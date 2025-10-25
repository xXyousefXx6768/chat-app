import { Routes, Route, useNavigate, Navigate, useLocation } from 'react-router-dom';
import Sidebar from '../Sidebar';
import ChatList from '../ChatList';
import Mainchat from '../Mainchat';
import SearchModal from '../SearchModal';
import RequestsModal from '../ReqModal';
import GroupModal from '../GroupModal';
import { useState, useEffect } from 'react';
import Profile from '../Profile';
import { useUser } from '../../contexts/UserContext';

function HomePage() {
  const [openModal, setOpenModal] = useState(false);
  const [darkmode, setDarkmode] = useState(false);
  const [selectedChatId, setSelectedChatId] = useState(null);
  const [currentChatId, setCurrentChatId] = useState(null);
  const [windowWidth, setWindowWidth] = useState(window.innerWidth);
  const { user, otherUser, setOtherUser } = useUser();
  const navigate = useNavigate();
  const location = useLocation(); // 👈 عشان نعرف المسار الحالي
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

  const handleChatClick = (chatId, selectedUser) => {
    if (chatId) {
      setSelectedChatId(chatId);
      setCurrentChatId(chatId);
      setOtherUser(selectedUser);
    } else {
      console.error('Chat ID is undefined');
    }
  };

  useEffect(() => {
    if (selectedChatId) {
      navigate(`/homepage/chat/${selectedChatId}`);
    }
  }, [selectedChatId]);

  if (!user) {
    return <Navigate to="/auth/signup" replace />;
  }

  // ✅ لو المسار هو صفحة البروفايل، اعرضها فقط
  if (location.pathname === '/homepage/profile') {
    return (
      <div className={`${darkmode && 'dark'} main-mode overflow-hidden`}>
        <main className="flex h-screen">
          <Sidebar
            open={openModal}
            handle={handleopen}
            users={user}
            darkmode={darkmode}
            handleDarkmode={handleDarkmode}
            handleReqModal={handleReqModal}
            handleGroupModal={handleGroupModal}
          />
          <Profile />
        </main>

        {openModal && <SearchModal onClose={() => setOpenModal(false)} />}
        {openReqModal && <RequestsModal onClose={() => setOpenReqModal(false)} />}
        {openGroupModal && <GroupModal onClose={() => setOpenGroupModal(false)} />}
      </div>
    );
  }

  // 💬 الباقي زي ما هو
  return (
    <div className={`${darkmode && 'dark'} main-mode overflow-hidden`}>
      <main className="flex h-screen">
        <Sidebar
          open={openModal}
          handle={handleopen}
          users={user}
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
                path="*"
                element={<ChatList onItemClick={handleChatClick} user={user} />}
              />
            )}
            {selectedChatId && (
              <Route
                path="chat/:chatId"
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
