
import { initializeApp, getApps, getApp } from "firebase/app";
import { getAuth, GoogleAuthProvider } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

// This is the correct configuration for the secapp-9b995 project.
const firebaseConfig = {
  apiKey: "AIzaSyD_NDo5Fl1uPStkWt5ZNtpVPBJid9CT6-A",
  authDomain: "rock-sorter-458718-b7.firebaseapp.com",
  projectId: "rock-sorter-458718-b7",
  storageBucket: "rock-sorter-458718-b7.firebasestorage.app",
  messagingSenderId: "879850545199",
  appId: "1:879850545199:web:4ad47d3b4f46f5e49ca6da"
};

const app = !getApps().length ? initializeApp(firebaseConfig) : getApp();
const auth = getAuth(app);
const db = getFirestore(app);
const googleProvider = new GoogleAuthProvider();

export { app, auth, db, googleProvider };
