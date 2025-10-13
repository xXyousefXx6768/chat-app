import React from 'react';
import Login from '../Login';
import SignUp from '../SignUp';
import { BrowserRouter, Routes, Route, Outlet } from 'react-router-dom';

function AuthLayout() {
  return (
    <main className="flex justify-center p-4 items-center flex-col bg-gradient-to-r from-sky-500 to-indigo-500 h-screen">
      <Outlet />
    </main>
  );
}

export default AuthLayout;
