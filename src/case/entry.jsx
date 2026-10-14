import React from 'react';
import { createRoot } from 'react-dom/client';
import './case.css';

const host = document.getElementById('root');
const studies = import.meta.glob('./studies/*.jsx');
const load = studies[`./studies/${host.dataset.case}.jsx`];

if (load) load().then(module => createRoot(host).render(<React.StrictMode><module.default/></React.StrictMode>));
else host.textContent = 'This case study is not available.';
