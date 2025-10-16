import React, { useRef, useState } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faMagnifyingGlass, faPlus } from '@fortawesome/free-solid-svg-icons';
import { collection, doc, getDocs, query, serverTimestamp, setDoc, where } from "firebase/firestore";
import { db } from '../lib/firebase';
import { useUser } from '../contexts/UserContext';
import toast from 'react-hot-toast';

function SearchModal({ onClose }) {
  const modalRef = useRef(null);
  const [people, setPeople] = useState(null);
  const [add, setAdd] = useState(false);
  const { user } = useUser();

  const handleSearch = async (e) => {
    e.preventDefault();
    const formdata = new FormData(e.target);
    const username = formdata.get('username');
    try {
      const userRef = collection(db, 'users');
      const Query = query(userRef, where('username', '==', username));
      const querySnapShot = await getDocs(Query);
      if (!querySnapShot.empty) {
        setPeople(querySnapShot.docs[0].data());
      } else {
        setPeople(null);
      }
    } catch (error) {
      console.log(error);
    }
  };

  const AddUser = async () => {
    if (!people?.id) {
      toast.error('No user selected');
      return;
    }
    try {
      const reqRef = doc(collection(db, 'friendRequests'));
      await setDoc(reqRef, {
        id: reqRef.id,
        from: user.id,
        to: people.id,
        status: 'pending',
        createdAt: serverTimestamp(),
      });

      const notifRef = doc(collection(db, 'notifications'));
      await setDoc(notifRef, {
        id: notifRef.id,
        userId: people.id,
        type: 'friend_request',
        from: user.id,
        seen: false,
        createdAt: serverTimestamp(),
      });

      toast.success('Request sent');
      setAdd(true);
    } catch (err) {
      console.error(err);
      toast.error('Failed to send request');
    }
  };

  const handleClickOutside = (event) => {
    if (modalRef.current && !modalRef.current.contains(event.target)) {
      onClose();
    }
  };

  return (
    <div
      onClick={handleClickOutside}
      className="fixed inset-0 flex justify-center items-center bg-black/40 backdrop-blur-sm z-50"
    >
      <div
        ref={modalRef}
        className="w-[90%] sm:w-[75%] md:w-[50%] lg:w-[40%] bg-white from-slate-100 dark:bg-gray-900 dark:text-gray-100 to-slate-200 rounded-3xl shadow-2xl p-6 border border-white/20 backdrop-blur-md transition-all duration-300"
      >
        <h2 className="text-2xl sm:text-3xl font-semibold  mb-6 text-center">
          Search People
        </h2>

        <form onSubmit={handleSearch} className="flex items-center  rounded-2xl shadow-inner p-2">
          <FontAwesomeIcon icon={faMagnifyingGlass} className="text-gray-500 px-3 text-lg" />
          <input
            type="text"
            name="username"
            placeholder="Enter username..."
            className="flex-1 bg-transparent focus:outline-none text-gray-700 placeholder-gray-400 text-base"
          />
          <button
            type="submit"
            className="bg-gradient-to-r from-indigo-500 to-blue-600 text-white px-5 py-2 rounded-2xl font-medium hover:opacity-90 transition"
          >
            Search
          </button>
        </form>

        <div className="mt-8 flex flex-col items-center gap-4">
          {people ? (
            <div className="bg-white/80 dark:!bg-gray-800/40 w-full p-4 rounded-2xl shadow-md flex items-center justify-between hover:shadow-lg transition-all duration-200">
              <div className="flex items-center gap-3">
                <img
                  src={people.profilePicture}
                  alt="Profile"
                  className="w-12 h-12 rounded-full border border-gray-300 object-cover"
                />
                <h4 className="text-lg font-semibold text-gray-700">{people.username}</h4>
              </div>
              <div>
                {add ? (
                  <p className="text-green-600 font-medium">Added ✅</p>
                ) : (
                  <button
                    onClick={AddUser}
                    className="bg-gradient-to-r from-green-400 to-green-600 hover:from-green-500 hover:to-green-700 text-white px-3 py-2 rounded-2xl transition-all duration-200"
                  >
                    <FontAwesomeIcon icon={faPlus} />
                  </button>
                )}
              </div>
            </div>
          ) : (
            <div className="text-gray-400 text-lg font-mono opacity-70 py-8">
              No user found
            </div>
          )}
        </div>

        <div className="flex justify-end mt-8">
          <button
            onClick={onClose}
            className="px-5 py-2 rounded-2xl border border-gray-300 text-gray-700 hover:bg-gray-100 transition font-medium"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
}

export default SearchModal;
