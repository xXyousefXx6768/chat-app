import { motion } from "framer-motion";
import { useUser } from "../contexts/UserContext";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faUserGroup,
  faUserPlus,
  faComments,
  faPen,
} from "@fortawesome/free-solid-svg-icons";
import { useEffect, useState } from "react";
import { db } from "../lib/firebase";
import {
  collection,
  doc,
  getDoc,
  getDocs,
  query,
  where,
} from "firebase/firestore";

function Profile() {
  const { user } = useUser();
  const [stats, setStats] = useState({
    requests: 0,
    friends: 0,
    groups: 0,
  });

  useEffect(() => {
    if (!user?.id) return;

    const fetchStats = async () => {
      try {
        const requestsQuery = query(
          collection(db, "friendRequests"),
          where("to", "==", user.id),
          where("status", "==", "pending")
        );
        const requestsSnap = await getDocs(requestsQuery);

        const userChatRef = doc(db, "userChat", user.id);
        const userChatSnap = await getDoc(userChatRef);
        let friendsCount = 0;
        if (userChatSnap.exists()) {
          const chats = userChatSnap.data().chats || [];
          friendsCount = chats.length;
        }

        const groupsQuery = query(
          collection(db, "groups"),
          where("members", "array-contains", user.id)
        );
        const groupsSnap = await getDocs(groupsQuery);

        setStats({
          requests: requestsSnap.size,
          friends: friendsCount,
          groups: groupsSnap.size,
        });
      } catch (error) {
        console.error("Error fetching stats:", error);
      }
    };

    fetchStats();
  }, [user]);

  if (!user) {
    return (
      <div className="flex items-center justify-center h-screen bg-gray-100 dark:bg-gray-900">
        <p className="text-gray-700 dark:text-gray-300 text-lg animate-pulse">
          Loading profile...
        </p>
      </div>
    );
  }

  return (
    <section className="flex items-center justify-center w-full min-h-screen bg-gradient-to-br from-slate-100 to-slate-200 dark:from-slate-900 dark:to-slate-950 transition-colors duration-500 text-slate-900 dark:text-white font-[Poppins] overflow-hidden relative px-4">
      {/* تأثير ضوء خفيف */}
      <div className="absolute inset-0 bg-gradient-to-r from-teal-400/5 to-blue-500/5 blur-3xl opacity-30"></div>

      <motion.div
        initial={{ opacity: 0, y: 40 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.7 }}
        className="relative w-full max-w-3xl bg-white/70 dark:bg-slate-800/60 backdrop-blur-xl border border-slate-300 dark:border-slate-700 rounded-3xl shadow-2xl p-6 sm:p-8 md:p-10"
      >
        {/* القسم العلوي */}
        <div className="flex flex-col items-center text-center">
          <div className="relative">
            <img
              src={user.profilePicture || "https://via.placeholder.com/150"}
              alt="Profile"
              className="w-24 h-24 sm:w-28 sm:h-28 md:w-32 md:h-32 rounded-full object-cover border-4 border-teal-400 shadow-lg"
            />
            <button className="absolute bottom-0 right-0 bg-teal-500 hover:bg-teal-600 text-white p-2 rounded-full shadow-md transition">
              <FontAwesomeIcon icon={faPen} size="sm" />
            </button>
          </div>

          <h2 className="mt-4 sm:mt-5 text-2xl sm:text-3xl font-bold text-slate-800 dark:text-white">
            {user.username || "Unknown User"}
          </h2>
          <p className="text-gray-500 dark:text-gray-300 text-sm sm:text-base">
            {user.email || "No email available"}
          </p>
          <p className="mt-2 sm:mt-3 text-gray-500 dark:text-gray-400 italic text-sm sm:text-base">
            {user.status || "Hey there! I'm using ChatApp 💬"}
          </p>
        </div>

        {/* الإحصائيات */}
        <motion.div
          className="grid grid-cols-1 sm:grid-cols-3 gap-4 sm:gap-6 mt-8 sm:mt-10"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3 }}
        >
          <StatCard
            icon={faUserPlus}
            label="Friend Requests"
            count={stats.requests}
            color="from-pink-500 to-red-500"
          />
          <StatCard
            icon={faUserGroup}
            label="Chats"
            count={stats.friends}
            color="from-teal-500 to-emerald-500"
          />
          <StatCard
            icon={faComments}
            label="Groups"
            count={stats.groups}
            color="from-blue-500 to-indigo-500"
          />
        </motion.div>

        {/* تاريخ الانضمام */}
        <div className="mt-8 sm:mt-10 text-center text-gray-600 dark:text-gray-400 text-sm sm:text-base">
          <p>
            Joined on{" "}
            <span className="text-teal-500 font-semibold">
              {user.createdAt
                ? new Date(user.createdAt.seconds * 1000).toLocaleDateString()
                : "Unknown"}
            </span>
          </p>
        </div>
      </motion.div>
    </section>
  );
}

function StatCard({ icon, label, count, color }) {
  return (
    <motion.div
      whileHover={{ scale: 1.07 }}
      className={`flex flex-col items-center justify-center bg-gradient-to-br ${color} rounded-2xl py-5 sm:py-6 shadow-lg cursor-pointer transition-transform text-white`}
    >
      <FontAwesomeIcon icon={icon} className="text-xl sm:text-2xl mb-2" />
      <p className="text-2xl sm:text-3xl font-bold">{count}</p>
      <span className="text-xs sm:text-sm opacity-90">{label}</span>
    </motion.div>
  );
}

export default Profile;
