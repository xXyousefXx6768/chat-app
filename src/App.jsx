// App.js
import React from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Login from './components/Login';
import AuthLayout from './components/Layouts/AuthLayout';
import HomePage from './components/Layouts/HomePage';
import SignUp from './components/SignUp';
import { UserProvider } from './contexts/UserContext'; // Adjust path if necessary

import './index.css';

function App() {
  return (
    <UserProvider>
      <BrowserRouter>
        <Routes>
          <Route  path="/auth" element={<AuthLayout />}>
            {/* Make these paths relative to /auth */}
            <Route index path='login' element={<Login />} />
            <Route path="signup" element={<SignUp />} />
          </Route>
          <Route path="/homepage/*" element={<HomePage />} />
        </Routes>
      </BrowserRouter>
    </UserProvider>
  );
}

export default App;
