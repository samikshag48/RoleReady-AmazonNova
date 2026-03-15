import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import './index.css';
import Popup from './popup/Popup';

const container = document.getElementById('popup-root');
if (container) {
  console.log('Container found, mounting full Popup component...');
  createRoot(container).render(
    <StrictMode>
      <Popup />
    </StrictMode>
  );
} else {
  console.error('popup-root element not found!');
} 