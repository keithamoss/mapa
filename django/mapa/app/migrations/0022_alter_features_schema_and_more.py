# Generated by Django 4.1.5 on 2023-01-22 07:40

from django.db import migrations, models
import django.db.models.deletion


class Migration(migrations.Migration):

    dependencies = [
        ('app', '0021_rename_map_featureschemas_map_id'),
    ]

    operations = [
        migrations.AlterField(
            model_name='features',
            name='schema',
            field=models.ForeignKey(blank=True, db_column='schema_id', null=True, on_delete=django.db.models.deletion.CASCADE, to='app.featureschemas'),
        ),
        migrations.RenameField(
            model_name='features',
            old_name='schema',
            new_name='schema_id',
        ),
    ]
