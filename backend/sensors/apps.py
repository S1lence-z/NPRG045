from django.apps import AppConfig
from django.db.models.signals import post_migrate
from django.dispatch import receiver

class SensorsConfig(AppConfig):
    default_auto_field = 'django.db.models.BigAutoField'
    name = 'sensors'
        
    def _instantiate_sensor_client_manager(self):
        from .sensor_management.sensor_client_manager import SensorClientManager
        SensorClientManager.get_instance()
        print('SensorClientManager singleton created')
        
    @receiver(post_migrate)
    def _prepare_db(self, sender, **kwargs):
        from sensors.models import Sensor
        Sensor.objects.update(is_connected=False)
        print('Successfully reset all connected sensors')

    def ready(self):
        self._instantiate_sensor_client_manager()
        post_migrate.connect(self._prepare_db, sender=self)