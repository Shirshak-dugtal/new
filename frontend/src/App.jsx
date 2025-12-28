import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import ProtectedRoute from './components/ProtectedRoute';
import Navbar from './components/Navbar';
import Login from './pages/Login';
import Home from './pages/Home';
import ClassDetail from './pages/ClassDetail';
import UserDashboard from './pages/UserDashboard';
import CreatorDashboard from './pages/CreatorDashboard';

function App() {
  return (
    <AuthProvider>
      <Router>
        <div className="min-h-screen bg-gray-50">
          <Navbar />
          <Routes>
            <Route path="/login" element={<Login />} />
            <Route path="/" element={<Home />} />
            <Route path="/class/:id" element={<ClassDetail />} />
            
            <Route
              path="/dashboard"
              element={
                <ProtectedRoute requireRole="user">
                  <UserDashboard />
                </ProtectedRoute>
              }
            />
            
            <Route
              path="/creator/dashboard"
              element={
                <ProtectedRoute requireRole="creator">
                  <CreatorDashboard />
                </ProtectedRoute>
              }
            />
            
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </div>
      </Router>
    </AuthProvider>
  );
}

export default App;
