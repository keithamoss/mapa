# Generated by Django 4.1.5 on 2023-04-02 05:57

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('app', '0032_featureschemas_symbology'),
    ]

    operations = [
        migrations.AlterField(
            model_name='featureschemas',
            name='definition',
            field=models.JSONField(blank=True, default=list),
        ),
    ]
