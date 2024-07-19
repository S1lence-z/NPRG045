from django.urls import path
from . import views

urlpatterns = [
    path('sensors/available/', views.SensorViewSet.as_view({'get': 'available'}), name='available-sensors'),
    path('sensors/active/', views.SensorViewSet.as_view({'get': 'active'}), name='active-sensors'),
    path('sensors/active/<int:pk>', views.SensorViewSet.as_view({'post': 'set_active'}), name='set-sensor-active'),
    path('sensors/inactive/', views.SensorViewSet.as_view({'get': 'inactive'}), name='inactive-sensors'),
    path('sensors/inactive/<int:pk>', views.SensorViewSet.as_view({'post': 'set_inactive'}), name='set-sensor-inactive'),
]