import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-app.js";
import { getStorage, ref , listAll, getDownloadURL } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-storage.js";
import { getAuth , onAuthStateChanged } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-auth.js";
import { getFirestore, collection, getDocs, doc , getDoc} from "https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js";


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
const storage = getStorage(app);

const profilePicture = document.getElementById('bkgd-green');
const infoList = document.getElementById('profile-info');
const logInOut = document.getElementById('log-in-out');
const displayUserName = document.getElementById('user-name');
const blogPage = document.getElementById('blog-button');
const username = localStorage.getItem('name');
const email = localStorage.getItem('email');
const userPhotoUrl = localStorage.getItem('userPhoto');
const displayUser = document.getElementById('displayUser');


profilePicture.addEventListener('click', function () {
  infoList.style.display = (infoList.style.display === 'none' || infoList.style.display === '') ? 'block' : 'none';
});

function updateUI(user) {
  
  if (user) {
    displayUserName.textContent = user.isAnonymous ? "Anonymous User" : (email || "User");
    logInOut.textContent = 'Log Out';
  } else {
    logInOut.textContent = 'Log In';
    displayUserName.style.display = "none";
  }

  
  if(email) {
    displayUser.textContent = email.charAt(0).toUpperCase();
  }
}

onAuthStateChanged(auth, (user) => {
  updateUI(user);
});

logInOut.addEventListener('click', () => {
  if (auth.currentUser) {
    auth.signOut();
  }
  localStorage.removeItem('userPhoto');
  localStorage.removeItem('username');
  localStorage.removeItem('email');
  window.location.href = 'login.html';
});


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


document.addEventListener('DOMContentLoaded', async () => {
  const mediaQuery = window.matchMedia("(min-width: 300px) and (max-width: 700px)");
  
  function handleScreenChange(e) {
    const list = document.getElementById('profile-List');
    const appendedItems = document.querySelectorAll('.appended-item');
    appendedItems.forEach(item => item.remove());

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
    try {
      const querySnapshot = await getDocs(collection(db, 'blogs'));
      const allBlogs = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      await displayBlogs(allBlogs);
    } catch (error) {
      console.error('Error fetching blogs:', error);
    }
  }

  async function displayBlogs(blogs) {
    qnaDataContainer.innerHTML = "";
  
    try {

      for (const [index, data] of blogs.entries()) {
        const div = document.createElement("div");
        div.className = "question";
        div.addEventListener('click', () => openBlog(data));
        div.innerHTML = `
          <div class="info-Data">
            <div class="heading">
              <h1>${data.title}</h1>
            </div>
            <div class="description">
              <p>${data.description}</p>
            </div>
            <div class="admin-info">
              <span class="admin-Name"><i class="fa-solid fa-user"></i> ${data.username ? data.username : data.email}</span>
              <span class="issue-Date">${data.date}</span>
            </div>
          </div>
          <div class="image-Section" id="image-Section-${index}">
          </div>
        `;
        qnaDataContainer.appendChild(div);
  
        // Load images for the current blog
        loadImages(data.id, `image-Section-${index}`);
      }
    } catch (error) {
      console.error('Error displaying blogs:', error);
    }
  }


  function openBlog(data) {
    const user = auth.currentUser;
    if (user) {
      if (user.isAnonymous) {
        alert('Anonymous users cannot access the blog. Please sign in with an email or Google account.');
      } else {
        const queryString = new URLSearchParams({
          email: data.email,
          title: data.title,
          id: data.blogId,
          description: data.description,
          imageUrl: data.imageUrl, // Replace with actual image URL property
          username: data.username,
          date: data.date
        }).toString();
      
        window.location.href = `blog-details.html?${queryString}`;
      }
    } else {
      alert('Please log in first.');
    }
  }
  await fetchBlogs();

});

async function loadImages(blogId, containerId) {
  try {
    const imagesContainer = document.getElementById(containerId);
    const blogRef = doc(db, 'blogs', blogId);
    const docSnapshot = await getDoc(blogRef);

    if (!docSnapshot.exists()) {
      console.log('Blog with blogId not found:', blogId);
      return;
    }

    const data = docSnapshot.data();
    const imageUrl = data.imageUrl;

    if (!imageUrl) {
      console.log('No image URL found for blogId:', blogId);
      return;
    }

    console.log('Loading image:', imageUrl);

    const imgElement = document.createElement('img');
    imgElement.src = imageUrl;
    imagesContainer.appendChild(imgElement);

  } catch (error) {
    console.error('Error loading image:', error);
  }
}



