from celery import shared_task
from sensors.utils import get_serial_ports, filter_ports, refresh_sensor_status, notify_on_port_change
from django.core.cache import cache
import json

REDIS_KEY = 'previous_port_names'

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
        refresh_sensor_status(current_port_names)
        return notify_on_port_change()
    
    #* No change detected
    refresh_sensor_status(current_port_names)
    return 'No port change detected...'