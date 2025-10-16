import { createContext, useContext, useState, useEffect } from "react";
import { auth, db } from "../lib/firebase";
import { doc, getDoc } from "firebase/firestore";
import { onAuthStateChanged, setPersistence, browserSessionPersistence } from "firebase/auth";

const UserContext = createContext();

export const UserProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [otherUser, setOtherUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setPersistence(auth, browserSessionPersistence)
      .then(() => {
        const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
          if (currentUser) {
            try {
              const userRef = doc(db, "users", currentUser.uid);
              const userSnap = await getDoc(userRef);
              if (userSnap.exists()) {
                setUser({ ...userSnap.data(), id: currentUser.uid });
              } else {
                console.error("User document not found!");
                setUser(null);
              }
            } catch (error) {
              console.error("Error fetching user data:", error);
            }
          } else {
            setUser(null);
          }
          setLoading(false);
        });

        return () => unsubscribe();
      })
      .catch((error) => {
        console.error("Error setting session persistence:", error);
        setLoading(false);
      });
  }, []);

  if (loading) return <div className="text-center p-5">Loading...</div>;

  return (
    <UserContext.Provider value={{ user, setUser, otherUser, setOtherUser }}>
      {children}
    </UserContext.Provider>
  );
};

export const useUser = () => useContext(UserContext);
