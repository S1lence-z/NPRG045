from acconeer.exptool.a121.algo.distance import Detector
from abc import ABC, abstractmethod
from distance_detector_app.distance_detector_app import DistanceDetectorApp
from sensors.models import Sensor
from distance_detector_app.models import DistanceProfile
from .sensor_client import SensorClient

class SensorAppProvider(ABC):
    """
    An abstract class which adds methods to start specific available sensor applications (distance detection, presence detection, etc.)

    Args:
        ABC (ABC): Abstract base class for the sensor application provider.
    """
    @abstractmethod
    def start_distance_detector(self, sensor: Sensor, distance_profile: DistanceProfile = None) -> Detector:
        pass
    
    @abstractmethod
    def stop_distance_detector(self, sensor: Sensor) -> None:
        pass

class SensorClientManager(SensorAppProvider):
    """
    A class that manages sensor client instances.

    Attributes:
        _instance (SensorClientManager): The singleton instance of the sensor client manager.
        _sensor_client_instances (dict[str, SensorClient]): A dictionary of sensor client instances with the port name as the key.
        _distance_detector_instances (dict[SensorClient, Detector]): A dictionary of distance detector instances with the sensor client as the key.

    Methods:
        add_sensor_client: Adds a sensor client instance to the manager.
        remove_sensor_client: Removes a sensor client instance based on the sensor.
        start_distance_detector: Retrieves a distance detector for a sensor with the specified configuration.
        stop_distance_detector: Stops the distance detector for a sensor.
    """

    _instance = None
    _sensor_client_instances: dict[Sensor, SensorClient] = {}
    #* Sensor Aplications
    _distance_detector_app: 'DistanceDetectorApp' = DistanceDetectorApp.get_instance()
        
    def __init__(self) -> None:
        raise RuntimeError('Use get_instance() to get the singleton instance.')
    
    @classmethod
    def get_instance(cls) -> 'SensorClientManager':
        if cls._instance is None:
            cls._instance = cls.__new__(cls)
        return cls._instance
    
    def __del__(self):
        for sensor_client in self._sensor_client_instances.values():
            sensor_client.client.close()
        self._instance = None
        self._sensor_client_instances = {}
        self._distance_detector_instances = {}
        
    def __str__(self) -> str:
        return f'SensorClientManager(sensor_client_instances={self._sensor_client_instances})'
        
    def _get_sensor_client(self, sensor: Sensor) -> SensorClient:
        """
        Retrieves a sensor client instance based on the sensor.

        Args:
            sensor (Sensor): The sensor.

        Returns:
            SensorClient: The sensor client instance.

        Raises:
            ValueError: If no sensor client instance is found for the specified sensor.
        """
        sensor_client_instance = self._sensor_client_instances.get(sensor)
        if sensor_client_instance is None:
            raise ValueError(f'No sensor client instance found for sensor: {sensor}. Is it connected?')
        return sensor_client_instance
    
    def _get_distance_detector(self, sensor: Sensor) -> Detector:
        """
        Retrieves a distance detector based on the sensor.

        Args:
            sensor (Sensor): The sensor.

        Returns:
            Detector: The distance detector.

        Raises:
            ValueError: If no distance detector instance is found for the specified sensor.
        """
        sensor_client = self._get_sensor_client(sensor)
        distance_detector_instance = self._distance_detector_app.get_distance_detector(sensor_client)
        if distance_detector_instance is None:
            raise ValueError(f'No distance detector instance found for sensor: {sensor}. Is it started?')
        return distance_detector_instance
    
    def add_sensor_client(self, sensor_model: Sensor):
        """
        Adds a sensor client instance to the manager.

        Args:
            sensor_model (Sensor): The sensor model representing the sensor to be added.

        Returns:
            None
        """
        if sensor_model not in self._sensor_client_instances.keys():
            self._sensor_client_instances[sensor_model] = SensorClient(sensor_model)
            print(f'Added sensor instance. Updated sensor instances: {self._sensor_client_instances}')
            return
        print(f'Sensor instance for port name: {sensor_model.port_name} already exists')
        
    def remove_sensor_client(self, sensor: Sensor):
        """
        Removes a sensor client instance based on the sensor.

        Args:
            sensor (Sensor): The sensor.

        Returns:
            None
        """
        if sensor in self._sensor_client_instances.keys():
            sensor_client = self._sensor_client_instances[sensor]
            sensor_client.client.close()
            del self._sensor_client_instances[sensor]
            print(f'Removed sensor instance for port name: {sensor.port_name}')
            print(f'Updated sensor instances: {self._sensor_client_instances}')
            return
        print(f'No sensor instance found for port name: {sensor.port_name}')
            
    def start_distance_detector(self, sensor: Sensor, distance_profile: DistanceProfile) -> Detector:
        """
        Retrieves a distance detector for a sensor with the specified configuration.

        Args:
            sensor (Sensor): The sensor for which to create the distance detector.
            distance_profile (DistanceProfile | None): The configuration for the distance detector.
                Defaults to None.

        Returns:
            Boolean: True if the distance detector was successfully started, False otherwise.

        Raises:
            ValueError: If no client instance is found for the specified sensor or if the
                detector configuration is not provided.
        """
        client_instance = self._get_sensor_client(sensor)
        self._distance_detector_app.start(client_instance, distance_profile)
        
    def stop_distance_detector(self, sensor: Sensor):
        """
        Stops the distance detector for a sensor.

        Args:
            sensor (Sensor): The sensor for which to stop the distance detector.

        Returns:
            None
        """
        client_instance = self._get_sensor_client(sensor)
        self._distance_detector_app.stop(client_instance)