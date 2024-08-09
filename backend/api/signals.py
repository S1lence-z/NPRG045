from django.db.models.signals import post_save, post_delete
from django.dispatch import receiver
from sensors.models import Sensor
from asgiref.sync import async_to_sync
from channels.layers import get_channel_layer
from api.serializers import SensorSerializer
from sensors.sensor_management.sensor_client_manager import SensorClientManager

###* Utility functions
def _send_notification(updated_sensor: Sensor):
    channel_layer = get_channel_layer()
    async_to_sync(channel_layer.group_send)(
        'sensor_updates',
        {
            'type': 'notify_of_sensor_change',
            'message': f'Sensor with id {updated_sensor.id} on port {updated_sensor.port_name} updated',
            'sensor': SensorSerializer(updated_sensor).data
        }
    )

def _update_sensor_client_manager(updated_sensor: Sensor):
    if not updated_sensor.is_connected:
        return SensorClientManager.get_instance().remove_sensor_client(updated_sensor)
    return SensorClientManager.get_instance().add_sensor_client(updated_sensor)


###* Signal handlers
@receiver(post_save, sender=Sensor)
def handle_sensor_save(sender, instance, **kwargs):
    """
    This is a signal handler function that is triggered after a Sensor object is saved.
    1. Updates the sensor client manager.
    2. It sends a notification to a group of connected clients using Django Channels.

    Parameters:
    - sender: The sender of the signal (Sensor model).
    - instance: The instance of the saved Sensor object.
    - **kwargs: Additional keyword arguments.

    Returns:
    None
    """
    _update_sensor_client_manager(instance)
    _send_notification(instance)
    
@receiver(post_delete, sender=Sensor)
def handle_sensor_deletion(sender, instance, **kwargs):
    """
    This is a signal handler function that is triggered after a Sensor object is deleted.
    1. Updates the sensor client manager.
    2. It sends a notification to a group of connected clients using Django Channels.

    Parameters:
    - sender: The sender of the signal (Sensor model).
    - instance: The instance of the deleted Sensor object.
    - **kwargs: Additional keyword arguments.

    Returns:
    None
    """
    _update_sensor_client_manager(instance)
    _send_notification(instance)