from django.urls import path
from . import views

_all_sensor_urlpatterns = [
    ### SENSORS
    path('sensors/', views.SensorListCreateAPIView.as_view(), name='list-create-sensors'), 
    path('sensors/<int:pk>', views.SensorDetailAPIView.as_view(), name='update-delete-sensor'),
    path('sensors/connected/', views.SensorConnectedAPIView.as_view(), name='list-connected-sensors'),
]

sensors_urlpatterns = _all_sensor_urlpatterns