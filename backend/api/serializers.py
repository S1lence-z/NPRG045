from rest_framework import serializers
from sensors.models import Sensor

# Create your serializers here.

class SensorSerializer(serializers.ModelSerializer):
    class Meta:
        model = Sensor
        fields = ['id', 'port_name', 'hwid', 'port_description', 'is_active']
