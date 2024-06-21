import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-app.js";
import { getStorage, ref, uploadBytesResumable ,listAll, getDownloadURL } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-storage.js";
import { getAuth , onAuthStateChanged } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-auth.js";
import { getFirestore, collection, getDocs, } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js";


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
const storage = getStorage();

const profilePicture = document.getElementById('profile-picture');
const infoList = document.getElementById('profile-info');
const logInOut = document.getElementById('log-in-out');
const userName = document.getElementById('user-name');
const blogPage = document.getElementById('blog-button');
const username = localStorage.getItem('username');
const userPhotoUrl = localStorage.getItem('userPhoto');

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

document.addEventListener('DOMContentLoaded', async () => {

  const mediaQuery = window.matchMedia("(min-width: 300px) and (max-width: 700px)");

  function handleScreenChange(e) {
      const list = document.getElementById('profile-List');

      const appendedItems = document.querySelectorAll('.appended-item');
      // appendedItems.forEach(item => item.remove());

      if (e.matches) {
        
          const li = document.createElement('li');
          li.textContent = 'Write or Ask';
          li.classList.add('appended-item');

          list.prepend(li);
          li.addEventListener('click', () => {

            const user = auth.currentUser;
  if (user) {
    if (user.isAnonymous) {
      alert('Anonymous users cannot access the blog. Please sign in with an email or Google account.');
    } else {
      window.location.href = 'blog.html';
    }
  } else {
    alert('Please log in first.');
  }

          }); 
      }
  }

  handleScreenChange(mediaQuery);

  mediaQuery.addListener(handleScreenChange);


  const qnaDataContainer = document.getElementById('qnaData');

  async function fetchBlogs() {
    const querySnapshot = await getDocs(collection(db, 'blogs'));
    const allBlogs = querySnapshot.docs.map(doc => doc.data());

    displayBlogs(allBlogs);
  }

  function displayBlogs(blogs) {

    console.log(blogs)
    qnaDataContainer.innerHTML = "";

    blogs.forEach(data => {
      const div = document.createElement("div");
      div.setAttribute("class", "question");
      div.addEventListener('click', () => questionSection(data));

      div.innerHTML = `
        <div class="info-Data">
          <div class="heading">
            <h1>${data.title}</h1>
          </div>
          <div class="description">
            <p>${data.description}</p>
          </div>
          <div class="admin-info">
            <span class="admin-Name"><i class="fa-solid fa-user"></i> ${data?.username}</span>
            <span class="issue-Date">${data?.date}</span>
          </div>
        </div>
        <div class="image-Section" id='image-Section'>
        </div>
      `;

      qnaDataContainer.appendChild(div);
    });
  }

  // Call the fetchBlogs function to load the blogs initially
  await fetchBlogs();
});

// Example function for handling clicks on blog entries
function questionSection(data) {
  // Implement your functionality here
  console.log('Blog clicked:', data);
}

blogPage.addEventListener('click', () => {
  const user = auth.currentUser;
  if (user) {
    if (user.isAnonymous) {
      alert('Anonymous users cannot access the blog. Please sign in with an email or Google account.');
    } else {
      window.location.href = 'blog.html';
    }
  } else {
    alert('Please log in first.');
  }
});

async function getImageUrls() {
  const storage = getStorage();
  const storageRef = ref(storage, 'images'); // Update path to your images directory

  try {
    // Get a list of all items (images) in the specified directory
    const itemsSnapshot = await getDownloadURL(storageRef);

    // Map each item to its download URL
    const imageUrls = itemsSnapshot.items.map((item) => item.downloadURL);

    return imageUrls; // Return an array of download URLs
  } catch (error) {
    console.error('Error fetching image URLs:', error);
    throw error; // Throw the error to be caught by the caller
  }
}

// Function to load and display images
async function loadImages() {
  try {
    // Fetch the image download URLs using getImageUrls function
    const imageUrls = await getImageUrls();

    // Reference to the image container
    const imageContainer = document.getElementById('imageContainer');

    // Create img elements for each image URL and append to the container
    imageUrls.forEach((imageUrl) => {
      const imgElement = document.createElement('img');
      imgElement.src = imageUrl;
      imageContainer.appendChild(imgElement);
    });
  } catch (error) {
    console.error('Error loading images:', error);
  }
}

document.addEventListener('DOMContentLoaded', loadImages);