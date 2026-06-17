import {StrictMode} from 'react';
import {createRoot} from 'react-dom/client';
import App from './App.tsx';
import './index.css';
import { installApiKeyInterceptor } from './lib/api';
import { installHistoryCapture } from './lib/history';

installApiKeyInterceptor();
installHistoryCapture();

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
);
