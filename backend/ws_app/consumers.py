import json
from enum import Enum
from channels.generic.websocket import WebsocketConsumer

class MessageType(Enum):
    CONNECTION_ESTABLISHED = "connection_established"
    CONNECTION_CLOSED = "connection_closed"
    PORT_CHANGE = "port_change"

class WebSocketConsumer(WebsocketConsumer):
    def connect(self):
        super().connect()
        self.send(text_data=json.dumps({
            'type': MessageType.CONNECTION_ESTABLISHED.value,
            'message': 'Connection established with the server.'
        }))
    
    def disconnect(self, close_code):
        print(f'Connection closed. Close code: {close_code}')
        self.send(text_data=json.dumps({
            'type': MessageType.CONNECTION_CLOSED.value,
            'message': 'Connection closed with the server.'
        }))
    
    def receive(self, text_data):
        text_data_json = json.loads(text_data)
        request_type = text_data_json['type']
        request_content = text_data_json['message']