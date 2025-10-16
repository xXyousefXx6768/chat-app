import { Routes, Route, useNavigate, Navigate } from 'react-router-dom';
import Sidebar from '../Sidebar';
import ChatList from '../ChatList';
import Mainchat from '../Mainchat';
import SearchModal from '../SearchModal';
import RequestsModal from '../ReqModal';
import GroupModal from '../GroupModal';
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
  const [windowWidth, setWindowWidth] = useState(window.innerWidth);
  const { setUser, user, otherUser, setOtherUser } = useUser();
  const navigate = useNavigate();
  const [openReqModal, setOpenReqModal] = useState(false);
  const [openGroupModal, setOpenGroupModal] = useState(false);

  const handleReqModal = () => setOpenReqModal(!openReqModal);
  const handleGroupModal = () => setOpenGroupModal(!openGroupModal);

  useEffect(() => {
    const handleResize = () => setWindowWidth(window.innerWidth);
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const handleopen = () => setOpenModal(!openModal);
  const handleDarkmode = () => setDarkmode(!darkmode);

  const handleChatClick = (chatId, userid) => {
    if (chatId) {
      setSelectedChatId(chatId);
      setCurrentChatId(chatId);
      setOtherUser(userid);
      navigate(`/homepage/chat/${chatId}/${userid}`);
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
          users={user} // Use userData here
          darkmode={darkmode}
          handleDarkmode={handleDarkmode}
          handleReqModal={handleReqModal}
          handleGroupModal={handleGroupModal}
        />
  
{windowWidth >= 800 ? (
  <>
    <ChatList onItemClick={handleChatClick} user={user} />
    <Mainchat chatId={currentChatId} otherUser={otherUser} currentUser={user} />
  </>
) : (
  <Routes>
    {!selectedChatId && (
      <Route
        path="/homepage"
        element={<ChatList onItemClick={handleChatClick} user={user} />}
      />
    )}
    {selectedChatId && (
      <Route
        path="chat/:chatId/:userid"
        element={<Mainchat chatId={currentChatId} otherUser={otherUser} currentUser={user} />}
      />
    )}
  </Routes>
)}

    </main>  
   {openModal && <SearchModal onClose={() => setOpenModal(false)} />}
   {openReqModal && <RequestsModal onClose={() => setOpenReqModal(false)} />}
  {openGroupModal && <GroupModal onClose={() => setOpenGroupModal(false)} />}
   </div>  
  );  
}

export default HomePage;
