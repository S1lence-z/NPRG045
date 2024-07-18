from django.core.management.base import BaseCommand
from serial.tools.list_ports_common import ListPortInfo
from sensors.utils import get_serial_ports

class Command(BaseCommand):
    help = 'Discover available serial ports'
    
    def add_arguments(self, parser):
        parser.add_argument(
            '--standard', 
            action='store_true', 
            help='Only show standard serial ports.'
        )
        parser.add_argument(
            '--enhanced',
            action='store_true',
            help='Only show enhanced serial ports.'
        )
    
    def handle(self, *args, **kwargs):
        available_ports = [PortInformation(port) for port in get_serial_ports()]
        if not available_ports:
            self.stdout.write('No serial ports found')
        else:
            filtered_ports = self._filer_ports(available_ports, kwargs['standard'], kwargs['enhanced'])
            self._print_available_ports(filtered_ports)
                    
    def _filer_ports(self, ports: list['PortInformation'], standard=False, enhanced=False):
        if standard:
            return [port for port in ports if 'standard' in port.description.lower()]
        if enhanced:
            return [port for port in ports if 'enhanced' in port.description.lower()]
        return ports
    
    def _print_available_ports(self, ports: list['PortInformation']):
        num_ports = len(ports)
        if num_ports == 1: self.stdout.write('1 available serial port:')
        else: self.stdout.write(f'{num_ports} available serial ports:')
        for port in ports:
            self.stdout.write(str(port))
    
class PortInformation:
    def __init__(self, port: ListPortInfo):
        self.port = port
        self.name = port.device
        self.description = port.description
        self.hwid = port.hwid

    def __str__(self):
        return f'{self.name} - {self.hwid}'