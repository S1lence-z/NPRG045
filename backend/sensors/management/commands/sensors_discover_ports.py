from django.core.management.base import BaseCommand
from sensors.utils import get_serial_ports, filter_ports, PortInformation

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
        available_ports = get_serial_ports()
        if not available_ports:
            self.stdout.write('No serial ports found')
        else:
            filtered_ports = filter_ports(available_ports, kwargs['standard'], kwargs['enhanced'])
            self._print_available_ports(filtered_ports)
    
    def _print_available_ports(self, ports: list['PortInformation']):
        num_ports = len(ports)
        if num_ports == 1: self.stdout.write('1 available serial port:')
        else: self.stdout.write(f'{num_ports} available serial ports:')
        for port in ports:
            self.stdout.write(str(port))