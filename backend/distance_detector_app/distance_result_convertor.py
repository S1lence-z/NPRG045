from acconeer.exptool.a121.algo.distance import DetectorResult
import datetime
import acconeer.exptool as et
import numpy as np

class DistanceResultConvertor:
    _instance: 'DistanceResultConvertor' = None
    
    def __init__(self) -> None:
        raise RuntimeError('Use get_instance() to get the instance of this class')
    
    @classmethod
    def get_instance(cls) -> 'DistanceResultConvertor':
        if cls._instance is None:
            cls._instance = cls.__new__(cls)
        return cls._instance 
    
    _distance_hist_smooth_limit = et.utils.SmoothLimits()
    _distance_history = [np.NaN] * 100
    
    def _calculate_distances(self, result: dict[int, DetectorResult]) -> dict:
        if len(result.distances) != 0:
            self._distance_history.append(result.distances[0])
        else:
            self._distance_history.append(np.NaN)
        #* calculate the new distance value and update the limits
        if np.any(~np.isnan(self._distance_history)):
            new_distance_value = self._distance_history[-1]
            if new_distance_value is np.NaN:
                new_distance_value = None
            lims = self._distance_hist_smooth_limit.update(self._distance_history)
            lims = [round(lim, 2) for lim in lims]
            if lims[0] is np.NaN or lims[1] is np.NaN:
                lims = [None, None]
            return {
                'value': new_distance_value,
                'limits': lims
            }
        return {}
    
    def _calculate_strengths(self, result: dict[int, DetectorResult]) -> list:
        return {
            'values': [res for res in result.strengths]
        }
    
    def convert_to_distance_data(self, detector_result: dict[int, DetectorResult]) -> dict:
        data_packet = {}
        timestamp = datetime.datetime.now().strftime('%H:%M:%S')
        for sensor_id, result in detector_result.items():
            data_packet = {
                'timestamp': timestamp,
                'distances': self._calculate_distances(result),
                'strengths': self._calculate_strengths(result),
                'temperature': result.temperature
            }
        return data_packet