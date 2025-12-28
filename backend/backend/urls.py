"""
URL configuration for backend project.

The `urlpatterns` list routes URLs to views. For more information please see:
    https://docs.djangoproject.com/en/4.2/topics/http/urls/
Examples:
Function views
    1. Add an import:  from my_app import views
    2. Add a URL to urlpatterns:  path('', views.home, name='home')
Class-based views
    1. Add an import:  from other_app.views import Home
    2. Add a URL to urlpatterns:  path('', Home.as_view(), name='home')
Including another URLconf
    1. Import the include() function: from django.urls import include, path
    2. Add a URL to urlpatterns:  path('blog/', include('blog.urls'))
"""
from django.contrib import admin
from django.urls import path, include
from django.conf import settings
from django.conf.urls.static import static
from rest_framework_simplejwt.views import (
    TokenObtainPairView,
    TokenRefreshView,
    TokenVerifyView,
)
from core.oauth_callback import oauth_callback
from core.views import set_role_session

urlpatterns = [
    path('admin/', admin.site.urls),
    path('api/', include('core.urls')),
    
    # JWT endpoints
    path('api/token/', TokenObtainPairView.as_view(), name='token_obtain_pair'),
    path('api/token/refresh/', TokenRefreshView.as_view(), name='token_refresh'),
    path('api/token/verify/', TokenVerifyView.as_view(), name='token_verify'),
    
    # Set role in session before OAuth
    path('api/auth/set-role/', set_role_session, name='set_role_session'),
    
    # OAuth and registration endpoints (REST API)
    path('api/auth/', include('dj_rest_auth.urls')),
    path('api/auth/registration/', include('dj_rest_auth.registration.urls')),
    
    # OAuth callback handler
    path('accounts/profile/', oauth_callback, name='oauth_callback'),
    
    # Allauth URLs for web-based OAuth flow
    path('accounts/', include('allauth.urls')),
]

# Serve media files in development/production
if settings.DEBUG or not settings.USE_MINIO:
    urlpatterns += static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)
