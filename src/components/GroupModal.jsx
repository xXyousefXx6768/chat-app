import React, { useState, useEffect } from "react";
import toast from "react-hot-toast";
import {
  collection,
  doc,
  setDoc,
  updateDoc,
  arrayUnion,
  getDoc,
  onSnapshot,
  serverTimestamp,
} from "firebase/firestore";
import { db } from "../lib/firebase";
import { useUser } from "../contexts/UserContext";
import upload from "../lib/upload";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faUsers,
  faTimes,
  faSearch,
  faUpload,
} from "@fortawesome/free-solid-svg-icons";

function GroupModal({ onClose }) {
  const { user } = useUser();
  const [name, setName] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedMembers, setSelectedMembers] = useState([]);
  const [friends, setFriends] = useState([]);
  const [loading, setLoading] = useState(false);
  const [groupPicFile, setGroupPicFile] = useState(null);
  const [preview, setPreview] = useState(null);

  useEffect(() => {
    if (!user || !user.id) return;

    const unsub = onSnapshot(doc(db, "userChat", user.id), async (res) => {
      if (res.exists()) {
        const chats = res.data().chats || [];
        const friendsData = [];

        for (const chat of chats) {
          if (Array.isArray(chat.receiverId)) continue;
          const userRef = doc(db, "users", chat.receiverId);
          const userSnap = await getDoc(userRef);
          if (userSnap.exists()) {
            friendsData.push({
              id: chat.receiverId,
              ...userSnap.data(),
            });
          }
        }

        setFriends(friendsData);
      }
    });

    return () => unsub();
  }, [user]);

  const toggleMember = (friend) => {
    setSelectedMembers((prev) =>
      prev.some((m) => m.id === friend.id)
        ? prev.filter((m) => m.id !== friend.id)
        : [...prev, friend]
    );
  };

  const handleFile = (e) => {
    const file = e.target.files[0];
    if (file) {
      setGroupPicFile(file);
      setPreview(URL.createObjectURL(file));
    }
  };

  const createGroup = async (e) => {
    e.preventDefault();
    if (!name.trim()) return toast.error("Please enter a group name");
    if (selectedMembers.length < 1)
      return toast.error("Select at least one member");

    setLoading(true);
    try {
      let groupPic = null;
      if (groupPicFile) groupPic = await upload(groupPicFile);

      const memberIds = selectedMembers.map((m) => m.id);
      if (!memberIds.includes(user.id)) memberIds.push(user.id);

      const groupRef = doc(collection(db, "groups"));
      const groupId = groupRef.id;

      await setDoc(groupRef, {
        id: groupId,
        name,
        type: "group",
        members: memberIds,
        createdBy: user.id,
        createdAt: serverTimestamp(),
        groupPic: groupPic || null,
      });

      for (const memberId of memberIds) {
        const userChatRef = doc(db, "userChat", memberId);
        const snap = await getDoc(userChatRef);
        if (!snap.exists()) await setDoc(userChatRef, { chats: [] });

        await updateDoc(userChatRef, {
          chats: arrayUnion({
            chatId: groupId,
            lastmessage: "",
            receiverId: memberIds,
            Groupname: name,
            groupPic: groupPic || null,
            type: "group",
            updatedAt: Date.now(),
            isSeen: memberId === user.id,
          }),
        });
      }

      toast.success("Group created successfully!");
      onClose?.();
    } catch (error) {
      console.error(error);
      toast.error("Failed to create group");
    } finally {
      setLoading(false);
    }
  };

  const filteredFriends = friends.filter((f) =>
    f.username?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm">
      <div className="bg-white dark:bg-gray-900 dark:text-gray-100 rounded-2xl p-6 w-[380px] shadow-2xl transition-all duration-300 max-h-[90vh]  font-[Poppins]">
        {/* Header */}
        <div className="flex justify-between items-center mb-5">
          <h3 className="text-2xl font-semibold flex items-center gap-2">
            <FontAwesomeIcon icon={faUsers} /> Create Group
          </h3>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-red-500 transition"
          >
            <FontAwesomeIcon icon={faTimes} size="lg" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={createGroup} className="flex flex-col gap-4">
          {/* Group name */}
          <input
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Group name..."
            className="p-3 border rounded-lg text-sm focus:ring-2 focus:ring-blue-500 outline-none dark:bg-gray-800 dark:border-gray-700"
          />

          {/* Upload Box */}
          <label className="flex flex-col items-center justify-center p-4 border-2 border-dashed rounded-lg cursor-pointer transition hover:border-blue-500 dark:border-gray-700 dark:hover:border-blue-400">
            <FontAwesomeIcon icon={faUpload} className="text-2xl mb-2" />
            <span className="text-sm text-gray-600 dark:text-gray-300">
              {groupPicFile ? groupPicFile.name : "Upload group picture"}
            </span>
            <input
              type="file"
              className="hidden"
              accept="image/*"
              onChange={handleFile}
            />
            {preview && (
              <img
                src={preview}
                alt="Preview"
                className="w-16 h-16 mt-2 rounded-full object-cover border"
              />
            )}
          </label>

          {/* Search box */}
          <div className="relative">
            <FontAwesomeIcon
              icon={faSearch}
              className="absolute left-3 top-3 text-gray-400"
            />
            <input
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search friends..."
              className="pl-10 p-3 w-full border rounded-lg text-sm focus:ring-2 focus:ring-blue-500 outline-none dark:bg-gray-800 dark:border-gray-700"
            />
          </div>

          {/* Friends list */}
          <div className="border rounded-lg p-2 h-40 overflow-y-auto dark:border-gray-700">
            {filteredFriends.length > 0 ? (
              filteredFriends.map((friend) => (
                <div
                  key={friend.id}
                  onClick={() => toggleMember(friend)}
                  className={`flex items-center gap-3 p-2 rounded-lg cursor-pointer transition-all duration-200 ${
                    selectedMembers.some((m) => m.id === friend.id)
                      ? "bg-blue-500 text-white"
                      : "hover:bg-gray-100 dark:hover:bg-gray-800"
                  }`}
                >
                  <img
                    src={
                      friend.profilePicture || "https://via.placeholder.com/40"
                    }
                    alt={friend.username}
                    className="w-10 h-10 rounded-full object-cover border"
                  />
                  <p className="font-medium">{friend.username}</p>
                </div>
              ))
            ) : (
              <p className="text-sm text-gray-500 text-center mt-2">
                No friends found
              </p>
            )}
          </div>

          {/* Selected members */}
          {selectedMembers.length > 0 && (
            <div className="flex flex-wrap gap-2 border rounded-lg p-2 mt-2 dark:border-gray-700">
              {selectedMembers.map((m) => (
                <div
                  key={m.id}
                  className="flex items-center gap-2 bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-white px-2 py-1 rounded-full"
                >
                  <img
                    src={m.profilePicture || "https://via.placeholder.com/30"}
                    alt={m.username}
                    className="w-6 h-6 rounded-full"
                  />
                  <span className="text-sm">{m.username}</span>
                </div>
              ))}
            </div>
          )}

          {/* Buttons */}
          <div className="flex justify-end gap-3 mt-4">
            <button
              type="button"
              onClick={onClose}
              className="px-3 py-2 border rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition"
            >
              {loading ? "Creating..." : "Create"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default GroupModal;
