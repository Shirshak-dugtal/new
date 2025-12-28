import React, { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import api from '../utils/api';

const UserDashboard = () => {
  const { user, checkAuth } = useAuth();
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const fileInputRef = useRef(null);

  useEffect(() => {
    fetchBookings();
  }, []);

  const fetchBookings = async () => {
    try {
      const response = await api.get('/bookings/my/');
      setBookings(response.data);
    } catch (err) {
      setError('Failed to load your enrollments');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleAvatarClick = () => {
    fileInputRef.current.click();
  };

  const handleAvatarChange = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const formData = new FormData();
    formData.append('avatar', file);

    try {
      await api.patch('/users/me/', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      await checkAuth(); // Refresh user data
    } catch (err) {
      console.error('Failed to update avatar', err);
      alert('Failed to update profile picture');
    }
  };

  const handleCancelBooking = async (bookingId) => {
    if (!confirm('Are you sure you want to cancel this enrollment?')) {
      return;
    }

    try {
      await api.delete(`/bookings/${bookingId}/delete/`);
      setBookings(bookings.filter(b => b.id !== bookingId));
    } catch (err) {
      alert('Failed to cancel enrollment');
      console.error(err);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-xl text-gray-500 font-medium">Loading your dashboard...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="container mx-auto px-4 max-w-6xl">
        {/* User Profile Header */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8 mb-10 flex flex-col md:flex-row items-center gap-6">
          <div className="relative group cursor-pointer" onClick={handleAvatarClick}>
            <input
              type="file"
              ref={fileInputRef}
              onChange={handleAvatarChange}
              className="hidden"
              accept="image/*"
            />
            <div className="w-24 h-24 bg-indigo-100 rounded-full flex items-center justify-center text-indigo-600 text-3xl font-bold shadow-inner overflow-hidden border-2 border-transparent group-hover:border-indigo-300 transition-all">
              {user?.avatar_url ? (
                <img 
                  src={user.avatar_url} 
                  alt={user.username} 
                  className="w-full h-full object-cover"
                />
              ) : (
                user?.username?.charAt(0).toUpperCase()
              )}
            </div>
            <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-30 rounded-full flex items-center justify-center transition-all">
              <svg className="w-8 h-8 text-white opacity-0 group-hover:opacity-100 transform scale-75 group-hover:scale-100 transition-all" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
            </div>
          </div>
          <div className="text-center md:text-left">
            <h1 className="text-3xl font-bold text-gray-900 mb-2">
              {user?.username}
            </h1>
            <p className="text-gray-500 font-medium mb-3">{user?.email}</p>
            <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-indigo-50 text-indigo-700 border border-indigo-100">
              Student Account
            </span>
          </div>
        </div>

        {/* Enrolled Classes Section */}
        <div>
          <div className="flex items-center justify-between mb-8">
            <h2 className="text-2xl font-bold text-gray-900">
              My Enrollments
              <span className="ml-3 text-sm font-normal text-gray-500 bg-white px-3 py-1 rounded-full border border-gray-200">
                {bookings.length} classes
              </span>
            </h2>
            <Link 
              to="/" 
              className="text-indigo-600 hover:text-indigo-700 font-medium hover:underline"
            >
              Browse more classes &rarr;
            </Link>
          </div>

          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-xl mb-8">
              {error}
            </div>
          )}

          {bookings.length === 0 ? (
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-16 text-center">
              <div className="w-16 h-16 bg-gray-50 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                </svg>
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-2">No enrollments yet</h3>
              <p className="text-gray-500 mb-8 max-w-md mx-auto">
                You haven't enrolled in any classes yet. Explore our catalog to find classes that interest you.
              </p>
              <Link
                to="/"
                className="inline-flex items-center justify-center px-6 py-3 border border-transparent text-base font-medium rounded-xl text-white bg-indigo-600 hover:bg-indigo-700 shadow-sm hover:shadow transition-all"
              >
                Browse Classes
              </Link>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {bookings.map((booking) => (
                <div
                  key={booking.id}
                  className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden hover:shadow-md transition-shadow duration-200 flex flex-col h-full"
                >
                  <div className="p-6 flex-grow">
                    <div className="flex justify-between items-start mb-4">
                      <h3 className="text-lg font-bold text-gray-900 line-clamp-1">
                        {booking.session.title}
                      </h3>
                      <span className="flex-shrink-0 bg-green-50 text-green-700 text-xs font-bold px-2 py-1 rounded-lg border border-green-100">
                        ENROLLED
                      </span>
                    </div>
                    
                    <p className="text-gray-600 text-sm mb-6 line-clamp-2">
                      {booking.session.description}
                    </p>

                    <div className="space-y-3">
                      <div className="flex items-center text-sm text-gray-500">
                        <svg className="w-4 h-4 mr-2 text-indigo-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                        </svg>
                        {new Date(booking.session.date).toLocaleDateString('en-US', {
                          weekday: 'short',
                          month: 'short',
                          day: 'numeric'
                        })}
                      </div>
                      <div className="flex items-center text-sm text-gray-500">
                        <svg className="w-4 h-4 mr-2 text-indigo-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                        {booking.session.time ? booking.session.time.substring(0, 5) : 'Time N/A'}
                      </div>
                      <div className="flex items-center text-sm text-gray-500">
                        <svg className="w-4 h-4 mr-2 text-indigo-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                        </svg>
                        Instructor: {booking.session.creator.username}
                      </div>
                    </div>
                  </div>

                  <div className="px-6 py-4 bg-gray-50 border-t border-gray-100 flex justify-between items-center">
                    <Link
                      to={`/class/${booking.session.id}`}
                      className="text-indigo-600 hover:text-indigo-800 text-sm font-medium hover:underline"
                    >
                      View Details
                    </Link>
                    <button
                      onClick={() => handleCancelBooking(booking.id)}
                      className="text-red-600 hover:text-red-800 text-sm font-medium hover:underline"
                    >
                      Cancel
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default UserDashboard;
