from django.db import models
from django.core.exceptions import ValidationError

# Create your models here.

class Sensor(models.Model):
    port_name = models.CharField(max_length=50)
    port_description = models.CharField(max_length=100)
    hwid = models.CharField(max_length=100)
    is_connected = models.BooleanField(default=False)
    
    def clean(self) -> None:
        if not self.port_name or not self.port_description or not self.hwid:
            raise ValidationError("All fields must be present.")
    
    def save(self, *args, **kwargs):
        self.clean()
        super().save(*args, **kwargs)
        
    def __hash__(self) -> int:
        return hash(self.port_name)
    
    def __eq__(self, other: object) -> bool:
        if not isinstance(other, Sensor):
            return False
        return self.port_name == other.port_name
    
    def __str__(self):
        return f"Sensor(port_name={self.port_name}, hwid={self.hwid}, is_connected={self.is_connected})"