from sensors.models import Sensor
from .serializers import SensorSerializer
from rest_framework.generics import ListAPIView

# Create your views here.

class SensorList(ListAPIView):
    queryset = Sensor.objects.all()
    serializer_class = SensorSerializer