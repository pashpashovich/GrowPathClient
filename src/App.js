import React from 'react';
import { ThemeProvider } from '@mui/material/styles';
import { CssBaseline } from '@mui/material';
import { Provider } from 'react-redux';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { store } from './store';
import { growPathTheme } from './theme';
import DesignSystemDemo from './components/DesignSystemDemo';
import './App.css';

function App() {
  return (
    <Provider store={store}>
      <ThemeProvider theme={growPathTheme}>
        <CssBaseline />
        <Router>
          <div className="App">
            <Routes>
              <Route path="/" element={<DesignSystemDemo />} />
              <Route path="/demo" element={<DesignSystemDemo />} />
            </Routes>
          </div>
        </Router>
      </ThemeProvider>
    </Provider>
  );
}

export default App;
