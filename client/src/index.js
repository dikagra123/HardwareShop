import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import './index.css';
const API = axios.create({
  baseURL: 'https://hardware-shop1.onrender.com',
});

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(<React.StrictMode><App /></React.StrictMode>);