from django.urls import path
from . import views

sensor_config_urlpatterns = [
    ### SENSOR CONFIG MANAGEMENT FOR THE AMP PHASE DETECTOR
    path('sensor_configs/', views.SensorConfigListCreateAPIView.as_view(), name='list-create-sensor-configs'),
    path('sensor_configs/<int:pk>', views.SensorConfigDetailAPIView.as_view(), name='retrieve-update-delete-sensor-config'),
]

amp_phase_measurement_urlpatterns = [
    ### TEMPORARY AMPLITUDE AND PHASE MEASUREMENT START/STOP
    path('measurements/amp_phase/<int:pk>/start', views.StartAmpPhaseMeasurementAPIView.as_view(), name='start-amp-phase-measurement'),
    path('measurements/amp_phase/<int:pk>/stop', views.StopAmpPhaseMeasurementAPIView.as_view(), name='stop-amp-phase-measurement'),
]