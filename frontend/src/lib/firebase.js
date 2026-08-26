// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyB3sENkxVTu95k9u289RRyPQq3T4CEROkg",
  authDomain: "tufting-studio.firebaseapp.com",
  projectId: "tufting-studio",
  storageBucket: "tufting-studio.firebasestorage.app",
  messagingSenderId: "531547295515",
  appId: "1:531547295515:web:1b64f59a7957cc52438dbe",
  measurementId: "G-39XC4SP6NJ"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const analytics = getAnalytics(app);
