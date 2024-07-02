import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-app.js";
import { getAuth, GoogleAuthProvider, onAuthStateChanged, signOut } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-auth.js";
import { getFirestore, collection, addDoc, query, getDocs , where } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js";


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

const profilePicture = document.querySelector('.profile-section');
const infoList = document.getElementById('profile-info');
const submitBut = document.querySelector('#submit-button');
const username = localStorage.getItem('username');
const email = localStorage.getItem('email');
const logInOut = document.getElementById('log-in-out');
const userPhotoUrl = localStorage.getItem('userPhoto');
const userNameProfile = document.getElementById('user-name');

onAuthStateChanged(auth, (user) => {
    updateUI(user);
  });

profilePicture.addEventListener('click', function () {
    infoList.style.display = (infoList.style.display === 'none' || infoList.style.display === '') ? 'block' : 'none';
  });

  function updateUI(user) {
    profilePicture.src = userPhotoUrl || 'User.webp';
    if (user) {
        userNameProfile.textContent = user.isAnonymous ? "Anonymous User" : (email);
      logInOut.textContent = 'Log Out';
    } else {
      logInOut.textContent = 'Log In';
      userNameProfile.style.display = "none";
    }

    
  if(email) {
    displayUser.textContent = email.charAt(0).toUpperCase();
  }

  }

const loginSection = () => {
        if (auth.currentUser) {
          auth.signOut();
        }
        localStorage.removeItem('username');
        localStorage.removeItem('email');
        window.location.href = 'login.html';
}

document.addEventListener('DOMContentLoaded', () => {
    const urlParams = new URLSearchParams(window.location.search);
    const title = urlParams.get('title');
    const description = urlParams.get('description');
    const imageUrl = urlParams.get('imageUrl');
    const username = urlParams.get('username');
    const date = urlParams.get('date');
    const currentBlogId = urlParams.get('id'); 
    const emailPerson = urlParams.get('email');
    const charUser = document.getElementById('displayUser');
    console.log(currentBlogId)
    document.title = urlParams.get('description');

    charUser.textContent =  username.charAt(0).toUpperCase();

    // Update DOM with blog details
    document.getElementById('title').textContent = title;
    document.getElementById('description').textContent = description;
    document.getElementById('date').textContent = date;
    document.getElementById('blog-image').src = imageUrl;

    if (emailPerson) {
    document.getElementById('name').textContent = emailPerson;
    }
    else {
      document.getElementById('name').textContent = "Anonymous";
    }
      const displayComments = async (blogId) => {
        const commentsContainer = document.getElementById('comment-Section');
        commentsContainer.innerHTML = ''; // Clear previous content (optional)
        
        const commentQuery = query(collection(db, 'comments'), where("blogId", "==", blogId));
        try {
          const querySnapshot = await getDocs(commentQuery);
      
          querySnapshot.forEach((doc) => {
            const commentData = doc.data();

            const displayUser = commentData.email ? commentData.email : commentData.username;

            const commentHTML = `
                <div class="display">
                    <div class="avatar placeholder image">
                        <div class="text-neutral-content rounded-full w-12 bkgd-green">
                            <span>${commentData.email.charAt(0).toUpperCase()}</span>
                        </div>
                    </div>
                    <div class="comment">
                        <p>${displayUser}</p>
                        <p>${commentData.text}</p>
                    </div>
                </div>`
                ;
            commentsContainer.innerHTML += commentHTML;
          });
        } catch (error) {
          console.error('Error displaying comments:', error);
        }
      };


      displayComments(currentBlogId);    

});

const addComment = () => {
    // Select the comment textarea
    let comment = document.querySelector('#comment');
    let para = comment.value.trim(); // Trim leading and trailing whitespace
  
    // Validate comment input
    if (para === '') {
      alert("Can't leave the comment empty!");
      return;
    }
    const urlParams = new URLSearchParams(window.location.search);
    const currentBlogId = urlParams.get('id'); 
  
    submitBut.innerHTML = "Loading...";
    submitBut.disabled = true;
  
    addDoc(collection(db, "comments"), {
      text: para,
      email: email,
      blogId : currentBlogId,
      username: username
    })
    .then(() => {
      
      submitBut.innerHTML = "Submit";
      submitBut.disabled = false;
    
      // Clear the comment textarea
      comment.value = '';
    })
    .catch((err) => {
      // Error handling
      console.error("Error adding comment:", err);
      submitBut.innerHTML = "Submit"; // Clear loading state
      submitBut.disabled = false; // Enable submit button
  
      alert("Failed to add comment. Please try again later.");
    });
  }
  


logInOut.addEventListener("click", loginSection);
submitBut.addEventListener("click", addComment);