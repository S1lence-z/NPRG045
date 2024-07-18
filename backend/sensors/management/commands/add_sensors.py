from django.core.management.base import BaseCommand
from sensors.utils import get_serial_ports, filter_ports
from sensors.models import Sensor

class Command(BaseCommand):
    help = 'Add sensors to the database'
    
    def handle(self, *args, **kwargs):
        available_ports = get_serial_ports()
        enhanced_ports = filter_ports(available_ports, enhanced=True)
        for port in enhanced_ports:
            sensor, created = Sensor.objects.get_or_create(
                port_name=port.name,
                hwid=port.hwid,
                port_description=port.description
            )
            if created:
                self.stdout.write(f'Added sensor: {sensor}')
            else:
                self.stdout.write(f'Sensor already exists: {sensor}')