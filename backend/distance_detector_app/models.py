from django.db import models
from django.forms import ValidationError

# Create your models here.

class DistanceProfile(models.Model):
    MAX_PROFILE_CHOICES = [
        ('PROFILE_1', 'PROFILE_1'),
        ('PROFILE_2', 'PROFILE_2'),
        ('PROFILE_3', 'PROFILE_3'),
        ('PROFILE_4', 'PROFILE_4'),
        ('PROFILE_5', 'PROFILE_5')
    ]
    
    THRESHOLD_METHOD_CHOICES = [
        ('CFAR', 'CFAR'),
        ('FIXED_AMPLITUDE', 'Fixed Amplitude'),
        ('FIXED_STRENGTH', 'Fixed Strength'),
        ('RECORDED', 'Recorded'),
    ]
    
    PEAKSORTING_METHOD_CHOICES = [
        ('STRONGEST', 'Strongest'),
        ('NEAREST', 'Nearest'),
    ]
    
    REFLECTOR_SHAPE_CHOICES = [
        ('GENERIC', 'Generic'),
        ('SPECIFIC', 'Specific'),
    ]
    
    DEFAULT_FIXED_AMPLITUDE_THRESHOLD_VALUE = 1.0
    DEFAULT_FIXED_STRENGTH_THRESHOLD_VALUE = 1.0
    DEFAULT_THRESHOLD_SENSITIVITY = 1.0
    
    name = models.CharField(max_length=50)
    start_m = models.FloatField(default=0.25)
    end_m = models.FloatField(default=3.0)
    max_step_length = models.IntegerField(null=True, blank=True)
    max_profile = models.CharField(
        max_length=10, 
        choices=MAX_PROFILE_CHOICES, 
        default='PROFILE_5'
    )
    close_range_leakage_cancellation = models.BooleanField(default=False)
    signal_quality = models.FloatField(default=15.0)
    threshold_method = models.CharField(
        max_length=20, 
        choices=THRESHOLD_METHOD_CHOICES, 
        default='CFAR'
    )
    peaksorting_method = models.CharField(
        max_length=20, 
        choices=PEAKSORTING_METHOD_CHOICES, 
        default='STRONGEST'
    )
    reflector_shape = models.CharField(
        max_length=20, 
        choices=REFLECTOR_SHAPE_CHOICES, 
        default='GENERIC'
    )
    num_frames_in_recorded_threshold = models.IntegerField(default=100)
    fixed_threshold_value = models.FloatField(default=DEFAULT_FIXED_AMPLITUDE_THRESHOLD_VALUE)
    fixed_strength_threshold_value = models.FloatField(default=DEFAULT_FIXED_STRENGTH_THRESHOLD_VALUE)
    threshold_sensitivity = models.FloatField(default=DEFAULT_THRESHOLD_SENSITIVITY)
    update_rate = models.FloatField(null=True, blank=True, default=50.0)
    
    def clean(self) -> None:        
        if self.start_m < 0.1:
            raise ValidationError(f'Cannot start measurements close than 0.1m')
        if self.end_m > 5.0:
            raise ValidationError(f'Cannot measure further than 5.0m')
        if self.start_m > self.end_m:
            raise ValidationError(f'Start distance must be smaller than end distance')
        if self.max_step_length and not (self.max_step_length % 24 == 0 or 24 % self.max_step_length == 0):
            valid_step_length = next(
                (sl for sl in range(self.max_step_length, 0, -1)
                if 24 % sl == 0 or sl % 24 == 0), 
                None
            )
            raise ValidationError(f'Actual step length will be rounded down to the closest valid step length: ({valid_step_length}).')
        
    def save(self, *args, **kwargs):
        self.clean()
        super().save(*args, **kwargs)
        
    def __str__(self) -> str:
        return f'DistanceProfile(name={self.name}, start_m={self.start_m}, end_m={self.end_m}, max_profile={self.max_profile})'