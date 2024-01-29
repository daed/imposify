import React from 'react';
import ReactDOM from 'react-dom';
import './global.css'; // Adjust the path according to your project structure
import App from './components/App';
import { createRoot } from 'react-dom/client';


const root = createRoot(document.getElementById('root'));
root.render(<App />);