import { initializeApp } from "firebase/app";
import { getAuth, GoogleAuthProvider } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import { getStorage } from "firebase/storage";

const firebaseConfig = {
  apiKey: "AIzaSyBxJ-TD4z6tyBNYmlYiqBQAzCC_Hmw3rsQ",
  authDomain: "vbassociate-34c7a.firebaseapp.com",
  projectId: "vbassociate-34c7a",
  storageBucket: "vbassociate-34c7a.firebasestorage.app",
  messagingSenderId: "27398532865",
  appId: "1:27398532865:web:3501cc45f5217b3d90b500",
  measurementId: "G-HBPTGE6H57"
};

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const googleProvider = new GoogleAuthProvider();
export const db = getFirestore(app);
export const storage = getStorage(app);
