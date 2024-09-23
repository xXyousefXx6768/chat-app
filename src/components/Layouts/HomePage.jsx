import { Routes, Route, useNavigate, Navigate } from 'react-router-dom';
import Sidebar from '../Sidebar';
import ChatList from '../ChatList';
import Mainchat from '../Mainchat';
import SearchModal from '../SearchModal';
import { useState, useEffect } from 'react';
import { onAuthStateChanged } from 'firebase/auth';
import { auth, db } from '../../lib/firebase';
import { doc, getDoc } from 'firebase/firestore';
import { useUser } from '../../contexts/UserContext';

function HomePage() {  
  const [openModal, setOpenModal] = useState(false);  
  const [darkmode, setDarkmode] = useState(false);  
  const [selectedChatId, setSelectedChatId] = useState(null);  
  const [currentChatId, setCurrentChatId] = useState(null);  
  const [currentUserId, setCurrentUserId] = useState(null); // Define currentUserId state  
  const [userData, setUserData] = useState(null);
  const [windowWidth, setWindowWidth] = useState(window.innerWidth);  
  const { setUser, user,otherUser,setOtherUser } = useUser(); // Get user data from useUser hook  
  const navigate = useNavigate();  
  
  useEffect(() => {  
   // Update window width on resize  
   const handleResize = () => setWindowWidth(window.innerWidth);  
   window.addEventListener('resize', handleResize);  
  
   return () => {  
    window.removeEventListener('resize', handleResize);  
   };  
  }, []);  
  
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (user) {
        const docRef = doc(db, 'users', user.uid);
        const docSnap = await getDoc(docRef);
  
        if (docSnap.exists()) {
          const data = docSnap.data(); // Fetch data from the document
          // Log the retrieved user data
          setUserData(data); // Set the userData state with the retrieved data
          if (data.id) {
           
            setUser(data); // Set the user context
            setCurrentUserId(data.id); // Set the current user ID
            
          } else {
            console.error('userId is missing in the document!');
          }
        } else {
          console.log('No such document!');
        }
      } else {
        setUser(null);
        setCurrentUserId(null); // Reset currentUserId state
        setUserData(null); // Reset userData
      }
    });
  
    return () => unsubscribe();
  }, [setUser]);
  
  const handleopen = () => {
    setOpenModal(!openModal);
  };

  const handleDarkmode = () => {
    setDarkmode(!darkmode);
  };

  const handleChatClick = (chatId,userid) => {
    if (chatId) {
      setSelectedChatId(chatId);
      setCurrentChatId(chatId);
      setOtherUser(userid) // Ensure currentChatId is set
      navigate(`/homepage/chat/${chatId}/${userid}`); // Navigate to the chat
    } else {
      console.error('Chat ID is undefined');
    }
  };
  if (!user) {
    return <Navigate to="/auth/signup" replace />;
  }

  
  return (  
   <div className={`${darkmode && 'dark'} main-mode`}>  
    <main className="flex h-screen">  
    <Sidebar
          open={openModal}
          handle={handleopen}
          users={userData} // Use userData here
          darkmode={darkmode}
          handleDarkmode={handleDarkmode}
        />
  
      {windowWidth >= 800 ? (
  <>  
    <ChatList onItemClick={handleChatClick} />  
    <Mainchat chatId={currentChatId} otherUser={otherUser} currentUser={user} />  
  </>
) : (
  <Routes>
     <Route path="/" element={<ChatList onItemClick={handleChatClick} />} />
     <Route path="/chat/:chatId/:userid" element={<Mainchat chatId={currentChatId} otherUser={otherUser} currentUser={user} />} />
          </Routes>
)}
    </main>  
    {openModal && <SearchModal onClose={() => setOpenModal(false)} />}  
   </div>  
  );  
}

export default HomePage;
