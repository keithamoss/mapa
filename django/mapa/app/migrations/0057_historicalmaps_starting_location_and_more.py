# Generated by Django 4.2.11 on 2024-08-19 03:08

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('app', '0056_remove_historicalmaps_starting_location_and_more'),
    ]

    operations = [
        migrations.AddField(
            model_name='historicalmaps',
            name='starting_location',
            field=models.JSONField(null=True),
        ),
        migrations.AddField(
            model_name='maps',
            name='starting_location',
            field=models.JSONField(null=True),
        ),
    ]