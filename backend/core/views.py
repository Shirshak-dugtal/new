from rest_framework import generics, permissions
from rest_framework.exceptions import PermissionDenied
from rest_framework.response import Response
from rest_framework.views import APIView
from rest_framework.decorators import api_view, permission_classes
from rest_framework import status
from .models import Session, Booking, User
from .serializers import SessionSerializer, BookingSerializer, UserSerializer
from .permissions import IsCreator
from .temp_storage import store_role_for_oauth


# 🔓 Store role in session before OAuth
@api_view(['POST'])
@permission_classes([permissions.AllowAny])
def set_role_session(request):
    """Store selected role and return state token for OAuth"""
    try:
        role = request.data.get('role', 'user')
        print(f"[SET ROLE] Received role: {role}")
        
        # Store role in temp storage and get state token
        state_token = store_role_for_oauth(role)
        
        # Also store in session as backup
        request.session['selected_role'] = role
        request.session.modified = True
        request.session.save()
        
        print(f"[SET ROLE] Generated state token: {state_token}")
        
        return Response({
            'status': 'success', 
            'role': role,
            'state': state_token
        }, status=status.HTTP_200_OK)
    except Exception as e:
        print(f"[SET ROLE] Error: {str(e)}")
        return Response({'error': str(e)}, status=status.HTTP_400_BAD_REQUEST)


# 🔒 Get current user profile
class UserProfileView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def get(self, request):
        serializer = UserSerializer(request.user)
        return Response(serializer.data)

    def patch(self, request):
        serializer = UserSerializer(request.user, data=request.data, partial=True)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


# 🔓 Public: list all sessions
class SessionListView(generics.ListAPIView):
    queryset = Session.objects.all().order_by('-created_at')
    serializer_class = SessionSerializer


# 🔓 Public: get single session
class SessionDetailView(generics.RetrieveAPIView):
    queryset = Session.objects.all()
    serializer_class = SessionSerializer


# 🔒 Creator: create session (creator role only)
class SessionCreateView(generics.CreateAPIView):
    serializer_class = SessionSerializer
    permission_classes = [permissions.IsAuthenticated, IsCreator]

    def perform_create(self, serializer):
        serializer.save(creator=self.request.user)


# 🔒 Creator: update session (only own sessions)
class SessionUpdateView(generics.UpdateAPIView):
    queryset = Session.objects.all()
    serializer_class = SessionSerializer
    permission_classes = [permissions.IsAuthenticated, IsCreator]

    def perform_update(self, serializer):
        # Only allow creator to update their own session
        if serializer.instance.creator != self.request.user:
            raise PermissionDenied("You can only update your own sessions")
        serializer.save()


# 🔒 Creator: delete session (only own sessions)
class SessionDeleteView(generics.DestroyAPIView):
    queryset = Session.objects.all()
    serializer_class = SessionSerializer
    permission_classes = [permissions.IsAuthenticated, IsCreator]

    def perform_destroy(self, instance):
        # Only allow creator to delete their own session
        if instance.creator != self.request.user:
            raise PermissionDenied("You can only delete your own sessions")
        instance.delete()


# 🔒 User: book a session
class BookingCreateView(generics.CreateAPIView):
    serializer_class = BookingSerializer
    permission_classes = [permissions.IsAuthenticated]

    def perform_create(self, serializer):
        serializer.save(user=self.request.user)


# 🔒 User: view own bookings
class UserBookingsView(generics.ListAPIView):
    serializer_class = BookingSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        return Booking.objects.filter(user=self.request.user)


# 🔒 User: delete own booking
class BookingDeleteView(generics.DestroyAPIView):
    queryset = Booking.objects.all()
    serializer_class = BookingSerializer
    permission_classes = [permissions.IsAuthenticated]

    def perform_destroy(self, instance):
        # Only allow user to delete their own booking
        if instance.user != self.request.user:
            raise PermissionDenied("You can only delete your own bookings")
        instance.delete()


# 🔓 Public: List all bookings for a specific session (to show enrolled students)
class SessionBookingsView(generics.ListAPIView):
    serializer_class = BookingSerializer
    permission_classes = [permissions.AllowAny]

    def get_queryset(self):
        session_id = self.kwargs['pk']
        return Booking.objects.filter(session_id=session_id)

