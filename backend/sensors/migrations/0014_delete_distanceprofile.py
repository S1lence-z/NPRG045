# Generated by Django 5.0.6 on 2024-09-06 20:28

from django.db import migrations


class Migration(migrations.Migration):

    dependencies = [
        ('sensors', '0013_alter_sensor_hwid'),
    ]

    operations = [
        migrations.DeleteModel(
            name='DistanceProfile',
        ),
    ]