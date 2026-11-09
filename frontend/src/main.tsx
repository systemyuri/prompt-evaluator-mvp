import './index.css'; // <-- AGREGA ESTA LÍNEA
import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import App from './App';
import BuilderPage from './pages/BuilderPage';
import FreeValidatorPage from './pages/FreeValidatorPage';

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<App />}>
          <Route index element={<Navigate to="/builder" replace />} />
          <Route path="builder" element={<BuilderPage />} />
          <Route path="validator" element={<FreeValidatorPage />} />
        </Route>
      </Routes>
    </BrowserRouter>
  </React.StrictMode>,
);