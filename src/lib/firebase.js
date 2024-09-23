// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import { getStorage } from "firebase/storage";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
const firebaseConfig = {
    apiKey: 'AIzaSyDLDy22AUPp22zyeMaODACX1lBapaEQLNs',
    authDomain: "chat-app-react-tailwind-82c28.firebaseapp.com",
    projectId: "chat-app-react-tailwind-82c28",
    storageBucket: "chat-app-react-tailwind-82c28.appspot.com",
    messagingSenderId: "464246088983",
    appId: "1:464246088983:web:6e600840e1ef7336204352"
  };
  

// Initialize Firebase
const app = initializeApp(firebaseConfig);
export const auth = getAuth(app); // Pass app instance here
export const db = getFirestore(app); // Pass app instance here
export const storage = getStorage(app); // Pass app instance here