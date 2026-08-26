import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import App from './App.tsx';
import { ErrorBoundary } from './components/ErrorBoundary.tsx';
import { logPi } from './pi-sdk-helper.ts';
import './index.css';

logPi('[APP] React démarrage');

if (typeof window !== 'undefined') {
  window.addEventListener('error', (event) => {
    const msg = `[GLOBAL ERROR] ${event.message} (${event.filename}:${event.lineno}:${event.colno})`;
    console.error(msg, event.error);
    logPi(msg);
  });

  window.addEventListener('unhandledrejection', (event) => {
    const reason = event.reason;
    const msg = `[UNHANDLED PROMISE] ${reason?.message || String(reason)}`;
    console.error(msg, reason);
    logPi(msg);
  });
}

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <ErrorBoundary>
      <App />
    </ErrorBoundary>
  </StrictMode>,
);

