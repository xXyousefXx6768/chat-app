import React, { useState, useEffect } from 'react';
import { faMessage } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { doc, onSnapshot, getDoc,updateDoc } from 'firebase/firestore';
import { db } from '../lib/firebase';
import { useUser, } from '../contexts/UserContext';
import { useNavigate } from 'react-router-dom';


function ChatList({ onItemClick }) {
  const [message, setMessage] = useState([]);
  const { user } = useUser();
  const [ou,setou]=useState()
  
  useEffect(() => {
  if (user && user.uid) {
    const unSub = onSnapshot(doc(db, 'userChat', user.uid), async (res) => {
      if (res.exists()) {
        const items = res.data().chats || [];
        const promises = items.map(async (item) => {
          const userDoc = doc(db, 'users', item.receiverId);
          const userSnap = await getDoc(userDoc);
          const User = userSnap.data();
          setou(User);
          return { ...item, User };
        });
        const chatData = await Promise.all(promises);
        setMessage(chatData.sort((a, b) => b.updatedAt - a.updatedAt));
      } else {
        setMessage([]);
      }
    });

    return () => {
      unSub();
    };
  }
}, [user]);

  const handleChatClick = async(chatId,ou) => {
    const updatedChats = [...message];
    const chatIndex = updatedChats.findIndex(item => item.chatId === chatId);

    if (chatIndex !== -1) {
      updatedChats[chatIndex].isSeen = true;

      const userChatRef = doc(db, 'userChat', user.id);
      try {
        await updateDoc(userChatRef, {
          chats: updatedChats,
        });
      } catch (error) {
        console.log('Error updating chat seen status:', error);
      }

      if (onItemClick) {
        onItemClick(chatId, ou);
      }
    } else {
      console.error('Chat not found in message list');
    }
  };

  return (
    <section className="bg-slate-200 dark:bg-slate-800 transition-colors duration-600 dark:text-white w-full h-full">
      <div className="title h-16 border-b-[1px] border-b-slate-400 flex items-center ">
        <h2 className="text-2xl pl-3 font-bold">Message</h2>
      </div>
      {message.length > 0 ? (
        <div className="list-layout h-[87%] flex flex-col overflow-y-auto">
          {message.map((msg, index) => (
            <section
              key={index}
              className={`border-b-[1px] border-b-slate-400 transition-colors duration-500 flex cursor-pointer h-[5rem] 
                ${ msg.isSeen 
                  ? 'bg-slate-300 dark:bg-slate-800' 
                  : 'bg-teal-400 text-white dark:bg-slate-700 hover:bg-slate-500 dark:hover:bg-slate-400'}`}
              onClick={() => handleChatClick(msg.chatId,msg.User)} // Pass the chatId on click
            >
              <section className="flex items-center chat-box pl-3">
                <div className="list-img">
                  <img src={msg.User.profilePicture || "https://via.placeholder.com/50"} alt="Profile" className="w-10 h-10 rounded-full cursor-pointer" />
                </div>
                <div className="list-info ml-5 flex-col">
                  <h3 className="font-medium text-2xl">{msg.User.username}</h3>
                  <p className="text-sm text-ellipsis overflow-hidden">{msg.lastmessage}</p>
                </div>
              </section>
            </section>
          ))}
        </div>
      ) : (
        <section className="flex flex-col p-4 text-center justify-center items-center mt-10 text-slate-700 ">
          <h2 className="text-lg font-medium">Explore users to start a conversation with.</h2>
        </section>
      )}
    </section>
  );
}

export default ChatList;
