from rest_framework import serializers
from .models import User, Session, Booking


class UserSerializer(serializers.ModelSerializer):
    avatar_url = serializers.SerializerMethodField()

    class Meta:
        model = User
        fields = ["id", "username", "email", "role", "avatar", "avatar_url"]
        extra_kwargs = {'avatar': {'write_only': True}}

    def get_avatar_url(self, obj):
        return obj.avatar_url


class SessionSerializer(serializers.ModelSerializer):
    creator = UserSerializer(read_only=True)
    image_url = serializers.SerializerMethodField()

    class Meta:
        model = Session
        fields = ["id", "creator", "title", "description", "date", "price", "image", "image_url", "created_at"]
        read_only_fields = ["creator", "image_url", "created_at"]

    def get_image_url(self, obj):
        return obj.image_url


class BookingSerializer(serializers.ModelSerializer):
    session = SessionSerializer(read_only=True)
    session_id = serializers.IntegerField(write_only=True, source='session.id')
    user = UserSerializer(read_only=True)

    class Meta:
        model = Booking
        fields = ["id", "user", "session", "session_id", "booked_at"]
        read_only_fields = ["user", "booked_at"]

    def create(self, validated_data):
        session_id = validated_data.pop('session')['id']
        validated_data['session_id'] = session_id
        
        # Check if user already enrolled in this session
        user = self.context['request'].user
        if Booking.objects.filter(user=user, session_id=session_id).exists():
            raise serializers.ValidationError({"error": "u have already enrolled"})
        
        return super().create(validated_data)
