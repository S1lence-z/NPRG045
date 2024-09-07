from django.urls import path
from . import views
from distance_detector_app.urls import distance_detector_urlpatterns
from sensors.urls import sensors_urlpatterns

_ports_urlpatterns = [
    ### PORTS
    #! a port is not a model, they are retrieved by a function
    path('ports/', views.PortsAPIView.as_view(), name='available-sensors'),
]

urlpatterns = _ports_urlpatterns + sensors_urlpatterns + distance_detector_urlpatterns