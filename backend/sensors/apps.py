from django.apps import AppConfig

class SensorsConfig(AppConfig):
    default_auto_field = 'django.db.models.BigAutoField'
    name = 'sensors'
        
    def _instantiate_sensor_client_manager(self):
        from .sensor_management.sensor_client_manager import SensorClientManager
        SensorClientManager.get_instance()
        print('SensorClientManager singleton created')

    def ready(self):
        import sensors.signals
        self._instantiate_sensor_client_manager()