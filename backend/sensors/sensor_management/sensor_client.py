from sensors.models import Sensor
from acconeer.exptool import a121
from acconeer.exptool.a121.algo.distance import Detector

class SensorClient:
    def __init__(self, sensor: Sensor) -> None:
        self.sensor: Sensor = sensor
        self.client: a121.Client = a121.Client.open(serial_port=sensor.port_name)
        self.connected_port: str = sensor.port_name
        self._distance_detector: Detector = None
        
    @property
    def distance_detector(self) -> Detector:
        if self._distance_detector is None:
            raise ValueError('Distance detector not set.')
        return self._distance_detector
    
    @distance_detector.setter
    def distance_detector(self, detector: Detector) -> None:
        self._distance_detector = detector
    
    def __str__(self) -> str:
        return f'SensorClient(connected_port={self.connected_port})'
    
    def __repr__(self) -> str:
        return str(self)
    
    def __del__(self) -> None:
        try:
            if hasattr(self, 'client') and self.client:
                self.client.close()
        except Exception as e:
            print(f'Error while closing client: {e}')
        finally:
            self.client = None
            self.sensor = None
            self.connected_port = None