// ChatList.jsx (replace your component)
import React, { useState, useEffect } from 'react';
import { doc, onSnapshot, getDoc, updateDoc } from 'firebase/firestore';
import { db } from '../lib/firebase';
import { useUser } from '../contexts/UserContext';
import userImg from '../assets/user.png'
import { motion } from 'framer-motion';
import { faMagnifyingGlass } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';

function ChatList({ onItemClick }) {
  const [message, setMessage] = useState([]);
  const [search, setSearch] = useState('');
  const { user } = useUser();

  useEffect(() => {
    if (user && user.id) {
      const unSub = onSnapshot(doc(db, 'userChat', user.id), async (res) => {
        if (res.exists()) {
          const items = res.data().chats || [];

          const promises = items.map(async (item) => {
            if (!item.receiverId) return null;

            // group if receiverId is array
            if (Array.isArray(item.receiverId)) {
              const userPromises = item.receiverId.map(async (uid) => {
                const userDoc = doc(db, 'users', uid);
                const userSnap = await getDoc(userDoc);
                return userSnap.exists() ? { id: uid, ...userSnap.data() } : null;
              });

              const groupUsers = (await Promise.all(userPromises)).filter(Boolean);
              return { ...item, group: true, members: groupUsers };
            } else {
              // direct DM
              const userDoc = doc(db, 'users', item.receiverId);
              const userSnap = await getDoc(userDoc);
              const User = userSnap.exists() ? { id: item.receiverId, ...userSnap.data() } : null;
              return { ...item, User };
            }
          });

          const chatData = (await Promise.all(promises)).filter(Boolean);
          setMessage(chatData.sort((a, b) => b.updatedAt - a.updatedAt));
        } else setMessage([]);
      });
      return () => unSub();
    }
  }, [user]);

  const handleChatClick = async (chatId, ou) => {
    const updatedChats = [...message];
    const chatIndex = updatedChats.findIndex((item) => item.chatId === chatId);

    if (chatIndex !== -1) {
      updatedChats[chatIndex].isSeen = true;
      const userChatRef = doc(db, 'userChat', user.id);
      await updateDoc(userChatRef, { chats: updatedChats });
      if (onItemClick) onItemClick(chatId, ou);
    }
  };

  const filteredMessages = message.filter((msg) => {
    if (msg.group) {
      const names = msg.members?.map((m) => m.username?.toLowerCase()).join(' ') || '';
      const groupName = msg.Groupname?.toLowerCase() || '';
      return (
        groupName.includes(search.toLowerCase()) ||
        names.includes(search.toLowerCase())
      );
    } else {
      return msg.User?.username?.toLowerCase().includes(search.toLowerCase());
    }
  });

  return (
    <section className="w-full h-full bg-gradient-to-b from-slate-100/90 to-slate-200/90 dark:from-slate-900 dark:to-slate-800 backdrop-blur-xl transition-colors duration-500">
      <div className="h-25 border-b border-slate-300 dark:border-slate-800 flex flex-col justify-center px-4 backdrop-blur-lg sticky top-0 z-10">
        <h2 className="text-2xl font-bold text-slate-800 dark:text-white tracking-wide mb-2">
          Messages
        </h2>
        <div className="relative">
          <input
            type="text"
            placeholder="Search conversations..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full bg-slate-200/60 dark:bg-slate-900 text-slate-800 dark:text-white rounded-lg py-2 pl-10 pr-3 outline-none focus:ring-2 focus:ring-teal-500 transition-all duration-300 placeholder:text-slate-500 dark:placeholder:text-slate-400"
          />
          <FontAwesomeIcon
            icon={faMagnifyingGlass}
            className="absolute left-3 top-3 text-slate-500 dark:text-slate-400"
          />
        </div>
      </div>

      {filteredMessages.length > 0 ? (
        <div className="h-[calc(100%-5rem)] flex flex-col overflow- scrollbar-thin scrollbar-thumb-slate-400 dark:scrollbar-thumb-slate-600 scrollbar-track-transparent">
          {filteredMessages.map((msg) => (
            <motion.section
              key={msg.chatId} // use chatId as key
              whileHover={{ scale: 1.01 }}
              transition={{ duration: 0.15 }}
              className={`flex items-center justify-between px-5 py-4 border-b border-slate-200 dark:border-slate-700 cursor-pointer 
                ${
                  msg.isSeen
                    ? 'bg-transparent hover:bg-slate-200/60 dark:hover:bg-slate-700/50'
                    : 'bg-gradient-to-r from-teal-500 to-teal-600 text-white shadow-lg hover:brightness-110'
                }`}
              onClick={() => {
                if (msg.group) {
                  // send a clean structured group object
                  handleChatClick(msg.chatId, {
                    isGroup: true,
                    chatId: msg.chatId,
                    Groupname: msg.Groupname,
                    groupPic: msg.groupPic || null,
                    receiverId: Array.isArray(msg.receiverId) ? msg.receiverId : msg.receiverId || [],
                    members: msg.members || [],
                  });
                } else {
                  handleChatClick(msg.chatId, {
                    isGroup: false,
                    id: msg.User?.id,
                    username: msg.User?.username,
                    profilePicture: msg.User?.profilePicture || null,
                  });
                }
              }}
            >
              <div className="flex items-center gap-4">
                <div className="relative">
                  <img
                    src={
                      msg.group
                        ? msg.groupPic || msg.members?.[0]?.profilePicture || userImg
                        : msg.User?.profilePicture || userImg
                    }
                    alt="Profile"
                    className="w-12 h-12 rounded-full object-cover ring-2 ring-transparent dark:ring-slate-700 transition-all duration-300"
                  />
                  {!msg.isSeen && (
                    <span className="absolute bottom-0 right-0 w-3 h-3 bg-teal-300 dark:bg-teal-400 rounded-full ring-2 ring-white dark:ring-slate-800 animate-pulse" />
                  )}
                </div>

                <div className="flex flex-col max-w-[12rem] sm:max-w-[15rem]">
                  <h3 className="font-semibold text-lg truncate dark:text-white">
                    {msg.group ? msg.Groupname || 'Unnamed Group' : msg.User?.username || 'Unknown'}
                  </h3>
                  <p className={`text-sm truncate ${msg.isSeen ? 'text-slate-600 dark:text-slate-400' : 'text-white/90 dark:text-teal-100'}`}>
                    {msg.lastmessage || (msg.group ? `${msg.members?.length || 0} members` : 'No messages yet')}
                  </p>
                </div>
              </div>
            </motion.section>
          ))}
        </div>
      ) : (
        <div className="flex flex-col justify-center items-center h-full text-center text-slate-600 dark:text-slate-400">
          <h2 className="text-lg font-medium">No messages found 💬</h2>
          <p className="text-sm">Try starting a new chat!</p>
        </div>
      )}
    </section>
  );
}

export default ChatList;
