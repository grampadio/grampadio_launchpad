import {StrictMode} from 'react';
import {createRoot} from 'react-dom/client';
import {TonConnectUIProvider} from '@tonconnect/ui-react';
import App from './App.tsx';
import './index.css';

// Intercept fetch requests to TON Connect analytics / event endpoints to prevent sandbox/cross-origin iframe network errors
try {
  const originalFetch = window.fetch;
  Object.defineProperty(window, 'fetch', {
    value: async function (this: any, input: RequestInfo | URL, init?: RequestInit): Promise<Response> {
      let url = '';
      if (typeof input === 'string') {
        url = input;
      } else if (input instanceof URL) {
        url = input.toString();
      } else if (input && typeof input === 'object' && 'url' in input) {
        url = (input as Request).url;
      }

      if (
        url.includes('analytics') || 
        url.includes('tc.tonapi.io') || 
        (url.includes('tonconnect') && (url.includes('event') || url.includes('track')))
      ) {
        return new Response(JSON.stringify({ ok: true, status: 'ok' }), {
          status: 200,
          headers: { 'Content-Type': 'application/json' },
        });
      }

      return originalFetch.apply(this, [input, init]);
    },
    writable: true,
    configurable: true,
    enumerable: true
  });
} catch (err) {
  console.warn('Failed to configure custom fetch interceptor due to platform sandbox restrictions:', err);
}

// const manifestUrl = `${window.location.origin}/tonconnect-manifest.json`;
const manifestUrl = `https://grampad.io/tonconnect-manifest.json`;

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <TonConnectUIProvider manifestUrl={manifestUrl}>
      <App />
    </TonConnectUIProvider>
  </StrictMode>,
);
