from django.shortcuts import render
from django.forms import ValidationError
from rest_framework import status
from rest_framework.response import Response
from amp_phase_detector_app.models import SensorConfig
from rest_framework.views import APIView
from sensors.models import Sensor
from sensors.serializers import SensorSerializer
from sensors.managers.sensor_client_manager import SensorClientManager
from .serializers import SensorConfigSerializer

# Create your views here.

class SensorConfigListCreateAPIView(APIView):
    def get(self, request):
        configs = SensorConfig.objects.all()
        serializer = SensorConfigSerializer(configs, many=True)
        return Response(serializer.data, status=status.HTTP_200_OK)
    
    def post(self, request):
        serializer = SensorConfigSerializer(data=request.data)
        if not serializer.is_valid():
            return Response(data=serializer.errors, status=status.HTTP_400_BAD_REQUEST)
        try:
            serializer.save()
            return Response(data={
                'message': f'New sensor config with id {serializer.data['id']} created',
                'config': serializer.data}, status=status.HTTP_201_CREATED)
        except ValidationError as e:
            return Response(data={
                'message': str(e)
                }, status=status.HTTP_400_BAD_REQUEST)
            
class SensorConfigDetailAPIView(APIView):
    def get(self, request, pk):
        try:
            config = SensorConfig.objects.get(pk=pk)
            serializer = SensorConfigSerializer(config)
            return Response(serializer.data, status=status.HTTP_200_OK)
        except SensorConfig.DoesNotExist:
            return Response({
                'message': f'Sensor config with id {pk} not found'}, status=status.HTTP_404_NOT_FOUND)
        
    def put(self, request, pk):
        try:
            config = SensorConfig.objects.get(pk=pk)
        except SensorConfig.DoesNotExist:
            return Response({'message': f'Sensor config with id {pk} not found'}, status=status.HTTP_404_NOT_FOUND)
        
        serializer = SensorConfigSerializer(config, data=request.data)
        if serializer.is_valid():
            serializer.save()
            return Response({
                'message': f'Sensor config with id {pk} updated',
                'config': serializer.data}, status=status.HTTP_200_OK)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
        
    def delete(self, request, pk):
        try:
            config = SensorConfig.objects.get(pk=pk)
            config.delete()
            return Response({'message': f'Sensor config with id {pk} deleted'}, status=status.HTTP_200_OK)
        except SensorConfig.DoesNotExist:
            return Response({'message': f'Sensor config with id {pk} not found'}, status=status.HTTP_404_NOT_FOUND)
        
class StartAmpPhaseMeasurementAPIView(APIView):
    def _get_sensor_config(self, requested_sensor_config_id: int) -> SensorConfig:
        try:
            sensor_config = SensorConfig.objects.get(pk=requested_sensor_config_id)
            print(f'Using sensor config with id {requested_sensor_config_id}.')
            return sensor_config
        except SensorConfig.DoesNotExist:
            print(f'Sensor config with id {requested_sensor_config_id} not found. Using default sensor config.')
            return SensorConfig.objects.first()
    
    def post(self, request, pk):
        requested_sensor_config_id = request.data.get('sensor_config_id')
        sensor_config = self._get_sensor_config(requested_sensor_config_id)
        try:
            sensor = Sensor.objects.get(pk=pk)
        except Sensor.DoesNotExist:
            return Response({
                'message': f'Sensor with id {pk} not found'}, status=status.HTTP_404_NOT_FOUND)
            
        SensorClientManager.get_instance().start_amp_phase_detector(sensor, sensor_config)
        return Response(data={
            'message': f'Started amplitude and phase measurement for sensor with id {pk}',
            'sensor': SensorSerializer(sensor).data,
            'sensor_config': SensorConfigSerializer(sensor_config).data}, status=status.HTTP_200_OK)
    
class StopAmpPhaseMeasurementAPIView(APIView):
    def post(self, request, pk):
        sensor = Sensor.objects.get(pk=pk)
        SensorClientManager.get_instance().stop_amp_phase_detector(sensor)
        return Response({
            'message': f'Stopped amplitude and phase measurement for sensor with id {pk}',
            'sensor': SensorSerializer(sensor).data
        }, status=status.HTTP_200_OK)