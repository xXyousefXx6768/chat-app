import { signInWithEmailAndPassword } from 'firebase/auth';
import React from 'react';
import { Link, Navigate, useNavigate } from 'react-router-dom'; // Change Navigate to 'useNavigate'
import { auth } from '../lib/firebase';
import { useUser } from '../contexts/UserContext';
import toast from 'react-hot-toast';
import { motion } from "framer-motion";

function Login() {
  // Get the user state and setUser function from the context
  const { setUser } = useUser();
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    
    const data = new FormData(e.target);
    const { email, pass } = Object.fromEntries(data);

    if (!email || !pass) {
      toast.error("Please fill in all fields!");
      return;
    }

    try {
      const res = await signInWithEmailAndPassword(auth, email, pass);
      
      if (res.user) {
        setUser(res.user);
        toast.success("Welcome back! 👋"); // ✅ توست نجاح
        navigate('/homepage');
      } else {
        toast.error("User not found!");
      }

    } catch (error) {
      console.error("Error during login:", error);
      if (error.code === "auth/user-not-found") {
        toast.error("No user found with this email!");
      } else if (error.code === "auth/wrong-password") {
        toast.error("Incorrect password!");
      } else if (error.code === "auth/invalid-email") {
        toast.error("Invalid email format!");
      } else {
        toast.error("Login failed. Please try again.");
      }
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 50, scale: 0.95 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{ duration: 0.8, ease: "easeOut" }}
      className="flex flex-col sm:w-[90%] md:w-2/4 h-auto py-10 px-6 justify-center items-center 
      bg-gradient-to-br from-slate-800/70 via-indigo-900/60 to-blue-800/80 
      rounded-3xl backdrop-blur-lg shadow-2xl border border-white/20 gap-8"
    >
      {/* ===== Title ===== */}
      <motion.h1
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
        className="text-white text-5xl font-extrabold tracking-wide drop-shadow-lg"
      >
        Welcome Back 👋
      </motion.h1>

      {/* ===== Form ===== */}
      <motion.form
        onSubmit={handleLogin}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.6 }}
        className="flex flex-col gap-6 w-full md:w-3/4"
      >
        {/* ==== Email ==== */}
        <motion.div
          whileFocus={{ scale: 1.03 }}
          className="relative w-full"
        >
          <input
            name="email"
            type="email"
            required
            className="peer w-full px-4 py-3 rounded-xl border border-white/30 bg-white/10 
            text-white placeholder-transparent outline-none focus:ring-2 focus:ring-cyan-400 
            transition-all duration-300 shadow-inner"
            placeholder="Email"
          />
          <label
            className="absolute left-4 top-2.5 text-white/70 text-sm 
            transition-all duration-200 peer-placeholder-shown:top-3.5 
            peer-placeholder-shown:text-base peer-focus:top-1.5 
            peer-focus:text-sm peer-focus:text-cyan-300"
          >
            Email
          </label>
        </motion.div>

        {/* ==== Password ==== */}
        <motion.div
          whileFocus={{ scale: 1.03 }}
          className="relative w-full"
        >
          <input
            name="pass"
            type="password"
            required
            className="peer w-full px-4 py-3 rounded-xl border border-white/30 bg-white/10 
            text-white placeholder-transparent outline-none focus:ring-2 focus:ring-indigo-400 
            transition-all duration-300 shadow-inner"
            placeholder="Password"
          />
          <label
            className="absolute left-4 top-2.5 text-white/70 text-sm 
            transition-all duration-200 peer-placeholder-shown:top-3.5 
            peer-placeholder-shown:text-base peer-focus:top-1.5 
            peer-focus:text-sm peer-focus:text-indigo-300"
          >
            Password
          </label>
        </motion.div>

        {/* ==== Button ==== */}
        <motion.button
          whileHover={{ scale: 1.05, backgroundColor: "#38bdf8" }}
          whileTap={{ scale: 0.97 }}
          transition={{ type: "spring", stiffness: 200 }}
          type="submit"
          className="mt-4 w-full py-3 rounded-full bg-gradient-to-r from-cyan-400 to-indigo-500 
          text-white text-lg font-semibold tracking-wide shadow-lg 
          hover:shadow-cyan-400/30 transition-all duration-300"
        >
          Sign In
        </motion.button>

        {/* ==== Link ==== */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1 }}
          className="text-center mt-4"
        >
          <p className="text-white/80 text-sm">
            Don’t have an account?{" "}
            <Link
              to="/auth/signup"
              className="text-cyan-300 hover:underline hover:text-cyan-200 transition"
            >
              Sign up here
            </Link>
          </p>
        </motion.div>
      </motion.form>
    </motion.div>
  );
}

export default Login;
