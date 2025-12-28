import React, { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const Login = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { user, login } = useAuth();
  const [error, setError] = useState('');
  const [selectedRole, setSelectedRole] = useState('user');

  useEffect(() => {
    // Handle OAuth callback
    const access = searchParams.get('access');
    const refresh = searchParams.get('refresh');
    
    console.log('Checking auth:', { access: !!access, refresh: !!refresh });
    
    if (access && refresh) {
      console.log('Tokens found, logging in...');
      login(access, refresh);
      navigate('/');
    }
  }, [searchParams]);

  useEffect(() => {
    if (user) {
      navigate('/');
    }
  }, [user, navigate]);

  const handleOAuthLogin = async (provider) => {
    // Store selected role in backend and get state token
    try {
      const response = await fetch('/api/auth/set-role/', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ role: selectedRole }),
        credentials: 'include', // Important for session cookies
      });
      
      const data = await response.json();
      console.log('Role set response:', data);
      
      // Use state token if provided
      const stateParam = data.state ? `?state=${data.state}` : '';
      
      // Redirect to backend OAuth endpoint with state
      window.location.href = `/accounts/${provider}/login/${stateParam}`;
    } catch (err) {
      console.error('Failed to set role:', err);
      // Fallback: redirect without state
      window.location.href = `/accounts/${provider}/login/`;
    }
  };

  return (
    <div className="min-h-screen bg-gray-200 flex items-center justify-center px-4">
      <div className="bg-white rounded-2xl shadow-2xl p-8 max-w-md w-full border-4 border-black">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Welcome to Sessions Marketplace
          </h1>
          <p className="text-gray-600">
            Find and enroll in amazing online classes
          </p>
        </div>

        {error && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
            {error}
          </div>
        )}

        <div className="mb-6">
          <label className="block text-gray-700 font-semibold mb-3 text-center">
            I am a:
          </label>
          <div className="grid grid-cols-2 gap-3">
            <button
              type="button"
              onClick={() => setSelectedRole('user')}
              className={`py-3 px-4 rounded-lg font-semibold transition border-2 ${
                selectedRole === 'user'
                  ? 'bg-black text-white border-black'
                  : 'bg-white text-gray-700 border-gray-300 hover:border-gray-400'
              }`}
            >
              🎓 Student
            </button>
            <button
              type="button"
              onClick={() => setSelectedRole('creator')}
              className={`py-3 px-4 rounded-lg font-semibold transition border-2 ${
                selectedRole === 'creator'
                  ? 'bg-black text-white border-black'
                  : 'bg-white text-gray-700 border-gray-300 hover:border-gray-400'
              }`}
            >
              👨‍🏫 Teacher
            </button>
          </div>
        </div>

        <div className="space-y-4">
          <button
            onClick={() => handleOAuthLogin('google')}
            className="w-full bg-white border-2 border-gray-300 hover:border-gray-400 text-gray-700 font-semibold py-3 px-4 rounded-lg flex items-center justify-center gap-3 transition"
          >
            <svg className="w-6 h-6" viewBox="0 0 24 24">
              <path
                fill="#6B7280"
                d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
              />
              <path
                fill="#4B5563"
                d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
              />
              <path
                fill="#9CA3AF"
                d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
              />
              <path
                fill="#374151"
                d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
              />
            </svg>
            Continue with Google
          </button>

          <button
            onClick={() => handleOAuthLogin('github')}
            className="w-full bg-black hover:bg-gray-800 text-white font-semibold py-3 px-4 rounded-lg flex items-center justify-center gap-3 transition"
          >
            <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
              <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z"/>
            </svg>
            Continue with GitHub
          </button>
        </div>

        <div className="mt-6 text-center text-sm text-gray-600">
          <p>By continuing, you agree to our Terms of Service</p>
        </div>
      </div>
    </div>
  );
};

export default Login;
