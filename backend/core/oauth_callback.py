from django.shortcuts import redirect
from django.contrib.auth import login
from allauth.socialaccount.models import SocialLogin
from rest_framework_simplejwt.tokens import RefreshToken
from core.temp_storage import get_role_from_state
import logging

logger = logging.getLogger(__name__)

def oauth_callback(request):
    """
    Custom OAuth callback that redirects to frontend with JWT tokens
    """
    # Get the authenticated user
    user = request.user
    
    print(f"[OAUTH CALLBACK] User authenticated: {user.is_authenticated}")
    print(f"[OAUTH CALLBACK] User: {user}")
    logger.info(f"OAuth callback - User authenticated: {user.is_authenticated}")
    
    if user.is_authenticated:
        # Try to get role from state parameter first
        state_token = request.GET.get('state', '')
        selected_role = get_role_from_state(state_token) if state_token else 'user'
        
        # Fallback to session
        if selected_role == 'user':
            selected_role = request.session.get('selected_role', 'user')
        
        print(f"[OAUTH CALLBACK] State token: {state_token}")
        print(f"[OAUTH CALLBACK] Selected role: {selected_role}")
        print(f"[OAUTH CALLBACK] Current user role in DB: {user.role}")
        logger.info(f"Selected role: {selected_role}")
        
        # Only update role if: 1) user has no role, 2) selected role is creator, or 3) user explicitly selected different role
        should_update = False
        if not user.role:
            should_update = True
            print(f"[OAUTH CALLBACK] User has no role, will set to {selected_role}")
        elif selected_role == 'creator':
            should_update = True
            print(f"[OAUTH CALLBACK] User selected creator role, will update")
        elif user.role == 'user' and selected_role == 'user':
            should_update = False
            print(f"[OAUTH CALLBACK] User is already user, no update needed")
        elif user.role == 'creator' and selected_role == 'user':
            should_update = False
            print(f"[OAUTH CALLBACK] User is creator, keeping creator role (not downgrading)")
        
        if should_update and user.role != selected_role:
            user.role = selected_role
            user.save()
            print(f"[OAUTH CALLBACK] Updated user {user.username} role to {selected_role}")
            logger.info(f"Updated user {user.username} role to {selected_role}")
        else:
            print(f"[OAUTH CALLBACK] Keeping user {user.username} role as {user.role}")
        
        # Generate JWT tokens
        refresh = RefreshToken.for_user(user)
        access_token = str(refresh.access_token)
        refresh_token = str(refresh)
        
        print(f"[OAUTH CALLBACK] Generated tokens for user {user.username}")
        print(f"[OAUTH CALLBACK] Access token length: {len(access_token)}")
        logger.info(f"Generated tokens for user {user.username}")
        
        # Redirect to frontend with tokens
        frontend_url = f"http://localhost/login?access={access_token}&refresh={refresh_token}"
        print(f"[OAUTH CALLBACK] Redirecting to: {frontend_url[:100]}...")
        return redirect(frontend_url)
    
    print("[OAUTH CALLBACK] User not authenticated!")
    logger.warning("User not authenticated in OAuth callback")
    # If not authenticated, redirect to login
    return redirect('http://localhost/login')
