import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import api from '../utils/api';

const Home = () => {
  const [sessions, setSessions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const { user } = useAuth();
  const navigate = useNavigate();

  const handleCreateClick = () => {
    console.log('[HOME] Create box clicked, user:', user);
    if (!user) {
      // Not logged in, redirect to login
      console.log('[HOME] Not logged in, redirecting to login');
      navigate('/login');
    } else if (user.role === 'creator') {
      // Creator - go to dashboard with create parameter
      console.log('[HOME] Creator user, navigating to dashboard with ?create=true');
      navigate('/creator/dashboard?create=true');
    } else {
      // User role, show message
      console.log('[HOME] Regular user, showing alert');
      alert('To create classes, please login as a Teacher. You can logout and login again selecting the Teacher option.');
    }
  };

  const handleEditClick = (e, sessionId) => {
    e.preventDefault(); // Prevent Link navigation
    e.stopPropagation();
    console.log('[HOME] Edit clicked for session:', sessionId);
    navigate('/creator/dashboard', { state: { editSessionId: sessionId } });
  };

  useEffect(() => {
    fetchSessions();
  }, []);

  const fetchSessions = async () => {
    try {
      const response = await api.get('/sessions/');
      setSessions(response.data);
    } catch (err) {
      setError('Failed to load classes');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-xl text-gray-500 font-medium">Loading classes...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 py-12">
        <div className="mb-10 text-center">
          <h1 className="text-4xl font-extrabold text-gray-900 mb-4 tracking-tight">
            Available Classes
          </h1>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            Explore and enroll in online classes from expert instructors. Find the perfect session to enhance your skills.
          </p>
        </div>

        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg mb-8 max-w-2xl mx-auto text-center">
            {error}
          </div>
        )}

        {sessions.length === 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {[1, 2, 3, 4].map((i) => (
              <div
                key={i}
                onClick={handleCreateClick}
                className="bg-white rounded-xl shadow-sm border-2 border-dashed border-gray-200 p-6 cursor-pointer hover:border-indigo-300 hover:shadow-md transition-all group"
              >
                <div className="aspect-square bg-gray-50 relative mb-6 flex items-center justify-center rounded-lg group-hover:bg-indigo-50 transition-colors">
                  <svg className="w-12 h-12 text-gray-300 group-hover:text-indigo-400 transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                  </svg>
                </div>
                
                <div>
                  <h3 className="text-lg font-semibold text-gray-400 group-hover:text-indigo-600 transition-colors mb-2">
                    Create a Class
                  </h3>
                  
                  <p className="text-sm text-gray-400 mb-4">
                    Click to add your class
                  </p>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {sessions.map((session) => (
              <Link
                key={session.id}
                to={`/class/${session.id}`}
                className="bg-white rounded-xl shadow-sm hover:shadow-xl transition-all duration-300 overflow-hidden border border-gray-100 group flex flex-col h-full"
              >
                <div className="aspect-video bg-gray-100 relative overflow-hidden">
                  {session.image_url ? (
                    <img
                      src={session.image_url}
                      alt={session.title}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center bg-indigo-50 text-indigo-300 text-4xl font-bold">
                      {session.title.charAt(0)}
                    </div>
                  )}
                  
                  {/* Edit button for creators */}
                  {user && user.id === session.creator.id && (
                    <button
                      onClick={(e) => handleEditClick(e, session.id)}
                      className="absolute top-3 right-3 bg-white/90 backdrop-blur-sm text-gray-700 p-2 rounded-full shadow-sm hover:bg-white hover:text-indigo-600 transition-all"
                      title="Edit class"
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                      </svg>
                    </button>
                  )}
                </div>
                
                <div className="p-5 flex flex-col flex-grow">
                  <div className="flex justify-between items-start mb-2">
                    <h3 className="text-lg font-bold text-gray-900 line-clamp-1 group-hover:text-indigo-600 transition-colors">
                      {session.title}
                    </h3>
                    <span className="bg-indigo-50 text-indigo-700 text-xs font-bold px-2 py-1 rounded-full">
                      ₹{session.price}
                    </span>
                  </div>
                  
                  <p className="text-gray-500 text-sm mb-4 line-clamp-2 flex-grow">
                    {session.description}
                  </p>
                  
                  <div className="pt-4 border-t border-gray-100 flex items-center justify-between text-sm">
                    <div className="flex items-center gap-2 text-gray-600">
                      <div className="w-6 h-6 bg-gray-200 rounded-full flex items-center justify-center text-xs font-bold text-gray-500">
                        {session.creator.username.charAt(0).toUpperCase()}
                      </div>
                      <span className="font-medium">{session.creator.username}</span>
                    </div>
                    <div className="text-gray-400 text-xs">
                      {new Date(session.date).toLocaleDateString('en-US', {
                        month: 'short',
                        day: 'numeric'
                      })}
                    </div>
                  </div>
                </div>
              </Link>
            ))}
            
            {/* Show 1 placeholder box if less than 4 classes */}
            {sessions.length < 4 && (
              <div
                onClick={handleCreateClick}
                className="bg-gray-50 rounded-xl shadow-sm border-2 border-dashed border-gray-200 p-6 cursor-pointer hover:border-indigo-300 hover:bg-white hover:shadow-md transition-all group flex flex-col items-center justify-center min-h-[300px]"
              >
                <div className="w-16 h-16 bg-white rounded-full shadow-sm flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                  <svg className="w-8 h-8 text-gray-400 group-hover:text-indigo-500 transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                  </svg>
                </div>
                <h3 className="text-lg font-semibold text-gray-500 group-hover:text-indigo-600 transition-colors">
                  Create New Class
                </h3>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default Home;

