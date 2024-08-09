from celery import shared_task
from .utils import get_serial_ports, filter_ports
from django.core.cache import cache
import json
from .models import Sensor
from channels.layers import get_channel_layer
from asgiref.sync import async_to_sync

REDIS_KEY = 'previous_port_names'

###* Utility functions
def _notify_on_port_change():
    channel_layer = get_channel_layer()
    async_to_sync(channel_layer.group_send)(
        'sensor_updates',
        {
            'type': 'notify_of_port_change',
            'message': 'There has been a change in the available ports.'
        }
    )
    return 'Notifying of port change...'

def _refresh_sensor_status(connected_ports: list[str]):
    sensors = Sensor.objects.all()
    for sensor in sensors:
        if sensor.is_connected and sensor.port_name not in connected_ports:
            sensor.is_connected = False
            sensor.save()
    return 'Updating sensor status...'


###* Celery tasks
@shared_task
def monitor_serial_ports():
    def _has_changed(current_ports, previous_ports):
        return set(current_ports) != set(previous_ports)
    
    current_ports = filter_ports(get_serial_ports(), enhanced=True)
    current_port_names = [port.name for port in current_ports]
    previous_port_names_raw = cache.get(REDIS_KEY)
    
    #* If the cache is empty, set the current port names and return
    if previous_port_names_raw is None:
        cache.set(REDIS_KEY, json.dumps(current_port_names))
        return 'Initial port names cached'
    
    previous_port_names = json.loads(previous_port_names_raw)
    #* Compare the current port names with the previous port names
    if _has_changed(current_port_names, previous_port_names):
        cache.set(REDIS_KEY, json.dumps(current_port_names))
        _refresh_sensor_status(current_port_names)
        return _notify_on_port_change()
    
    #* No change detected
    _refresh_sensor_status(current_port_names)
    return 'No port change detected...'