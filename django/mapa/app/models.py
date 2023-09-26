
from mapa.app.enums import GeomType, ProfileSettings
from mapa.util import make_logger
from model_utils import FieldTracker
from simple_history.models import HistoricalRecords

from django.contrib.auth.models import User
from django.contrib.gis.db import models
from django.db.models import JSONField

logger = make_logger(__name__)

# Create your models here.


class CompilationError(Exception):
    pass


def default_profile_settings():
    return {

    }


class Profile(models.Model):
    user = models.OneToOneField(User, on_delete=models.CASCADE)
    profile_image_url = models.URLField(blank=False)
    is_approved = models.BooleanField(default=False)
    settings = JSONField(default=default_profile_settings, blank=True)
    last_gdrive_backup = models.DateTimeField(null=True)

    tracker = FieldTracker()

    def __str__(self):
        return self.user.username

    def merge_settings(self, settings):
        for item, val in settings.items():
            if ProfileSettings.has_value(item) is True:
                if item not in self.settings and type(val) is dict:
                    self.settings[item] = {}

                if item in self.settings and type(self.settings[item]) is dict:
                    self.settings[item] = {**self.settings[item], **val}
                else:
                    self.settings[item] = val


class AllowedUsers(models.Model):
    "Our allowlist of allowed users"

    email = models.EmailField(unique=True, blank=False)


class FeatureSchemas(models.Model):
    last_updated_date = models.DateTimeField(auto_now=True)
    name = models.TextField(unique=False)
    owner_id = models.ForeignKey(User, on_delete=models.CASCADE, db_column="owner_id")
    definition = JSONField(default=list, blank=True)
    # definition = JSONField(default=None, blank=True, validators=[JSONSchemaValidator(limit_value=noms_schema)])
    symbology = JSONField(default=dict, blank=True)
    default_symbology = JSONField(null=True)
    recently_used_symbols = JSONField(default=dict, blank=True)
    deleted_at = models.DateTimeField(null=True)

    history = HistoricalRecords()


class Maps(models.Model):
    last_updated_date = models.DateTimeField(auto_now=True)
    name = models.TextField(unique=False)
    owner_id = models.ForeignKey(User, on_delete=models.CASCADE, db_column="owner_id")
    default_symbology = JSONField(null=True)
    deleted_at = models.DateTimeField(null=True)
    available_schema_ids = JSONField(default=list, blank=True)
    last_used_schema_id = models.ForeignKey(FeatureSchemas, null=True, on_delete=models.CASCADE, db_column="last_used_schema_id")

    history = HistoricalRecords()


class Features(models.Model):
    last_updated_date = models.DateTimeField(auto_now=True)
    geom = models.PointField(geography=True)
    geom_type = models.TextField(choices=[(tag, tag.value) for tag in GeomType])
    map_id = models.ForeignKey(Maps, on_delete=models.CASCADE, db_column="map_id")
    schema_id = models.ForeignKey(FeatureSchemas, on_delete=models.CASCADE, blank=True, null=True, db_column="schema_id")
    symbol_id = models.IntegerField(blank=True, null=True)
    data = JSONField(default=list, blank=True)
    deleted_at = models.DateTimeField(null=True)
    import_job = models.TextField(blank=True, default="")

    history = HistoricalRecords()
