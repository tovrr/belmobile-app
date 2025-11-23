import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";
import { getAuth } from "firebase/auth";
import { getStorage } from "firebase/storage";
import { getAnalytics } from "firebase/analytics";

// Configuration provided by user
const firebaseConfig = {
  apiKey: "AIzaSyB7jJgigdcB8KrBPKkRYi2w185swWYAksU",
  authDomain: "belmobile-dev.firebaseapp.com",
  projectId: "belmobile-dev",
  storageBucket: "belmobile-dev.firebasestorage.app",
  messagingSenderId: "370015748398",
  appId: "1:370015748398:web:5b08566aadf36e8bef3abf",
  measurementId: "G-HMNQBB10MH"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize Services
export const db = getFirestore(app);
export const auth = getAuth(app);
export const storage = getStorage(app);
export const analytics = getAnalytics(app);

export default app;