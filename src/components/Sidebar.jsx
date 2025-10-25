import React from 'react';
import { useState } from 'react';
import chaticon from '../assets/chat-round.svg';
import SearchModal from './SearchModal';
import { faHouse, faUser, faRightFromBracket, faCommentDots, faUserPlus, faCog, faMoon, faLightbulb, faUserGroup } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faUsers } from '@fortawesome/free-solid-svg-icons';
import { useUser } from '../contexts/UserContext';
import { useNavigate } from 'react-router-dom';
import { signOut } from "firebase/auth";
import { auth } from "../lib/firebase"; 
import toast from "react-hot-toast";

function Sidebar({open,handle,darkmode,handleDarkmode,users,handleReqModal,handleGroupModal}) {
  const { setUser } = useUser();
  const navigate = useNavigate();


   const handleLogout = async () => {
    try {
      await signOut(auth); // تسجيل خروج من Firebase
      setUser(null);       // مسح بيانات المستخدم من الـ context
      toast.success("Logged out successfully 👋");
      navigate("/auth/login"); // توجيه لصفحة اللوجين
    } catch (error) {
      console.error("Error during logout:", error);
      toast.error("Logout failed. Please try again!");
    }
  };


  return (
    <div className="bg-gray-100 dark:bg-slate-800 transition-colors duration-600 h-screen flex flex-col justify-between items-center py-4">
      {/* Top Icon (Chat) */}
      <div className="flex flex-col items-center space-y-5">
        <div className="flex items-center justify-center rounded-md dark:bg-slate-700 bg-white p-3">
          <img src={chaticon} className="w-[36px] cursor-pointer" alt="Chat Icon" />
        </div>

        {/* Icons list */}
        <div className="!space-y-3">
          <ul className="flex flex-col !space-y-5">
            <li onClick={() => navigate('/homepage')} className="group relative p-3 cursor-pointer text-gray-500 hover:text-blue-600">
              <FontAwesomeIcon icon={faCommentDots} className="h-6 w-6" />
              <span className="absolute left-12 top-1/2 transform -translate-y-1/2 opacity-0 group-hover:opacity-100 group-hover:translate-x-1 transition-all bg-gray-800 text-white px-2 py-1 rounded-md text-sm">
                Chat
              </span>
            </li>
            <li className="group relative p-3 cursor-pointer text-gray-500 hover:text-blue-600">
              <FontAwesomeIcon icon={faUserPlus} onClick={handle} className="h-6 w-6" />
              <span className="absolute left-12 top-1/2 transform -translate-y-1/2 opacity-0 group-hover:opacity-100 group-hover:translate-x-1 transition-all bg-gray-800 text-white px-2 py-1 rounded-md text-sm">
                Add User
              </span>
            </li>
            <li className="group relative p-3 cursor-pointer text-gray-500 hover:text-blue-600">
               <FontAwesomeIcon icon={faUserGroup} onClick={handleReqModal} className="h-6 w-6" />
                 <span className="absolute left-12 top-1/2 transform -translate-y-1/2 opacity-0 group-hover:opacity-100 group-hover:translate-x-1 transition-all bg-gray-800 text-white px-2 py-1 rounded-md text-sm">
                    friend request
                 </span>
                 </li>
            <li className="group relative p-3 cursor-pointer text-gray-500 hover:text-blue-600">
               <FontAwesomeIcon icon={faUsers} onClick={handleGroupModal} className="h-6 w-6" />
                 <span className="absolute left-12 top-1/2 transform -translate-y-1/2 opacity-0 group-hover:opacity-100 group-hover:translate-x-1 transition-all bg-gray-800 text-white px-2 py-1 rounded-md text-sm">
                    Create Group
                 </span>
                 </li>
            <li className="group relative p-3 cursor-pointer text-gray-500 hover:text-blue-600">
              <FontAwesomeIcon onClick={() => navigate("/homepage/profile")} icon={faUser} className="h-6 w-6" />
              <span className="absolute left-12 top-1/2 transform -translate-y-1/2 opacity-0 group-hover:opacity-100 group-hover:translate-x-1 transition-all bg-gray-800 text-white px-2 py-1 rounded-md text-sm">
                Profile
              </span>
            </li>
            <li className="group relative p-3 cursor-pointer text-gray-500 hover:text-blue-600">
              <FontAwesomeIcon icon={faRightFromBracket} onClick={handleLogout} className="h-6 w-6" />
              <span 
              className="absolute left-12 top-1/2 transform -translate-y-1/2 opacity-0 group-hover:opacity-100 group-hover:translate-x-1 transition-all bg-gray-800 text-white px-3 py-1 rounded-md  text-sm">
                Logout
              </span>
            </li>
          </ul>
        </div>
      </div>

      {/* Bottom Icons (Settings, Profile) */}
      <div className="flex flex-col items-center space-y-5">
        <li className=" group relative p-3 cursor-pointer text-gray-500 hover:text-blue-600">
          {darkmode?
          <>
        <FontAwesomeIcon  onClick={handleDarkmode}   icon={faLightbulb} className="h-6 w-6 bg-none" />
          <span className="absolute left-12 top-1/2 transform -translate-y-1/2 opacity-0 group-hover:opacity-100 group-hover:translate-x-1 transition-all bg-gray-800 text-white px-2 py-1 rounded-md text-sm">
           Lightmode
          </span>
          </>
          :
          <>
          <FontAwesomeIcon   onClick={handleDarkmode} icon={faMoon} className="h-6 w-6 bg-none" />
          <span className="absolute left-12 top-1/2 transform -translate-y-1/2 opacity-0 group-hover:opacity-100 group-hover:translate-x-1 transition-all bg-gray-800 text-white px-2 py-1 rounded-md text-sm">
            Darkmode
          </span>
            </>
}
        </li>

        {/* Profile Image */}
        <div className="flex items-center justify-center">
          {users ? (
            <img
              src={users.profilePicture}
              alt="Profile"
              className="w-10 h-10 rounded-full cursor-pointer"
            />
          ) : (
            <div className="w-10 h-10 rounded-full bg-gray-300 flex items-center justify-center">
              {/* Placeholder or loading state */}
              <img
                  src="https://placehold.co/50x50"
                  alt="Profile"
                  className="w-10 h-10 rounded-full cursor-pointer"
                />
            </div>
          )}
         
        </div>
      </div>
     
    </div>
  );
}

export default Sidebar;
