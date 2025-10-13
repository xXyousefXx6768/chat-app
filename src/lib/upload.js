import { getStorage, ref, uploadBytes, getDownloadURL } from "firebase/storage";
import { auth } from "./firebase"; // تأكد إن ده بيشير للـ auth بتاعك

const upload = async (file) => {
  try {
    const storage = getStorage();
    const userId = auth.currentUser?.uid;

    if (!userId) {
      throw new Error("User not authenticated");
    }

    const storageRef = ref(storage, `uploads/${userId}/${file.name}`);
    
    const snapshot = await uploadBytes(storageRef, file);
    const downloadURL = await getDownloadURL(snapshot.ref);

    console.log("Uploaded file available at:", downloadURL);
    return downloadURL;

  } catch (error) {
    console.error("Error uploading image:", error);
    return null;
  }
};

export default upload;
