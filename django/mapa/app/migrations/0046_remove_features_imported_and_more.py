# Generated by Django 4.2.5 on 2023-09-26 06:26

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('app', '0045_features_imported_historicalfeatures_imported'),
    ]

    operations = [
        migrations.RemoveField(
            model_name='features',
            name='imported',
        ),
        migrations.RemoveField(
            model_name='historicalfeatures',
            name='imported',
        ),
        migrations.AddField(
            model_name='features',
            name='import_job',
            field=models.TextField(default=''),
        ),
        migrations.AddField(
            model_name='historicalfeatures',
            name='import_job',
            field=models.TextField(default=''),
        ),
    ]
