import json
from enum import Enum
from channels.generic.websocket import WebsocketConsumer
from asgiref.sync import async_to_sync

class MessageType(Enum):
    CONNECTION_ESTABLISHED = "connection_established"
    CONNECTION_CLOSED = "connection_closed"
    PORT_CHANGE = "port_change"
    SENSOR_CHANGE = "sensor_change"
    DISTANCE_DATA = "distance_data"

class WebSocketConsumer(WebsocketConsumer):
    def connect(self):
        self.accept()
        # Join a group for notifying the user of any updates related to the sensors
        async_to_sync(self.channel_layer.group_add)(
            'sensor_updates', 
            self.channel_name
        )
        self.send(text_data=json.dumps({
            'type': MessageType.CONNECTION_ESTABLISHED.value,
            'message': 'Connection established with the server.'
        }))
    
    def disconnect(self, close_code):
        print(f'Connection closed. Close code: {close_code}')
        # Leave the group for notifying the user of port changes
        async_to_sync(self.channel_layer.group_discard)(
            'sensor_updates', 
            self.channel_name
        )
        self.send(text_data=json.dumps({
            'type': MessageType.CONNECTION_CLOSED.value,
            'message': 'Connection closed with the server.'
        }))
    
    def receive(self, text_data):
        text_data_json = json.loads(text_data)
        request_type = text_data_json['type']
        request_content = text_data_json['message']
        self.send(text_data=json.dumps({
            'type': request_type,
            'message': f'You said: {request_content}'
        }))
    
    def notify_of_port_change(self, event):
        event_message = event['message']
        self.send(text_data=json.dumps({
            'type': MessageType.PORT_CHANGE.value,
            'message': event_message
        }))
        
    def notify_of_sensor_change(self, event):
        event_message = event['message']
        event_sensor = event['sensor']
        self.send(text_data=json.dumps({
            'type': MessageType.SENSOR_CHANGE.value,
            'message': event_message,
            'sensor': event_sensor
        }))
        
    def send_distance_data(self, event):
        event_message = event['message']
        event_sensor = event['sensor']
        event_data = event['data']
        self.send(text_data=json.dumps({
            'type': MessageType.DISTANCE_DATA.value,
            'message': event_message,
            'sensor': event_sensor,
            'data': event_data
        }))