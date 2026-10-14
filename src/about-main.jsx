import React from 'react';
import { createRoot } from 'react-dom/client';
import './styles.css';
import AboutPage from './AboutPage.jsx';
createRoot(document.getElementById('root')).render(<React.StrictMode><AboutPage/></React.StrictMode>);
