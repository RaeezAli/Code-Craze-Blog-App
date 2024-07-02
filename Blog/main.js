
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-app.js";
import { getFirestore, collection, addDoc } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js";
import { getStorage, ref, uploadBytes, getDownloadURL } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-storage.js";
import { getAuth , onAuthStateChanged } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-auth.js";

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
const storage = getStorage(app);
const userPhotoUrl = localStorage.getItem('userPhoto');
const cancelBtn = document.getElementById('cancle');
const profilePicture = document.getElementById('profile-section');
const infoList = document.getElementById('profile-info');
const userName = document.getElementById('user-name');
const logInOut = document.getElementById('log-in-out');
const displayUser = document.getElementById('displayUser');
const email = localStorage.getItem('email');

profilePicture.addEventListener('click', function () {

  if (infoList.style.display === 'none' || infoList.style.display === '') {
    infoList.style.display = 'block';
  } else {
    infoList.style.display = 'none';
  }
});

function updateUI(user) {

  if (user) {
      // User is signed in
      if (user.isAnonymous) {
        
        userName.textContent = "Anonymous User";
        logInOut.textContent = 'Log In';
      } else {
        
          userName.textContent = email || "User";
          logInOut.textContent = 'Log Out';
          
      }
  } else {
      // User is not signed in
        logInOut.textContent = 'Log In';
      userName.style.display = "none";
  }

  if(email) {
    displayUser.textContent = email.charAt(0).toUpperCase();
  }

}

// Listen for changes in authentication state
onAuthStateChanged(auth, (user) => {
  updateUI(user); // Update UI based on authentication status
});

logInOut.addEventListener('click', () => {


  if (auth.currentUser) {
    auth.signOut();
    window.location.href = 'login.html';

  } else {
    window.location.href = 'login.html';
  }

});

cancelBtn.addEventListener('click', () => {
  window.location.href = 'index.html';
});

document.addEventListener('DOMContentLoaded', () => {
  const saveBtn = document.getElementById('save');
  
    saveBtn.addEventListener('click', async () => {
    const title = document.getElementById('title').value;
    const category = document.getElementById('category').value;
    const type = document.querySelector('input[name="type"]:checked').value;
    const status = document.querySelector('input[name="status"]:checked').value;
    const description = document.getElementById('description').value;
    const imageFile = document.getElementById('image').files[0];

    const username = localStorage.getItem('username');

    if (title == '' || category == '' || type == '' || status == '' || description == '' || imageFile == '') {
      alert('Please fill in all required fields.');
      return;
    }

    saveBtn.innerHTML = "Loading...";
    saveBtn.disabled = true;

    await saveDataToFirestore(title, category, type, status, description, imageFile, username , email);

    saveBtn.innerHTML = "Save";
    saveBtn.disabled = false;

    alert("Blog is saved successfully");
    window.location.reload();
  });

  
});

async function saveDataToFirestore(title, category, type, status, description, imageFile, username, email) {
  const now = new Date();
  const timestamp = now.getTime();
  const blogId = generateBlogId(); // Generate or fetch the blog ID somehow

  try {
    const imageName = `${blogId}/${timestamp}_${imageFile.name}`;
    const storageRef = ref(storage, 'images/' + imageName);
    
    const snapshot = await uploadBytes(storageRef, imageFile);
    const imageUrl = await getDownloadURL(snapshot.ref);
    const formattedDate = `${now.getDate()}-${now.getMonth() + 1}-${now.getFullYear()}`;

    const blogRef = collection(db, 'blogs');
    const docRef = await addDoc(blogRef, {
      title: title,
      email: email,
      category: category,
      type: type,
      status: status,
      description: description,
      imageUrl: imageUrl,
      username: username,
      date: formattedDate,
      blogId: blogId // Optionally store blogId in Firestore for reference
    });

    console.log('Document written with ID:', docRef.id);
    return docRef.id;
  } catch (error) {
    console.error('Error adding document:', error);
    throw error; // Propagate the error for handling at a higher level
  }
}

function generateBlogId() {
  // Generate a timestamp to create a unique ID
  const timestamp = new Date().getTime();

  // Return the generated ID
  return `blog_${timestamp}`;
}






