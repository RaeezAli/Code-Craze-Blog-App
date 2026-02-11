import { auth, db, storage } from "../firebase.js";
import { ref , listAll, getDownloadURL } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-storage.js";
import { onAuthStateChanged } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-auth.js";
import { collection, getDocs, doc , getDoc} from "https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js";

const profilePicture = document.getElementById('bkgd-green');
const infoList = document.getElementById('profile-info');
const logInOut = document.getElementById('log-in-out');
const displayUserName = document.getElementById('user-name');
const blogPage = document.getElementById('blog-button');
const displayUser = document.getElementById('displayUser');
const searchBar = document.getElementById('searchBar');

let allBlogsCache = [];


profilePicture.addEventListener('click', function () {
  infoList.style.display = (infoList.style.display === 'none' || infoList.style.display === '') ? 'block' : 'none';
});

function updateUI(user, userData = null) {
  
  if (user) {
    let displayName = "User";

    if (user.isAnonymous) {
        displayName = "Anonymous User";
    } else {
        // Fallback chain: Firestore Username -> Firestore Email -> Auth Display Name -> Auth Email -> "User"
        displayName = userData?.username || userData?.email || user.displayName || user.email || "User";
    }

    const firstLetter = displayName.charAt(0).toUpperCase();

    displayUserName.textContent = displayName;
    displayUser.textContent = firstLetter;
    displayUserName.style.display = "block";
    logInOut.textContent = 'Log Out';
  } else {
    logInOut.textContent = 'Log In';
    displayUserName.style.display = "none";
    displayUser.textContent = "U";
  }
}

onAuthStateChanged(auth, async (user) => {
  if (user) {
      // Fetch user data from Firestore
      const userDocRef = doc(db, user.isAnonymous ? 'anonymousUsers' : 'users', user.uid);
      try {
          const userDoc = await getDoc(userDocRef);
          if (userDoc.exists()) {
              updateUI(user, userDoc.data());
          } else {
              updateUI(user);
          }
      } catch (error) {
          console.error("Error fetching user data:", error);
          updateUI(user);
      }
  } else {
      updateUI(null);
  }
});

logInOut.addEventListener('click', () => {
  if (auth.currentUser) {
    auth.signOut();
  }
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
      allBlogsCache = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      await displayBlogs(allBlogsCache);
    } catch (error) {
      console.error('Error fetching blogs:', error);
    }
  }

  if (searchBar) {
    searchBar.addEventListener('input', (e) => {
      const searchTerm = e.target.value.toLowerCase();
      const filteredBlogs = allBlogsCache.filter(blog => 
        (blog.title && blog.title.toLowerCase().includes(searchTerm)) || 
        (blog.description && blog.description.toLowerCase().includes(searchTerm))
      );
      displayBlogs(filteredBlogs);
    });
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



