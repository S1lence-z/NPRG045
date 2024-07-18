from django.core.management.base import BaseCommand
from sensors.utils import get_serial_ports

class Command(BaseCommand):
    help = 'Discover available serial ports'
    
    def handle(self, *args, **kwargs):
        available_ports = get_serial_ports()
        if not available_ports:
            self.stdout.write('No serial ports found')
        else:
            self.stdout.write(f'{len(available_ports)} available serial ports:')
            for port in available_ports:
                self.stdout.write(str(port.description))