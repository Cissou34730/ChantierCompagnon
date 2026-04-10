import React from 'react';
import ReactDOM from 'react-dom/client';
import { REPORT_STATUSES } from '@chantier-compagnon/shared';

function App() {
  return (
    <main
      style={{
        fontFamily: 'Segoe UI, sans-serif',
        padding: '3rem',
        maxWidth: '48rem',
        margin: '0 auto',
      }}
    >
      <h1>ChantierCompagnon</h1>
      <p>Frontend scaffold ready for the site journal workflow.</p>
      <p>Shared package check: default report status is {REPORT_STATUSES[0]}.</p>
    </main>
  );
}

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
);
