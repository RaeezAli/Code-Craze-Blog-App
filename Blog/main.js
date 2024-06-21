
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-app.js";
import { getFirestore, collection, addDoc } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js";
import { getStorage, ref, uploadString, getDownloadURL } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-storage.js";
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
const profilePicture = document.getElementById('profile-picture');
const infoList = document.getElementById('profile-info');
const username = localStorage.getItem('username');
const userName = document.getElementById('user-name');
const logInOut = document.getElementById('log-in-out');


profilePicture.addEventListener('click', function () {

  if (infoList.style.display === 'none' || infoList.style.display === '') {
    infoList.style.display = 'block';
  } else {
    infoList.style.display = 'none';
  }
});

function updateUI(user) {

  if(userPhotoUrl) {
    profilePicture.src = userPhotoUrl;
  }

  else{
    profilePicture.src = 'User.webp'
  }

  if (user) {
      // User is signed in
      if (user.isAnonymous) {
        
        userName.textContent = "Anonymous User";
        logInOut.textContent = 'Log In';
      } else {
        
          userName.textContent = username || "User";
          logInOut.textContent = 'Log Out';
          
      }
  } else {
      // User is not signed in
        logInOut.textContent = 'Log In';
      userName.style.display = "none";
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

    if (!title || !category || !type || !status || !description || !imageFile) {
      alert('Please fill in all required fields.');
      return;
    }

    await saveDataToFirestore(title, category, type, status, description, imageFile, username);
  });
});

async function saveDataToFirestore(title, category, type, status, description, imageFile , username) {
  // Upload image to Firebase Storage
  const storageRef = ref(storage, 'images/' + imageFile.name);
  await uploadString(storageRef, imageFile);

  // Get the download URL of the uploaded image
  const imageUrl = await getDownloadURL(storageRef);

  const now = new Date();
  const day = String(now.getDate()).padStart(2, '0');
  const month = String(now.getMonth() + 1).padStart(2, '0');
  const year = now.getFullYear();
  const formattedDate = `${day}-${month}-${year}`;
  
  try {
    await addDoc(collection(db, 'blogs'), {
      title: title,
      category: category,
      type: type,
      status: status,
      description: description,
      imageUrl: imageUrl,
      username: username,
      date: formattedDate
    });

  } catch (error) {
    console.error('Error adding document: ', error);
  }
}






