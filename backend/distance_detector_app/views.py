from django.forms import ValidationError
from rest_framework import status
from rest_framework.response import Response
from distance_detector_app.models import DistanceProfile
from rest_framework.views import APIView
from .serializers import DistanceProfileSerializer
from sensors.serializers import SensorSerializer
from sensors.managers.sensor_client_manager import SensorClientManager
from sensors.models import Sensor

# Create your views here.

class DistanceProfileListCreateAPIView(APIView):
    def get(self, request):
        profiles = DistanceProfile.objects.all()
        serializer = DistanceProfileSerializer(profiles, many=True)
        return Response(serializer.data, status=status.HTTP_200_OK)
    
    def post(self, request):
        serializer = DistanceProfileSerializer(data=request.data)
        print(request.data)
        if not serializer.is_valid():
            return Response(data=serializer.errors, status=status.HTTP_400_BAD_REQUEST)
        try:
            serializer.save()
            return Response(data={
                'message': f'New profile with id {serializer.data['id']} created',
                'profile': serializer.data}, status=status.HTTP_201_CREATED)
        except ValidationError as e:
            return Response(data={
                'message': str(e)
                }, status=status.HTTP_400_BAD_REQUEST)

class DistanceProfileDetailAPIView(APIView):
    def get(self, request, pk):
        try:
            profile = DistanceProfile.objects.get(pk=pk)
            serializer = DistanceProfileSerializer(profile)
            return Response(serializer.data, status=status.HTTP_200_OK)
        except DistanceProfile.DoesNotExist:
            return Response({
                'message': f'Profile with id {pk} not found'}, status=status.HTTP_404_NOT_FOUND)
        
    def put(self, request, pk):
        try:
            profile = DistanceProfile.objects.get(pk=pk)
        except DistanceProfile.DoesNotExist:
            return Response({'message': f'Distance profile with id {pk} not found'}, status=status.HTTP_404_NOT_FOUND)
        
        serializer = DistanceProfileSerializer(profile, data=request.data)
        if serializer.is_valid():
            serializer.save()
            return Response({
                'message': f'Profile with id {pk} updated',
                'profile': serializer.data}, status=status.HTTP_200_OK)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
        
    def delete(self, request, pk):
        try:
            profile = DistanceProfile.objects.get(pk=pk)
            profile.delete()
            return Response({'message': f'Profile with id {pk} deleted'}, status=status.HTTP_200_OK)
        except DistanceProfile.DoesNotExist:
            return Response({'message': f'Profile with id {pk} not found'}, status=status.HTTP_404_NOT_FOUND)

class DistanceMeasurementStartAPIView(APIView):
    def _get_distance_profile(self, requested_distance_profile_id: int) -> DistanceProfile:
        try:
            distance_profile = DistanceProfile.objects.get(pk=requested_distance_profile_id)
            print(f'Using distance profile with id {requested_distance_profile_id}.')
            return distance_profile
        except DistanceProfile.DoesNotExist:
            print(f'Distance profile with id {requested_distance_profile_id} not found. Using default profile.')
            return DistanceProfile.objects.first()
    
    def post(self, request, pk):
        requested_distance_profile_id = request.data.get('distance_profile_id')
        distance_profile = self._get_distance_profile(requested_distance_profile_id)
        try:
            sensor = Sensor.objects.get(pk=pk)
        except Sensor.DoesNotExist:
            return Response({'message': f'Sensor with id {pk} not found'}, status=status.HTTP_404_NOT_FOUND)

        SensorClientManager.get_instance().start_distance_detector(sensor, distance_profile)
        return Response({
            'message': f'Distance measurement started for sensor with id {pk}',
            'sensor': SensorSerializer(sensor).data,
        }, status=status.HTTP_200_OK)

class DistanceMeasurementStopAPIView(APIView):
    def post(self, request, pk):
        sensor = Sensor.objects.get(pk=pk)
        SensorClientManager.get_instance().stop_distance_detector(sensor)
        return Response({
            'message': f'Distance measurement stopped for sensor with id {pk}',
            'sensor': SensorSerializer(sensor).data,
        }, status=status.HTTP_200_OK)