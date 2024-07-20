from rest_framework import serializers
from sensors.models import Sensor

# Create your serializers here.

class SensorSerializer(serializers.ModelSerializer):
    class Meta:
        model = Sensor
        fields = '__all__'
