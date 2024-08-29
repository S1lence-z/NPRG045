import serial.tools.list_ports
from serial.tools.list_ports_common import ListPortInfo
from .models import Sensor
from channels.layers import get_channel_layer
from asgiref.sync import async_to_sync

def get_serial_ports() -> list['PortInformation']:
    """
    Returns a list of available serial ports.

    Returns:
        list[PortInformation]: A list of PortInformation objects representing the available serial ports.
    """
    return [PortInformation(port) for port in serial.tools.list_ports.comports()]

def filter_ports(ports: list['PortInformation'], standard=False, enhanced=False) -> list['PortInformation']:
    """
    Filters a list of 'PortInformation' objects based on the specified criteria.

    Args:
        ports (list['PortInformation']): The list of 'PortInformation' objects to filter.
        standard (bool, optional): If True, only ports with 'standard' in their description will be included. Defaults to False.
        enhanced (bool, optional): If True, only ports with 'enhanced' in their description will be included. Defaults to False.

    Returns:
        list['PortInformation']: The filtered list of 'PortInformation' objects.
    """
    if standard:
        return [port for port in ports if 'standard' in port.description.lower()]
    if enhanced:
        return [port for port in ports if 'enhanced' in port.description.lower()]
    return ports

class PortInformation:
    """
    Represents information about a port.

    Attributes:
        port (ListPortInfo): The port information.
        name (str): The name of the port.
        description (str): The description of the port.
        hwid (str): The hardware ID of the device connected to the port.
    """

    def __init__(self, port: ListPortInfo):
        self.port = port
        self.name = port.device
        self.description = port.description
        self.device_hwid = port.hwid

    def __str__(self):
        return f'PortInformation(name={self.name}, device_hwid={self.device_hwid})'
    
    def __repr__(self):
        return str(self)
    
def notify_on_port_change():
    channel_layer = get_channel_layer()
    async_to_sync(channel_layer.group_send)(
        'sensor_updates',
        {
            'type': 'notify_of_port_change',
            'message': 'There has been a change in the available ports.'
        }
    )
    return 'Notifying of port change...'

def refresh_sensor_status(connected_ports: list[str]):
    sensors = Sensor.objects.all()
    for sensor in sensors:
        if sensor.is_connected and sensor.port_name not in connected_ports:
            sensor.is_connected = False
            sensor.save()
    return 'Updating sensor status...'