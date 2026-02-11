// firebase.js
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-app.js";
import { getAuth } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-auth.js";
import { getFirestore } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js";
import { getStorage } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-storage.js";

const firebaseConfig = {
  apiKey: "AIzaSyBdEgmy88sot8nITGiit9Ujm1w4_dG5vBg",
  authDomain: "code-craze-blog-app.firebaseapp.com",
  databaseURL: "https://code-craze-blog-app-default-rtdb.firebaseio.com",
  projectId: "code-craze-blog-app",
  storageBucket: "code-craze-blog-app.appspot.com",
  messagingSenderId: "812380418108",
  appId: "1:812380418108:web:8aa1a0f43b0f98455d5339",
  measurementId: "G-C6CK3W9WDC"
};

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app);
export const storage = getStorage(app);