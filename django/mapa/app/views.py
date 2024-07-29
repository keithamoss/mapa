import numbers
import os
import re
from copy import deepcopy
from datetime import datetime
from http.client import BAD_REQUEST
from urllib.parse import unquote_plus, urlparse

import pytz
import requests
from mapa.app.admin import is_admin
from mapa.app.envs import are_management_tasks_allowed
from mapa.app.export import orchestrate_google_drive_backup
from mapa.app.models import Features, FeatureSchemas, Maps
from mapa.app.permissions import IsAuthenticatedAndOwnsEntityPermissions
from mapa.app.serializers import (FeatureSchemaSerializer, FeatureSerializer,
                                  MapSerializer, UserSerializer)
from rest_framework import status, viewsets
from rest_framework.decorators import action
from rest_framework.permissions import AllowAny, IsAdminUser, IsAuthenticated
from rest_framework.response import Response
from rest_framework.views import APIView

from django.contrib.auth import logout
from django.contrib.auth.models import User
from django.db.models import Count
from django.http import HttpResponseNotFound


def api_not_found(request):
    return HttpResponseNotFound()


class ManagementEventsView(APIView):
    """
    API endpoint that allows management actions to be undertaken
    by the lambda "cron" jobs responsible for those.
    e.g. The daily "cron" job that ensures user data is backed up
    to their Google Drive.
    """
    permission_classes = (AllowAny,)

    def post(self, request):
        if are_management_tasks_allowed() is True:
            eventType = request.data["event_type"] if "event_type" in request.data else None

            if eventType == "backup_to_google_drive":
                orchestrate_google_drive_backup()
            elif eventType == "run_migrations":
                from django.core.management import execute_from_command_line
                execute_from_command_line(['manage.py', 'migrate'])
            else:
                raise Exception(f"Unknown event type '{eventType}'")
            return Response({})
        return Response({}, status=status.HTTP_400_BAD_REQUEST)


class CurrentUserView(APIView):
    permission_classes = (AllowAny,)
    schema = None

    def get(self, request):
        if request.user.is_authenticated:
            serializer = UserSerializer(
                request.user, context={"request": request}
            )

            return Response({
                "is_logged_in": True,
                "user": serializer.data
            })
        else:
            return Response({
                "is_logged_in": False,
                "user": None
            })


class LogoutUserView(APIView):
    permission_classes = (IsAuthenticated,)

    def get(self, request):
        logout(request)

        return Response({
            "is_logged_in": False,
            "user": None
        })


class UserViewSet(viewsets.ModelViewSet):
    """
    API endpoint that allows users to be viewed or edited.
    """
    queryset = User.objects.all().order_by("-date_joined")
    serializer_class = UserSerializer
    permission_classes = (IsAdminUser,)


class ProfileViewSet(viewsets.ViewSet):
    """
    API endpoint that allows user profiles to be viewed and edited.
    """
    permission_classes = (IsAuthenticated,)

    @action(detail=False, methods=["POST"])
    def update_settings(self, request):
        request.user.profile.merge_settings(request.data)
        request.user.profile.save()
        return Response(request.user.profile.settings)

    @action(detail=False, methods=["POST"])
    def update_what_new_view_count(self, request):
        if "viewCount" in request.data and isinstance(request.data["viewCount"], numbers.Number) is True:
            request.user.profile.whats_new_release_count = request.data["viewCount"]
            request.user.profile.save()
            return Response(None, status=status.HTTP_200_OK)
        return Response({}, status=status.HTTP_400_BAD_REQUEST)


