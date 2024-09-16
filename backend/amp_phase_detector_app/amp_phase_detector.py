from acconeer.exptool import a121
from sensors.managers.sensor_client import SensorClient

class AmpPhaseDetector():
    def __init__(self, sensor_client: SensorClient, sensor_config: a121.SensorConfig):
        self._sensor_client: SensorClient = sensor_client
        self._sensor_config: a121.SensorConfig = sensor_config
        self._session_config = a121.SessionConfig()     #! DO NOT SET THE SENSOR CONFIG HERE
        self._client: a121.Client  = sensor_client.client
        self._metadata: a121.Metadata = self._client.setup_session(self._session_config)
        
    def start(self):
        self._client.start_session()
        
    def stop(self):
        self._client.stop_session()
        
    def get_next(self) -> (a121.Result | list[dict[int, a121.Result]]):
        #! when the extended=True in the session config is set, the result is in the list format
        #! that is needed when there are multiple sensor configs in the session config
        #! currently, the session config is set to have only one sensor config
        # TODO: add the possiblity of adding more sensor configs in the session config
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