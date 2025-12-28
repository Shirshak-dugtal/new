"""
Temporary storage for OAuth role selection
This uses cache/database to persist role across OAuth redirects
"""
from django.core.cache import cache
from django.db import models
import uuid

# Simple in-memory storage (will work better than sessions for OAuth)
_role_storage = {}

def store_role_for_oauth(role='user'):
    """
    Store role and return a unique state token
    """
    state_token = str(uuid.uuid4())
    _role_storage[state_token] = role
    print(f"[ROLE STORAGE] Stored role '{role}' with token '{state_token}'")
    return state_token

def get_role_from_state(state_token):
    """
    Retrieve role from state token
    """
    role = _role_storage.get(state_token, 'user')
    print(f"[ROLE STORAGE] Retrieved role '{role}' for token '{state_token}'")
    # Clean up after use
    if state_token in _role_storage:
        del _role_storage[state_token]
    return role
