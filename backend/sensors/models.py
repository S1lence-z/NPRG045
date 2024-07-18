from django.db import models

# Create your models here.

class Sensor(models.Model):
    port_name = models.CharField(max_length=50)
    hwid = models.CharField(max_length=50)
    port_description = models.CharField(max_length=100)
    
    def __str__(self):
        return f"{self.port_name} - {self.hwid}"