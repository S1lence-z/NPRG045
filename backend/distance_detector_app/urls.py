from django.urls import path
from . import views

_distance_profile_urlpatterns = [
    ### PROFILE MANAGEMENT FOR THE DISTANCE DETECTOR
    path('profiles/distance/', views.DistanceProfileListCreateAPIView.as_view(), name='list-create-profiles'),
    path('profiles/distance/<int:pk>', views.DistanceProfileDetailAPIView.as_view(), name='retrieve-update-delete-profile'),
]

_distance_measurement_urlpatterns = [
    ### DISTANCE DATA RETRIEVAL START/STOP
    path('measurements/distance/<int:pk>/start', views.DistanceMeasurementStartAPIView.as_view(), name='start-distance-measurement'),
    path('measurements/distance/<int:pk>/stop', views.DistanceMeasurementStopAPIView.as_view(), name='stop-distance-measurement'),
]

distance_detector_urlpatterns = _distance_profile_urlpatterns + _distance_measurement_urlpatterns