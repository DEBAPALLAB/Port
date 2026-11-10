import React from 'react';
import { createRoot } from 'react-dom/client';
import './case.css';
import '../analytics.js';
import WorkIndex from './WorkIndex.jsx';

createRoot(document.getElementById('root')).render(<React.StrictMode><WorkIndex/></React.StrictMode>);
