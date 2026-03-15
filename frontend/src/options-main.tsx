import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { OptionsApp } from './options/OptionsApp';
import './index.css';

const container = document.getElementById('options-root');
if (container) {
  createRoot(container).render(
    <StrictMode>
      <OptionsApp />
    </StrictMode>
  );
} 