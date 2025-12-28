"""
Django shell script to configure Google and GitHub OAuth
Run with: docker-compose exec backend python setup_oauth.py
"""

import os
import django
from dotenv import load_dotenv

# Load environment variables
load_dotenv()

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'backend.settings')
django.setup()

from django.contrib.sites.models import Site
from allauth.socialaccount.models import SocialApp

# Get OAuth credentials from environment variables
GOOGLE_CLIENT_ID = os.getenv('GOOGLE_CLIENT_ID')
GOOGLE_CLIENT_SECRET = os.getenv('GOOGLE_CLIENT_SECRET')
GITHUB_CLIENT_ID = os.getenv('GITHUB_CLIENT_ID')
GITHUB_CLIENT_SECRET = os.getenv('GITHUB_CLIENT_SECRET')
SITE_DOMAIN = os.getenv('SITE_DOMAIN', 'localhost:8000')
SITE_NAME = os.getenv('SITE_NAME', 'localhost')

# Validate required environment variables
if not all([GOOGLE_CLIENT_ID, GOOGLE_CLIENT_SECRET, GITHUB_CLIENT_ID, GITHUB_CLIENT_SECRET]):
    print("❌ Error: Missing OAuth credentials in .env file!")
    print("Please set the following environment variables:")
    if not GOOGLE_CLIENT_ID:
        print("  - GOOGLE_CLIENT_ID")
    if not GOOGLE_CLIENT_SECRET:
        print("  - GOOGLE_CLIENT_SECRET")
    if not GITHUB_CLIENT_ID:
        print("  - GITHUB_CLIENT_ID")
    if not GITHUB_CLIENT_SECRET:
        print("  - GITHUB_CLIENT_SECRET")
    exit(1)

# Update or create site
site, created = Site.objects.get_or_create(
    id=1,
    defaults={
        'domain': SITE_DOMAIN,
        'name': SITE_NAME
    }
)
if not created:
    site.domain = SITE_DOMAIN
    site.name = SITE_NAME
    site.save()
print(f"✅ Site configured: {site.domain}")

# Create or update Google OAuth app
google_app, created = SocialApp.objects.update_or_create(
    provider='google',
    defaults={
        'name': 'Google OAuth',
        'client_id': GOOGLE_CLIENT_ID,
        'secret': GOOGLE_CLIENT_SECRET,
    }
)

# Add site to the app
google_app.sites.add(site)
google_app.save()

print(f"✅ Google OAuth configured: {google_app.name}")
print(f"   Client ID: {google_app.client_id[:20]}...")
print(f"   Secret: {'*' * 20}...")
print(f"   Sites: {[s.domain for s in google_app.sites.all()]}")

# Configure GitHub OAuth
github_app, created = SocialApp.objects.update_or_create(
    provider='github',
    defaults={
        'name': 'GitHub OAuth',
        'client_id': GITHUB_CLIENT_ID,
        'secret': GITHUB_CLIENT_SECRET,
    }
)
github_app.sites.add(site)
github_app.save()

print(f"✅ GitHub OAuth configured: {github_app.name}")
print(f"   Client ID: {github_app.client_id}")
print(f"   Secret: {'*' * 20}...")
print(f"   Sites: {[s.domain for s in github_app.sites.all()]}")

print("\n🎉 OAuth setup complete!")
print("\n⚠️  Remember to add callback URLs to your OAuth apps:")
print(f"   Google: http://{SITE_DOMAIN}/accounts/google/login/callback/")
print(f"   GitHub: http://{SITE_DOMAIN}/accounts/github/login/callback/")
