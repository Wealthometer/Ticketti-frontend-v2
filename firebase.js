// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
import { getFirestore } from "firebase/firestore";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyAb_VOfvEeMLtO-2gsgEaXs1zEQpHnRp8s",
  authDomain: "sliver-32052.firebaseapp.com",
  projectId: "sliver-32052",
  storageBucket: "sliver-32052.firebasestorage.app",
  messagingSenderId: "925327504976",
  appId: "1:925327504976:web:52d86c8189e675db624355",
  measurementId: "G-HEP4WR8ZMW"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const analytics = getAnalytics(app);
const db = getFirestore(app);

