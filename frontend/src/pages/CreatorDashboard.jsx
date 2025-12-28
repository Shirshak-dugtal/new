import React, { useState, useEffect, useRef } from 'react';
import { useAuth } from '../context/AuthContext';
import { useLocation, useSearchParams } from 'react-router-dom';
import api from '../utils/api';

const CreatorDashboard = () => {
  console.log('[DASHBOARD] ==== Component function called ====');
  
  const { user, checkAuth } = useAuth();
  const location = useLocation();
  const [searchParams, setSearchParams] = useSearchParams();
  const fileInputRef = useRef(null);
  
  console.log('[DASHBOARD] Hooks initialized');
  console.log('[DASHBOARD] searchParams:', searchParams.toString());
  console.log('[DASHBOARD] location:', location);
  
  // Check URL parameter or location state
  const createParam = searchParams.get('create') === 'true';
  const shouldOpenCreate = createParam || location.state?.openCreateForm === true;
  
  console.log('[DASHBOARD] Component render');
  console.log('[DASHBOARD] URL param create:', createParam);
  console.log('[DASHBOARD] location.state:', location.state);
  console.log('[DASHBOARD] shouldOpenCreate:', shouldOpenCreate);
  
  const [sessions, setSessions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showCreateForm, setShowCreateForm] = useState(shouldOpenCreate);
  const [editingSession, setEditingSession] = useState(null);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    date: '',
    price: ''
  });
  const [imageFile, setImageFile] = useState(null);
  const [creating, setCreating] = useState(false);
  const [updating, setUpdating] = useState(false);
  const [error, setError] = useState('');
  
  // Enrollment viewing state
  const [expandedSessionId, setExpandedSessionId] = useState(null);
  const [enrollments, setEnrollments] = useState([]);
  const [loadingEnrollments, setLoadingEnrollments] = useState(false);

  useEffect(() => {
    console.log('CreatorDashboard mounted, location.state:', location.state);
    console.log('searchParams create:', searchParams.get('create'));
    fetchMySessions();
    
    // Clear the create parameter from URL if it exists
    if (searchParams.get('create') === 'true') {
      console.log('Clearing create parameter from URL');
      setSearchParams({});
    }
    
    // Check if we need to auto-open create form from Home page
    if (location.state?.openCreateForm) {
      console.log('Opening create form from navigation - setting showCreateForm to true');
      setShowCreateForm(true);
      setEditingSession(null);
      setFormData({ title: '', description: '', date: '', price: '' });
      setImageFile(null);
      setError('');
    } else {
      console.log('No openCreateForm flag in location.state');
    }
  }, []);

  useEffect(() => {
    // Check if we need to auto-edit a session from ClassDetail navigation
    if (location.state?.editSessionId && sessions.length > 0) {
      const sessionToEdit = sessions.find(s => s.id === location.state.editSessionId);
      if (sessionToEdit) {
        console.log('Auto-editing session:', sessionToEdit.title);
        handleEdit(sessionToEdit);
      }
    }
  }, [sessions]);

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

  const fetchMySessions = async () => {
    try {
      const response = await api.get('/sessions/');
      // Filter sessions created by current user
      const mySessions = response.data.filter(s => s.creator.id === user.id);
      setSessions(mySessions);
    } catch (err) {
      setError('Failed to load your classes');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleImageChange = (e) => {
    setImageFile(e.target.files[0]);
  };

  const handleViewEnrollments = async (sessionId) => {
    if (expandedSessionId === sessionId) {
      setExpandedSessionId(null);
      setEnrollments([]);
      return;
    }

    setExpandedSessionId(sessionId);
    setLoadingEnrollments(true);
    try {
      const response = await api.get(`/sessions/${sessionId}/bookings/`);
      setEnrollments(response.data);
    } catch (err) {
      console.error('Failed to fetch enrollments', err);
    } finally {
      setLoadingEnrollments(false);
    }
  };

  const handleEdit = (session) => {
    setEditingSession(session);
    setFormData({
      title: session.title,
      description: session.description,
      date: session.date.split('T')[0], // Format date for input field
      price: session.price
    });
    setImageFile(null);
    setShowCreateForm(false);
  };

  const handleCancelEdit = () => {
    setEditingSession(null);
    setFormData({ title: '', description: '', date: '', price: '' });
    setImageFile(null);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (editingSession) {
      // Update existing session
      setUpdating(true);
      setError('');

      try {
        const data = new FormData();
        data.append('title', formData.title);
        data.append('description', formData.description);
        data.append('date', formData.date);
        data.append('price', formData.price);
        if (imageFile) {
          data.append('image', imageFile);
        }

        await api.put(`/sessions/${editingSession.id}/update/`, data, {
          headers: {
            'Content-Type': 'multipart/form-data',
          },
        });

        setFormData({ title: '', description: '', date: '', price: '' });
        setImageFile(null);
        setEditingSession(null);
        fetchMySessions();
      } catch (err) {
        setError(err.response?.data?.error || 'Failed to update class');
      } finally {
        setUpdating(false);
      }
    } else {
      // Create new session
      setCreating(true);
      setError('');

      try {
        const data = new FormData();
        data.append('title', formData.title);
        data.append('description', formData.description);
        data.append('date', formData.date);
        data.append('price', formData.price);
        if (imageFile) {
          data.append('image', imageFile);
        }

        await api.post('/sessions/create/', data, {
          headers: {
            'Content-Type': 'multipart/form-data',
          },
        });

        setFormData({ title: '', description: '', date: '', price: '' });
        setImageFile(null);
        setShowCreateForm(false);
        fetchMySessions();
      } catch (err) {
        setError(err.response?.data?.error || 'Failed to create class');
      } finally {
        setCreating(false);
      }
    }
  };

  const handleDelete = async (sessionId) => {
    if (!confirm('Are you sure you want to delete this class?')) {
      return;
    }

    try {
      await api.delete(`/sessions/${sessionId}/delete/`);
      setSessions(sessions.filter(s => s.id !== sessionId));
    } catch (err) {
      alert('Failed to delete class');
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
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 py-12">
        {/* Creator Profile */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-8 mb-10">
          <div className="flex flex-col md:flex-row items-center justify-between gap-6">
            <div className="flex items-center gap-6">
              <div className="relative group cursor-pointer" onClick={handleAvatarClick}>
                <input
                  type="file"
                  ref={fileInputRef}
                  onChange={handleAvatarChange}
                  className="hidden"
                  accept="image/*"
                />
                <div className="w-20 h-20 bg-indigo-100 rounded-full flex items-center justify-center text-indigo-600 text-3xl font-bold shadow-sm overflow-hidden border-2 border-transparent group-hover:border-indigo-300 transition-all">
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
                  <svg className="w-6 h-6 text-white opacity-0 group-hover:opacity-100 transform scale-75 group-hover:scale-100 transition-all" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" />
                  </svg>
                </div>
              </div>
              <div>
                <h1 className="text-3xl font-bold text-gray-900 mb-1">
                  {user?.username}
                </h1>
                <p className="text-gray-500 mb-2">{user?.email}</p>
                <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-indigo-50 text-indigo-700">
                  Instructor
                </span>
              </div>
            </div>

            <button
              type="button"
              onClick={(e) => {
                e.preventDefault();
                setShowCreateForm(!showCreateForm);
                setEditingSession(null);
                setFormData({ title: '', description: '', date: '', price: '' });
                setImageFile(null);
                setError('');
              }}
              className={`px-6 py-3 rounded-xl font-semibold transition-all shadow-sm ${
                showCreateForm 
                  ? 'bg-white border border-gray-200 text-gray-700 hover:bg-gray-50' 
                  : 'bg-indigo-600 text-white hover:bg-indigo-700 hover:shadow-md'
              }`}
            >
              {showCreateForm ? 'Cancel' : '+ Create New Class'}
            </button>
          </div>
        </div>

        {/* Create/Edit Form */}
        {(showCreateForm || editingSession) && (
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-8 mb-10 animate-fade-in-down">
            <div className="flex justify-between items-center mb-8 pb-4 border-b border-gray-100">
              <h2 className="text-2xl font-bold text-gray-900">
                {editingSession ? 'Edit Class' : 'Create New Class'}
              </h2>
              {editingSession && (
                <button
                  onClick={handleCancelEdit}
                  className="text-gray-500 hover:text-gray-900 font-medium transition-colors"
                >
                  Cancel Edit
                </button>
              )}
            </div>

            {error && (
              <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-xl mb-6">
                {error}
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Class Title *
                </label>
                <input
                  type="text"
                  name="title"
                  value={formData.title}
                  onChange={handleInputChange}
                  required
                  className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all bg-gray-50 focus:bg-white"
                  placeholder="e.g., Python Basics - Beginner Course"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Description *
                </label>
                <textarea
                  name="description"
                  value={formData.description}
                  onChange={handleInputChange}
                  required
                  rows={4}
                  className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all bg-gray-50 focus:bg-white"
                  placeholder="Describe what students will learn..."
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Class Date *
                  </label>
                  <input
                    type="date"
                    name="date"
                    value={formData.date}
                    onChange={handleInputChange}
                    required
                    className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all bg-gray-50 focus:bg-white"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Price ($) *
                  </label>
                  <input
                    type="number"
                    name="price"
                    value={formData.price}
                    onChange={handleInputChange}
                    required
                    min="0"
                    step="0.01"
                    className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all bg-gray-50 focus:bg-white"
                    placeholder="0.00"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Class Image
                </label>
                <div className="mt-1 flex justify-center px-6 pt-5 pb-6 border-2 border-gray-300 border-dashed rounded-xl hover:border-indigo-400 transition-colors cursor-pointer bg-gray-50 hover:bg-gray-100">
                  <div className="space-y-1 text-center">
                    <svg
                      className="mx-auto h-12 w-12 text-gray-400"
                      stroke="currentColor"
                      fill="none"
                      viewBox="0 0 48 48"
                      aria-hidden="true"
                    >
                      <path
                        d="M28 8H12a4 4 0 00-4 4v20m32-12v8m0 0v8a4 4 0 01-4 4H12a4 4 0 01-4-4v-4m32-4l-3.172-3.172a4 4 0 00-5.656 0L28 28M8 32l9.172-9.172a4 4 0 015.656 0L28 28m0 0l4 4m4-24h8m-4-4v8m-12 4h.02"
                        strokeWidth={2}
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />
                    </svg>
                    <div className="flex text-sm text-gray-600 justify-center">
                      <label
                        htmlFor="file-upload"
                        className="relative cursor-pointer bg-transparent rounded-md font-medium text-indigo-600 hover:text-indigo-500 focus-within:outline-none"
                      >
                        <span>Upload a file</span>
                        <input
                          id="file-upload"
                          name="file-upload"
                          type="file"
                          accept="image/*"
                          className="sr-only"
                          onChange={handleImageChange}
                        />
                      </label>
                      <p className="pl-1">or drag and drop</p>
                    </div>
                    <p className="text-xs text-gray-500">PNG, JPG, GIF up to 10MB</p>
                    {imageFile && (
                      <p className="text-sm text-indigo-600 font-medium mt-2">
                        Selected: {imageFile.name}
                      </p>
                    )}
                  </div>
                </div>
              </div>

              <button
                type="submit"
                disabled={creating || updating}
                className="w-full bg-indigo-600 hover:bg-indigo-700 disabled:bg-indigo-300 text-white font-bold py-4 px-6 rounded-xl transition shadow-sm hover:shadow-md transform hover:-translate-y-0.5"
              >
                {editingSession 
                  ? (updating ? 'Updating...' : 'Update Class')
                  : (creating ? 'Creating...' : 'Create Class')
                }
              </button>
            </form>
          </div>
        )}

        {/* My Classes */}
        <div>
          <h2 className="text-2xl font-bold text-gray-900 mb-6">
            My Classes ({sessions.length})
          </h2>

          {sessions.length === 0 ? (
            <div className="bg-white rounded-xl shadow-sm border border-dashed border-gray-300 p-12 text-center">
              <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                </svg>
              </div>
              <p className="text-xl text-gray-600 mb-6">
                You haven't created any classes yet
              </p>
              <button
                onClick={() => setShowCreateForm(true)}
                className="inline-flex items-center px-6 py-3 border border-transparent text-base font-medium rounded-xl shadow-sm text-white bg-indigo-600 hover:bg-indigo-700"
              >
                Create Your First Class
              </button>
            </div>
          ) : (
            <div className="space-y-4">
              {sessions.map((session) => (
                <div
                  key={session.id}
                  className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 hover:shadow-md transition-all"
                >
                  <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                    {/* Left side - Class details */}
                    <div className="flex-1">
                      <div className="flex items-center justify-between mb-2">
                        <h3 className="text-xl font-bold text-gray-900">
                          {session.title}
                        </h3>
                        <span className="md:hidden font-bold text-indigo-600">₹{session.price}</span>
                      </div>

                      <p className="text-gray-500 mb-3 line-clamp-1 text-sm">
                        {session.description}
                      </p>

                      <div className="flex items-center gap-6 text-sm text-gray-500">
                        <div className="flex items-center gap-2">
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                          </svg>
                          {new Date(session.date).toLocaleDateString('en-US', {
                            month: 'short',
                            day: 'numeric',
                            year: 'numeric'
                          })}
                        </div>
                        <div className="hidden md:flex items-center gap-2">
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                          </svg>
                          <span className="font-bold text-gray-900">₹{session.price}</span>
                        </div>
                      </div>
                    </div>

                    {/* Right side - Actions */}
                    <div className="flex items-center gap-3 pt-4 md:pt-0 border-t md:border-t-0 border-gray-100">
                      <button
                        onClick={() => handleViewEnrollments(session.id)}
                        className={`flex-1 md:flex-none px-4 py-2 rounded-lg text-sm font-medium transition-colors flex items-center justify-center gap-2 ${
                          expandedSessionId === session.id
                            ? 'bg-indigo-50 text-indigo-700'
                            : 'bg-white border border-gray-200 text-gray-700 hover:bg-gray-50'
                        }`}
                      >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                        </svg>
                        {expandedSessionId === session.id ? 'Hide Students' : 'Students'}
                      </button>
                      <button
                        onClick={() => handleEdit(session)}
                        className="flex-1 md:flex-none bg-white border border-gray-200 hover:border-indigo-300 text-gray-700 hover:text-indigo-600 px-4 py-2 rounded-lg text-sm font-medium transition-colors flex items-center justify-center gap-2"
                      >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                        </svg>
                        Edit
                      </button>
                      <button
                        onClick={() => handleDelete(session.id)}
                        className="flex-1 md:flex-none bg-red-50 hover:bg-red-100 text-red-600 px-4 py-2 rounded-lg text-sm font-medium transition-colors flex items-center justify-center gap-2"
                      >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                        </svg>
                        Delete
                      </button>
                    </div>
                  </div>

                  {expandedSessionId === session.id && (
                    <div className="mt-6 border-t border-gray-100 pt-6 animate-fade-in">
                      <h4 className="font-bold text-gray-900 mb-4 flex items-center gap-2">
                        <span className="w-2 h-2 bg-indigo-500 rounded-full"></span>
                        Enrolled Students
                      </h4>
                      {loadingEnrollments ? (
                        <div className="flex items-center gap-2 text-gray-500 text-sm">
                          <svg className="animate-spin h-4 w-4 text-indigo-500" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                          </svg>
                          Loading...
                        </div>
                      ) : enrollments.length > 0 ? (
                        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
                          {enrollments.map((booking) => (
                            <div key={booking.id} className="flex items-center gap-3 bg-gray-50 p-3 rounded-lg border border-gray-100">
                              <div className="w-8 h-8 bg-white border border-gray-200 rounded-full flex items-center justify-center text-gray-500 font-bold text-xs shadow-sm">
                                {booking.user.username.charAt(0).toUpperCase()}
                              </div>
                              <span className="text-gray-700 text-sm font-medium">{booking.user.username}</span>
                            </div>
                          ))}
                        </div>
                      ) : (
                        <div className="text-center py-6 bg-gray-50 rounded-lg border border-dashed border-gray-200">
                          <p className="text-gray-500 text-sm italic">No students enrolled yet.</p>
                        </div>
                      )}
                    </div>
                  )}
                </div>

              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default CreatorDashboard;
