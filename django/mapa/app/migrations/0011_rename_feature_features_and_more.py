# Generated by Django 4.1.5 on 2023-01-15 05:45

from django.conf import settings
from django.db import migrations


class Migration(migrations.Migration):

    dependencies = [
        migrations.swappable_dependency(settings.AUTH_USER_MODEL),
        ('app', '0010_alter_map_owner'),
    ]

    operations = [
        migrations.RenameModel(
            old_name='Feature',
            new_name='Features',
        ),
        migrations.RenameModel(
            old_name='FeatureType',
            new_name='FeatureSchemas',
        ),
        migrations.RenameModel(
            old_name='Map',
            new_name='Maps',
        ),
        migrations.DeleteModel(
            name='Folder',
        ),
    ]
