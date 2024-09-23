###* Utility functions
from sensors.serializers import SensorSerializer
from sensors.models import Sensor
from sensors.managers.sensor_client_manager import SensorClientManager
from asgiref.sync import async_to_sync
from channels.layers import get_channel_layer

def send_notification(updated_sensor: Sensor):
    channel_layer = get_channel_layer()
    async_to_sync(channel_layer.group_send)(
        'sensor_updates',
        {
            'type': 'notify_of_sensor_change',
            'message': f'Sensor with id {updated_sensor.id} on port {updated_sensor.port_name} updated',
            'sensor': SensorSerializer(updated_sensor).data
        }
    )

def update_sensor_client_manager(updated_sensor: Sensor):
    if not updated_sensor.is_connected:
        return SensorClientManager.get_instance().remove_sensor_client(updated_sensor)
    return SensorClientManager.get_instance().add_sensor_client(updated_sensor)