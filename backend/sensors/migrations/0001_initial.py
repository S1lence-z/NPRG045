# Generated by Django 5.0.6 on 2024-07-18 17:30

from django.db import migrations, models


class Migration(migrations.Migration):

    initial = True

    dependencies = [
    ]

    operations = [
        migrations.CreateModel(
            name='Sensor',
            fields=[
                ('id', models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('port_name', models.CharField(max_length=50)),
                ('hwid', models.CharField(max_length=50)),
                ('port_description', models.CharField(max_length=100)),
            ],
        ),
    ]
