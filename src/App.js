import React from 'react';
import { ThemeProvider } from '@mui/material/styles';
import { CssBaseline } from '@mui/material';
import { Provider } from 'react-redux';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { store } from './store';
import { growPathTheme } from './theme';
import DesignSystemDemo from './components/DesignSystemDemo';
import MentorDashboard from './pages/MentorDashboard';
import InternDashboard from './pages/InternDashboard';
import Navigation from './components/Navigation';
import './App.css';

function App() {
  return (
    <Provider store={store}>
      <ThemeProvider theme={growPathTheme}>
        <CssBaseline />
        <Router>
          <div className="App">
            <Navigation />
            <Routes>
              <Route path="/" element={<DesignSystemDemo />} />
              <Route path="/demo" element={<DesignSystemDemo />} />
              <Route path="/mentor" element={<MentorDashboard />} />
              <Route path="/intern" element={<InternDashboard />} />
            </Routes>
          </div>
        </Router>
      </ThemeProvider>
    </Provider>
  );
}

export default App;
