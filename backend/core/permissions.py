from rest_framework import permissions


class IsCreator(permissions.BasePermission):
    """
    Custom permission to only allow users with 'creator' role to access.
    """
    
    def has_permission(self, request, view):
        # Check if user is authenticated and has creator role
        return (
            request.user and 
            request.user.is_authenticated and 
            request.user.role == 'creator'
        )


class IsOwnerOrReadOnly(permissions.BasePermission):
    """
    Custom permission to only allow owners of an object to edit it.
    """
    
    def has_object_permission(self, request, view, obj):
        # Read permissions are allowed to any request
        if request.method in permissions.SAFE_METHODS:
            return True
        
        # Write permissions are only allowed to the owner
        return obj.creator == request.user
