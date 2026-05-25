import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth"; // <-- 1. IMPORTAMOS AUTH
import { getFirestore } from "firebase/firestore";
import { getStorage } from "firebase/storage";

const firebaseConfig = {
  apiKey: "AIzaSyB5UPmX2y_T8emM0DD_rCHew-2WMkwlDpc",
  authDomain: "histour-9d10e.firebaseapp.com",
  projectId: "histour-9d10e",
  storageBucket: "histour-9d10e.firebasestorage.app",
  messagingSenderId: "998189882000",
  appId: "1:998189882000:web:760fe2e1a393d5a7ce5615"
};

// Inicializar Firebase
const app = initializeApp(firebaseConfig);

// Exportar autenticación, base de datos y almacenamiento para usarlos en toda tu app
export const auth = getAuth(app); // <-- 2. EXPORTAMOS AUTH
export const db = getFirestore(app);
export const storage = getStorage(app);