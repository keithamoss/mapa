# Generated by Django 4.1.5 on 2023-01-17 11:00

from django.db import migrations, models
import django.db.models.deletion


class Migration(migrations.Migration):

    dependencies = [
        ('app', '0018_rename_map_features_map_id'),
    ]

    operations = [
        migrations.AlterField(
            model_name='features',
            name='map_id',
            field=models.ForeignKey(db_column='map_id', on_delete=django.db.models.deletion.CASCADE, to='app.maps'),
        ),
    ]
