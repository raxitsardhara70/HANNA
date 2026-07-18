import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { App } from './App.js';
import '@styles/global.css';

const root = document.getElementById('root');

if (root === null) {
  throw new Error('HANNA renderer root element was not found.');
}

createRoot(root).render(
  <StrictMode>
    <App />
  </StrictMode>,
);
