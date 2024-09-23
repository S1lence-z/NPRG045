from django.urls import path
from . import views


ports_urlpatterns = [
    ### PORTS
    #! a port is not a model, it is a type retrieved by a function
    path('ports/', views.PortsAPIView.as_view(), name='available-sensors'),
]