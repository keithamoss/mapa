# Generated by Django 4.2.11 on 2024-05-16 01:01

from django.db import migrations


class Migration(migrations.Migration):

    dependencies = [
        ('app', '0052_alter_features_creation_date_and_more'),
    ]

    operations = [
        migrations.RemoveField(
            model_name='featureschemas',
            name='recently_used_symbols',
        ),
        migrations.RemoveField(
            model_name='historicalfeatureschemas',
            name='recently_used_symbols',
        ),
    ]
