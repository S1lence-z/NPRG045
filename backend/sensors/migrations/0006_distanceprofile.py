# Generated by Django 5.0.6 on 2024-07-21 17:55

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('sensors', '0005_rename_status_sensor_is_connected'),
    ]

    operations = [
        migrations.CreateModel(
            name='DistanceProfile',
            fields=[
                ('id', models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('name', models.CharField(max_length=50)),
                ('start_m', models.FloatField()),
                ('end_m', models.FloatField()),
                ('max_profile', models.CharField(choices=[('low', 'Low'), ('medium', 'Medium'), ('high', 'High')], default='low', max_length=10)),
                ('max_step_length', models.IntegerField()),
                ('threshold_method', models.CharField(choices=[('cfar', 'CFAR'), ('fixed_amplitude', 'Fixed Amplitude'), ('fixed_strength', 'Fixed Strength'), ('recorded', 'Recorded')], default='recorded', max_length=20)),
            ],
        ),
    ]