class MapsViewSet(viewsets.ModelViewSet):
    """
    API endpoint that allows maps to be viewed and edited.
    """
    queryset = Maps.objects.filter(deleted_at=None).order_by("id")
    serializer_class = MapSerializer
    permission_classes = (IsAuthenticated,)

    def get_queryset(self, *args, **kwargs):
        return super().get_queryset(*args, **kwargs).filter(
            owner_id=self.request.user.id
        )

    def create(self, request, format=None):
        request.data.update({"owner_id": request.user.id})
        serializer = MapSerializer(data=request.data)
        if serializer.is_valid() is True:
            serializer.save()
            return Response(serializer.data, status=status.HTTP_201_CREATED)
        else:
            return Response({}, status=status.HTTP_400_BAD_REQUEST)

    def update(self, request, pk=None, *args, **kwargs):
        # Ensure the user isn't trying to remove a schema that's still used on the map.
        # This is simply a backend protection against a check the UI already enforces.
        if "available_schema_ids" in request.data:
            schemasUsedOnMap = Features.objects.filter(map_id=pk, deleted_at=None, schema_id__isnull=False).values_list("schema_id", flat=True).distinct()

            if set(schemasUsedOnMap).issubset(list(request.data["available_schema_ids"])) is False:
                return Response({}, status=status.HTTP_412_PRECONDITION_FAILED)

        return super().update(request, pk, *args, **kwargs)

    @action(detail=False, methods=["GET"], serializer_class=FeatureSerializer)
    def features(self, request, format=None):
        """
        Retrieve a list of all of the features for the user's active map.
        """
        # Note: This will probably eventually allow for a list of active_map_ids on the profile, not just one.
        # Requires a lot of UI rework to support it though.
        # e.g. Some uses of useGetFeaturesQuery will need to think about filtering the result by map and whatnot.
        
        if request.user.profile.settings is not None and "last_map_id" in request.user.profile.settings and request.user.profile.settings["last_map_id"] is not None:
            mapIds = Maps.objects.filter(deleted_at=None, owner_id=request.user.id, id=request.user.profile.settings["last_map_id"]).values_list("id", flat=True)

            serializer = FeatureSerializer(Features.objects.filter(deleted_at=None, map_id__in=list(mapIds)), many=True)
            return Response(serializer.data)

        return Response([])

    @action(detail=False, methods=["GET"], serializer_class=FeatureSerializer)
    def copy(self, request, format=None):
        """
        Copies a given map and all of its features.
        """
        if is_admin(request.user) is False:
            return Response({}, status.HTTP_401_UNAUTHORIZED)

        mapIdToCopy = request.query_params.get("id")
        if mapIdToCopy is None:
            return Response(status=status.HTTP_400_BAD_REQUEST)

        map = Maps.objects.get(id=mapIdToCopy)
        map.pk = None
        map.name = f"{map.name} (Copy)"
        map.owner_id = request.user
        map.save()

        schemasToCopy = []
        features = Features.objects.filter(map_id=mapIdToCopy)
        for feature in features:
            if feature.schema_id not in schemasToCopy:
                schemasToCopy.append(deepcopy(feature.schema_id))
        
        oldToNewSchemaMapping = {}
        for schema in schemasToCopy:
            oldSchemaId = schema.pk
            schema.pk = None
            schema.owner_id = request.user
            schema.save()

            oldToNewSchemaMapping[oldSchemaId] = schema
        
        for feature in features:
            feature.pk = None
            feature.map_id = map
            feature.schema_id = oldToNewSchemaMapping[feature.schema_id.pk]
            feature.save()
        
        map.available_schema_ids = [schema.pk for schema in oldToNewSchemaMapping.values()]
        map.last_used_schema_id = oldToNewSchemaMapping[list(oldToNewSchemaMapping.keys())[0]]
        map.save()

        return Response({}, status=status.HTTP_201_CREATED)


class FeatureSchemasViewSet(viewsets.ModelViewSet):
    """
    API endpoint that allows feature schemas to be viewed and edited.
    """
    queryset = FeatureSchemas.objects.filter(deleted_at=None).order_by("name")
    serializer_class = FeatureSchemaSerializer
    permission_classes = (IsAuthenticated,)

    def get_queryset(self, *args, **kwargs):
        return super().get_queryset(*args, **kwargs).filter(
            owner_id=self.request.user.id
        )

    def create(self, request, format=None):
        request.data.update({"owner_id": request.user.id})
        serializer = FeatureSchemaSerializer(data=request.data)
        if serializer.is_valid() is True:
            serializer.save()
            return Response(serializer.data, status=status.HTTP_201_CREATED)
        else:
            return Response({}, status=status.HTTP_400_BAD_REQUEST)

    @action(detail=True, methods=["GET"], permission_classes=(IsAuthenticatedAndOwnsEntityPermissions,))
    def can_delete(self, request, pk=None, format=None):
        """
        Checks if a schema is in use and can be deleted.
        """
        schema = self.get_object()
        features = Features.objects.filter(schema_id=schema.id, deleted_at=None)
        featureCount = features.count()

        return Response({
            "deletable": featureCount == 0,
            "count": featureCount,
            "count_by_map": features.values("map_id").annotate(count=Count("map_id")),

        })

    def destroy(self, request, pk=None, format=None, permission_classes=(IsAuthenticatedAndOwnsEntityPermissions,)):
        """
        Mark this schema as deleted.
        """
        schema = self.get_object()

        if Features.objects.filter(schema_id=schema.id, deleted_at=None).count() == 0:
            # Update any maps that have pointers to the schema
            Maps.objects.filter(last_used_schema_id=schema.id).update(last_used_schema_id=None)

            for map in Maps.objects.filter(available_schema_ids__contains=[schema.id]):
                map.available_schema_ids = [id for id in map.available_schema_ids if id != schema.id]
                map.save()

            # Now we can safely delete the schema
            schema.deleted_at = datetime.now(pytz.utc)
            schema.save()

            return Response(status=status.HTTP_204_NO_CONTENT)
        return Response(status=status.HTTP_412_PRECONDITION_FAILED)

    @action(detail=True, methods=["GET"], permission_classes=(IsAuthenticatedAndOwnsEntityPermissions,))
    def can_delete_symbol(self, request, pk=None, format=None):
        """
        Checks if a symbol on this schema is in use and can be deleted.
        """
        symbolID = request.query_params.get("symbolID")
        if symbolID is None:
            return Response(status=status.HTTP_400_BAD_REQUEST)

        schema = self.get_object()
        features = Features.objects.filter(schema_id=schema.id, deleted_at=None, symbol_id=symbolID)
        featureCount = features.count()

        return Response({
            "deletable": featureCount == 0,
            "count": featureCount,
            "count_by_map": features.values("map_id").annotate(count=Count("map_id")),

        })

    @action(detail=True, methods=["GET"], permission_classes=(IsAuthenticatedAndOwnsEntityPermissions,))
    def can_delete_field(self, request, pk=None, format=None):
        """
        Checks if a field on this schema is in use and can be deleted.
        """
        fieldID = request.query_params.get("fieldID")
        if fieldID is None:
            return Response(status=status.HTTP_400_BAD_REQUEST)

        schema = self.get_object()
        features = Features.objects.filter(schema_id=schema.id, deleted_at=None, data__contains=[{"schema_field_id": int(fieldID)}])
        featureCount = features.count()

        return Response({
            "deletable": featureCount == 0,
            "count": featureCount,
            "count_by_map": features.values("map_id").annotate(count=Count("map_id")),
        })


