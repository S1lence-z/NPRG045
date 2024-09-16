from django.db import models
from django.core.validators import MinValueValidator, MaxValueValidator
from django.core.exceptions import ValidationError
from acconeer.exptool.a121._core.entities.configs.config_enums import PRF, Profile
from acconeer.exptool import a121

# Create your models here.

class SubsweepConfig(models.Model):
    APPROX_BASE_STEP_LENGTH = 2.5e-3
    MAX_HWAAS = 511
    
    PROFILE_CHOICES = [
        ('PROFILE_1', 'PROFILE_1'),
        ('PROFILE_2', 'PROFILE_2'),
        ('PROFILE_3', 'PROFILE_3'),
        ('PROFILE_4', 'PROFILE_4'),
        ('PROFILE_5', 'PROFILE_5')
    ]
    
    PRF_CHOICES = [
        ('PRF_19_5_MHz', 'PRF_19_5_MHz'),
        ('PRF_15_6_MHz', 'PRF_15_6_MHz'),
        ('PRF_13_0_MHz', 'PRF_13_0_MHz'),
        ('PRF_8_7_MHz', 'PRF_8_7_MHz'),
        ('PRF_6_5_MHz', 'PRF_6_5_MHz'),
        ('PRF_5_2_MHz', 'PRF_5_2_MHz')
    ]
    
    start_point = models.IntegerField(default=80, validators=[MinValueValidator(0)])
    num_points = models.IntegerField(default=160, validators=[MinValueValidator(1)])
    step_length = models.IntegerField(default=1, validators=[MinValueValidator(1)])
    profile = models.CharField(max_length=10, choices=PROFILE_CHOICES, default='PROFILE_3')
    hwass = models.IntegerField(default=8, validators=[MinValueValidator(1), MaxValueValidator(MAX_HWAAS)])
    receiver_gain = models.IntegerField(default=16, validators=[MinValueValidator(0), MaxValueValidator(23)])
    enable_tx = models.BooleanField(default=True)
    enable_loopback = models.BooleanField(default=False)
    phase_enhancement = models.BooleanField(default=False)
    prf = models.CharField(max_length=12, choices=PRF_CHOICES, default=PRF_CHOICES[1][1])
    
    def clean(self):
        validation_errors = []
        if self.enable_loopback and self.profile == 'PROFILE_2':
            validation_errors.extend(
                [
                    ValidationError(
                        self, "enable_loopback", "Enable loopback is incompatible with Profile 2."
                    ),
                    ValidationError(
                        self, "profile", "Enable loopback is incompatible with Profile 2."
                    ),
                ]
            )
        
        if self.prf == self.PRF_CHOICES[0][0]:
            FORBIDDEN_PROFILES = [
                'PROFILE_2',
                'PROFILE_3',
                'PROFILE_4',
                'PROFILE_5',
            ]
            
            if self.profile in FORBIDDEN_PROFILES:
                validation_errors.extend(
                    [
                        ValidationError(
                            self, "prf", "19.5 MHz PRF is only compatible with profile 1."
                        ),
                        ValidationError(
                            self,
                            "profile",
                            f"Profile {self.profile} is not supported with 19.5 MHz PRF.",
                        ),
                    ]
                )
                
        prf_validation_errors = self._validate_prf()
        
        if prf_validation_errors:
            validation_errors.extend(prf_validation_errors)
            
        if self.start_point < -275:
            validation_errors.append(
                ValidationError(
                    self, 
                    "start_point", 
                    "Start point must be greater than or equal to -275."
                )
            )
        
        return validation_errors
    
    def _validate_prf(self) -> list[ValidationError]:
        prf_validation_errors = []
        end_point_m = (
            self.start_point + ((self.num_points - 1) * self.step_length)
        ) * self.APPROX_BASE_STEP_LENGTH
        prf_enum: PRF = getattr(PRF, self.prf)
        if end_point_m > prf_enum.maximum_measurable_distance:
            prf_validation_errors.extend(
                [
                    ValidationError(
                        self,
                        "prf",
                        f"PRF is too high for the measuring end point ({end_point_m:.3f}m), "
                        + "try lowering the PRF."
                    ),
                    ValidationError(
                        self,
                        "num_points",
                        f"Measuring range is too long for PRF (max {prf_enum.mmd:.2f}m), "
                        + "try decreasing the number of points."
                    ),
                    ValidationError(
                        self,
                        "step_length",
                        f"Measuring range is too long for PRF (max {prf_enum.mmd:.2f}m), "
                        + "try decreasing the step length."
                    )
                ]
            )
        return prf_validation_errors
    
    def save(self, *args, **kwargs):
        self.clean()
        super().save(*args, **kwargs)
        
    def __str__(self):
        pass

