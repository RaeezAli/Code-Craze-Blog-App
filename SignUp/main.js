import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-app.js";
import { getFirestore, doc, setDoc } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js";
import { getAuth , createUserWithEmailAndPassword , GoogleAuthProvider, signInWithPopup , signInAnonymously, onAuthStateChanged } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-auth.js";

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
const db = getFirestore(app);
const auth = getAuth(app);
const provider = new GoogleAuthProvider();

const appleSignUpButton = document.querySelector('.apple-login-button');
const passwordInput = document.getElementById('password-input');
const showPassword = document.getElementById('showPassword');
const googleSignUpButton = document.querySelector('.google-signUp-button');


// Show and Hide Password Button
showPassword.addEventListener('click', () => {
        if (passwordInput.type === 'password') {
        passwordInput.type = 'text';
        showPassword.textContent = 'Hide';
      } else {
        passwordInput.type = 'password';
        showPassword.textContent = 'Show';
    }
});


// Login with Email and Password

document.addEventListener('DOMContentLoaded', function () {
    const signUpForm = document.querySelector('.user-Data-Input');
    
    signUpForm.addEventListener('submit', function (e) {
        e.preventDefault();
        
        const username = signUpForm.querySelector('#userName-input').value;
        const email = signUpForm.querySelector('#email-input').value;
        const password = signUpForm.querySelector('#password-input').value;

        signUpUser(email, password, username);
    });
});

function signUpUser(email, password, username) {
    createUserWithEmailAndPassword(auth, email, password)
        .then((userCredential) => {
            const user = userCredential.user;
            const signUpMethod = 'emailPassword'; // Set sign-up method
            addUserToFirestore(user.uid, email, username, signUpMethod);
            window.location.href = 'index.html'; // Change 'index.html' to your actual home page URL
        })
        .catch((error) => {
            console.error(error.message);
        });
}



// Login With Google Id 

googleSignUpButton.addEventListener('click', async () => {
    const provider = new GoogleAuthProvider();
    try {
        const result = await signInWithPopup(auth, provider);
        const user = result.user;
        const signUpMethod = 'googleSignUp'; // Set sign-up method for Google
        
        // Call function to add user data to Firestore
        addUserToFirestore(user.uid, user.email, user.displayName || '', signUpMethod);
        
        // Redirect to login page after sign-in attempt
        window.location.href = 'login.html'; // Change 'login.html' to your actual login page URL
    } catch (error) {
        console.error('Error during Google sign-in: ', error);
        // Handle sign-in errors here, such as displaying an error message to the user
    }
});

// Function to add user data to Firestore
function addUserToFirestore(uid, email, username, signUpMethod) {
    const userDocRef = doc(db, 'users', uid);

    setDoc(userDocRef, {
        email: email,
        username: username,
        signUpMethod: signUpMethod
    })
    .then(() => {
        console.log("User data added to Firestore");
        // Optionally, redirect to another page or handle post-signup actions here
    })
    .catch((error) => {
        console.error("Error adding document: ", error);
        // Handle Firestore data addition errors here
    });
}


onAuthStateChanged(auth, (user) => {
    if (user && user.isAnonymous) {
        // User is signed in anonymously
        console.log("User is signed in anonymously:", user.uid);

        // Save data for anonymous user in Firestore
        const anonymousUserDocRef = doc(db, 'anonymousUsers', user.uid);
        setDoc(anonymousUserDocRef, {
            uid: user.uid,
            createdAt: new Date(),
            // Add any additional data you want to save for the anonymous user
        })
        .then(() => {
            console.log("Data saved for anonymous user");
        })
        .catch((error) => {
            console.error("Error saving data for anonymous user:", error);
        });
    } else {
        // User is not signed in anonymously or there's no user
        console.log("User is not signed in anonymously.");
    }
});


// Login With Anonymous Id 
appleSignUpButton.addEventListener('click', async () => {
    signInAnonymously(auth)
        .then((userCredential) => {
            // User signed in anonymously
            const user = userCredential.user;
            console.log("User signed in anonymously:", user.uid);
            // You can redirect to a different page or load additional content here
            window.location.href = 'index.html';
        })
        .catch((error) => {
            console.error("Error signing in anonymously:", error);
            // Handle errors here, such as displaying an error message to the user
        });
});






































