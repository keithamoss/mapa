from datetime import datetime
from http.client import BAD_REQUEST

import pytz
from mapa.app.models import Features, FeatureSchemas, Maps
from mapa.app.permissions import IsAuthenticatedAndOwnsEntityPermissions
from mapa.app.serializers import (FeatureSchemaSerializer, FeatureSerializer,
                                  MapSerializer, UserSerializer)
from mapa.util import make_logger
from rest_framework import generics, mixins, status, viewsets
from rest_framework.decorators import action
from rest_framework.permissions import AllowAny, IsAdminUser, IsAuthenticated
from rest_framework.response import Response
from rest_framework.views import APIView

from django.contrib.auth import logout
from django.contrib.auth.models import User
from django.db.models import Count
from django.http import HttpResponseNotFound

logger = make_logger(__name__)


def api_not_found(request):
    return HttpResponseNotFound()


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


class MapsViewSet(viewsets.ModelViewSet):
    """
    API endpoint that allows maps to be viewed and edited.
    """
    queryset = Maps.objects.order_by("id")
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
        
        if request.user.profile.settings is not None and request.user.profile.settings["last_map_id"] is not None:
            mapIds = Maps.objects.filter(deleted_at=None, owner_id=request.user.id, id=request.user.profile.settings["last_map_id"]).values_list("id", flat=True)

            serializer = FeatureSerializer(Features.objects.filter(deleted_at=None, map_id__in=list(mapIds)), many=True)
            return Response(serializer.data)

        return Response([])


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
