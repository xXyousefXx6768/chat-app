import React from 'react';
import Login from '../Login';
import SignUp from '../SignUp';
import { BrowserRouter, Routes, Route } from 'react-router-dom';

function AuthLayout() {
  return (
    <main className="flex justify-center p-4 items-center flex-col bg-gradient-to-r from-sky-500 to-indigo-500 h-screen">
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="/signup" element={<SignUp />} />
        {/* Catch-all route to handle unknown paths */}
        <Route path="*" element={<SignUp />} />
      </Routes>
    </main>
  );
}

export default AuthLayout;
