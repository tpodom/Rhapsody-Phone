// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyD7alACZc2k2rFX3oAy0ZquRiUTUjYm6Ls",
  authDomain: "rhapsody-phone.firebaseapp.com",
  projectId: "rhapsody-phone",
  storageBucket: "rhapsody-phone.appspot.com",
  messagingSenderId: "772695048745",
  appId: "1:772695048745:web:b4d6f81a57e66e3dce9238",
  measurementId: "G-VCY4KK3NHJ",
};

// Initialize Firebase
export const app = initializeApp(firebaseConfig);
export const analytics = getAnalytics(app);
