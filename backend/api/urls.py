from django.urls import path
from . import views

urlpatterns = [
    ### PORTS
    path('ports/', views.PortsView.as_view(), name='available-sensors'),
    path('ports/<str:port_name>', views.PortsView.as_view(), name='connect-sensor'),
    ### SENSORS
    path('sensors/', views.SensorViewSet.as_view({'get': 'list'}), name='list-sensors'),
    path('sensors/<int:pk>', views.SensorViewSet.as_view({'patch': 'change_connection_status'}), name='update-sensor-status'),
    path('sensors/<int:pk>', views.SensorViewSet.as_view({'delete': 'delete'}), name='delete-sensor'),
    path('sensors/connected/', views.SensorViewSet.as_view({'get': 'get_connected'}), name='get-connected-sensors'),
]