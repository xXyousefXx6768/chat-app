import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import Login from './components/Login';
import AuthLayout from './components/Layouts/AuthLayout';
import HomePage from './components/Layouts/HomePage';
import SignUp from './components/SignUp';
import { Toaster } from "react-hot-toast";
import { UserProvider } from './contexts/UserContext';
import './index.css';

function App() {
  return (
  
    <UserProvider>
      <BrowserRouter>
      <Toaster position="top-center" reverseOrder={false} />
        <Routes>
          {/* 👇 لاحظ النجمة هنا */}
          <Route path="/auth/*" element={<AuthLayout />}>
            <Route path="login" element={<Login />} />
            <Route path="signup" element={<SignUp />} />
          </Route>

          <Route path="/homepage/*" element={<HomePage />} />

          {/* 👇 لو دخل / يروح على /auth/login */}
          <Route path="/" element={<Navigate to="/auth/login" replace />} />
        </Routes>
      </BrowserRouter>
    </UserProvider>
  );
}

export default App;
