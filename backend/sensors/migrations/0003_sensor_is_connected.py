# Generated by Django 5.0.6 on 2024-07-19 21:34

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('sensors', '0002_sensor_is_active'),
    ]

    operations = [
        migrations.AddField(
            model_name='sensor',
            name='is_connected',
            field=models.BooleanField(default=False),
        ),
    ]