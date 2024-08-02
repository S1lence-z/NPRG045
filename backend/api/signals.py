from django.db.models.signals import post_save
from django.dispatch import receiver
from sensors.models import Sensor
from asgiref.sync import async_to_sync
from channels.layers import get_channel_layer
from api.serializers import SensorSerializer

#* This receive should send a message to the WebSocketConsumer when a sensor is updated
@receiver(post_save, sender=Sensor)
def sensor_updated(sender, instance, **kwargs):
    updated_sensor = instance
    channel_layer = get_channel_layer()
    async_to_sync(channel_layer.group_send)(
        'sensor_updates',
        {
            'type': 'notify_of_sensor_change',
            'message': f'Sensor with id {updated_sensor.id} on port {updated_sensor.port_name} updated',
            'sensor': SensorSerializer(updated_sensor).data
        }
    )