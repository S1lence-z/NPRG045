from rest_framework import serializers
from distance_detector_app.models import DistanceProfile

class DistanceProfileSerializer(serializers.ModelSerializer):
    class Meta:
        model = DistanceProfile
        fields = '__all__'