from django.urls import path
from . import views

urlpatterns = [
    path('sensors/available/', views.SensorList.as_view(), name='available-sensors'),
    #TODO path('sensors/active/', views.ActiveSensorList.as_view(), name='active-sensors'),
    #TODO path('sensors/active/<int:pk>', views.SensorDetail.as_view(), name='set-active-sensor'),
    #TODO path('sensors/inactive/', views.SensorDetail.as_view(), name='inactive-sensor'),
    #TODO path('sensors/inactive/<int:pk>', views.SensorDetail.as_view(), name='set-inactive-sensor'),
]