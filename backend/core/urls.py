from django.urls import path
from .views import (
    UserProfileView,
    SessionListView,
    SessionDetailView,
    SessionCreateView,
    SessionUpdateView,
    SessionDeleteView,
    BookingCreateView,
    BookingDeleteView,
    UserBookingsView,
    SessionBookingsView,
)

urlpatterns = [
    # User endpoints
    path("users/me/", UserProfileView.as_view(), name="user-profile"),
    
    # Session endpoints
    path("sessions/", SessionListView.as_view(), name="session-list"),
    path("sessions/<int:pk>/", SessionDetailView.as_view(), name="session-detail"),
    path("sessions/<int:pk>/bookings/", SessionBookingsView.as_view(), name="session-bookings"),
    path("sessions/create/", SessionCreateView.as_view(), name="session-create"),
    path("sessions/<int:pk>/update/", SessionUpdateView.as_view(), name="session-update"),
    path("sessions/<int:pk>/delete/", SessionDeleteView.as_view(), name="session-delete"),
    
    # Booking endpoints
    path("bookings/create/", BookingCreateView.as_view(), name="booking-create"),
    path("bookings/<int:pk>/delete/", BookingDeleteView.as_view(), name="booking-delete"),
    path("bookings/my/", UserBookingsView.as_view(), name="my-bookings"),
]