class FeaturesViewSet(viewsets.ModelViewSet):
    """
    API endpoint that allows elections to be viewed and edited.
    """
    queryset = Features.objects.filter(deleted_at=None).order_by("-id")
    serializer_class = FeatureSerializer
    permission_classes = (IsAuthenticated,)

    def get_queryset(self, *args, **kwargs):
        return super().get_queryset(*args, **kwargs).filter(
            map_id__owner_id=self.request.user.id
        )

    def destroy(self, request, pk=None, format=None):
        """
        Mark this feature as deleted.
        """
        feature = self.get_object()
        if feature.map_id.owner_id.id != request.user.id:
            return Response({}, status.HTTP_401_UNAUTHORIZED)

        feature.deleted_at = datetime.now(pytz.utc)
        feature.save()
        return Response(status=status.HTTP_204_NO_CONTENT)


class GoogleMapsImportView(APIView):
    """
    API endpoint that allows us to extract place name and 
    # coordinates from a Google Maps Share Link.
    """
    permission_classes = (IsAuthenticated,)

    def get(self, request):
        # e.g. https://maps.app.goo.gl/1PLx9ie7Z4rSCWK28
        googelMapsShareLink = request.query_params.get("sharelinkURL")
        if googelMapsShareLink is None:
            return Response(status=status.HTTP_400_BAD_REQUEST)

        parsedGoogelMapsShareLink = urlparse(googelMapsShareLink)
        if parsedGoogelMapsShareLink.netloc != "maps.app.goo.gl" or re.search(r"^\/[A-z0-9]+$", parsedGoogelMapsShareLink.path) is None:
            return Response(status=status.HTTP_400_BAD_REQUEST)

        r = requests.get(googelMapsShareLink, allow_redirects=False)

        # Going to a Google Maps Share Link results in a 302 temporary redirect to its authoratative Google Maps URL (where we can parse its name and coordinates from the URL)
        # e.g. https://maps.app.goo.gl/1PLx9ie7Z4rSCWK28
        # becomes
        # https://www.google.com.au/maps/place/Kismet+Cocktail+%26+Whisky+Bar/@-41.2741297,173.279014,16z/data=!4m6!3m5!1s0x6d3bed01fe9b43c9:0xbb6d22d9ffbdd44a!8m2!3d-41.2741295!4d173.2827429!16s%2Fg%2F11h2bmt7wj?entry=tts&g_ep=EgoyMDI0MDcyNC4wKgBIAVAD
        if r.status_code == 302:
            # e.g. /maps/place/Kismet+Cocktail+%26+Whisky+Bar/@-41.2741297,173.279014,16z/data=!4m6!3m5!1s0x6d3bed01fe9b43c9:0xbb6d22d9ffbdd44a!8m2!3d-41.2741295!4d173.2827429!16s%2Fg%2F11h2bmt7wj?entry=tts&g_ep=EgoyMDI0MDcyNC4wKgBIAVAD
            # We do some (probably quite brittle!) parsing of Google's internal `data` component of the URL to pull out the actual lat lon of the place.
            # Ref: https://stackoverflow.com/a/24662610/7368493
            # 
            # If this all falls apart one day, our best fallback option is probably to make an API call to the Text Search (New) API to try to find the place that is near to the coordinates.
            # If we need it, the regex for that is:
            # regex = r"\/maps\/place\/(?P<place_name>.+)\/@(?P<lat>[0-9\-\.]+),(?P<lon>[0-9\-\.]+),[0-9\.]+z\/data=.+"
            # Ref: https://developers.google.com/maps/documentation/places/web-service/text-search
            regex = r"\/maps\/place\/(?P<place_name>.+)\/@.+z\/data=.+!3d(?P<lat>[0-9\-\.]+)!4d(?P<lon>[0-9\-\.]+).+"
            matches = re.search(regex, urlparse(r.headers['Location']).path)

            if matches:
                matchedGroups = matches.groupdict()

                return Response({
                    "place_name": unquote_plus(matchedGroups["place_name"]),
                    "lat": float(matchedGroups["lat"]),
                    "lon": float(matchedGroups["lon"]),
                })

        return Response(status=status.HTTP_400_BAD_REQUEST)