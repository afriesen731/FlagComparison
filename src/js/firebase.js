import { initializeApp } from "firebase/app";
import { getStorage, ref } from "firebase/storage"
import { 
    memoryLocalCache, initializeFirestore, collection,
} from "firebase/firestore";




// firebase configuration
export const firebaseConfig = {
    apiKey: process.env.FIREBASE_API_KEY,
    authDomain: process.env.FIREBASE_AUTH_DOMAIN,
    projectId: process.env.FIREBASE_PROJECT_ID,
    storageBucket: process.env.FIREBASE_STORAGE_BUCKET,
    messagingSenderId: process.env.FIREBASE_MESSAGING_SENDER_ID,
    appId: process.env.FIREBASE_APP_ID,
    measurementId: process.env.FIREBASE_MEASUREMENT_ID,
};
  
// Initialize Firebase
export const app = initializeApp(firebaseConfig);
export const db = initializeFirestore(app, {localCache: memoryLocalCache()}); //adds reload storage
export const flagsRef = collection(db, 'flags');
export const storage = getStorage();
export const imgDirRef = ref(storage, "flags");