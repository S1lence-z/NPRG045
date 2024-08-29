import json
from acconeer.exptool import a121
from acconeer.exptool.a121.algo.distance import ProcessorResult
from acconeer.exptool.a121._core.entities.containers.metadata import Metadata
from acconeer.exptool.a121._core.entities.containers.result import ResultContext
from acconeer.exptool.a121.algo.distance._processors import (
    ProcessorExtraResult,
    ProcessorResult,
)
from acconeer.exptool.a121.algo.distance import DetectorResult

class ProcessorExtraResultEncoder(json.JSONEncoder):
    def default(self, object: ProcessorExtraResult) -> str:
        if isinstance(object, ProcessorExtraResult):
            return {
                'abs_sweep': object.abs_sweep.tolist() if object.abs_sweep is not None else None,
                'used_threshold': object.used_threshold.tolist() if object.used_threshold is not None else None,
                'distances_m': object.distances_m.tolist() if object.distances_m is not None else None,
            }
            
class ProcessorResultEncoder(json.JSONEncoder):
    def default(self, object: ProcessorResult) -> str:
        if isinstance(object, ProcessorResult):
            return {
                'estimated_distances': object.estimated_distances if object.estimated_distances is not None else None,
                'estimated_strengths': object.estimated_strengths if object.estimated_strengths is not None else None,
                'near_edge_status': object.near_edge_status,
                'recorded_threshold_mean_sweep': object.recorded_threshold_mean_sweep.tolist() if object.recorded_threshold_mean_sweep is not None else None,
                'recorded_threshold_noise_std': object.recorded_threshold_noise_std if object.recorded_threshold_noise_std is not None else None,
                'direct_leakage': object.direct_leakage.tolist() if object.direct_leakage is not None else None,
                'phase_jitter_comp_reference': object.phase_jitter_comp_reference.tolist() if object.phase_jitter_comp_reference is not None else None,
                'extra_result': ProcessorExtraResultEncoder().default(object.extra_result),
            }
            
class MetadataEncoder(json.JSONEncoder):
    def default(self, object: Metadata) -> str:
        if isinstance(object, Metadata):
            return {
                '_frame_data_length': object.frame_data_length,
                '_sweep_data_length': object.sweep_data_length,
                '_subsweep_data_offset': object.subsweep_data_offset.tolist(),
                '_subsweep_data_length': object.subsweep_data_length.tolist(),
                '_calibration_temperature': object.calibration_temperature,
                '_tick_period': object.tick_period,
                '_base_step_length_m': object.base_step_length_m,
                '_max_sweep_rate': object.max_sweep_rate,
                '_high_speed_mode': object.high_speed_mode,
            }

class ResultContextEncoder(json.JSONEncoder):
    def default(self, object: ResultContext) -> str:
        if isinstance(object, ResultContext):
            return {
                'metadata': MetadataEncoder().default(object.metadata),
                'ticks_per_second': object.ticks_per_second,
            }
            
class A121ResultEncoder(json.JSONEncoder):
    def default(self, object: a121.Result) -> str:
        if isinstance(object, a121.Result):
            return {
                'data_saturated': object.data_saturated,
                'frame_delayed': object.frame_delayed,
                'calibration_needed': object.calibration_needed,
                'temperature': object.temperature,
                '_frame': object._frame.tolist(),
                'tick': object.tick,
                '_context': ResultContextEncoder().default(object._context),
            }

class ServiceExtendedResult(json.JSONEncoder):
    def default(self, object: dict[int, a121.Result]) -> str:
        if isinstance(object,  dict):
            return {
                key: A121ResultEncoder().default(value) for key, value in object.items()
            }
            
class DetectorResultEncoder(json.JSONEncoder):
    def default(self, object: DetectorResult) -> str:
        if isinstance(object, DetectorResult):
            return {
                'distances': object.distances.tolist(),
                'strengths': object.strengths.tolist(),
                'near_edge_status': object.near_edge_status,
                'calibration_needed': object.calibration_needed,
                'temperature': object.temperature,
                'processor_result': [ProcessorResultEncoder().default(pr) for pr in object.processor_results],
                'service_extended_result': [ServiceExtendedResult().default(ser) for ser in object.service_extended_result],
            }