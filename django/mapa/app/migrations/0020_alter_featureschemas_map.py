# Generated by Django 4.1.5 on 2023-01-19 11:43

from django.db import migrations, models
import django.db.models.deletion


class Migration(migrations.Migration):

    dependencies = [
        ('app', '0019_alter_features_map_id'),
    ]

    operations = [
        migrations.AlterField(
            model_name='featureschemas',
            name='map',
            field=models.ForeignKey(db_column='map_id', on_delete=django.db.models.deletion.CASCADE, to='app.maps'),
        ),
    ]
