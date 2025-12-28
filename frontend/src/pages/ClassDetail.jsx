import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import api from '../utils/api';

const ClassDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [session, setSession] = useState(null);
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [enrolling, setEnrolling] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  useEffect(() => {
    fetchSession();
    fetchBookings();
  }, [id]);

  const fetchSession = async () => {
    try {
      const response = await api.get(`/sessions/${id}/`);
      setSession(response.data);
    } catch (err) {
      setError('Failed to load class details');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const fetchBookings = async () => {
    try {
      const response = await api.get(`/sessions/${id}/bookings/`);
      setBookings(response.data);
    } catch (err) {
      console.error('Failed to fetch bookings', err);
    }
  };

  const handleEdit = () => {
    // Navigate to creator dashboard with edit mode
    navigate('/creator/dashboard', { state: { editSessionId: session.id } });
  };

  const handleDelete = async () => {
    if (!confirm('Are you sure you want to delete this class?')) {
      return;
    }

    try {
      await api.delete(`/sessions/${session.id}/delete/`);
      navigate('/creator/dashboard');
    } catch (err) {
      setError('Failed to delete class');
      console.error(err);
    }
  };

  const handleEnroll = async () => {
    if (!user) {
      navigate('/login');
      return;
    }

    setEnrolling(true);
    setError('');
    
    try {
      await api.post('/bookings/create/', {
        session_id: session.id
      });
      setSuccess('Successfully enrolled in class!');
      fetchBookings();
      // Stay on page after enrollment
      // setTimeout(() => {
      //   navigate('/dashboard');
      // }, 1500);
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to enroll in class');
    } finally {
      setEnrolling(false);
    }

  };

  const isEnrolled = user && bookings.some(b => b.user.id === user.id);

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-xl text-gray-500 font-medium">Loading class details...</div>
      </div>
    );
  }

  if (!session) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-xl text-red-500 font-medium">Class not found</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 py-12">
        <div className="max-w-4xl mx-auto">
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
            {/* Image */}
            <div className="w-full aspect-video bg-gray-100 relative">
              {session.image_url ? (
                <img
                  src={session.image_url}
                  alt={session.title}
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center bg-indigo-50 text-indigo-300 text-6xl font-bold">
                  {session.title.charAt(0)}
                </div>
              )}
              
              <div className="absolute top-4 right-4">
                <span className="bg-white/90 backdrop-blur-sm text-gray-900 font-bold px-4 py-2 rounded-full shadow-sm">
                  ₹{session.price}
                </span>
              </div>
            </div>

            {/* Content */}
            <div className="p-8">
              <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-6 mb-8">
                <div>
                  <h1 className="text-3xl font-bold text-gray-900 mb-4">
                    {session.title}
                  </h1>

                  <div className="flex flex-wrap items-center gap-6 text-gray-600">
                    <div className="flex items-center gap-2">
                      <div className="w-8 h-8 bg-indigo-100 rounded-full flex items-center justify-center text-indigo-600 font-bold text-sm">
                        {session.creator.username.charAt(0).toUpperCase()}
                      </div>
                      <span className="font-medium">{session.creator.username}</span>
                    </div>

                    <div className="flex items-center gap-2">
                      <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                      </svg>
                      <span>
                        {new Date(session.date).toLocaleDateString('en-US', {
                          weekday: 'long',
                          year: 'numeric',
                          month: 'long',
                          day: 'numeric'
                        })}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="flex-shrink-0">
                  {user?.role !== 'creator' && (
                    isEnrolled ? (
                      <button
                        disabled
                        className="w-full md:w-auto bg-green-600 text-white font-semibold py-3 px-8 rounded-xl shadow-sm cursor-default flex items-center justify-center gap-2"
                      >
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                        </svg>
                        Enrolled
                      </button>
                    ) : (
                      <button
                        onClick={handleEnroll}
                        disabled={enrolling}
                        className="w-full md:w-auto bg-indigo-600 hover:bg-indigo-700 disabled:bg-indigo-300 text-white font-semibold py-3 px-8 rounded-xl shadow-sm hover:shadow transition-all transform hover:-translate-y-0.5"
                      >
                        {enrolling ? 'Enrolling...' : 'Enroll Now'}
                      </button>
                    )
                  )}

                  {user?.role === 'creator' && session.creator.id === user.id && (
                    <div className="flex gap-3">
                      <button
                        onClick={handleEdit}
                        className="bg-white border border-gray-200 hover:border-indigo-300 text-gray-700 hover:text-indigo-600 font-medium py-2.5 px-6 rounded-xl transition flex items-center gap-2"
                      >
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                        </svg>
                        Edit
                      </button>
                      <button
                        onClick={handleDelete}
                        className="bg-red-50 hover:bg-red-100 text-red-600 font-medium py-2.5 px-6 rounded-xl transition flex items-center gap-2"
                      >
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                        </svg>
                        Delete
                      </button>
                    </div>
                  )}
                </div>
              </div>

              <div className="prose prose-indigo max-w-none mb-10">
                <h2 className="text-xl font-bold text-gray-900 mb-4">
                  About this Class
                </h2>
                <p className="text-gray-600 leading-relaxed whitespace-pre-wrap">
                  {session.description}
                </p>
              </div>

              <div className="border-t border-gray-100 pt-8">
                <h2 className="text-xl font-bold text-gray-900 mb-6">
                  Enrolled Students
                </h2>
                {bookings.length > 0 ? (
                  <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                    {bookings.map((booking) => (
                      <div key={booking.id} className="flex items-center gap-3 bg-gray-50 p-4 rounded-xl border border-gray-100">
                        <div className="w-10 h-10 bg-white border border-gray-200 rounded-full flex items-center justify-center text-gray-500 font-bold shadow-sm">
                          {booking.user.username.charAt(0).toUpperCase()}
                        </div>
                        <span className="text-gray-700 font-medium">{booking.user.username}</span>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="bg-gray-50 rounded-xl p-8 text-center border border-dashed border-gray-200">
                    <p className="text-gray-500">No students enrolled yet</p>
                  </div>
                )}
              </div>

              {error && (
                <div className="mt-6 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-xl">
                  {error}
                </div>
              )}

              {success && (
                <div className="mt-6 bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded-xl">
                  {success}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};


export default ClassDetail;
