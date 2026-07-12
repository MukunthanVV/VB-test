import { initializeApp } from "firebase/app";
import { getAuth, GoogleAuthProvider } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import { getStorage } from "firebase/storage";

const firebaseConfig = {
  apiKey: "AIzaSyDAJVP7BT3pD_UU3RlAhobVsWXNh83XAV8",
  authDomain: "vbassociate-4ec0d.firebaseapp.com",
  projectId: "vbassociate-4ec0d",
  storageBucket: "vbassociate-4ec0d.firebasestorage.app",
  messagingSenderId: "270029453012",
  appId: "1:270029453012:web:ad845b809c6508d39a2d41",
  measurementId: "G-K3E4ML343F"
};

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const googleProvider = new GoogleAuthProvider();
export const db = getFirestore(app);
export const storage = getStorage(app);
