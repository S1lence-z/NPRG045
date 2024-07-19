from rest_framework import viewsets, status
from rest_framework.decorators import action
from rest_framework.response import Response
from sensors.models import Sensor
from .serializers import SensorSerializer

# Create your views here.

class SensorViewSet(viewsets.ModelViewSet):
    queryset = Sensor.objects.all()
    serializer_class = SensorSerializer
    
    @action(detail=False, methods=['get'])
    def available(self, request):
        sensors = Sensor.objects.all()
        serializer = self.get_serializer(sensors, many=True)
        return Response(serializer.data)
    
    @action(detail=False, methods=['get'])
    def active(self, request):
        active_sensors = Sensor.objects.filter(is_active=True)
        serializer = self.get_serializer(active_sensors, many=True)
        return Response(serializer.data)
    
    @action(detail=True, methods=['post'])
    def set_active(self, request, pk):
        try:
            sensor = Sensor.objects.get(pk=pk)
            sensor.is_active = True
            sensor.save()
            Sensor.objects.exclude(pk=pk).update(is_active=False)
            return Response({'status': f'Sensor with id {sensor.id} activated.'}, status=status.HTTP_200_OK)
        except Sensor.DoesNotExist:
            return Response({'status': f'Sensor with id {pk} not found.'}, status=status.HTTP_404_NOT_FOUND)
        
    @action(detail=False, methods=['get'])
    def inactive(self, request):
        inactive_sensors = Sensor.objects.filter(is_active=False)
        serializer = self.get_serializer(inactive_sensors, many=True)
        return Response(serializer.data)
    
    @action(detail=True, methods=['post'])
    def set_inactive(self, request, pk):
        try:
            sensor = Sensor.objects.get(pk=pk)
            sensor.is_active = False
            sensor.save()
            return Response({'status': f'Sensor with id {sensor.id} deactivated.'}, status=status.HTTP_200_OK)
        except Sensor.DoesNotExist:
            return Response({'status': f'Sensor with id {pk} not found.'}, status=status.HTTP_404_NOT_FOUND)