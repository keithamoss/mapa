# Generated by Django 4.2.1 on 2023-05-06 01:36

from django.db import migrations


class Migration(migrations.Migration):

    dependencies = [
        ('app', '0038_historicalmaps_historicalfeatureschemas_and_more'),
    ]

    operations = [
        migrations.RenameField(
            model_name='historicalmaps',
            old_name='hidden_schema_ids',
            new_name='available_schema_ids',
        ),
        migrations.RenameField(
            model_name='maps',
            old_name='hidden_schema_ids',
            new_name='available_schema_ids',
        ),
    ]
