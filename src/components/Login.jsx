import { signInWithEmailAndPassword } from 'firebase/auth';
import React from 'react';
import { Link, Navigate, useNavigate } from 'react-router-dom'; // Change Navigate to 'useNavigate'
import { auth } from '../lib/firebase';
import { useUser } from '../contexts/UserContext';

function Login() {
  // Get the user state and setUser function from the context
  const { setUser } = useUser();
  
  // Use the `useNavigate` hook to programmatically navigate
  const navigate = useNavigate();

  // Handle login form submission
  const handleLogin = async (e) => {
    e.preventDefault();
    
    const data = new FormData(e.target);
    const { email, pass } = Object.fromEntries(data);
    
    try {
      // Sign in using Firebase Authentication
      const res = await signInWithEmailAndPassword(auth, email, pass);
      
      // Check the full response from Firebase
      console.log('Response from Firebase:', res);
      
      // Set the logged-in user in the context if res.user is available
      if (res.user) {
        setUser(res.user);
        console.log('Login successful', res.user);
        navigate('/homepage')
      } else {
        console.error('No user found in response.');
      }
  
    } catch (error) {
      // Handle login errors
      console.error('Error during login:', error);
    }
  };
  

  return (
    <div className='flex flex-col sm:w-full md:w-2/4 h-3/4 justify-center bg-blue-800 rounded-xl bg-clip-padding backdrop-filter shadow-md backdrop-blur-md bg-opacity-40 border border-indigo-500/50 items-center gap-6'>
      <div className='text-white title justify-items-center'>
        <h1 className='text-4xl font-medium tracking-wide'>Login</h1>
      </div>
      <section className='flex flex-col inputs-group gap-4 w-2/3'>
        <form className='flex items-center flex-col gap-4' onSubmit={handleLogin}>
          <div className="relative w-full max-w-[490px] h-10">
            <input
              name='username'
              className="peer w-full h-full bg-transparent text-blue-gray-700 font-sans font-normal outline-0 focus:outline-0 disabled:bg-blue-gray-50 disabled:border-0 transition-all placeholder-shown:border placeholder-shown:border-blue-gray-200 placeholder-shown:border-cyan-500 border focus:border-2 focus:border-t-transparent text-sm px-3 py-2.5 rounded-[7px] border-blue-gray-200 focus:border-gray-900"
              placeholder=" "
            />
            <label className="flex w-full h-full text-xs select-none pointer-events-none absolute left-0 font-normal !overflow-visible truncate peer-placeholder-shown:text-white leading-tight peer-focus:leading-tight peer-disabled:text-transparent peer-disabled:peer-placeholder-shown:text-white-500 transition-all -top-1.5 peer-placeholder-shown:text-sm text-[11px] peer-focus:text-[11px] before:content[' '] before:block before:box-border before:w-2.5 before:h-1.5 before:mt-[6.5px] before:mr-1 peer-placeholder-shown:before:border-transparent before:rounded-tl-md before:border-t peer-focus:before:border-t-2 before:border-l peer-focus:before:border-l-2 before:pointer-events-none before:transition-all peer-disabled:before:border-transparent after:content[' '] after:block after:flex-grow after:box-border after:w-2.5 after:h-1.5 after:mt-[6.5px] after:ml-1 peer-placeholder-shown:after:border-transparent after:rounded-tr-md after:border-t peer-focus:after:border-t-2 after:border-r peer-focus:after:border-r-2 after:pointer-events-none after:transition-all peer-disabled:after:border-transparent peer-placeholder-shown:leading-[3.75] text-gray-500 peer-focus:text-gray-900 before:border-blue-gray-200 peer-focus:before:!border-gray-900 after:border-blue-gray-200 peer-focus:after:!border-gray-900">
              Username
            </label>
          </div>

          <div className="relative w-full max-w-[490px] h-10">
            <input
              name='email'
              type="email"
              className="peer w-full h-full bg-transparent text-blue-gray-700 font-sans font-normal outline-0 focus:outline-0 disabled:bg-blue-gray-50 disabled:border-0 transition-all placeholder-shown:border placeholder-shown:border-cyan-500 placeholder-shown:border-t-blue-gray-200 border focus:border-2 focus:border-t-transparent text-sm px-3 py-2.5 rounded-[7px] border-blue-gray-200 focus:border-gray-900"
              placeholder=" "
            />
            <label className="flex w-full h-full text-xs select-none pointer-events-none absolute left-0 font-normal !overflow-visible truncate peer-placeholder-shown:text-white leading-tight peer-focus:leading-tight peer-disabled:text-transparent peer-disabled:peer-placeholder-shown:text-white-500 transition-all -top-1.5 peer-placeholder-shown:text-sm text-[11px] peer-focus:text-[11px] before:content[' '] before:block before:box-border before:w-2.5 before:h-1.5 before:mt-[6.5px] before:mr-1 peer-placeholder-shown:before:border-transparent before:rounded-tl-md before:border-t peer-focus:before:border-t-2 before:border-l peer-focus:before:border-l-2 before:pointer-events-none before:transition-all peer-disabled:before:border-transparent after:content[' '] after:block after:flex-grow after:box-border after:w-2.5 after:h-1.5 after:mt-[6.5px] after:ml-1 peer-placeholder-shown:after:border-transparent after:rounded-tr-md after:border-t peer-focus:after:border-t-2 after:border-r peer-focus:after:border-r-2 after:pointer-events-none after:transition-all peer-disabled:after:border-transparent peer-placeholder-shown:leading-[3.75] text-gray-500 peer-focus:text-gray-900 before:border-blue-gray-200 peer-focus:before:!border-gray-900 after:border-blue-gray-200 peer-focus:after:!border-gray-900">
              Email
            </label>
          </div>

          <div className="relative w-full max-w-[490px] h-10">
            <input
              name='pass'
              type="password"
              className="peer w-full h-full bg-transparent text-blue-gray-700 font-sans font-normal outline-0 focus:outline-0 disabled:bg-blue-gray-50 disabled:border-0 transition-all placeholder-shown:border placeholder-shown:border-cyan-500 placeholder-shown:border-t-blue-gray-200 border focus:border-2 focus:border-t-transparent text-sm px-3 py-2.5 rounded-[7px] border-blue-gray-200 focus:border-gray-900"
              placeholder=" "
            />
            <label className="flex w-full h-full select-none pointer-events-none absolute left-0 font-normal !overflow-visible truncate peer-placeholder-shown:text-white leading-tight peer-focus:leading-tight peer-disabled:text-transparent peer-disabled:peer-placeholder-shown:text-white-500 transition-all -top-1.5 peer-placeholder-shown:text-sm text-[11px] peer-focus:text-[11px] before:content[' '] before:block before:box-border before:w-2.5 before:h-1.5 before:mt-[6.5px] before:mr-1 peer-placeholder-shown:before:border-transparent before:rounded-tl-md before:border-t text-xs peer-focus:before:border-t-2 before:border-l peer-focus:before:border-l-2 before:pointer-events-none before:transition-all peer-disabled:before:border-transparent after:content[' '] after:block after:flex-grow after:box-border after:w-2.5 after:h-1.5 after:mt-[6.5px] after:ml-1 peer-placeholder-shown:after:border-transparent after:rounded-tr-md after:border-t peer-focus:after:border-t-2 after:border-r peer-focus:after:border-r-2 after:pointer-events-none after:transition-all peer-disabled:after:border-transparent peer-placeholder-shown:leading-[3.75] text-gray-500 peer-focus:text-gray-900 before:border-blue-gray-200 peer-focus:before:!border-gray-900 after:border-blue-gray-200 peer-focus:after:!border-gray-900">
              Password
            </label>
          </div>

          <div className='submission flex flex-col w-full justify-center items-center'>
            <button type="submit" className="rounded-full w-2/3 bg-slate-800 px-5 py-3 text-base font-medium text-white transition duration-200 hover:bg-slate-100 hover:text-black active:bg-navy-900 dark:bg-white/10 dark:text-white dark:hover:bg-white/20 dark:active:bg-white/30">
              Sign In
            </button>
            <Link to="/signup" className="text-white mt-4">
              Don't have an account? Sign Up here
            </Link>
          </div>
        </form>
      </section>
    </div>
  );
}

export default Login;
