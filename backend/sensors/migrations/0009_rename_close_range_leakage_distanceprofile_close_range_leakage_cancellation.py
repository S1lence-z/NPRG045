# Generated by Django 5.0.6 on 2024-07-27 11:29

from django.db import migrations


class Migration(migrations.Migration):

    dependencies = [
        ('sensors', '0008_rename_distancedetectorprofile_distanceprofile'),
    ]

    operations = [
        migrations.RenameField(
            model_name='distanceprofile',
            old_name='close_range_leakage',
            new_name='close_range_leakage_cancellation',
        ),
    ]