// Mainchat.jsx (replace your component)
import React, { useState, useEffect } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faPaperPlane, faUpload, faSmile } from "@fortawesome/free-solid-svg-icons";
import { doc, onSnapshot, updateDoc, arrayUnion, getDoc } from 'firebase/firestore';
import { db } from '../lib/firebase';
import userImg from '../assets/user.png'
import Chatimg from '../assets/chat.png';
import upload from '../lib/upload';
import lightbg from '../assets/wallapaper.jpeg';
import darkbg from '../assets/darkmode.jpg';

function Mainchat({ chatId, otherUser, currentUser }) {
  const [chat, setChat] = useState(null);
  const [newMessage, setNewMessage] = useState('');
  const [recipientId, setRecipientId] = useState(null);
  const [img, setImg] = useState({ file: null, url: '' });
  const [loadingChat, setLoadingChat] = useState(false);

  useEffect(() => {
    // whenever chatId or otherUser changes, clear old chat immediately
    setChat(null);

    if (!chatId || !otherUser) {
      setRecipientId(null);
      return;
    }

    setLoadingChat(true);

    const unsub = onSnapshot(doc(db, 'chats', chatId), (res) => {
      if (res.exists()) {
        setChat(res.data());
      } else {
        console.warn('Chat not found for ID:', chatId);
        setChat(null);
      }

      setLoadingChat(false);

      if (otherUser.isGroup) {
        setRecipientId('group');
      } else {
        setRecipientId(otherUser.id || otherUser?.uid || null);
      }
    }, (err) => {
      console.error('onSnapshot error:', err);
      setLoadingChat(false);
    });

    return () => {
      unsub();
    };
  }, [chatId, otherUser]);

  const handleSendMessage = async () => {
    if (!chatId || !currentUser?.id) {
      console.error('chatId or userId is undefined');
      return;
    }

    if (!newMessage.trim() && !img.file) return; // nothing to send

    try {
      const usersid = otherUser?.isGroup
        ? [currentUser.id, ...(otherUser.receiverId || [])]
        : [currentUser.id, otherUser.id];

      let imgUrl = null;
      if (img.file) {
        imgUrl = await upload(img.file);
      }

      await updateDoc(doc(db, 'chats', chatId), {
        messages: arrayUnion({
          text: newMessage,
          senderId: currentUser.id,
          createdAt: new Date(),
          ...(imgUrl ? { img: imgUrl } : {})
        }),
      });

      // update userChat summaries for participants
      usersid.forEach(async (id) => {
        try {
          const userChatRef = doc(db, 'userChat', id);
          const userChatSnap = await getDoc(userChatRef);
          if (userChatSnap.exists()) {
            const userChatData = userChatSnap.data();
            const chatIndex = (userChatData.chats || []).findIndex(i => i.chatId === chatId);
            if (chatIndex !== -1) {
              userChatData.chats[chatIndex].lastmessage = newMessage || (imgUrl ? 'Image' : '');
              userChatData.chats[chatIndex].isSeen = id === currentUser.id;
              userChatData.chats[chatIndex].updatedAt = Date.now();
              await updateDoc(userChatRef, { chats: userChatData.chats });
            }
          }
        } catch (err) {
          console.error('Failed updating userChat for', id, err);
        }
      });

      setImg({ file: null, url: '' });
      setNewMessage('');
    } catch (error) {
      console.error('Error sending message:', error);
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter') handleSendMessage();
  };

  const handleImg = (e) => {
    if (e.target.files?.[0]) {
      const file = e.target.files[0];
      setImg({ file, url: URL.createObjectURL(file) });
    }
  };

  // UI: show loading placeholder while chat null but chatId exists
  if (!chat && chatId && loadingChat) {
    return (
      <section className="flex h-screen items-center justify-center">
        <div className="text-center text-slate-500">Loading chat...</div>
      </section>
    );
  }

  return (
    <section className="flex h-screen flex-col w-full dark:bg-gray-900 bg-gradient-to-b from-slate-100 to-slate-300 transition-all duration-500">
      {chat ? (
        <>
          <div className="flex items-center justify-between p-4 border-b border-slate-300 dark:border-slate-700 bg-white/70 dark:bg-slate-800/90 backdrop-blur-lg shadow-sm sticky top-0 z-20">
            <div className="flex items-center gap-3">
              <img
                src={
                  otherUser?.isGroup
                    ? otherUser.groupPic || otherUser.members?.[0]?.profilePicture || userImg
                    : otherUser?.profilePicture || userImg
                }
                alt="Profile"
                className="w-10 h-10 rounded-full object-cover border border-slate-300"
              />
              <div>
                <h4 className="text-lg font-semibold dark:text-white">
                  {otherUser?.isGroup ? (otherUser.Groupname || "Unnamed Group") : otherUser?.username}
                </h4>
                {otherUser?.isGroup ? (
                  <p className="text-xs text-slate-500 dark:text-slate-400">{otherUser.members?.length || 0} members</p>
                ) : (
                  <p className="text-xs text-green-500 dark:text-green-400">Online</p>
                )}
              </div>
            </div>
            <FontAwesomeIcon icon={faSmile} className="text-slate-500 dark:text-slate-300 cursor-pointer text-xl" />
          </div>

          <section
            className="chat-bg flex flex-col flex-grow overflow-y-auto p-6 gap-4 dark:bg-slate-800 scrollbar-thin scrollbar-thumb-slate-400 scrollbar-track-transparent dark:scrollbar-thumb-slate-600"
          >
            {chat?.messages?.map((msg, idx) => {
              const isSender = msg.senderId === currentUser.id;
              return (
                <div key={`${msg.senderId}-${msg.createdAt?.toString() || idx}`} className={`flex flex-col ${isSender ? "items-end" : "items-start"}`}>
                  <div className={`max-w-[70%] rounded-2xl p-3 text-sm shadow-md break-words ${isSender ? "bg-blue-500 text-white rounded-br-none" : "bg-white dark:bg-slate-700 text-slate-800 dark:text-white rounded-bl-none"}`}>
                    {msg.text}
                  </div>

                  {msg.img && <img src={msg.img} alt="Uploaded" className={`mt-2 rounded-xl max-w-[60%] ${isSender ? "self-end" : "self-start"}`} />}
                </div>
              );
            })}
          </section>

          <section className="p-4 bg-white/80 dark:bg-slate-900/90 backdrop-blur-md border-t border-slate-300 dark:border-slate-700 flex items-center gap-3">
            <label htmlFor="file-input" className="cursor-pointer text-slate-600 dark:text-slate-300 hover:text-blue-500 transition">
              <FontAwesomeIcon icon={faUpload} className="text-xl" />
              <input id="file-input" type="file" className="hidden" onChange={handleImg} />
            </label>

            <input
              type="text"
              value={newMessage}
              onChange={(e) => setNewMessage(e.target.value)}
              onKeyUp={handleKeyPress}
              placeholder="Type a message..."
              className="flex-grow bg-transparent text-slate-800 dark:text-white placeholder:text-slate-400 outline-none px-2"
            />

            <button onClick={handleSendMessage} className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-full transition shadow-sm">
              <FontAwesomeIcon icon={faPaperPlane} />
            </button>
          </section>
        </>
      ) : (
        <div className="flex h-screen justify-center items-center dark:text-white dark:bg-gray-800 flex-col">
          <div className="flex ">
            <h2 className="text-4xl font-sans font-medium">QuikChat</h2>
            <img src={Chatimg} alt="chat" className="h-20" />
          </div>
          <h4 className="text-base font-bold mt-2">Select user to send message</h4>
        </div>
      )}
    </section>
  );
}

export default Mainchat;
