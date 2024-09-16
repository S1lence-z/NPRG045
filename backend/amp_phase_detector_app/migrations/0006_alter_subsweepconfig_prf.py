# Generated by Django 5.0.6 on 2024-09-09 22:43

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('amp_phase_detector_app', '0005_alter_subsweepconfig_prf'),
    ]

    operations = [
        migrations.AlterField(
            model_name='subsweepconfig',
            name='prf',
            field=models.CharField(choices=[('PRF_19_5_MHz', 'PRF_19_5_MHz'), ('PRF_15_6_MHz', 'PRF_15_6_MHz'), ('PRF_13_0_MHz', 'PRF_13_0_MHz'), ('PRF_8_7_MHz', 'PRF_8_7_MHz'), ('PRF_6_5_MHz', 'PRF_6_5_MHz'), ('PRF_5_2_MHz', 'PRF_5_2_MHz')], default='PRF_15_6_MHz', max_length=12),
        ),
    ]
