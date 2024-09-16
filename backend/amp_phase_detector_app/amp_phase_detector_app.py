from amp_phase_detector_app.models import SensorConfig
from sensors.models import Sensor
from sensors.serializers import SensorSerializer
from sensors.managers.sensor_client import SensorClient
from sensors.managers.sensor_app_abc import SensorApplication
from acconeer.exptool import a121
from amp_phase_detector_app.amp_phase_detector import AmpPhaseDetector
from channels.layers import get_channel_layer
from asgiref.sync import async_to_sync
from amp_phase_detector_app.amp_phase_result_convertor import AmpPhaseResultConvertor
import threading
from core.sensor_data_queue import SensorDataQueue

class AmpPhaseDetectorApp(SensorApplication):
    _instance: 'AmpPhaseDetectorApp' = None
    _amp_phase_detector_instances: dict[SensorClient, AmpPhaseDetector] = {}
    _amp_phase_result_convertor: AmpPhaseResultConvertor = AmpPhaseResultConvertor.get_instance()
    # Threading related variables
    _thread_locks: dict[SensorClient, threading.Lock] = {}
    _stop_events: dict[SensorClient, threading.Event] = {}
    _sensor_client_to_threads_map: dict[SensorClient, list[threading.Thread]] = {}
    _sensor_client_to_queues_map: dict[SensorClient, SensorDataQueue] = {}
    
    def __init__(self):
        raise RuntimeError('Use get_instance() to get the singleton instance.')
    
    @classmethod
    def get_instance(cls) -> 'AmpPhaseDetectorApp':
        if cls._instance is None:
            print('Creating AmpPhaseDetectorApp singleton instance')
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
        for sensor_client, amp_phase_detector in self._amp_phase_detector_instances.items():
            amp_phase_detector.stop()
        self._amp_phase_detector_instances.clear()
    
    def __str__(self) -> str:
        return f'AmpPhaseDetectorApp(sensor_detector_instances={self._amp_phase_detector_instances})'
    
    def _convert_to_sensor_config(self, sensor_config: SensorConfig) -> a121.SensorConfig:
        # Convert the sensor config to a121.SensorConfig
        inter_frame_idle_state_value = getattr(a121.IdleState, sensor_config.inter_frame_idle_state)
        inter_sweep_idle_state_value = getattr(a121.IdleState, sensor_config.inter_sweep_idle_state)
        prf_value = getattr(a121.PRF, sensor_config.prf)
        profile_value = getattr(a121.Profile, sensor_config.profile)
        
        return a121.SensorConfig(
            sweeps_per_frame=sensor_config.sweeps_per_frame,
            continuous_sweep_mode=sensor_config.continuous_sweep_mode,
            double_buffering=sensor_config.double_buffering,
            inter_frame_idle_state=inter_frame_idle_state_value,
            inter_sweep_idle_state=inter_sweep_idle_state_value,
            sweep_rate=sensor_config.sweep_rate,
            frame_rate=sensor_config.frame_rate,
            start_point=sensor_config.start_point,
            num_points=sensor_config.num_points,
            step_length=sensor_config.step_length,
            receiver_gain=sensor_config.receiver_gain,
            enable_tx=sensor_config.enable_tx,
            enable_loopback=sensor_config.enable_loopback,
            phase_enhancement=sensor_config.phase_enhancement,
            prf=prf_value,
            hwaas=sensor_config.hwaas,
            profile=profile_value,
        )
    
    def _send_amp_phase_data_to_frontend(self, sensor: Sensor, amp_phase_result: dict):
        channel_layer = get_channel_layer()
        sensor_info = SensorSerializer(sensor).data
        sensor_data = amp_phase_result
        async_to_sync(channel_layer.group_send)(
            'sensor_updates',
            {
                'type': 'send_amp_phase_data',
                'message': 'New amplitude and phase data',
                'sensor': sensor_info,
                'data': sensor_data
            }
        )
    
    def start(self, sensor_client: SensorClient, sensor_config: SensorConfig) -> AmpPhaseDetector:
        @staticmethod
        def _create_amp_phase_detector(sensor_client: SensorClient, sensor_config: SensorConfig, sensor_ids: list[int]) -> AmpPhaseDetector:
            amp_phase_detector_instance = AmpPhaseDetector(sensor_client, sensor_config)
            self._amp_phase_detector_instances[sensor_client] = amp_phase_detector_instance
            return amp_phase_detector_instance
        
        @staticmethod
        def _run_amp_phase_detector(amp_phase_detector_instance: AmpPhaseDetector, stop_event: threading.Event, thread_lock: threading.Lock, main_data_queue: SensorDataQueue):
            """Thread 1: Sensor data acquisition thread"""
            with thread_lock:
                amp_phase_detector_instance.start()
                
            while not stop_event.is_set():
                with thread_lock:
                    result = amp_phase_detector_instance.get_next()
                    main_data_queue.put_raw_data(result)
                    
            with thread_lock:
                amp_phase_detector_instance.stop()
                print('Sensor data acquisition thread stopped')
                
        @staticmethod
        def _convert_data_thread(stop_event: threading.Event, main_data_queue: SensorDataQueue, config: a121.SensorConfig, metadata: a121.Metadata):
            """Thread 2: Data conversion thread"""
            while not stop_event.is_set():
                raw_data = main_data_queue.get_raw_data()
                converted_data = self._amp_phase_result_convertor.convert_to_amp_phase_data(raw_data, config, metadata)
                main_data_queue.put_converted_data(converted_data)
            print('Data conversion thread stopped')
                
        @staticmethod
        def _send_data_thread(sensor_client: SensorClient, stop_event: threading.Event, main_data_queue: SensorDataQueue):
            """Thread 3: Data sending thread"""
            while not stop_event.is_set():
                try:
                    converted_data = main_data_queue.get_converted_data()
                    self._send_amp_phase_data_to_frontend(sensor_client.sensor, converted_data)
                except Exception as e:
                    print(e)
            print('Data sending thread stopped')
        
        SENSOR_IDS = [1]
        sensor_config = self._convert_to_sensor_config(sensor_config)
        amp_phase_detector = _create_amp_phase_detector(sensor_client, sensor_config, SENSOR_IDS)
        amp_phase_config = amp_phase_detector.sensor_config
        amp_phase_detector_metadata = amp_phase_detector.metadata
        
        # Initialize events and locks
        stop_event = threading.Event()
        self._stop_events[sensor_client] = stop_event
        thread_lock = threading.Lock()
        self._thread_locks[sensor_client] = thread_lock
        
        # Initialize sensor data queue
        main_data_queue = SensorDataQueue(sensor_client)
        self._sensor_client_to_queues_map[sensor_client] = main_data_queue
        
        # Start sensor data acquisition thread
        detector_thread = threading.Thread(target=_run_amp_phase_detector, args=(amp_phase_detector, stop_event, thread_lock, main_data_queue))
        self._sensor_client_to_threads_map[sensor_client] = [detector_thread]
        detector_thread.start()
        
        # Start data conversion thread
        convert_data_thread = threading.Thread(target=_convert_data_thread, args=(stop_event, main_data_queue, amp_phase_config, amp_phase_detector_metadata))
        self._sensor_client_to_threads_map[sensor_client].append(convert_data_thread)
        convert_data_thread.start()
        
        # Start data sending thread
        send_data_thread = threading.Thread(target=_send_data_thread, args=(sensor_client, stop_event, main_data_queue))
        self._sensor_client_to_threads_map[sensor_client].append(send_data_thread)
        send_data_thread.start()
    
    def stop(self, sensor_client: SensorClient):
        if not sensor_client in self._sensor_client_to_threads_map:
            raise RuntimeError('AmpPhaseApp: Sensor client is not running')
        
        # Set the stop event to stop all threads
        self._stop_events[sensor_client].set()
        
        # Join all threads and delete them
        for thread in self._sensor_client_to_threads_map[sensor_client]:
            thread.join(1)
        del self._sensor_client_to_threads_map[sensor_client]
            
        # Delete the stop event, lock and queue
        del self._stop_events[sensor_client]
        del self._thread_locks[sensor_client]
        del self._sensor_client_to_queues_map[sensor_client]
        
        # Get and delete the amp phase detector instance
        amp_phase_detector = self._amp_phase_detector_instances.get(sensor_client)
        if amp_phase_detector:
            del self._amp_phase_detector_instances[sensor_client]
            print(f'Stopped amplitude and phase detector for sensor: {sensor_client.sensor}')