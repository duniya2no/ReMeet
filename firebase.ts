// Import the functions you need from the SDKs you need


import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";
import { getAuth } from "firebase/auth";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyBe_v5f9bjvGvslyft2tm1n3G9LVaO7Irs",
  authDomain: "re-meet-5e138.firebaseapp.com",
  projectId: "re-meet-5e138",
  storageBucket: "re-meet-5e138.firebasestorage.app",
  messagingSenderId: "396376232424",
  appId: "1:396376232424:web:ec53c2155ea3617b49545d",
  measurementId: "G-1VCDTWGRH7"
};

// Initialize Firebase
// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Firestore instance
export const db = getFirestore(app);

// Authentication instance
export const auth = getAuth(app);
