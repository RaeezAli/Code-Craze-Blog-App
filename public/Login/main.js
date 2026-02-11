import { auth, db } from "../firebase.js";
import { signInWithEmailAndPassword , signInWithPopup , GoogleAuthProvider , signInAnonymously, onAuthStateChanged } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-auth.js";
import { collection, query, where, getDoc , doc , getDocs } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js";
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
        window.location.href = "index.html";
    }
});

// Login form submit event listener
const loginForm = document.querySelector('.user-Data-Input');

loginForm.addEventListener('submit', async (e) => {
    e.preventDefault();

    const email = loginForm.querySelector('#email-input').value;
    const password = loginForm.querySelector('#password-input').value;

    try {
        // Step 1: Attempt Authentication First
        const userCredential = await signInWithEmailAndPassword(auth, email, password);
        const user = userCredential.user;
        console.log("User signed in:", user.uid);

        // Step 2: Fetch User Data from Firestore After Authentication (when permissions are granted)
        const userDocRef = doc(db, 'users', user.uid);
        const userDoc = await getDoc(userDocRef);

        if (userDoc.exists()) {
            const userData = userDoc.data();
            // Optional: You can check if the signup method matches, but usually Auth + Firestore doc is enough
            console.log("User profile loaded:", userData.username);
            window.location.href = 'index.html'; 
        } else {
            console.error("Authenticated but no user document found.");
            // This might happen if someone signed up long ago or via a different method
            // Fallback: Redirect to index, Landing/main.js will handle missing data
            window.location.href = 'index.html';
        }

    } catch (error) {
        console.error("Error during login:", error);
        
        let message = "An error occurred. Please try again.";
        if (error.code === 'auth/invalid-credential' || error.code === 'auth/wrong-password' || error.code === 'auth/user-not-found') {
            message = "Invalid email or password. Please check your credentials.";
        } else if (error.code === 'auth/too-many-requests') {
            message = "Too many failed attempts. Please try again later.";
        }
        
        alert(message);
    }
});


googleSignInButton.addEventListener('click', async () => {
    const provider = new GoogleAuthProvider();
    try {
        const result = await signInWithPopup(auth, provider);
        const user = result.user;
        
        // Check if user exists in Firestore based on UID (more reliable than email query)
        const userDocRef = doc(db, 'users', user.uid);
        const userDoc = await getDoc(userDocRef);

        if (userDoc.exists()) {
            console.log("User signed in with Google:", user.email);
            window.location.href = 'index.html';
        } else {
            // User authenticated with Google but no record in Firestore
            console.error("User does not exist in Firestore. Redirecting to sign-up.");
            alert("No account found for this Google user. Please sign up first.");
            // Optional: You could allow them to sign up here instead of just alerting
            window.location.href = 'signUp.html';
        }
    } catch (error) {
        console.error('Error during Google sign-in: ', error);
        alert("Google sign-in failed: " + error.message);
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