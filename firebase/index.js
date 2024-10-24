import { initializeApp } from "firebase/app";
import { getAuth, initializeAuth, getReactNativePersistence } from "firebase/auth"
import { getDatabase, ref, set, onValue } from "firebase/database";
import AsyncStorage from "@react-native-async-storage/async-storage";

// const firebaseConfig = {
//     apiKey: "AIzaSyAQddWdX9_j3uXc-6iiacfaPUUoZAqASFY",
//     authDomain: "co-act-app.firebaseapp.com",
//     databaseURL: "https://co-act-app-default-rtdb.asia-southeast1.firebasedatabase.app",
//     projectId: "co-act-app",
//     storageBucket: "co-act-app.appspot.com",
//     messagingSenderId: "178673755863",
//     appId: "1:178673755863:web:eff44985bd7bb551f4b292",
//     measurementId: "G-EF57XJYTQ2"
// };

const firebaseConfig = {
    apiKey: process.env.EXPO_PUBLIC_FIREBASE_API_KEY,
    authDomain: process.env.EXPO_PUBLIC_FIREBASE_AUTH_DOMAIN,
    databaseURL:process.env.EXPO_PUBLIC_DATABASE_URL,
    projectId: process.env.EXPO_PUBLIC_PROJECT_ID,
    storageBucket: process.env.EXPO_PUBLIC_STORAGE_BUCKET,
    messagingSenderId: process.env.EXPO_PUBLIC_MESSAGING_SENDER_ID,
    appId: process.env.EXPO_PUBLIC_APP_ID,
};

export const app = initializeApp(firebaseConfig);
export const auth = initializeAuth(app, {
    persistence: getReactNativePersistence(AsyncStorage)
});
export const database = getDatabase(app);