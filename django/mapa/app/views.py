
from datetime import datetime
from http.client import BAD_REQUEST

import pytz
from mapa.app.models import Features, FeatureSchemas, Maps
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

    @action(detail=True, methods=["GET"], permission_classes=(IsAuthenticated,), serializer_class=FeatureSerializer)
    def features(self, request, pk=None, format=None):
        """
        Retrieve a list of all of the features for this map.
        """
        map = self.get_object()
        if map.owner_id.id != request.user.id:
            return Response({}, status.HTTP_401_UNAUTHORIZED)

        serializer = FeatureSerializer(Features.objects.filter(deleted_at=None, map_id=pk), many=True)
        return Response(serializer.data)


class FeatureSchemasViewSet(viewsets.ModelViewSet):
    """
    API endpoint that allows feature schemas to be viewed and edited.
    """
    queryset = FeatureSchemas.objects.filter(deleted_at=None).order_by("-id")
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
        feature.deleted_at = datetime.now(pytz.utc)
        feature.save()
        return Response(status=status.HTTP_204_NO_CONTENT)
