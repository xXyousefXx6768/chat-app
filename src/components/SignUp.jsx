import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { createUserWithEmailAndPassword } from 'firebase/auth';
import { doc, setDoc } from 'firebase/firestore';
import { auth, db } from '../lib/firebase';
import upload from '../lib/upload';
import toast from 'react-hot-toast'; 
import { motion } from "framer-motion";
function SignUp() {
 const [profilePic, setProfilePic] = useState({ File: null, url: '' });
  const [error, setError] = useState('');
  const navigate = useNavigate(); 

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

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      setError('Invalid email format.');
      toast.error('Invalid email format!');
      return;
    }

    try {
      const res = await createUserWithEmailAndPassword(auth, email, pass);
      const upimg = await upload(profilePic.File);

      await setDoc(doc(db, 'users', res.user.uid), {
        username,
        email,
        profilePicture: upimg,
        id: res.user.uid,
      });

      await setDoc(doc(db, 'userChat', res.user.uid), {
        chats: [],
      });

      toast.success('Account created successfully! 🎉'); 
      navigate('/homepage'); 

    } catch (error) {
      console.error(error);
      if (error.code === 'auth/email-already-in-use') {
        setError('Email already in use.');
        toast.error('Email is already in use.');
      } else {
        toast.error('Error creating user!');
        setError(`Error creating user: ${error.message}`);
      }
    }
  };

   return (
    <motion.div
      initial={{ opacity: 0, y: 40 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, ease: "easeOut" }}
      className="flex flex-col sm:w-full md:w-2/4 justify-center items-center 
      rounded-2xl bg-gradient-to-br from-indigo-800/40 via-blue-700/30 to-cyan-600/40 
      backdrop-blur-lg border border-blue-500/40 shadow-xl p-8"
    >
      <motion.h1
        className="text-4xl font-semibold text-white mb-6 tracking-wide"
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
      >
        Sign Up
      </motion.h1>

      <motion.form
        onSubmit={register}
        className="flex flex-col items-center gap-6 w-full max-w-md"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.4 }}
      >
        {/* Reusable Input Component */}
        {[
          { name: "username", label: "Username" },
          { name: "email", label: "Email" },
          { name: "pass", label: "Password", type: "password" },
        ].map((field, i) => (
          <motion.div
            key={field.name}
            className="relative w-full"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 * i }}
          >
            <input
              type={field.type || "text"}
              name={field.name}
              placeholder=" "
              className="peer w-full px-4 py-3 rounded-xl bg-white/10 text-white text-sm 
              border border-transparent focus:border-transparent 
              focus:outline-none focus:ring-2 focus:ring-cyan-400/60 transition-all
              shadow-sm focus:shadow-cyan-500/40"
            />
            <motion.span
              initial={false}
              animate={{
                background: [
                  "linear-gradient(90deg, #06b6d4, #3b82f6)",
                  "linear-gradient(270deg, #3b82f6, #06b6d4)",
                ],
              }}
              transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
              className="absolute inset-0 rounded-xl border-[1.5px] opacity-20 pointer-events-none"
            />
            <label
              className="absolute left-4 top-3 text-gray-300 text-sm transition-all
              peer-placeholder-shown:top-3 peer-placeholder-shown:text-gray-400 
              peer-placeholder-shown:text-base peer-focus:top-[-10px] peer-focus:text-cyan-300 
              peer-focus:text-sm bg-gradient-to-r from-cyan-500 to-blue-500 bg-clip-text text-transparent"
            >
              {field.label}
            </label>
          </motion.div>
        ))}

        {/* Image Upload */}
        <motion.div
          whileHover={{ scale: 1.02 }}
          className="w-full text-center text-gray-300"
        >
          <label
            htmlFor="file_input"
            className="block mb-1 text-sm font-medium text-cyan-200"
          >
            Upload profile picture
          </label>
          <input
            id="file_input"
            type="file"
            onChange={handleImg}
            className="block w-full p-3 text-sm text-gray-100 border border-cyan-500/40 
            rounded-lg cursor-pointer bg-transparent focus:outline-none"
          />
          <p className="mt-1 text-sm text-gray-400">
            PNG, JPG, SVG (max 800×400px)
          </p>
        </motion.div>

        {/* Button */}
        <motion.button
          whileHover={{
            scale: 1.05,
            boxShadow: "0 0 15px rgba(34,211,238,0.6)",
          }}
          whileTap={{ scale: 0.97 }}
          className="rounded-full w-2/3 bg-gradient-to-r from-cyan-500 to-blue-600 
          px-5 py-3 text-base font-medium text-white transition-all 
          hover:from-cyan-400 hover:to-blue-500"
        >
          Sign Up
        </motion.button>

        <Link
          to="/auth/login"
          className="text-cyan-200 hover:text-white mt-4 transition-all"
        >
          Already have an account? Login here
        </Link>
      </motion.form>
    </motion.div>
  );
}

export default SignUp
