import { auth, db, storage } from "../firebase.js";
import { collection, addDoc, doc, getDoc } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js";
import { ref, uploadBytes, getDownloadURL } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-storage.js";
import { onAuthStateChanged } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-auth.js";
const cancelBtn = document.getElementById('cancle');
const profilePicture = document.getElementById('profile-section');
const infoList = document.getElementById('profile-info');
const userName = document.getElementById('user-name');
const logInOut = document.getElementById('log-in-out');
const displayUser = document.getElementById('displayUser');

let currentUserData = null;

profilePicture.addEventListener('click', function () {

  if (infoList.style.display === 'none' || infoList.style.display === '') {
    infoList.style.display = 'block';
  } else {
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

      userName.textContent = displayName;
      displayUser.textContent = firstLetter;
      userName.style.display = "block";
      logInOut.textContent = 'Log Out';
  } else {
      logInOut.textContent = 'Log In';
      userName.style.display = "none";
      displayUser.textContent = "U";
  }
}

// Listen for changes in authentication state
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

logInOut.addEventListener('click', () => {
  if (auth.currentUser) {
    auth.signOut().then(() => {
        window.location.href = 'login.html';
    });
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

    if (title == '' || category == '' || type == '' || status == '' || description == '' || imageFile == '') {
      alert('Please fill in all required fields.');
      return;
    }

    saveBtn.innerHTML = "Loading...";
    saveBtn.disabled = true;

    // Fallback logic for username and email to prevent blocking submission
    const submitUsername = currentUserData?.username || auth.currentUser.displayName || auth.currentUser.email.split('@')[0] || "User";
    const submitEmail = currentUserData?.email || auth.currentUser.email;

    try {
        await saveDataToFirestore(title, category, type, status, description, imageFile, submitUsername, submitEmail);
        alert("Blog is saved successfully");
        window.location.href = 'index.html'; 
    } catch (error) {
        alert("Failed to save blog: " + error.message);
    } finally {
        saveBtn.innerHTML = "Save";
        saveBtn.disabled = false;
    }
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






