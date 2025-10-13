
import React, { useEffect, useState } from "react";
import {
  collection,
  query,
  where,
  onSnapshot,
  doc,
  updateDoc,
  setDoc,
  serverTimestamp,
  arrayUnion,
} from "firebase/firestore";
import { db } from "../lib/firebase";
import { useUser } from "../contexts/UserContext";
import toast from "react-hot-toast";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faUserPlus,
  faTimes,
  faCheck,
  faXmark,
} from "@fortawesome/free-solid-svg-icons";

function RequestsModal({ onClose }) {
  const { user } = useUser();
  const [requests, setRequests] = useState([]);

  useEffect(() => {
    if (!user) return;
    const q = query(
      collection(db, "friendRequests"),
      where("to", "==", user.id),
      where("status", "==", "pending")
    );
    const unsub = onSnapshot(q, (snap) => {
      setRequests(snap.docs.map((d) => ({ id: d.id, ...d.data() })));
    });
    return () => unsub();
  }, [user]);

  const accept = async (req) => {
    try {
      await updateDoc(doc(db, "friendRequests", req.id), { status: "accepted" });

      const chatRef = doc(collection(db, "chats"));
      await setDoc(chatRef, {
        id: chatRef.id,
        createdAt: serverTimestamp(),
        messages: [],
      });

      await updateDoc(doc(db, "userChat", user.id), {
        chats: arrayUnion({
          chatId: chatRef.id,
          lastmessage: "",
          receiverId: req.from,
          updatedAt: Date.now(),
          type: "personal",
          isSeen: true,
        }),
      });

      await updateDoc(doc(db, "userChat", req.from), {
        chats: arrayUnion({
          chatId: chatRef.id,
          lastmessage: "",
          receiverId: user.id,
          updatedAt: Date.now(),
          type: "personal",
          isSeen: false,
        }),
      });

      await setDoc(doc(collection(db, "notifications")), {
        userId: req.from,
        type: "request_accepted",
        from: user.id,
        seen: false,
        createdAt: serverTimestamp(),
      });

      toast.success("Request accepted — chat created");
    } catch (err) {
      console.error(err);
      toast.error("Failed to accept request");
    }
  };

  const reject = async (req) => {
    try {
      await updateDoc(doc(db, "friendRequests", req.id), { status: "rejected" });
      toast.success("Request rejected");
    } catch (err) {
      console.error(err);
      toast.error("Failed to reject request");
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm">
      <div className="bg-white dark:bg-gray-900 dark:text-gray-100 rounded-2xl p-6 w-[380px] shadow-2xl transition-all duration-300 font-[Poppins] max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex justify-between items-center mb-5">
          <h3 className="text-2xl font-semibold flex items-center gap-2">
            <FontAwesomeIcon icon={faUserPlus} /> Friend Requests
          </h3>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-red-500 transition"
          >
            <FontAwesomeIcon icon={faTimes} size="lg" />
          </button>
        </div>

        {/* Requests list */}
        {requests.length === 0 ? (
          <p className="text-center text-gray-500 dark:text-gray-400">
            No friend requests
          </p>
        ) : (
          <div className="flex flex-col gap-3">
            {requests.map((r) => (
              <div
                key={r.id}
                className="flex items-center justify-between border dark:border-gray-700 rounded-lg p-3 hover:shadow-md dark:hover:bg-gray-800 transition-all duration-200"
              >
                <div className="flex items-center gap-3">
                  <img
                    src={
                      r.fromProfile ||
                      "https://via.placeholder.com/40?text=User"
                    }
                    alt="sender"
                    className="w-10 h-10 rounded-full object-cover border"
                  />
                  <div>
                    <p className="font-semibold">{r.fromName || "Unknown"}</p>
                    <p className="text-xs text-gray-500 dark:text-gray-400">
                      wants to be your friend
                    </p>
                  </div>
                </div>

                <div className="flex gap-2">
                  <button
                    onClick={() => accept(r)}
                    className="flex items-center gap-1 bg-green-500 hover:bg-green-600 text-white px-2.5 py-1 rounded-lg text-sm transition"
                  >
                    <FontAwesomeIcon icon={faCheck} /> Accept
                  </button>
                  <button
                    onClick={() => reject(r)}
                    className="flex items-center gap-1 bg-red-500 hover:bg-red-600 text-white px-2.5 py-1 rounded-lg text-sm transition"
                  >
                    <FontAwesomeIcon icon={faXmark} /> Reject
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Close Button */}
        <div className="flex justify-end mt-5">
          <button
            onClick={onClose}
            className="px-4 py-2 border rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
}

export default RequestsModal;
