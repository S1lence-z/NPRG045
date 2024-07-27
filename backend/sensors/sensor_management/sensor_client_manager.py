import acconeer.exptool.a121 as et
from acconeer.exptool import a121
from acconeer.exptool.a121.algo.distance import Detector, DetectorConfig, ThresholdMethod
from acconeer.exptool.a121.algo import PeakSortingMethod, ReflectorShape
from abc import ABC, abstractmethod
from sensors.models import Sensor, DistanceProfile
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
        add_sensor: Adds a sensor client instance to the manager.
        get_sensor_client: Retrieves a sensor client instance based on the sensor.
        remove_sensor: Removes a sensor client instance based on the sensor.
        start_distance_detector: Retrieves a distance detector for a sensor with the specified configuration.
        stop_distance_detector: Stops the distance detector for a sensor.
    """

    _instance = None
    _sensor_client_instances: dict[Sensor, SensorClient] = {}
    _distance_detector_instances: dict[SensorClient, Detector] = {}
        
    def __init__(self) -> None:
        raise RuntimeError('Use get_instance() to get the singleton instance.')
    
    @classmethod
    def get_instance(cls):
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
            None
        """
        return self._sensor_client_instances.get(sensor)
    
    def _convert_to_detector_config(self, distance_profile_model: DistanceProfile) -> DetectorConfig:
        """
        Converts a distance profile model to a detector configuration.

        Args:
            distance_profile_model (DistanceProfile): The distance profile model.

        Returns:
            DetectorConfig: The detector configuration.
        """
        # Convert fields with custom types to their respective values
        max_profile_value = getattr(a121.Profile, distance_profile_model.max_profile)
        threshold_method_value = getattr(ThresholdMethod, distance_profile_model.threshold_method)
        peak_sorting_method_value = getattr(PeakSortingMethod, distance_profile_model.peaksorting_method)
        reflector_shape_value = getattr(ReflectorShape, distance_profile_model.reflector_shape)
        
        return DetectorConfig(
            start_m=distance_profile_model.start_m,
            end_m=distance_profile_model.end_m,
            max_step_length=distance_profile_model.max_step_length,
            max_profile=max_profile_value,
            close_range_leakage_cancellation=distance_profile_model.close_range_leakage_cancellation,
            signal_quality=distance_profile_model.signal_quality,
            threshold_method=threshold_method_value,
            peaksorting_method=peak_sorting_method_value,
            reflector_shape=reflector_shape_value,
            num_frames_in_recorded_threshold=distance_profile_model.num_frames_in_recorded_threshold,
            fixed_threshold_value=distance_profile_model.fixed_threshold_value,
            fixed_strength_threshold_value=distance_profile_model.fixed_strength_threshold_value,
            threshold_sensitivity=distance_profile_model.threshold_sensitivity,
            update_rate=distance_profile_model.update_rate
        )
    
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
            del self._sensor_client_instances[sensor]
            print(f'Removed sensor instance for port name: {sensor.port_name}')
        print(f'Updated sensor instances: {self._sensor_client_instances}')
            
    def start_distance_detector(self, sensor: Sensor, distance_profile: DistanceProfile) -> Detector:
        """
        Retrieves a distance detector for a sensor with the specified configuration.

        Args:
            sensor (Sensor): The sensor for which to create the distance detector.
            distance_profile (DistanceProfile | None): The configuration for the distance detector.
                Defaults to None.

        Returns:
            Detector: The distance detector.

        Raises:
            ValueError: If no client instance is found for the specified sensor or if the
                detector configuration is not provided.
        """        
        client_instance = self._get_sensor_client(sensor)
        if client_instance is None:
            raise ValueError(f'No client instance found for sensor: {sensor}. Is it connected?')
        distance_profile = self._convert_to_detector_config(distance_profile)
        
        
        distance_detector = Detector(
            client=client_instance.client,
            sensor_ids=[1],
            detector_config=distance_profile
        )
        #! set the distance detector for the client instance
        client_instance.distance_detector = distance_detector
        distance_detector.calibrate_detector()
        distance_detector.start()
        print(f'Started distance detector for sensor: {sensor}')
        
        #! this is how to get data from the detector
        # while not interrupt_handler.got_signal:
        # detector_result = detector.get_next()
        # print(detector_result)
        # detector.stop()
        # print("Disconnecting...")
        # client.close()
        return distance_detector
    
    def stop_distance_detector(self, sensor: Sensor):
        """
        Stops the distance detector for a sensor.

        Args:
            sensor (Sensor): The sensor for which to stop the distance detector.

        Returns:
            None
        """
        client_instance = self._get_sensor_client(sensor)
        if client_instance is None:
            raise ValueError(f'No client instance found for sensor: {sensor}. Is it connected?')
        distance_detector = client_instance.distance_detector
        distance_detector.stop()
        del client_instance.distance_detector
        print(f'Stopped distance detector for sensor: {sensor}')
