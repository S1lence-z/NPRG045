from rest_framework import viewsets, status
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework.views import APIView
from .serializers import SensorSerializer
from sensors.models import Sensor
from sensors.serializers import PortInformationSerializer
from sensors.utils import get_serial_ports, filter_ports

# Create your views here.

class PortsView(APIView):
    def get(self, request):
        ports = get_serial_ports()
        enhanced_ports = filter_ports(ports, enhanced=True)
        serializer = PortInformationSerializer(enhanced_ports, many=True)
        return Response(serializer.data, status=status.HTTP_200_OK)
    
    def post(self, request, port_name):
        sensor = Sensor.objects.filter(port_name=port_name)
        if sensor.exists():
            sensor = sensor.first()
            sensor.is_connected = True
            sensor.save()
            return Response({'message': f'Known sensor on port {port_name} conncted'}, status=status.HTTP_200_OK)
        else:
            ports = get_serial_ports()
            for port in ports:
                if port.name == port_name:
                    sensor = Sensor.objects.create(port_name=port.name, port_description=port.description, hwid=port.device_hwid, is_connected=True)
                    sensor.save()
                    return Response({'message': f'New sensor on port {port_name} connected'}, status=status.HTTP_200_OK)
            return Response({'message': f'Sensor on port {port_name} not found'}, status=status.HTTP_404_NOT_FOUND)

class SensorViewSet(viewsets.ModelViewSet):
    queryset = Sensor.objects.all()
    serializer_class = SensorSerializer
    
    def list(self, request):
        sensors = Sensor.objects.all()
        serializer = SensorSerializer(sensors, many=True)
        return Response(serializer.data, status=status.HTTP_200_OK)
    
    def delete(self, request, pk):
        try:
            sensor = Sensor.objects.get(pk=pk)
            sensor.delete()
            return Response({'message': f'Sensor on port {sensor.port_name} deleted'}, status=status.HTTP_200_OK)
        except Sensor.DoesNotExist:
            return Response({'message': 'Sensor not found'}, status=status.HTTP_404_NOT_FOUND)
        
    @action(detail=False, methods=['get'])
    def get_connected(self, request):
        sensors = Sensor.objects.filter(is_connected=True)
        serializer = SensorSerializer(sensors, many=True)
        return Response(serializer.data, status=status.HTTP_200_OK)
    
    @action(detail=True, methods=['patch'])
    def change_connection_status(self, request, pk):
        sensor = Sensor.objects.get(pk=pk)
        sensor.is_connected = not sensor.is_connected
        sensor.save()
        return Response({'message': f'Sensor on port {sensor.port_name} is now {"active" if sensor.is_connected else "inactive"}'}, status=status.HTTP_200_OK)