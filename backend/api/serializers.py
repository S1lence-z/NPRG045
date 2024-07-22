from rest_framework import serializers
from sensors.models import Sensor, DistanceProfile

# Create your serializers here.

class SensorSerializer(serializers.ModelSerializer):
    class Meta:
        model = Sensor
        fields = '__all__'

class PortInformationSerializer(serializers.Serializer):
    name = serializers.CharField(max_length=50)
    description = serializers.CharField(max_length=100)
    device_hwid = serializers.CharField(max_length=100)
    
class DistanceProfileSerializer(serializers.ModelSerializer):
    class Meta:
        model = DistanceProfile
        fields = '__all__'