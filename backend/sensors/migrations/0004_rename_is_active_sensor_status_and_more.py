# Generated by Django 5.0.6 on 2024-07-19 22:51

from django.db import migrations


class Migration(migrations.Migration):

    dependencies = [
        ('sensors', '0003_sensor_is_connected'),
    ]

    operations = [
        migrations.RenameField(
            model_name='sensor',
            old_name='is_active',
            new_name='status',
        ),
        migrations.RemoveField(
            model_name='sensor',
            name='is_connected',
        ),
    ]