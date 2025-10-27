import React from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';
import App from './App';

const root = ReactDOM.createRoot(document.getElementById('root'));

// Removed StrictMode to prevent double-rendering issues that can cause flickering
root.render(<App />);
