from rest_framework import serializers
from amp_phase_detector_app.models import SensorConfig

class SensorConfigSerializer(serializers.ModelSerializer):
    class Meta:
        model = SensorConfig
        fields = '__all__'