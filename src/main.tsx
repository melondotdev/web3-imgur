import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { Toaster } from 'react-hot-toast';
import { App } from './App.tsx';
import './index.css';
import '@mysten/dapp-kit/dist/index.css';
import { SuiProvider } from './components/providers/SuiProvider.tsx';

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <Toaster position="top-right" />
    <SuiProvider>
      <App />
    </SuiProvider>
  </StrictMode>,
);
