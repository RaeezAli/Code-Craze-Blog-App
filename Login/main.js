import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-app.js";
import { getAuth, signInWithEmailAndPassword , signInWithPopup , GoogleAuthProvider , signInAnonymously, onAuthStateChanged } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-auth.js";
import { getFirestore, collection, query, where, getDoc , doc , getDocs } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js";

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
const auth = getAuth(app);
const db = getFirestore(app);
const usersCollection = collection(db, 'users');

const signInAnonymous = document.querySelector('.apple-login-button');
const showPasswordElement = document.getElementById('showPassword');
const passwordInput = document.getElementById('password-input');
const googleSignInButton = document.querySelector('.login-google-button');


showPasswordElement.addEventListener('click', () => {
    if (passwordInput.type === 'password') {
        passwordInput.type = 'text';
        showPasswordElement.textContent = 'Hide';
    } else {
        passwordInput.type = 'password';
        showPasswordElement.textContent = 'Show';
    }
});


onAuthStateChanged(auth, (user) => {
    if (user) {
        
    //   window.location.href = "index.html";
    }
  });

// Login form submit event listener
const loginForm = document.querySelector('.user-Data-Input');

loginForm.addEventListener('submit', async (e) => {
    e.preventDefault();

    const email = loginForm.querySelector('#email-input').value;
    const password = loginForm.querySelector('#password-input').value;

    // Check if user exists in Firestore based on email
    const usersCollection = collection(db, 'users');
    const usersQuery = query(usersCollection, where('email', '==', email));
    const querySnapshot = await getDocs(usersQuery);

    if (!querySnapshot.empty) {
        // User exists, proceed with sign-in
        querySnapshot.forEach((doc) => {
            const userData = doc.data();
            const signUpMethod = userData.signUpMethod;

            if (signUpMethod === 'emailPassword') {
                
                signInWithEmailAndPassword(auth, email, password)
                    .then((userCredential) => {
                        
                        const user = userCredential.user;
                        console.log("User signed in:", user.uid);
                        localStorage.setItem('username', userData.username);
                        localStorage.setItem('email', userData.email);
                        window.location.href = 'index.html'; 
                    })
                    .catch((error) => {
                        console.error("Error signing in:", error);
                        
                    });
            } else if (signUpMethod === 'googleSignUp') {
                
                console.log("User signed up with Google. Implement Google sign-in logic.");
            } else {
                
                console.error("Unknown sign-up method or invalid data.");
            }
        });
    } else {
        
        console.error("User does not exist. Please sign up first.");
        
    }
});


googleSignInButton.addEventListener('click', async () => {
    const provider = new GoogleAuthProvider();
    try {
        const result = await signInWithPopup(auth, provider);
        const user = result.user;
        
        // Check if user exists in Firestore based on email
        const usersCollection = collection(db, 'users');
        const usersQuery = query(usersCollection, where('email', '==', user.email));
        const querySnapshot = await getDocs(usersQuery);

        if (!querySnapshot.empty) {
            // User exists in Firestore, proceed with sign-in
            querySnapshot.forEach((doc) => {
                const userData = doc.data();
                const signUpMethod = userData.signUpMethod;
                
                if (signUpMethod === 'googleSignUp') {
                    // User signed up with Google, proceed with sign-in
                    console.log("User exists with Google sign-up:", user.email);
                    localStorage.setItem('name', user.username);
                    localStorage.setItem('email', user.email);
                    window.location.href = 'index.html'; // Change 'index.html' to your actual index page URL
                } else {
                    // User did not sign up with Google, display error message or handle as needed
                    console.error("User did not sign up with Google.");
                    // Display an error message to the user indicating that they need to sign up with Google
                }
            });
        } else {
            // User does not exist in Firestore, display error message or handle as needed
            console.error("User does not exist in Firestore.");
            // Display an error message to the user indicating that they need to sign up first
        }
    } catch (error) {
        console.error('Error during Google sign-in: ', error);
        // Handle sign-in errors here, such as displaying an error message to the user
    }
});

signInAnonymous.addEventListener('click', () => {
    signInAnonymously(auth)
    .then((result) => {
        const user = result.user;
        console.log("Anonymous user signed in:", user.uid);
          // Redirect to index page
        window.location.href = 'index.html';
    })
    .catch((error) => {
        console.error("Error signing in anonymously:", error);
    });
})