import React, { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { faHouse, faUser, faRightFromBracket, faCalendar } from '@fortawesome/free-solid-svg-icons';
import Sidebar from './Sidebar';
import {  fetchSignInMethodsForEmail } from "firebase/auth";
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { createUserWithEmailAndPassword } from 'firebase/auth';
import { getStorage, ref } from "firebase/storage";
import { doc, setDoc } from "firebase/firestore"; 
import { auth, db } from '../lib/firebase';
import upload from '../lib/upload';
function SignUp() {
  const [profilePic, setProfilePic] = useState({ File: null, url: '' });
  const [error, setError] = useState('');

  const handleImg = (e) => {
    if (e.target.files[0]) {
      setProfilePic({
        File: e.target.files[0],
        url: URL.createObjectURL(e.target.files[0]),
      });
    }
  };

  const register = async (e) => {
    e.preventDefault();
    const data = new FormData(e.target);
    const { email, username, pass } = Object.fromEntries(data);

    // Validate the email format before making the request
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      setError('Invalid email format. Please enter a valid email.');
      return;
    }

    try {
      const res = await createUserWithEmailAndPassword(auth, email, pass);
      const upimg = await upload(profilePic.File); // Assuming the upload function is defined elsewhere

      await setDoc(doc(db, 'users', res.user.uid), {
        username,
        email,
        profilePicture: upimg,
        id: res.user.uid, // Use uid instead of id
      });

      await setDoc(doc(db, 'userChat', res.user.uid), {
        chats: [],
      });

      console.log('User created successfully!');
    } catch (error) {
      if (error.code === 'auth/email-already-in-use') {
        setError('Email is already in use.');
      } else {
        setError(`Error creating user: ${error.message}`);
      }
    }
  };

  return (<>  
        
    <div className='flex flex-col sm:w-full md:w-2/4   justify-center bg-blue-800 rounded-xl bg-clip-padding backdrop-filter  shadow-md backdrop-blur-md bg-opacity-40 border border-indigo-500/50 items-center  p-2' >
      <div className='text-white title justify-items-center'>
     <h1 className='text-4xl font-medium p-4 tracking-wide '>
      SignUp
     </h1>
     </div>
     <section className=' flex flex-col inputs-group gap-4 w-2/3 '>
        <form className='flex items-center flex-col gap-4' onSubmit={register}>
        
        <div className="relative w-full max-w-[490px] h-10">
    <input
      name='username'
      className="peer w-full h-full bg-transparent text-blue-gray-700 font-sans font-normal outline outline-0 focus:outline-0 disabled:bg-blue-gray-50 disabled:border-0 transition-all placeholder-shown:border placeholder-shown:border-blue-gray-200 placeholder-shown:border-cyan-500 border focus:border-2  focus:border-t-transparent text-sm px-3 py-2.5 rounded-[7px] border-blue-gray-200 focus:border-gray-900"
      placeholder=" " />
      <label
      className="flex w-full h-full text-xs select-none pointer-events-none absolute left-0 font-normal !overflow-visible truncate peer-placeholder-shown:text-white leading-tight peer-focus:leading-tight peer-disabled:text-transparent peer-disabled:peer-placeholder-shown:text-white-500 transition-all -top-1.5 peer-placeholder-shown:text-sm text-[11px] peer-focus:text-[11px] before:content[' '] before:block before:box-border before:w-2.5 before:h-1.5 before:mt-[6.5px] before:mr-1 peer-placeholder-shown:before:border-transparent before:rounded-tl-md before:border-t peer-focus:before:border-t-2 before:border-l peer-focus:before:border-l-2 before:pointer-events-none before:transition-all peer-disabled:before:border-transparent after:content[' '] after:block after:flex-grow after:box-border after:w-2.5 after:h-1.5 after:mt-[6.5px] after:ml-1 peer-placeholder-shown:after:border-transparent after:rounded-tr-md after:border-t peer-focus:after:border-t-2 after:border-r peer-focus:after:border-r-2 after:pointer-events-none after:transition-all peer-disabled:after:border-transparent peer-placeholder-shown:leading-[3.75] text-gray-500 peer-focus:text-gray-900 before:border-blue-gray-200 peer-focus:before:!border-gray-900 after:border-blue-gray-200 peer-focus:after:!border-gray-900">
       UserName
    </label>
  </div>

        <div class="relative w-full max-w-[490px] h-10">
    <input
      name='email'
      className="peer w-full h-full bg-transparent text-blue-gray-700 font-sans font-normal outline outline-0 focus:outline-0 disabled:bg-blue-gray-50 disabled:border-0 transition-all placeholder-shown:border placeholder-shown:border-cyan-500 placeholder-shown:border-t-blue-gray-200 border focus:border-2  focus:border-t-transparent text-sm px-3 py-2.5 rounded-[7px] border-blue-gray-200 focus:border-gray-900"
      placeholder=" " />
      <label
      class="flex w-full h-full text-xs select-none pointer-events-none absolute left-0 font-normal !overflow-visible truncate peer-placeholder-shown:text-white leading-tight peer-focus:leading-tight peer-disabled:text-transparent peer-disabled:peer-placeholder-shown:text-white-500 transition-all -top-1.5 peer-placeholder-shown:text-sm text-[11px] peer-focus:text-[11px] before:content[' '] before:block before:box-border before:w-2.5 before:h-1.5 before:mt-[6.5px] before:mr-1 peer-placeholder-shown:before:border-transparent before:rounded-tl-md before:border-t peer-focus:before:border-t-2 before:border-l peer-focus:before:border-l-2 before:pointer-events-none before:transition-all peer-disabled:before:border-transparent after:content[' '] after:block after:flex-grow after:box-border after:w-2.5 after:h-1.5 after:mt-[6.5px] after:ml-1 peer-placeholder-shown:after:border-transparent after:rounded-tr-md after:border-t peer-focus:after:border-t-2 after:border-r peer-focus:after:border-r-2 after:pointer-events-none after:transition-all peer-disabled:after:border-transparent peer-placeholder-shown:leading-[3.75] text-gray-500 peer-focus:text-gray-900 before:border-blue-gray-200 peer-focus:before:!border-gray-900 after:border-blue-gray-200 peer-focus:after:!border-gray-900">
        Email
    </label>
  </div>
  <div class="relative w-full max-w-[490px] h-10">
    <input
      name='pass'
      class="peer w-full h-full bg-transparent text-blue-gray-700 font-sans font-normal outline outline-0 focus:outline-0 disabled:bg-blue-gray-50 disabled:border-0 transition-all placeholder-shown:border placeholder-shown:border-cyan-500 placeholder-shown:border-t-blue-gray-200 border focus:border-2  focus:border-t-transparent text-sm px-3 py-2.5 rounded-[7px] border-blue-gray-200 focus:border-gray-900"
      placeholder=" " />
      
      <label
      class="flex w-full h-full select-none pointer-events-none absolute left-0 font-normal !overflow-visible truncate peer-placeholder-shown:text-white leading-tight peer-focus:leading-tight peer-disabled:text-transparent peer-disabled:peer-placeholder-shown:text-white-500 transition-all -top-1.5 peer-placeholder-shown:text-sm text-[11px] peer-focus:text-[11px] before:content[' '] before:block before:box-border before:w-2.5 before:h-1.5 before:mt-[6.5px] before:mr-1 
      peer-placeholder-shown:before:border-transparent 
      before:rounded-tl-md before:border-t text-xs
      peer-focus:before:border-t-2 before:border-l 
      peer-focus:before:border-l-2 
      before:pointer-events-none before:transition-all peer-disabled:before:border-transparent after:content[' '] 
      after:block after:flex-grow after:box-border 
      after:w-2.5 
      after:h-1.5 
      after:mt-[6.5px] 
      after:ml-1 
      peer-placeholder-shown:after:border-transparent after:rounded-tr-md after:border-t peer-focus:after:border-t-2 after:border-r peer-focus:after:border-r-2 after:pointer-events-none after:transition-all peer-disabled:after:border-transparent peer-placeholder-shown:leading-[3.75] text-gray-500 peer-focus:text-gray-900 before:border-blue-gray-200 peer-focus:before:!border-gray-900 after:border-blue-gray-200 peer-focus:after:!border-gray-900">
        password
    </label>
  </div>
 
<label className="block mb-2 text-sm font-medium text-gray-900 dark:text-white" for="file_input">Upload profile picture</label>
<input className="block w-full p-3 text-sm text-gray-900 border  border-gray-300 rounded-lg cursor-pointer bg-transparent  focus:outline-none dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400" aria-describedby="file_input_help" id="file_input" onChange={handleImg} type="file"/>
<p className="mt-1 text-sm  text-gray-300" id="file_input_help">SVG, PNG, JPG  (MAX. 800x400px).</p>


<div className='submission flex flex-col w-full justify-center items-center '>
<button className="rounded-full w-2/3 bg-slate-800 px-5 py-3 text-base font-medium text-white transition duration-200 hover:bg-slate-100 hover:text-black active:bg-navy-900 dark:bg-white/10 dark:text-white dark:hover:bg-white/20 dark:active:bg-white/30">
 SignUp
</button>
<Link to="/auth/login" className="text-white p-3 mt-4">
            Already have an account? Login here
          </Link>
</div>
  
             
        </form>
     </section>
    </div>
    </>
  )
}

export default SignUp
