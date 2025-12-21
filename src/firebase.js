import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import { getStorage } from "firebase/storage";
import { getAnalytics } from "firebase/analytics";

const firebaseConfig = {
    apiKey: "AIzaSyB2FURkzhOCIsI4bi8-jc_uydZ_oFCbcYA",
    authDomain: "lets-try007.firebaseapp.com",
    databaseURL: "https://lets-try007-default-rtdb.firebaseio.com",
    projectId: "lets-try007",
    storageBucket: "lets-try007.firebasestorage.app",
    messagingSenderId: "218535335758",
    appId: "1:218535335758:web:3c03cb75cb2d10ec57301f",
    measurementId: "G-XE0W1LTN0G"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const analytics = getAnalytics(app);

// Export services
export const auth = getAuth(app);
export const db = getFirestore(app);
export const storage = getStorage(app);
