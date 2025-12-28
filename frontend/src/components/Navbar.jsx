import React from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const Navbar = () => {
  const { user, logout } = useAuth();

  return (
    <nav className="bg-white shadow-sm border-b border-gray-100 sticky top-0 z-50">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <Link to="/" className="flex items-center gap-2">
            <div className="w-8 h-8 bg-indigo-600 rounded-lg flex items-center justify-center">
              <span className="text-white font-bold text-xl">S</span>
            </div>
            <span className="text-xl font-bold text-gray-900 tracking-tight">Sessions</span>
          </Link>
          
          <div className="flex items-center gap-6">
            {user ? (
              <>
                <Link to="/" className="text-gray-600 hover:text-indigo-600 font-medium transition">
                  Browse Classes
                </Link>
                
                {user.role === 'creator' ? (
                  <Link to="/creator/dashboard" className="text-gray-600 hover:text-indigo-600 font-medium transition">
                    Manage Classes
                  </Link>
                ) : (
                  <Link to="/dashboard" className="text-gray-600 hover:text-indigo-600 font-medium transition">
                    My Bookings
                  </Link>
                )}
                
                <div className="flex items-center gap-4 pl-4 border-l border-gray-200">
                  <div className="flex flex-col items-end">
                    <span className="text-sm font-semibold text-gray-900 leading-none">
                      {user.username}
                    </span>
                    <span className="text-xs text-gray-500 capitalize mt-1">
                      {user.role}
                    </span>
                  </div>
                  
                  <div className="w-10 h-10 rounded-full bg-indigo-100 border border-indigo-200 flex items-center justify-center overflow-hidden shadow-sm">
                    {user.avatar_url ? (
                      <img 
                        src={user.avatar_url} 
                        alt={user.username} 
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <span className="text-indigo-700 font-bold text-sm">
                        {user.username.charAt(0).toUpperCase()}
                      </span>
                    )}
                  </div>

                  <button
                    onClick={logout}
                    className="text-gray-500 hover:text-red-600 transition p-2 rounded-full hover:bg-red-50"
                    title="Logout"
                  >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                    </svg>
                  </button>
                </div>
              </>
            ) : (
              <Link
                to="/login"
                className="bg-indigo-600 text-white hover:bg-indigo-700 px-5 py-2.5 rounded-lg font-medium transition shadow-sm hover:shadow"
              >
                Sign In
              </Link>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;

