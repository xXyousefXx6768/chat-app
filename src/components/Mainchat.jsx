import React, { useState, useEffect } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faUpload } from '@fortawesome/free-solid-svg-icons';
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
    <section className="flex h-screen flex-col dark:bg-gray-900 bg-slate-300 w-full">
      <div className="flex h-screen flex-col">
        {chat ? (
          <div className="flex h-full relative flex-col dark:bg-dark dark:bg-cover transition-colors duration-700 bg-hero-pattern bg-cover">
            {/* Chat display */}
            <div className="top-layout h-36 p-5 flex w-full">
              <div className="top-bar w-[57%] dark:text-white items-center fixed flex h-[14%] rounded-3xl p-5 dark:bg-slate-900 bg-slate-400">
                <img
                 src={otherUser.profilePicture
                  || "https://placehold.co/50x50"}
                  alt="Profile"
                  className="w-10 h-10 rounded-full cursor-pointer"
                />
                <h4 className="pl-3 self-center text-xl font-semibold">
                  {otherUser.username} {/* Adjust this field to display the chat recipient */}
                </h4>
              </div>
            </div>

            {/* Messages section */}
            <section className="flex overflow-y-auto outline-none  [&::-webkit-scrollbar]:w-2
  [&::-webkit-scrollbar-track]:bg-gray-100
  [&::-webkit-scrollbar-thumb]:bg-gray-300
  dark:[&::-webkit-scrollbar-track]:bg-neutral-700
  dark:[&::-webkit-scrollbar-thumb]:bg-neutral-500 flex-col mb-20 p-7">
  {chat?.messages?.map((msg, index) => (
    <div key={index} className={`mb-2 ${msg.senderId === currentUser.id ? 'text-right' : 'text-left'}`}>
      {/* Message Text */}
      <p className={`p-2 mt-4 bg-emerald-600 dark:bg-gray-700 text-white rounded-lg inline-block`}>
        {msg.text}
      </p>

      {/* Render the image if the img field exists and align it based on sender */}
      {msg.img && (
        <div className={`flex m-3 ${msg.senderId === currentUser.id ? 'justify-end' : 'justify-start'}`}>
          <img src={msg.img} alt="Uploaded" className="w-[14rem] rounded-lg" />
        </div>
      )}
    </div>
  ))}
</section>



           

            {/* Input section */}
            <section className="p-7 flex w-full absolute bottom-0 left-0">
              <div className="flex items-center h-16 w-full rounded-3xl dark:bg-slate-900 bg-slate-300 p-4">
                <label htmlFor="file-input">
                  <FontAwesomeIcon className="h-4 cursor-pointer" icon={faUpload} />
                </label>
                <input id="file-input" type="file" className="hidden" onChange={handleImg} />

                {/* Message Input */}
                <input
                  type="text"
                  value={newMessage}
                  onChange={(e) => setNewMessage(e.target.value)}
                  onKeyUp={handleKeyPress} // Handle "Enter" press
                  placeholder="Add message....."
                  className="h-11 p-7 w-full dark:text-white focus:outline-none border-0 bg-transparent"
                />

                {/* Send Button */}
                <button
                  onClick={handleSendMessage}
                  className="ml-2 px-4 py-2 bg-blue-500 text-white rounded-lg"
                >
                  Send
                </button>
              </div>
            </section>
          </div>
        ) : (
          <div className="flex h-screen justify-center items-center flex-col">
            <div className="flex">
              <h2 className="text-4xl font-sans font-medium">QuikChat</h2>
              <img src={Chatimg} alt="chat" className="h-20" />
            </div>
            <h4 className="text-base font-bold mt-2">Select user to send message</h4>
          </div>
        )}
      </div>
    </section>
  );


}
export default Mainchat;
