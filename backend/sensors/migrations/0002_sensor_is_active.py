# Generated by Django 5.0.6 on 2024-07-18 21:02

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('sensors', '0001_initial'),
    ]

    operations = [
        migrations.AddField(
            model_name='sensor',
            name='is_active',
            field=models.BooleanField(default=False),
        ),
    ]
