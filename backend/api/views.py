from rest_framework import status
from rest_framework.response import Response
from rest_framework.views import APIView
from .serializers import SensorSerializer, PortInformationSerializer, DistanceProfileSerializer
from sensors.models import Sensor, DistanceProfile
from sensors.utils import get_serial_ports, filter_ports
from sensors.sensor_management.sensor_client_manager import SensorClientManager

# Create your views here.

class PortsAPIView(APIView):
    def get(self, request):
        enhanced_ports = filter_ports(get_serial_ports(), enhanced=True)
        serializer = PortInformationSerializer(enhanced_ports, many=True)
        return Response(data=serializer.data, status=status.HTTP_200_OK)
    
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
            #! the signal handler will update the sensor client manager
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
        #! the signal handler will update the sensor client manager
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
            #! the signal handler will update the sensor client manager
            return Response(data={
                'message': f'Sensor with id {pk} on port {sensor.port_name} updated', 
                'sensor': serializer.data}, status=status.HTTP_200_OK)
        return Response(data=serializer.errors, status=status.HTTP_400_BAD_REQUEST)
        
    def delete(self, request, pk):        
        try:
            sensor = Sensor.objects.get(pk=pk)
            sensor.delete()
            #! the signal handler will update the sensor client manager
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
    
class DistanceProfileListCreateAPIView(APIView):
    def get(self, request):
        profiles = DistanceProfile.objects.all()
        serializer = DistanceProfileSerializer(profiles, many=True)
        return Response(serializer.data, status=status.HTTP_200_OK)
    
    def post(self, request):
        serializer = DistanceProfileSerializer(data=request.data)
        if serializer.is_valid():
            serializer.save()
            return Response(data={
                'message': f'New profile with id {serializer.data['id']} created',
                'profile': serializer.data}, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
    
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