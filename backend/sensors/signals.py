from django.db.models.signals import post_init
from django.dispatch import receiver
from sensors.models import Sensor

@receiver(post_init)
def prepare_db(sender, **kwargs):
    Sensor.objects.update(is_connected=False)
    print('Successfully reset all connected sensors')