# TODO: implement so that the sensor config can hold multiple subsweep configs including the validation
# TODO: ALSO IMPLEMENT THE CHANGES ON THE FRONTEND TYPE
class SensorConfig(models.Model):
    MAX_HWAAS = SubsweepConfig.MAX_HWAAS
    
    IDLE_STATE_CHOICES = [
        ('DEEP_SLEEP', 'DEEP_SLEEP'),
        ('SLEEP', 'SLEEP'),
        ('READY', 'READY'),
    ]
    
    # TODO: these are fields required for multiple subsweep configs
    # subsweeps: list[SubsweepConfig] = models.ManyToManyField(SubsweepConfig, related_name='sensor_configs')
    # num_subsweeps = models.IntegerField(default=1, validators=[MinValueValidator(1)])
    
    # REQUIRED FIELDS
    name = models.CharField(max_length=100, unique=True, null=False, blank=False, default="Generated Name")
    sweeps_per_frame = models.IntegerField(default=1, validators=[MinValueValidator(1)])
    continuous_sweep_mode = models.BooleanField(default=False)
    double_buffering = models.BooleanField(default=False)
    inter_frame_idle_state = models.CharField(max_length=10, choices=IDLE_STATE_CHOICES, default='DEEP_SLEEP')
    inter_sweep_idle_state = models.CharField(max_length=10, choices=IDLE_STATE_CHOICES, default='READY')
    # OPTIONAL FIELDS
    sweep_rate = models.FloatField(null=True, blank=True, default=None)
    frame_rate = models.FloatField(null=True, blank=True, default=None)
    start_point = models.IntegerField(null=True, blank=True, default=None)  #* SUBSWEEP CONFIG FIELD
    num_points = models.IntegerField(null=True, blank=True, default=None)   #* SUBSWEEP CONFIG FIELD
    step_length = models.IntegerField(null=True, blank=True, default=None)  #* SUBSWEEP CONFIG FIELD
    profile = models.CharField(max_length=10, choices=SubsweepConfig.PROFILE_CHOICES, default='PROFILE_3') #* SUBSWEEP CONFIG FIELD
    hwaas = models.IntegerField(default=8, validators=[MinValueValidator(1), MaxValueValidator(MAX_HWAAS)])        #* SUBSWEEP CONFIG FIELD
    receiver_gain = models.IntegerField(null=True, blank=True, default=None)#* SUBSWEEP CONFIG FIELD
    enable_tx = models.BooleanField(null=True, blank=True, default=None)    #* SUBSWEEP CONFIG FIELD
    enable_loopback = models.BooleanField(null=True, blank=True, default=None) #* SUBSWEEP CONFIG FIELD
    phase_enhancement = models.BooleanField(null=True, blank=True, default=None) #* SUBSWEEP CONFIG FIELD
    prf = models.CharField(max_length=12, choices=SubsweepConfig.PRF_CHOICES, default=None, null=True, blank=True) #* SUBSWEEP CONFIG FIELD
    
    def _populate_fields_from_subsweep_config(self):
        temp_sensor_config = a121.SensorConfig(
            sweeps_per_frame=self.sweeps_per_frame,
            continuous_sweep_mode=self.continuous_sweep_mode,
            double_buffering=self.double_buffering,
            inter_frame_idle_state=self.inter_frame_idle_state,
            inter_sweep_idle_state=self.inter_sweep_idle_state,
            sweep_rate=self.sweep_rate,
            frame_rate=self.frame_rate,
            start_point=self.start_point,
            num_points=self.num_points,
            step_length=self.step_length,
            profile=self.profile,
            hwaas=self.hwaas,
            receiver_gain=self.receiver_gain,
            enable_tx=self.enable_tx,
            enable_loopback=self.enable_loopback,
            phase_enhancement=self.phase_enhancement,
            prf=getattr(PRF, self.prf) if self.prf else None
        )
        # Insert the values from the subsweep config to the sensor config (for now a sensor config can only hold one subsweep config)
        self.sweeps_per_frame = temp_sensor_config.sweeps_per_frame
        self.continuous_sweep_mode = temp_sensor_config.continuous_sweep_mode
        self.double_buffering = temp_sensor_config.double_buffering
        self.sweep_rate = temp_sensor_config.sweep_rate
        self.frame_rate = temp_sensor_config.frame_rate
        self.start_point = temp_sensor_config.start_point
        self.num_points = temp_sensor_config.num_points
        self.step_length = temp_sensor_config.step_length
        self.hwaas = temp_sensor_config.hwaas
        self.receiver_gain = temp_sensor_config.receiver_gain
        self.enable_tx = temp_sensor_config.enable_tx
        self.enable_loopback = temp_sensor_config.enable_loopback
        self.phase_enhancement = temp_sensor_config.phase_enhancement
        self.prf = temp_sensor_config.prf.name if temp_sensor_config.prf else None
        del temp_sensor_config
        
    def _validate_name(self):
        if self.name.strip() == "":
            raise ValidationError(
                self,
                "name",
                "Name cannot be empty."
            )
    
    def clean(self):
        self._validate_name()
        _ = a121.SensorConfig(
            sweeps_per_frame=self.sweeps_per_frame,
            continuous_sweep_mode=self.continuous_sweep_mode,
            double_buffering=self.double_buffering,
            inter_frame_idle_state=getattr(a121.IdleState, self.inter_frame_idle_state) if self.inter_frame_idle_state else None,
            inter_sweep_idle_state=getattr(a121.IdleState, self.inter_sweep_idle_state) if self.inter_sweep_idle_state else None,
            sweep_rate=int(self.sweep_rate),
            frame_rate= None if self.continuous_sweep_mode else int(self.frame_rate),
            start_point=self.start_point,
            num_points=self.num_points,
            step_length=self.step_length,
            profile=getattr(Profile, self.profile) if self.profile else None,
            hwaas=self.hwaas,
            receiver_gain=self.receiver_gain,
            enable_tx=self.enable_tx,
            enable_loopback=self.enable_loopback,
            phase_enhancement=self.phase_enhancement,
            prf=getattr(PRF, self.prf) if self.prf else None
        )
        _.validate()
        
    def save(self, *args, **kwargs):
        self.clean()
        self._populate_fields_from_subsweep_config()
        super().save(*args, **kwargs)
        
    def __str__(self):
        return f"SensorConfig(sweeps_per_frame={self.sweeps_per_frame}, continuous_sweep_mode={self.continuous_sweep_mode}, double_buffering={self.double_buffering}, inter_frame_idle_state={self.inter_frame_idle_state}, inter_sweep_idle_state={self.inter_sweep_idle_state})"