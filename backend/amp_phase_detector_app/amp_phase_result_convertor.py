from acconeer.exptool import a121
from acconeer_result_encoders import A121ResultEncoder
import numpy as np
import numpy.typing as npt
from acconeer.exptool.a121 import algo

class AmpPhaseResultConvertor():
    _instance: 'AmpPhaseResultConvertor' = None
    
    def __init__(self) -> None:
        raise RuntimeError('Use get_instance() to get the singleton instance.')
    
    @classmethod
    def get_instance(cls) -> 'AmpPhaseResultConvertor':
        if cls._instance is None:
            cls._instance = cls.__new__(cls)
        return cls._instance
    
    def convert_to_amp_phase_data(self, amp_phase_result: list[dict[int, a121.Result]], config: a121.SensorConfig, metadata: a121.Metadata) -> dict:
        # Extract the result from the list
        amp_phase_result = amp_phase_result[0][1]
        metadata = metadata[0][1]
        
        subsweep_result = self._get_amp_phase_data(amp_phase_result)
        distances_result = self._get_distance_data(config, metadata)
        return {
            'subsweep_results': [result.to_dict() for result in subsweep_result],
            'distances_result': [float(distances) for distances in distances_result.tolist()]
        }
    
    @staticmethod
    def _get_amp_phase_data(amp_phase_result: a121.Result):
        #* the amplitude method should always be set to default => COHERENT
        result: list[SubsweepResult] = []
        for subframe in amp_phase_result.subframes:
            amplitudes = np.abs(subframe.mean(axis=0))
            phases = np.angle(subframe.mean(axis=0))
            result.append(SubsweepResult(subframe, amplitudes, phases))
        return result
    
    @staticmethod
    def _get_distance_data(config: a121.SensorConfig, metadata: a121.Metadata) -> npt.NDArray[np.float_]:
        temp_distances = [algo.get_distances_m(subsweep, metadata) for subsweep in config.subsweeps]
        return temp_distances[0]
        
class SubsweepResult():
    def __init__(self, subsweep, amplitudes, phases) -> None:
        self.subsweep = subsweep
        self.amplitude = amplitudes
        self.phase = phases
        
    def to_dict(self):
        return {
            # 'frame': [str(subsweep) for subsweep in self.subsweep.tolist()],
            'amplitude': self.amplitude.tolist(),
            'phase': self.phase.tolist()
        }