import React from 'react';
import { ThemeProvider } from '@mui/material/styles';
import { CssBaseline } from '@mui/material';
import { Provider } from 'react-redux';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { store } from './store';
import { growPathTheme } from './theme';
import LoginPage from './pages/LoginPage';
import MentorDashboard from './pages/MentorDashboard';
import InternDashboard from './pages/InternDashboard';
import HRDashboard from './pages/HRDashboard';
import HRRatingPage from './pages/HRRatingPage';
import InternRatingPage from './pages/InternRatingPage';
import ProtectedRoute from './components/ProtectedRoute';
import './App.css';

function App() {
  return (
    <Provider store={store}>
      <ThemeProvider theme={growPathTheme}>
        <CssBaseline />
            <Router>
              <div className="App">
                <Routes>
                  {/* Публичные маршруты */}
                  <Route path="/login" element={<LoginPage />} />
                  
                  {/* Защищенные маршруты */}
                  <Route path="/" element={
                    <ProtectedRoute>
                      <Navigate to="/mentor" replace />
                    </ProtectedRoute>
                  } />
                  
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
                  
                  {/* Fallback для несуществующих маршрутов */}
                  <Route path="*" element={<Navigate to="/login" replace />} />
                </Routes>
              </div>
            </Router>
      </ThemeProvider>
    </Provider>
  );
}

export default App;
