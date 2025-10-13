import React, { useRef, useState } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faMagnifyingGlass, faPlus } from '@fortawesome/free-solid-svg-icons';
import { arrayUnion, collection, doc, getDocs, query, serverTimestamp, setDoc, updateDoc, where } from "firebase/firestore";
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
      className="fixed inset-0 flex justify-center items-center bg-black/40 z-50 backdrop-blur-sm"
    >
      <section
        ref={modalRef}
        className="bg-white w-[90%] sm:w-[70%] md:w-[50%] lg:w-[40%] rounded-2xl shadow-2xl p-6 transition-all duration-300"
      >
        <h2 className="text-2xl font-semibold text-gray-800 mb-6 text-center">🔍 Search People</h2>

        <form onSubmit={handleSearch} className="flex items-center gap-2 bg-gray-100 rounded-xl p-2 shadow-inner">
          <FontAwesomeIcon icon={faMagnifyingGlass} className="text-gray-500 px-3 text-lg" />
          <input
            type="text"
            name="username"
            placeholder="Enter username..."
            className="flex-1 bg-transparent focus:outline-none text-gray-800 placeholder-gray-400"
          />
          <button
            type="submit"
            className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-xl transition-all duration-200"
          >
            Search
          </button>
        </form>

        <div className="mt-8 flex flex-col items-center gap-4">
          {people ? (
            <div className="bg-gray-100 w-full p-4 rounded-xl shadow-lg flex items-center justify-between hover:bg-gray-200 transition">
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
                    className="bg-green-500 hover:bg-green-600 text-white px-3 py-2 rounded-xl transition-all duration-200"
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

        <div className="flex justify-end mt-6">
          <button
            onClick={onClose}
            className="px-4 py-2 text-gray-600 hover:text-gray-800 transition border rounded-xl hover:bg-gray-100"
          >
            Close
          </button>
        </div>
      </section>
    </div>
  );
}

export default SearchModal;
