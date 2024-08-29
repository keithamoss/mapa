
from mapa.app.models import Features, FeatureSchemas, Maps, Profile
from rest_framework import serializers

from django.contrib.auth.models import User


# https://stackoverflow.com/a/26100964/7368493
class TimestampReadOnlyField(serializers.ReadOnlyField):
    def to_representation(self, value):
        return round(value.timestamp() * 1000)


class ProfileSerializer(serializers.HyperlinkedModelSerializer):
    class Meta:
        model = Profile
        fields = ('is_approved', 'settings', 'last_gdrive_backup', 'whats_new_release_count')


class UserSerializer(serializers.HyperlinkedModelSerializer):
    is_approved = serializers.BooleanField(source='profile.is_approved')
    settings = serializers.JSONField(source='profile.settings')
    last_gdrive_backup = serializers.DateTimeField(source='profile.last_gdrive_backup')
    whats_new_release_count = serializers.IntegerField(source='profile.whats_new_release_count')

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
            'settings',
            'last_gdrive_backup',
            'whats_new_release_count')


class MapSerializer(serializers.ModelSerializer):
    class Meta:
        model = Maps
        fields = ("id", "name", "owner_id", "default_symbology", "hero_icon", "available_schema_ids", "starting_location", "location_search_enabled", "last_used_schema_id")

class FeatureSerializer(serializers.ModelSerializer):
    creation_date = TimestampReadOnlyField(required=False)

    class Meta:
        model = Features
        fields = ("id", "geom", "geom_type", "map_id", "schema_id", "symbol_id", "creation_date", "data")


class FeatureSchemaSerializer(serializers.ModelSerializer):
    class Meta:
        model = FeatureSchemas
        fields = ("id", "name", "owner_id", "definition", "symbology", "default_symbology")
