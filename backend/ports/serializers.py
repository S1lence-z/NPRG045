from rest_framework import serializers

# Create your serializers here.

class PortInformationSerializer(serializers.Serializer):
    name = serializers.CharField(max_length=50)
    description = serializers.CharField(max_length=100)
    device_hwid = serializers.CharField(max_length=100)
