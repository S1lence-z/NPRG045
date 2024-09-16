import threading
import queue
from core.sensor_data_queue import SensorDataQueue
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
    _result_convertor: DistanceResultConvertor = DistanceResultConvertor.get_instance()
    # Threading related variables
    _thread_locks: dict[SensorClient, threading.Lock] = {}
    _stop_events: dict[SensorClient, threading.Event] = {}
    _sensor_client_to_threads_map: dict[SensorClient, list[threading.Thread]] = {}
    _sensor_client_to_queue_map: dict[SensorClient, SensorDataQueue] = {}
    
    def __init__(self):
        raise RuntimeError('Use get_instance() to get the singleton instance.')
    
    @classmethod
    def get_instance(cls) -> 'DistanceDetectorApp':
        if cls._instance is None:
            print('Creating DistanceDetectorApp singleton instance')
            cls._instance = cls.__new__(cls)
        return cls._instance
    
    def __del__(self) -> None:
        # Stop all distance detectors and threads
        for sensor, stop_event in self._stop_events.items():
            stop_event.set()
            self._sensor_client_to_threads_map[sensor].join(1)
            del self._sensor_client_to_threads_map[sensor]
            del self._stop_events[sensor]
        
        #? Should the sensor client be used for something?
        for sensor_client, distance_detector in self._distance_detector_instances.items():
            distance_detector.stop()
        self._distance_detector_instances.clear()
    
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
        @staticmethod
        def _create_distance_detector(sensor_client: SensorClient, sensor_ids: list[int], distance_profile: DistanceProfile) -> Detector:
            distance_detector_instance = Detector(client=sensor_client.client, sensor_ids=sensor_ids, detector_config=distance_profile)
            distance_detector_instance.calibrate_detector()
            return distance_detector_instance
        
        @staticmethod
        def _run_distance_detector(distance_detector: Detector, stop_event: threading.Event, thread_lock: threading.Lock, main_data_queue: SensorDataQueue):
            """Thread 1: Sensor data acquisition thread"""
            with thread_lock:
                distance_detector.start()
                
            while not stop_event.is_set():
                with thread_lock:
                    result = distance_detector.get_next()
                    main_data_queue.put_raw_data(result)
            
            with thread_lock:
                distance_detector.stop()
                print('Sensor data acquisition thread stopped')
            
        @staticmethod
        def _convert_data_thread(stop_event: threading.Event, main_data_queue: SensorDataQueue):
            """Thread 2: Data conversion thread"""
            while not stop_event.is_set():
                raw_data = main_data_queue.get_raw_data()
                converted_data = self._result_convertor.convert_to_distance_data(raw_data)
                main_data_queue.put_converted_data(converted_data)
            print('Data conversion thread stopped')
                
        @staticmethod
        def _send_data_thread(sensor_client: SensorClient, stop_event: threading.Event, main_data_queue: SensorDataQueue):
            """Thread 3: Data sending thread"""
            while not stop_event.is_set():
                try:
                    converted_data = main_data_queue.get_converted_data()
                    self._send_distance_data_to_frontend(sensor_client.sensor, converted_data)
                except Exception as e:
                    print(e)
            print('Data sending thread stopped')
        
        SENSOR_IDS = [1]
        distance_profile = self._convert_to_detector_config(distance_profile)
        distance_detector = _create_distance_detector(sensor_client, SENSOR_IDS, distance_profile)
        self._distance_detector_instances[sensor_client] = distance_detector
        
        # Initialize events and locks
        stop_event = threading.Event()
        self._stop_events[sensor_client] = stop_event
        thread_lock = threading.Lock()
        self._thread_locks[sensor_client] = thread_lock
        
        # Initialize sensor data queue
        main_data_queue = SensorDataQueue(sensor_client)
        self._sensor_client_to_queue_map[sensor_client] = main_data_queue
        
        # Start sensor data acquisition thread
        detector_thread = threading.Thread(target=_run_distance_detector, args=(distance_detector, stop_event, thread_lock, main_data_queue))
        self._sensor_client_to_threads_map[sensor_client] = [detector_thread]
        detector_thread.start()
        
        # Start data conversion thread
        convert_data_thread = threading.Thread(target=_convert_data_thread, args=(stop_event, main_data_queue))
        self._sensor_client_to_threads_map[sensor_client].append(convert_data_thread)
        convert_data_thread.start()
        
        # Start data sending thread
        send_data_thread = threading.Thread(target=_send_data_thread, args=(sensor_client, stop_event, main_data_queue))
        self._sensor_client_to_threads_map[sensor_client].append(send_data_thread)
        send_data_thread.start()
        
    def stop(self, sensor_client: SensorClient):
        # If the distance detector instance does not exist, raise an error
        if not sensor_client in self._distance_detector_instances.keys():
            raise RuntimeError('DistanceDetectorApp: Sensor client is not running')
        
        # Set the stop event to stop all threads
        self._stop_events[sensor_client].set()
        
        # Join all threads and delete them
        for thread in self._sensor_client_to_threads_map[sensor_client]:
            thread.join(1)
        del self._sensor_client_to_threads_map[sensor_client]
        
        # Delete the stop event, lock and queue
        del self._stop_events[sensor_client]
        del self._thread_locks[sensor_client]
        del self._sensor_client_to_queue_map[sensor_client]
        
        # Get and delete the distance detector instance
        distance_detector = self._distance_detector_instances.get(sensor_client)
        if distance_detector:
            del self._distance_detector_instances[sensor_client]
            print('Distance detector stopped')