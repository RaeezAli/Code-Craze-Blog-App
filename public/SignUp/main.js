import { auth, db } from "../firebase.js";
import {
  doc,
  setDoc,
  getDoc,
} from "https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js";
import {
  createUserWithEmailAndPassword,
  GoogleAuthProvider,
  signInWithPopup,
  signInAnonymously,
  onAuthStateChanged,
} from "https://www.gstatic.com/firebasejs/10.12.2/firebase-auth.js";
const provider = new GoogleAuthProvider();

const appleSignUpButton = document.querySelector(".apple-login-button");
const passwordInput = document.getElementById("password-input");
const showPassword = document.getElementById("showPassword");
const googleSignUpButton = document.querySelector(".google-signUp-button");

// Modal Elements
const usernameModal = document.getElementById("username-modal");
const usernamePromptForm = document.getElementById("username-prompt-form");
const modalUsernameInput = document.getElementById("modal-username-input");

let tempUser = null; // Store user object during OAuth until username is provided

// Show and Hide Password Button
showPassword.addEventListener("click", () => {
  if (passwordInput.type === "password") {
    passwordInput.type = "text";
    showPassword.textContent = "Hide";
  } else {
    passwordInput.type = "password";
    showPassword.textContent = "Show";
  }
});

// Create Account with Email and Password
document.addEventListener("DOMContentLoaded", function () {
  const signUpForm = document.querySelector(".user-Data-Input");

  signUpForm.addEventListener("submit", function (e) {
    e.preventDefault();

    const username = signUpForm.querySelector("#userName-input").value;
    const email = signUpForm.querySelector("#email-input").value;
    const password = signUpForm.querySelector("#password-input").value;

    signUpUser(email, password, username);
  });
});

function signUpUser(email, password, username) {
  createUserWithEmailAndPassword(auth, email, password)
    .then((userCredential) => {
      const user = userCredential.user;
      const signUpMethod = "emailPassword";
      addUserToFirestore(user.uid, email, username, signUpMethod);
      window.location.href = "index.html";
    })
    .catch((error) => {
      if (error.code === "auth/email-already-in-use") {
        alert("This email is already registered. Please go to the login page.");
        window.location.href = "login.html";
      } else {
        console.error(error.message);
        alert(error.message);
      }
    });
}

// Login/Sign Up With Google
googleSignUpButton.addEventListener("click", async () => {
  const provider = new GoogleAuthProvider();
  try {
    const result = await signInWithPopup(auth, provider);
    const user = result.user;
    
    // Check if user already exists in Firestore
    const userDocRef = doc(db, "users", user.uid);
    const userDoc = await getDoc(userDocRef);

    if (userDoc.exists()) {
      // User already signed up, go to home
      alert("Welcome back! You are already signed up.");
      window.location.href = "index.html";
    } else {
      // New user via Google, ask for username
      tempUser = user;
      usernameModal.style.display = "flex";
    }
  } catch (error) {
    console.error("Error during Google sign-in: ", error);
    alert("Authentication failed: " + error.message);
  }
});

// Handle Username Prompt Submission
usernamePromptForm.addEventListener("submit", async (e) => {
  e.preventDefault();
  const username = modalUsernameInput.value.trim();
  
  if (username && tempUser) {
    try {
      await addUserToFirestore(tempUser.uid, tempUser.email, username, "googleSignUp");
      usernameModal.style.display = "none";
      alert("Account created successfully!");
      window.location.href = "index.html";
    } catch (error) {
      console.error("Error saving username:", error);
      alert("Failed to save username. Please try again.");
    }
  }
});

// Function to add user data to Firestore
async function addUserToFirestore(uid, email, username, signUpMethod) {
  const userDocRef = doc(db, "users", uid);

  try {
    await setDoc(userDocRef, {
      email: email,
      username: username,
      signUpMethod: signUpMethod,
      createdAt: new Date()
    });
    console.log("User data added to Firestore");
  } catch (error) {
    console.error("Error adding document: ", error);
    throw error;
  }
}

// Anonymous Sign In (Currently mapped to the Apple-styled button)
appleSignUpButton.addEventListener("click", async () => {
  signInAnonymously(auth)
    .then((userCredential) => {
      const user = userCredential.user;
      console.log("User signed in anonymously:", user.uid);
      window.location.href = "index.html";
    })
    .catch((error) => {
      console.error("Error signing in anonymously:", error);
      alert("Anonymous sign-in failed.");
    });
});

onAuthStateChanged(auth, (user) => {
  if (user && user.isAnonymous) {
    const anonymousUserDocRef = doc(db, "anonymousUsers", user.uid);
    setDoc(anonymousUserDocRef, {
      uid: user.uid,
      createdAt: new Date(),
    }).catch((error) => {
      console.error("Error saving data for anonymous user:", error);
    });
  }
});
