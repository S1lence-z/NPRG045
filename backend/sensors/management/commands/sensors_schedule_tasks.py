from django.core.management.base import BaseCommand
from django_celery_beat.models import PeriodicTask, IntervalSchedule

class Command(BaseCommand):
    help = 'Setup periodic tasks for the application'
    
    def handle(self, *args, **kwargs):
        #* Delete all periodic tasks so that we can start fresh
        PeriodicTask.objects.all().delete()
        
        schedule, created = IntervalSchedule.objects.get_or_create(
            every=3,
            period=IntervalSchedule.SECONDS,
        )
        
        if created: print('Interval schedule created.')
        else: print('Interval schedule not created. Already exists.')
        
        PeriodicTask.objects.create(
            interval=schedule,
            name='Monitor changes in serial ports',
            task='sensors.tasks.monitor_serial_ports',
        )
        
        self.stdout.write(self.style.SUCCESS('Periodic tasks created successfully.'))