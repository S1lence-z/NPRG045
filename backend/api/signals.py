from django.db.models.signals import post_save, post_delete
from django.dispatch import receiver
from sensors.models import Sensor
from ports.utils import update_sensor_client_manager, send_notification

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
    update_sensor_client_manager(instance)
    send_notification(instance)
    
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
    update_sensor_client_manager(instance)
    send_notification(instance)