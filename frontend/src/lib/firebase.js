import { initializeApp } from 'firebase/app'
import { getAuth } from 'firebase/auth'
import { getFirestore } from 'firebase/firestore'

const firebaseConfig = {
  apiKey: "AIzaSyB3sENkxVTu95k9u289RRyPQq3T4CEROkg",
  authDomain: "tufting-studio.firebaseapp.com",
  projectId: "tufting-studio",
  storageBucket: "tufting-studio.firebasestorage.app",
  messagingSenderId: "531547295515",
  appId: "1:531547295515:web:1b64f59a7957cc52438dbe",
  measurementId: "G-39XC4SP6NJ"
};

const app = initializeApp(firebaseConfig)

export const auth = getAuth(app)
export const db = getFirestore(app)

