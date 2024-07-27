from django.urls import path
from . import views

_ports_urlpatterns = [
    ### PORTS
    #! port is not a model, they are retrieved by a function
    path('ports/', views.PortsAPIView.as_view(), name='available-sensors'),
]

_sensors_urlpatterns = [
    ### SENSORS
    path('sensors/', views.SensorListCreateAPIView.as_view(), name='list-create-sensors'), 
    path('sensors/<int:pk>', views.SensorDetailAPIView.as_view(), name='update-delete-sensor'),
    path('sensors/connected/', views.SensorConnectedAPIView.as_view(), name='list-connected-sensors'),
]

_distance_profile_urlpatterns = [
    ### PROFILE MANAGEMENT FOR THE DISTANCE DETECTOR
    path('profiles/distance/', views.DistanceProfileListCreateAPIView.as_view(), name='list-create-profiles'),
    path('profiles/distance/<int:pk>', views.DistanceProfileDetailAPIView.as_view(), name='retrieve-update-delete-profile'),
]

_measurement_urlpatterns = [
    ### DATA RETRIEVAL START/STOP
    path('measurements/distance/<int:pk>/start', views.DistanceMeasurementStartAPIView.as_view(), name='start-distance-measurement'),
    path('measurements/distance/<int:pk>/stop', views.DistanceMeasurementStopAPIView.as_view(), name='stop-distance-measurement'),
]

urlpatterns = _ports_urlpatterns + _sensors_urlpatterns + _distance_profile_urlpatterns + _measurement_urlpatterns

#! DO NOT PUT DATA STREAMING IN HERE! Data is gonna be handled using websockets
#? probably more endpoints for profiles for other sensor apps (motion, presence, etc.)