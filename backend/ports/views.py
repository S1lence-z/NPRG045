from ports.serializers import PortInformationSerializer
from rest_framework import status
from rest_framework.response import Response
from rest_framework.views import APIView
from ports.serializers import PortInformationSerializer
from sensors.utils import get_serial_ports, filter_ports

# Create your views here.

class PortsAPIView(APIView):
    def get(self, request):
        enhanced_ports = filter_ports(get_serial_ports(), enhanced=True)
        serializer = PortInformationSerializer(enhanced_ports, many=True)
        return Response(data=serializer.data, status=status.HTTP_200_OK)
