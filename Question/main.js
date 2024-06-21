// import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-app.js";
// import { getAuth, GoogleAuthProvider, signInWithPopup, onAuthStateChanged, signOut } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-auth.js";
// import { getDatabase, } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-database.js";
// import { getFirestore, collection, addDoc,getDocs, query, where } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js";


// const firebaseConfig = {
//   apiKey: "AIzaSyBdEgmy88sot8nITGiit9Ujm1w4_dG5vBg",
//   authDomain: "code-craze-blog-app.firebaseapp.com",
//   databaseURL: "https://code-craze-blog-app-default-rtdb.firebaseio.com",
//   projectId: "code-craze-blog-app",
//   storageBucket: "code-craze-blog-app.appspot.com",
//   messagingSenderId: "812380418108",
//   appId: "1:812380418108:web:8aa1a0f43b0f98455d5339",
//   measurementId: "G-C6CK3W9WDC"
// };


// const app = initializeApp(firebaseConfig);
// const db = getFirestore(app);
// const auth = getAuth(app);
// const provider = new GoogleAuthProvider();
// const database = getDatabase();
// const logOutBut = document.querySelector(".logout-button");
// const submitBut = document.querySelector('#submit-button');

// const { title,
//   description,
//   type,
//   status,
//   category,
//   date,
//   username,
//   email,
//   uid } = JSON.parse(localStorage.getItem("blog"));

// const userData = JSON.parse(localStorage.getItem("userData"));

// document.getElementById("title").innerHTML = title;
// document.getElementById("description").innerHTML = description;
// document.getElementById("name").innerHTML = username;
// document.getElementById("date").innerHTML = date;
// // document.getElementById("title").innerHTML = title;
// // const userCreds = JSON.parse(sessionStorage.getItem("user-creds"));
// // const userInfo = JSON.parse(sessionStorage.getItem("user-info"));

// const loginSection = () => {

  
//   localStorage.removeItem("userData");
//   window.location.href = "index.html";

// }

// const getComments = async () => {
//   const q = query(collection(db, "comments"), where("blogId", "==", uid));

//   const querySnapshot = await getDocs(q);

//   querySnapshot.forEach((doc) => {
//     // doc.data() is never undefined for query doc snapshots
//     const comment = doc.data();

//     let margin = document.createElement('div');
//     margin.style.width = "100%";
//     margin.style.height = "1px";
//     margin.style.background = "#ADBC9F";
//     let anotherComment = document.querySelector("#comment-Section");
//     anotherComment.appendChild(margin);

//     anotherComment.innerHTML += `<div class="display"><div class="avatar placeholder image"><div class="bg-neutral text-neutral-content rounded-full w-12"><span>${comment.username.charAt(0)}</span></div></div><div class="comment"><p>${comment.email}</p><p>${comment.text}</p></div></div>`;

//   });
// }
// getComments()


// const addComment = () => {

//   let comment = document.querySelector('#comment');
//   let para = comment.value;

//   if (para.trim() == '') {
//     alert("Can't Leave the Comment Empty!");
//     return;
//   }

//   submitBut.innerHTML = "Loading...";

//   addDoc(collection(db, "comments"), {
//     text: para,
//     email: userData.Email,
//     blogId: uid,
//     username: userData.Name
//   })
//     .then(() => {

//       let margin = document.createElement('div');
//       margin.style.width = "100%";
//       margin.style.height = "1px";
//       margin.style.background = "#ADBC9F";
//       let anotherComment = document.querySelector("#comment-Section");
//       anotherComment.appendChild(margin);

//       anotherComment.innerHTML += `<div class="display"><div class="avatar placeholder image"><div class="bg-neutral text-neutral-content rounded-full w-12"><span>${userData.Name.charAt(0)}</span></div></div><div class="comment"><p>${userData.Email}</p><p>${para}</p></div></div>`;

//       comment.value = '';
//       submitBut.innerHTML = "Submit";
//     })
//     .catch((err) => {

//       console.log("🚀 ~ .then ~ e:", err)
//       submitBut.innerHTML = "Submit";

//       alert(err);
//     })
// }



// logOutBut.addEventListener("click", loginSection);
// submitBut.addEventListener("click", addComment);