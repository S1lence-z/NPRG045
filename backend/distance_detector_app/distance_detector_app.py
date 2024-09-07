import threading
from distance_detector_app.models import DistanceProfile
from distance_detector_app.distance_result_convertor import DistanceResultConvertor
from sensors.models import Sensor
from sensors.managers.sensor_client import SensorClient
from sensors.managers.sensor_app_abc import SensorApplication
from sensors.serializers import SensorSerializer
from acconeer.exptool import a121
from acconeer.exptool.a121.algo.distance import Detector, DetectorConfig, ThresholdMethod
from acconeer.exptool.a121.algo import PeakSortingMethod, ReflectorShape
from channels.layers import get_channel_layer
from asgiref.sync import async_to_sync

class DistanceDetectorApp(SensorApplication):
    _instance: 'DistanceDetectorApp' = None
    _distance_detector_instances: dict[SensorClient, Detector] = {}
    _detector_threads: dict[Sensor, threading.Thread] = {}
    _stop_events: dict[Sensor, threading.Event] = {}
    
    def __init__(self):
        raise RuntimeError('Use get_instance() to get the singleton instance.')
    
    @classmethod
    def get_instance(cls) -> 'DistanceDetectorApp':
        if cls._instance is None:
            print('Creating DistanceDetectorApp singleton instance')
            cls._instance = cls.__new__(cls)
        return cls._instance
    
    def __del__(self):
        # TODO: Implement this method
        pass
    
    def __str__(self) -> str:
        return f'DistanceDetectorApp(sensor_detector_instances={self._distance_detector_instances})'
    
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
    
    def _send_distance_data_to_frontend(self, sensor: Sensor, detector_result: dict):
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
        #! this serializes the whole detector result object
        # sensor_data = json.loads(json.dumps(detector_result, cls=DetectorResultEncoder))
        sensor_data = detector_result
        async_to_sync(channel_layer.group_send)(
            'sensor_updates',
            {
                'type': 'send_distance_data',
                'message': 'New distance data from a sensor',
                'sensor': sensor_info,
                'data': sensor_data
            }
        )
    
    def get_distance_detector(self, sensor_client: SensorClient) -> Detector:
        return self._distance_detector_instances.get(sensor_client)
    
    def start(self, sensor_client: SensorClient, distance_profile: DistanceProfile) -> Detector:
        def _run_distance_detector(distance_detector: Detector):
            distance_detector.start()
            result_convertor = DistanceResultConvertor.get_instance()
            while not stop_event.is_set():
                data = distance_detector.get_next()
                if data is not None:
                    converted_data = result_convertor.convert_to_graph_data(data)
                    self._send_distance_data_to_frontend(sensor_client.sensor, converted_data)
        
        SENSOR_IDS = [1]
        distance_profile = self._convert_to_detector_config(distance_profile)
        distance_detector = Detector(
            client=sensor_client.client,
            sensor_ids=SENSOR_IDS,
            detector_config=distance_profile
        )
        distance_detector.calibrate_detector()
        self._distance_detector_instances[sensor_client] = distance_detector
        
        # Start the distance detector in a separate thread
        #! Instantiate and save stop event
        stop_event = threading.Event()
        self._stop_events[sensor_client.sensor] = stop_event
        #! Instantiate, save and start detector thread
        detector_thread = threading.Thread(target=_run_distance_detector, args=(distance_detector,))
        self._detector_threads[sensor_client.sensor] = detector_thread
        detector_thread.start()
        
    def stop(self, sensor_client: SensorClient):
        distance_detector = self._distance_detector_instances.get(sensor_client)
        
        if sensor_client.sensor in self._stop_events:
            self._stop_events[sensor_client.sensor].set()
            self._detector_threads[sensor_client.sensor].join(1)
            del self._detector_threads[sensor_client.sensor]
            del self._stop_events[sensor_client.sensor]
            
        if distance_detector:
            distance_detector.stop()
            del self._distance_detector_instances[sensor_client]
            print(f'Stopped distance detector for sensor: {sensor_client.sensor}')