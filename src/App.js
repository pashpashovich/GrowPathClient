import React from 'react';
import { ThemeProvider } from '@mui/material/styles';
import { CssBaseline } from '@mui/material';
import { Provider } from 'react-redux';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { store } from './store';
import { setStore } from './services/api';
import { growPathTheme } from './theme';
import LoginPage from './pages/LoginPage';
import MentorDashboard from './pages/MentorDashboard';
import InternDashboard from './pages/InternDashboard';
import HRDashboard from './pages/HRDashboard';
import AdminDashboard from './pages/AdminDashboard';
import HRRatingPage from './pages/HRRatingPage';
import InternRatingPage from './pages/InternRatingPage';
import TestPage from './pages/TestPage';
import ProtectedRoute from './components/ProtectedRoute';
import AuthInitializer from './components/AuthInitializer';
import './App.css';

setStore(store);

function App() {
  return (
    <Provider store={store}>
      <ThemeProvider theme={growPathTheme}>
        <CssBaseline />
            <Router>
              <AuthInitializer>
              <div className="App">
                <Routes>
                  <Route path="/" element={<LoginPage />} />
                  <Route path="/login" element={<LoginPage />} />
                  
                  
                  <Route path="/mentor" element={
                    <ProtectedRoute requiredRole="mentor">
                      <MentorDashboard />
                    </ProtectedRoute>
                  } />
                  
                  <Route path="/mentor/roadmap" element={
                    <ProtectedRoute requiredRole="mentor">
                      <MentorDashboard />
                    </ProtectedRoute>
                  } />
                  
                  <Route path="/mentor/review" element={
                    <ProtectedRoute requiredRole="mentor">
                      <MentorDashboard />
                    </ProtectedRoute>
                  } />
                  
                  <Route path="/mentor/stats" element={
                    <ProtectedRoute requiredRole="mentor">
                      <MentorDashboard />
                    </ProtectedRoute>
                  } />
                  
                  <Route path="/intern" element={
                    <ProtectedRoute requiredRole="intern">
                      <InternDashboard />
                    </ProtectedRoute>
                  } />
                  
                  <Route path="/intern/roadmap" element={
                    <ProtectedRoute requiredRole="intern">
                      <InternDashboard />
                    </ProtectedRoute>
                  } />
                  
                  <Route path="/intern/stats" element={
                    <ProtectedRoute requiredRole="intern">
                      <InternDashboard />
                    </ProtectedRoute>
                  } />
                  
                  <Route path="/intern/rating" element={
                    <ProtectedRoute requiredRole="intern">
                      <InternDashboard />
                    </ProtectedRoute>
                  } />
                  
                  <Route path="/hr" element={
                    <ProtectedRoute requiredRole="hr">
                      <HRDashboard />
                    </ProtectedRoute>
                  } />
                  
                  <Route path="/hr/rating" element={
                    <ProtectedRoute requiredRole="hr">
                      <HRDashboard />
                    </ProtectedRoute>
                  } />
                  
                  <Route path="/hr/analytics" element={
                    <ProtectedRoute requiredRole="hr">
                      <HRDashboard />
                    </ProtectedRoute>
                  } />
                  
                  <Route path="/admin" element={
                    <ProtectedRoute requiredRole="admin">
                      <AdminDashboard />
                    </ProtectedRoute>
                  } />
                  
                  <Route path="/admin/settings" element={
                    <ProtectedRoute requiredRole="admin">
                      <AdminDashboard />
                    </ProtectedRoute>
                  } />
                  
                  <Route path="/test" element={<TestPage />} />
                  
                  <Route path="*" element={<Navigate to="/" replace />} />
                </Routes>
              </div>
              </AuthInitializer>
            </Router>
      </ThemeProvider>
    </Provider>
  );
}

export default App;
