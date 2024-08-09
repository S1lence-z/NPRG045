from acconeer.exptool import a121
from acconeer.exptool.a121.algo.distance import Detector, DetectorConfig, ThresholdMethod, DetectorResult
from acconeer.exptool.a121.algo import PeakSortingMethod, ReflectorShape
from abc import ABC, abstractmethod
from sensors.models import Sensor, DistanceProfile
from .sensor_client import SensorClient
from channels.layers import get_channel_layer
from asgiref.sync import async_to_sync
from api.serializers import SensorSerializer
from sensors.detector_serializers import DetectorResultEncoder
import json

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
    _distance_detector_instances: dict[SensorClient, Detector] = {}
        
    def __init__(self) -> None:
        raise RuntimeError('Use get_instance() to get the singleton instance.')
    
    @classmethod
    def get_instance(cls) -> 'SensorClientManager':
        if cls._instance is None:
            cls._instance = cls.__new__(cls)
            cls._instance_exists = True
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
        distance_detector_instance = self._distance_detector_instances.get(sensor_client)
        if distance_detector_instance is None:
            raise ValueError(f'No distance detector instance found for sensor: {sensor}. Is it started?')
        return distance_detector_instance
    
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
        
    def send_distance_data_to_frontend(self, sensor: Sensor, detector_result: dict[int, DetectorResult]):
        """
        Sends distance data from a sensor to the frontend.

        Args:
            sensor (Sensor): The sensor object.
            detector_result (dict[int, DetectorResult]): The detector result data.

        Returns:
            None
        """
        channel_layer = get_channel_layer()
        sensor_info = SensorSerializer(sensor).data
        sensor_data = json.loads(json.dumps(detector_result, cls=DetectorResultEncoder))
        async_to_sync(channel_layer.group_send)(
            'sensor_updates',
            {
                'type': 'send_distance_data',
                'message': 'New distance data from a sensor',
                'sensor': sensor_info,
                'data': sensor_data
            }
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
        else:
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
        
        SENSOR_IDS = [1]
        client_instance = self._get_sensor_client(sensor)
        distance_profile = self._convert_to_detector_config(distance_profile)
        distance_detector = Detector(
            client=client_instance.client,
            sensor_ids=SENSOR_IDS,
            detector_config=distance_profile
        )
        
        self._distance_detector_instances[client_instance] = distance_detector
        distance_detector.calibrate_detector()
        distance_detector.start()
        print(f'Started distance detector for sensor: {sensor}')
        
        while distance_detector.started:
            data = distance_detector.get_next()
            if data is not None:
                self.send_distance_data_to_frontend(sensor, data)
            if not distance_detector.started:
                del self._distance_detector_instances[client_instance]
                break
    
    def stop_distance_detector(self, sensor: Sensor):
        """
        Stops the distance detector for a sensor.

        Args:
            sensor (Sensor): The sensor for which to stop the distance detector.

        Returns:
            None
        """
        client_instance = self._get_sensor_client(sensor)
        distance_detector = self._distance_detector_instances.get(client_instance)
        distance_detector.stop()
        del self._distance_detector_instances[client_instance]
        print(f'Stopped distance detector for sensor: {sensor}')
