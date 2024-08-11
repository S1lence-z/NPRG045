from acconeer.exptool.a121.algo.distance import DetectorResult
import datetime

class DistanceResultConvertor:
    # TODO: format distance to be in meters and contain data to format the graph
    # TODO: add strength to the graph data
    
    @staticmethod
    def convert_to_graph_data(detector_result: dict[int, DetectorResult]) -> dict:
        data_packet = {}
        timestamp = datetime.datetime.now().strftime('%H:%M:%S')
        for sensor_id, result in detector_result.items():
            data_packet = {
                'timestamp': timestamp,
                'temperature': result.temperature,
                'distances': 'TODO'
            }
        return data_packet