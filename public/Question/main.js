import { auth, db } from "../firebase.js";
import { GoogleAuthProvider, onAuthStateChanged, signOut } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-auth.js";
import { collection, addDoc, query, getDocs, where, doc, getDoc, updateDoc, arrayUnion, arrayRemove } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js";

const profilePicture = document.querySelector('.profile-section');
const infoList = document.getElementById('profile-info');
const submitBut = document.querySelector('#submit-button');
const logInOut = document.getElementById('log-in-out');
const userNameProfile = document.getElementById('user-name');
const displayUser = document.getElementById('displayUser');

let currentUserData = null;

onAuthStateChanged(auth, async (user) => {
    if (user) {
        const userDocRef = doc(db, user.isAnonymous ? 'anonymousUsers' : 'users', user.uid);
        try {
            const userDoc = await getDoc(userDocRef);
            if (userDoc.exists()) {
                currentUserData = userDoc.data();
                updateUI(user, currentUserData);
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

profilePicture.addEventListener('click', function (e) {
    e.stopPropagation(); // Prevent immediate closing if we add a document listener later
    infoList.style.display = (infoList.style.display === 'none' || infoList.style.display === '') ? 'block' : 'none';
});

// Close menu when clicking elsewhere
document.addEventListener('click', function (e) {
    if (!profilePicture.contains(e.target) && !infoList.contains(e.target)) {
        infoList.style.display = 'none';
    }
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

        userNameProfile.textContent = displayName;
        displayUser.textContent = firstLetter;
        userNameProfile.style.display = "block";
        logInOut.textContent = 'Log Out';
    } else {
        logInOut.textContent = 'Log In';
        userNameProfile.style.display = "none";
        displayUser.textContent = "U";
    }
}

const loginSection = () => {
    if (auth.currentUser) {
        auth.signOut().then(() => {
            window.location.href = 'login.html';
        });
    } else {
        window.location.href = 'login.html';
    }
}

document.addEventListener('DOMContentLoaded', () => {
    const urlParams = new URLSearchParams(window.location.search);
    const title = urlParams.get('title');
    const description = urlParams.get('description');
    const imageUrl = urlParams.get('imageUrl');
    const username = urlParams.get('username'); // Existing username from data
    const date = urlParams.get('date');
    const currentBlogId = urlParams.get('id'); 
    const emailPerson = urlParams.get('email');
    const charUser = document.getElementById('displayUser');
    console.log(currentBlogId)
    document.title = urlParams.get('description');

    // Use username for the small circle/logo letter if it's the author? 
    // Actually the displayUser in navbar is for the logged-in user, but there might be a circle for the author too.
    // Looking at the HTML, displayUser is in the navbar.
    // The "Published by" section as an id "name".

    // Update DOM with blog details
    document.getElementById('title').textContent = title;
    document.getElementById('description').textContent = description;
    document.getElementById('date').textContent = date;
    document.getElementById('blog-image').src = imageUrl;

    const authorDisplayName = username || emailPerson || "Anonymous";
    document.getElementById('name').textContent = authorDisplayName;

    if (currentBlogId) {
        displayComments(currentBlogId);
    }
});

const displayComments = async (blogId) => {
    const commentsContainer = document.getElementById('comment-Section');
    if (!commentsContainer) return;

    commentsContainer.innerHTML = ''; 
    
    const commentQuery = query(collection(db, 'comments'), where("blogId", "==", blogId));
    try {
      const querySnapshot = await getDocs(commentQuery);
  
        querySnapshot.forEach((docSnap) => {
            const commentData = docSnap.data();
            const commentId = docSnap.id;

            const authorName = commentData.username || commentData.email || "Anonymous";
            const firstLetter = authorName.charAt(0).toUpperCase();
            
            const likeCount = commentData.likes ? commentData.likes.length : 0;
            const dislikeCount = commentData.dislikes ? commentData.dislikes.length : 0;

            const commentHTML = `
                <div class="display">
                    <div class="avatar placeholder image">
                        <div class="text-neutral-content rounded-full w-12 bkgd-green">
                            <span>${firstLetter}</span>
                        </div>
                    </div>
                    <div class="comment-content-wrapper">
                        <div class="comment">
                            <p>${authorName}</p>
                            <p>${commentData.text}</p>
                        </div>
                        <div class="comment-votes">
                            <button class="vote-btn like-btn" onclick="handleVote('${commentId}', 'like')">
                                <i class="fa-solid fa-thumbs-up"></i> <span class="vote-count">${likeCount}</span>
                            </button>
                            <button class="vote-btn dislike-btn" onclick="handleVote('${commentId}', 'dislike')">
                                <i class="fa-solid fa-thumbs-down"></i> <span class="vote-count">${dislikeCount}</span>
                            </button>
                        </div>
                    </div>
                </div>`
                ;
            commentsContainer.innerHTML += commentHTML;
        });
    } catch (error) {
      console.error('Error displaying comments:', error);
    }
};

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
  
    if (!auth.currentUser) {
        alert("Please log in to add a comment.");
        window.location.href = 'login.html';
        return;
    }

    submitBut.innerHTML = "Loading...";
    submitBut.disabled = true;

    // Fallback logic for comments
    const submitUsername = auth.currentUser.isAnonymous ? "Anonymous" : (currentUserData?.username || auth.currentUser.displayName || auth.currentUser.email.split('@')[0] || "User");
    const submitEmail = auth.currentUser.isAnonymous ? "Anonymous" : (currentUserData?.email || auth.currentUser.email);
  
    addDoc(collection(db, "comments"), {
      text: para,
      email: submitEmail,
      blogId : currentBlogId,
      username: submitUsername,
      likes: [],
      dislikes: [],
      createdAt: new Date()
    })
    .then(() => {
      submitBut.innerHTML = "Submit";
      submitBut.disabled = false;
      comment.value = '';
      // Reload comments
      if (currentBlogId) {
          displayComments(currentBlogId);
      } else {
          console.error("No blog ID found in URL.");
      }
    })
    .catch((err) => {
      console.error("Error adding comment:", err);
      submitBut.innerHTML = "Submit";
      submitBut.disabled = false;
      alert("Failed to add comment: " + err.message);
    });
  }
  


window.handleVote = async (commentId, type) => {
    if (!auth.currentUser) {
        alert("Please log in to vote.");
        return;
    }

    const userId = auth.currentUser.uid;
    const commentDocRef = doc(db, 'comments', commentId);

    try {
        const commentDoc = await getDoc(commentDocRef);
        if (!commentDoc.exists()) return;

        const data = commentDoc.data();
        const likes = data.likes || [];
        const dislikes = data.dislikes || [];

        if (type === 'like') {
            if (likes.includes(userId)) {
                // Remove like
                await updateDoc(commentDocRef, {
                    likes: arrayRemove(userId)
                });
            } else {
                // Add like, remove dislike if present
                await updateDoc(commentDocRef, {
                    likes: arrayUnion(userId),
                    dislikes: arrayRemove(userId)
                });
            }
        } else if (type === 'dislike') {
            if (dislikes.includes(userId)) {
                // Remove dislike
                await updateDoc(commentDocRef, {
                    dislikes: arrayRemove(userId)
                });
            } else {
                // Add dislike, remove like if present
                await updateDoc(commentDocRef, {
                    dislikes: arrayUnion(userId),
                    likes: arrayRemove(userId)
                });
            }
        }

        // Refresh comments to show updated counts
        const urlParams = new URLSearchParams(window.location.search);
        displayComments(urlParams.get('id'));

    } catch (error) {
        console.error("Error voting:", error);
        alert("Failed to update vote. Please try again.");
    }
};

logInOut.addEventListener("click", loginSection);
submitBut.addEventListener("click", addComment);