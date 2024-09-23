import { getStorage, ref, uploadBytes, getDownloadURL } from "firebase/storage";

const upload = async (file) => {
  try {
    const storage = getStorage();
    const storageRef = ref(storage, `uploads/${file.name}`);
    
    // Upload file
    const snapshot = await uploadBytes(storageRef, file);
    
    // Get the download URL
    const downloadURL = await getDownloadURL(snapshot.ref);
    console.log('Uploaded file available at:', downloadURL);  // Log the image URL
    
    return downloadURL;
  } catch (error) {
    console.error('Error uploading image:', error);
    return null;
  }
};

export default upload