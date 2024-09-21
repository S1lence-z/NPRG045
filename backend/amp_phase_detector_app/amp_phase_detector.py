from acconeer.exptool import a121
from sensors.managers.sensor_client import SensorClient

class AmpPhaseDetector():
    def __init__(self, sensor_client: SensorClient, sensor_config: a121.SensorConfig, sensor_ids: list[int]):
        self._sensor_client: SensorClient = sensor_client
        #* DEFAULT SENSOR CONFIG
        self._sensor_config: a121.SensorConfig = a121.SensorConfig(
            sweeps_per_frame=32,
            num_points=40,
            step_length=8
        )
        self._session_config = a121.SessionConfig({sensor_ids[0]: self._sensor_config}, extended=True)
        self._client: a121.Client  = sensor_client.client
        self._metadata: a121.Metadata = self._client.setup_session(self._session_config)
        
    def start(self):
        self._client.start_session()
        
    def stop(self):
        self._client.stop_session()
        
    def get_next(self) -> (list[dict[int, a121.Result]]):
        return self._client.get_next()
    
    @property
    def metadata(self):
        return self._metadata
    
    @metadata.setter
    def metadata(self, metadata):
        self._metadata = metadata
    
    @property
    def sensor_config(self):
        return self._sensor_config
    
    @sensor_config.setter
    def sensor_config(self, sensor_config):
        self._sensor_config = sensor_config
    
    @property
    def session_config(self):
        return self._session_config
    
    @session_config.setter
    def session_config(self, session_config):
        self._session_config = session_config
    
    @property
    def client(self):
        return self._client
    
    @client.setter
    def client(self, value):
        self._client = value