
from mapa.app.models import Features, FeatureSchemas, Maps, Profile
from rest_framework import serializers

from django.contrib.auth.models import User


class ProfileSerializer(serializers.HyperlinkedModelSerializer):
    class Meta:
        model = Profile
        fields = ('is_approved', 'settings')


class UserSerializer(serializers.HyperlinkedModelSerializer):
    is_approved = serializers.BooleanField(source='profile.is_approved')
    settings = serializers.JSONField(source='profile.settings')

    name = serializers.SerializerMethodField()
    initials = serializers.SerializerMethodField()

    def get_name(self, obj):
        return "{} {}".format(obj.first_name, obj.last_name)

    def get_initials(self, obj):
        return "{}{}".format(obj.first_name[:1], obj.last_name[:1])

    class Meta:
        model = User
        fields = (
            'id',
            'username',
            'first_name',
            'last_name',
            'name',
            'initials',
            'email',
            'is_staff',
            'date_joined',
            'groups',
            'is_approved',
            'settings')


class MapSerializer(serializers.ModelSerializer):
    class Meta:
        model = Maps
        fields = ("id", "name", "owner_id", "default_symbology", "hidden_schema_ids", "last_used_schema_id")


class FeatureSerializer(serializers.ModelSerializer):
    class Meta:
        model = Features
        fields = ("id", "geom", "geom_type", "map_id", "schema_id", "symbol_id", "data")


class FeatureSchemaSerializer(serializers.ModelSerializer):
    class Meta:
        model = FeatureSchemas
        fields = ("id", "name", "owner_id", "definition", "symbology", "default_symbology")
