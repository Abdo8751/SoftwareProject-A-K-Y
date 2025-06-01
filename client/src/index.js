import React from 'react';
import ReactDOM from 'react-dom/client'; // Updated import
import './config/axios'; // Import axios config
import App from './App';
import './index.css';
import { AuthProvider } from './context/AuthContext';

// Create a root element and render
const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <React.StrictMode>
    <AuthProvider>
      <App />
    </AuthProvider>
  </React.StrictMode>
);