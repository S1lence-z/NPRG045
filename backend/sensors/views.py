from rest_framework import status
from rest_framework.response import Response
from rest_framework.views import APIView
from .serializers import SensorSerializer
from .models import Sensor

# Create your views here.

class SensorListCreateAPIView(APIView):
    def get(self, request):
        sensors = Sensor.objects.all()
        serializer = SensorSerializer(sensors, many=True)
        return Response(data=serializer.data, status=status.HTTP_200_OK)
    
    def post(self, request):
        requested_port_name = request.data.get('name')
        requested_description = request.data.get('description')
        requested_device_hwid = request.data.get('device_hwid')
        
        sensor = Sensor.objects.filter(port_name=requested_port_name).first()
        if sensor:
            sensor.is_connected = True
            sensor.save()
            serializer = SensorSerializer(sensor)
            return Response(data={
                'message': f'Known sensor with id {sensor.id} on port {requested_port_name} connected',
                'sensor': serializer.data}, status=status.HTTP_200_OK)
            
        #* Create a new sensor if the sensor does not already exist
        sensor = Sensor.objects.create(
            port_name=requested_port_name, 
            port_description=requested_description, 
            hwid=requested_device_hwid, 
            is_connected=True
        )
        sensor.save()
        serializer = SensorSerializer(sensor)
        return Response(data={
            'message': f'New sensor with id {sensor.id} on port {requested_port_name} connected',
            'sensor': serializer.data}, status=status.HTTP_201_CREATED)
        
class SensorDetailAPIView(APIView):
    def put(self, request, pk):
        try:
            sensor = Sensor.objects.get(pk=pk)
        except Sensor.DoesNotExist:
            return Response({
                'message': f'Sensor with id {pk} was not found'}, status=status.HTTP_404_NOT_FOUND)
            
        serializer = SensorSerializer(sensor, data=request.data)
        if serializer.is_valid():
            serializer.save()
            return Response(data={
                'message': f'Sensor with id {pk} on port {sensor.port_name} updated', 
                'sensor': serializer.data}, status=status.HTTP_200_OK)
        return Response(data=serializer.errors, status=status.HTTP_400_BAD_REQUEST)
        
    def delete(self, request, pk):
        try:
            sensor = Sensor.objects.get(pk=pk)
            sensor.delete()
            return Response(data={
                'message': f'Sensor with id {pk} on port {sensor.port_name} deleted',
                }, status=status.HTTP_200_OK)
        except Sensor.DoesNotExist:
            return Response({'message': f'Sensor with id {pk} not found'}, status=status.HTTP_404_NOT_FOUND)
        
class SensorConnectedAPIView(APIView):    
    def get(self, request):
        sensors = Sensor.objects.filter(is_connected=True)
        serializer = SensorSerializer(sensors, many=True)
        return Response(serializer.data, status=status.HTTP_200_OK)
