from abc import ABC, abstractmethod

class SensorApplication(ABC):
    """
    Abstract base class for sensor applications.
    This class defines the interface for sensor applications. Subclasses must implement the `start` and `stop` methods.
    Attributes:
        None
    Methods:
        start: Start the sensor application.
        stop: Stop the sensor application.
    """
    @abstractmethod
    def start(self):
        pass
    
    @abstractmethod
    def stop(self):
        pass