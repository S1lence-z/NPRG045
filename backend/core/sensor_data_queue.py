import queue
from sensors.managers.sensor_client import SensorClient

class SensorDataQueue:
    DEFAULT_TIMEOUT = 1
    
    def __init__(self, sensor_client: SensorClient) -> None:
        self._sensor_client: SensorClient = sensor_client
        self._raw_data_queue: queue.Queue = queue.Queue()
        self._converted_data_queue: queue.Queue = queue.Queue()
        
    def __del__(self) -> None:
        with self._raw_data_queue.mutex:
            self._raw_data_queue.queue.clear()
        with self._converted_data_queue.mutex:
            self._converted_data_queue.queue.clear()
    
    def put_raw_data(self, data):
        self._raw_data_queue.put(data)
        
    def get_raw_data(self):
        return self._raw_data_queue.get(timeout=self.DEFAULT_TIMEOUT)
    
    def put_converted_data(self, data):
        self._converted_data_queue.put(data)
        
    def get_converted_data(self):
        return self._converted_data_queue.get(timeout=self.DEFAULT_TIMEOUT)
    
    @property
    def is_converted_data_empty(self) -> bool:
        return self._converted_data_queue.empty()
    
    @property
    def is_raw_data_empty(self) -> bool:
        return self._raw_data_queue.empty()
    
    @property
    def is_empty(self) -> bool:
        return self._raw_data_queue.empty() and self._converted_data_queue.empty()