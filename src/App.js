import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { AuthProvider, useAuth } from './context/AuthContext';
import Header from './components/common/Header';
import Loading from './components/common/Loading';
import ProtectedRoute from './components/common/ProtectedRoute';

// Auth Components
import Login from './components/auth/Login';
import Register from './components/auth/Register';

// Admin Components
import AdminDashboard from './components/admin/AdminDashboard';

// Judge Components
import JudgeDashboard from './components/judge/JudgeDashboard';

// Participant Components
import ParticipantDashboard from './components/participant/ParticipantDashboard';

import './App.css';

// Dashboard Router Component
const DashboardRouter = () => {
  const { userProfile } = useAuth();

  if (!userProfile) {
    return <Loading />;
  }

  switch (userProfile.role) {
    case 'admin':
      return <Navigate to="/admin" replace />;
    case 'judge':
      return <Navigate to="/judge" replace />;
    case 'participant':
      return <Navigate to="/participant" replace />;
    default:
      return <Navigate to="/login" replace />;
  }
};

// Main App Component
function App() {
  return (
    <AuthProvider>
      <Router>
        <div className="App">
          <Header />
          <main className="main-content">
            <Routes>
              {/* Public Routes */}
              <Route path="/login" element={<Login />} />
              <Route path="/register" element={<Register />} />
              
              {/* Dashboard Route */}
              <Route 
                path="/" 
                element={
                  <ProtectedRoute>
                    <DashboardRouter />
                  </ProtectedRoute>
                } 
              />
              
              {/* Admin Routes */}
              <Route 
                path="/admin/*" 
                element={
                  <ProtectedRoute requiredRole="admin">
                    <AdminDashboard />
                  </ProtectedRoute>
                } 
              />
              
              {/* Judge Routes */}
              <Route 
                path="/judge/*" 
                element={
                  <ProtectedRoute requiredRole="judge">
                    <JudgeDashboard />
                  </ProtectedRoute>
                } 
              />
              
              {/* Participant Routes */}
              <Route 
                path="/participant/*" 
                element={
                  <ProtectedRoute requiredRole="participant">
                    <ParticipantDashboard />
                  </ProtectedRoute>
                } 
              />
              
              {/* Unauthorized Route */}
              <Route 
                path="/unauthorized" 
                element={
                  <div className="unauthorized-container">
                    <h2>Ikke autoriseret</h2>
                    <p>Du har ikke adgang til denne side.</p>
                  </div>
                } 
              />
              
              {/* Catch all route */}
              <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>
          </main>
          
          {/* Toast notifications */}
          <Toaster 
            position="top-right"
            toastOptions={{
              duration: 4000,
              style: {
                background: '#333',
                color: '#fff',
              },
              success: {
                style: {
                  background: '#4caf50',
                },
              },
              error: {
                style: {
                  background: '#f44336',
                },
              },
            }}
          />
        </div>
      </Router>
    </AuthProvider>
  );
}

export default App;
