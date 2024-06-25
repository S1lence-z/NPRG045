import json
from enum import Enum
from channels.generic.websocket import WebsocketConsumer

class MessageType(Enum):
    CONNECTION_ESTABLISHED = "connection_established"
    CONNECTION_CLOSED = "connection_closed"
    DATA = "data"
    WARNING = "warning"

class WebSocketConsumer(WebsocketConsumer):
    def connect(self):
        super().connect()
        self.send(text_data=json.dumps({
            'type': MessageType.CONNECTION_ESTABLISHED.value,
            'message': 'Connection established with the server.'
        }))
    
    def disconnect(self, close_code):
        print(f'Connection closed. Close code: {close_code}')
        pass
    
    def receive(self, text_data):
        text_data_json = json.loads(text_data)
        message_type = text_data_json['type']
        message_content = text_data_json['message']
        
        if message_type == MessageType.DATA.value:
            self.send(text_data=json.dumps({
                'type': MessageType.DATA.value,
                'message': message_content
            }))
        elif message_type == MessageType.WARNING.value:
            self.send(text_data=json.dumps({
                'type': MessageType.WARNING.value,
                'message': message_content
            }))
        elif message_type == MessageType.CONNECTION_CLOSED.value:
            self.send(text_data=json.dumps({
                'type': MessageType.CONNECTION_CLOSED.value,
                'message': message_content
            }))
            self.close()