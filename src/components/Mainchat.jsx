import React, { useState, useEffect } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faPaperPlane, faUpload, faSmile } from "@fortawesome/free-solid-svg-icons";
import { doc, onSnapshot, updateDoc, arrayUnion, serverTimestamp, getDoc } from 'firebase/firestore';
import { db } from '../lib/firebase';
import Chatimg from '../assets/chat.png';
import upload from '../lib/upload';

function Mainchat({ chatId, otherUser, currentUser }) {
  const [chat, setChat] = useState(null);
  const [newMessage, setNewMessage] = useState('');
  const [recipientId, setRecipientId] = useState(null);
  const [img, setImg] = useState({ file: null, url: '' });

  useEffect(() => {
    if (chatId && otherUser) {
      const unsub = onSnapshot(doc(db, 'chats', chatId), (res) => {
        const chatData = res.data();
        setChat(chatData);
        setRecipientId(otherUser.id);
      });

      return () => unsub();
    }
  }, [chatId, otherUser]);

  const handleSendMessage = async () => {
    console.log('Sending message...'); // Added log
    console.log('Image file:', img.file); // Check if the image file exists
    
    if (!chatId || !currentUser.id) {
      console.error("chatId or userId is undefined");
      return;
    }

    if (newMessage.trim()) {
      try {
        const usersid = [currentUser.id, otherUser.id];
        let imgUrl = null;

        // Upload image if exists
        if (img.file) {
          console.log('Uploading image...'); // Added log
          imgUrl = await upload(img.file); // Assuming upload returns a URL
          console.log('Image uploaded successfully. URL:', imgUrl); // Log the image URL after upload
        } else {
          console.log('No image file to upload'); // Added log
        }

        // Store message and image URL (if any)
        await updateDoc(doc(db, 'chats', chatId), {
          messages: arrayUnion({
            text: newMessage,
            senderId: currentUser.id,
            createdAt: new Date(),
            ...(imgUrl && { img: imgUrl }) // Add image URL to the message if it exists
          }),
        });

        // Update chat preview for both users
        usersid.forEach(async (id) => {
          const userChatRef = doc(db, 'userChat', id);
          const userChatsnap = await getDoc(userChatRef);

          if (userChatsnap.exists()) {
            const userChatData = userChatsnap.data();
            const chatIndex = userChatData.chats.findIndex(i => i.chatId === chatId);

            if (chatIndex !== -1) {
              userChatData.chats[chatIndex].lastmessage = newMessage;
              userChatData.chats[chatIndex].isSeen = id === currentUser.id ? true : false;
              userChatData.chats[chatIndex].updatedAt = Date.now();

              await updateDoc(userChatRef, {
                chats: userChatData.chats,
              });
            } else {
              console.error('Chat not found for chatId:', chatId);
            }
          }
        });

        // Reset image and message after sending
        setImg({
          file: null,
          url: ''
        });
        setNewMessage('');
        console.log('Message sent successfully'); // Added log
      } catch (error) {
        console.error('Error sending message:', error);
      }
    }
  };

  // Handle sending message with "Enter" key press
  const handleKeyPress = (event) => {
    if (event.key === 'Enter') {
      handleSendMessage();
    }
  };

  // Handle image selection
  const handleImg = (e) => {
    if (e.target.files[0]) {
      const selectedFile = e.target.files[0];
      console.log('Image selected:', selectedFile); // Added log
      setImg({
        file: selectedFile,
        url: URL.createObjectURL(selectedFile), // For preview
      });
    }
  };


  return (
    <section className="flex h-screen flex-col w-full dark:bg-gray-900 bg-gradient-to-b from-slate-100 to-slate-300 transition-all duration-500">
      {chat ? (
        <>
          {/* ==== Header ==== */}
          <div className="flex items-center justify-between p-4 border-b border-slate-300 dark:border-slate-700 bg-white/70 dark:bg-slate-800/90 backdrop-blur-lg shadow-sm sticky top-0 z-20">
            <div className="flex items-center gap-3">
              <img
                src={otherUser.profilePicture || "https://placehold.co/50x50"}
                alt="Profile"
                className="w-10 h-10 rounded-full object-cover border border-slate-300"
              />
              <div>
                <h4 className="text-lg font-semibold dark:text-white">{otherUser.username}</h4>
                <p className="text-xs text-green-500 dark:text-green-400">Online</p>
              </div>
            </div>
            <FontAwesomeIcon
              icon={faSmile}
              className="text-slate-500 dark:text-slate-300 cursor-pointer text-xl"
            />
          </div>

          {/* ==== Messages Section ==== */}
          <section
            className="flex flex-col flex-grow overflow-y-auto p-6 gap-4 
            dark:bg-slate-800
            scrollbar-thin scrollbar-thumb-slate-400 scrollbar-track-transparent 
            dark:scrollbar-thumb-slate-600"
          >
            {chat?.messages?.map((msg, index) => {
              const isSender = msg.senderId === currentUser.id;
              return (
                <div
                  key={index}
                  className={`flex flex-col ${isSender ? "items-end" : "items-start"}`}
                >
                  {/* Message Bubble */}
                  <div
                    className={`max-w-[70%] rounded-2xl p-3 text-sm shadow-md break-words ${
                      isSender
                        ? "bg-blue-500 text-white rounded-br-none"
                        : "bg-white dark:bg-slate-700 text-slate-800 dark:text-white rounded-bl-none"
                    }`}
                  >
                    {msg.text}
                  </div>

                  {/* Image if exists */}
                  {msg.img && (
                    <img
                      src={msg.img}
                      alt="Uploaded"
                      className={`mt-2 rounded-xl max-w-[60%] ${
                        isSender ? "self-end" : "self-start"
                      }`}
                    />
                  )}
                </div>
              );
            })}
          </section>

          {/* ==== Input Section ==== */}
          <section className="p-4 bg-white/80 dark:bg-slate-900/90 backdrop-blur-md border-t border-slate-300 dark:border-slate-700 flex items-center gap-3">
            {/* Upload Icon */}
            <label htmlFor="file-input" className="cursor-pointer text-slate-600 dark:text-slate-300 hover:text-blue-500 transition">
              <FontAwesomeIcon icon={faUpload} className="text-xl" />
              <input id="file-input" type="file" className="hidden" onChange={handleImg} />
            </label>

            {/* Input Field */}
            <input
              type="text"
              value={newMessage}
              onChange={(e) => setNewMessage(e.target.value)}
              onKeyUp={handleKeyPress}
              placeholder="Type a message..."
              className="flex-grow bg-transparent text-slate-800 dark:text-white placeholder:text-slate-400 outline-none px-2"
            />

            {/* Send Button */}
            <button
              onClick={handleSendMessage}
              className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-full transition shadow-sm"
            >
              <FontAwesomeIcon icon={faPaperPlane} />
            </button>
          </section>
        </>
      )  : (
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
