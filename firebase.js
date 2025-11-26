import { Platform } from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { initializeApp, getApps, getApp } from "firebase/app";
import {
  initializeAuth,
  getReactNativePersistence,
  getAuth,
} from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import { getAnalytics, isSupported } from "firebase/analytics";

// Import the functions you need from the SDKs you need
// Initialize Firebase using the provided configuration
const firebaseConfig = {
  apiKey: "AIzaSyD3RM0IQ2veY4KJ-E6FrWv5wHmNpoY3Nko",
  authDomain: "calander-3bdda.firebaseapp.com",
  projectId: "calander-3bdda",
  storageBucket: "calander-3bdda.firebasestorage.app",
  messagingSenderId: "631828190926",
  appId: "1:631828190926:web:b922bd331e56133735229f",
  measurementId: "G-C7HMFV3FT0",
};

const app = getApps().length ? getApp() : initializeApp(firebaseConfig);

// Configure Auth with React Native persistence to keep users signed in across sessions.
let auth;
try {
  auth = initializeAuth(app, {
    persistence: getReactNativePersistence(AsyncStorage),
  });
} catch (error) {
  // On fast refresh an Auth instance may already exist.
  auth = getAuth(app);
}

const db = getFirestore(app);

// Analytics is only supported on web; guard to avoid crashes on native.
let analytics;
if (Platform.OS === "web") {
  isSupported()
    .then((supported) => {
      if (supported) {
        analytics = getAnalytics(app);
      }
    })
    .catch(() => {
      // Ignore analytics failures in unsupported environments.
    });
}

export { app, auth, db, analytics };
