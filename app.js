// Firebase config
const firebaseConfig = {
  apiKey: "YOUR_API_KEY",
  authDomain: "YOUR_PROJECT.firebaseapp.com",
  projectId: "YOUR_PROJECT_ID",
  storageBucket: "YOUR_PROJECT.appspot.com",
  messagingSenderId: "YOUR_SENDER_ID",
  appId: "YOUR_APP_ID"
};

firebase.initializeApp(firebaseConfig);
const auth = firebase.auth();
const db = firebase.firestore();

// --------- Login / Signup ---------
const signupBtn = document?.getElementById("signup-btn");
const loginBtn = document?.getElementById("login-btn");

signupBtn?.addEventListener("click", () => {
  const name = document.getElementById("signup-name").value;
  const email = document.getElementById("signup-email").value;
  const password = document.getElementById("signup-password").value;

  auth.createUserWithEmailAndPassword(email, password)
    .then((cred) => {
      return db.collection("users").doc(cred.user.uid).set({ name: name, email: email });
    })
    .then(() => { window.location.href = "main.html"; })
    .catch(err => alert(err.message));
});

loginBtn?.addEventListener("click", () => {
  const email = document.getElementById("login-email").value;
  const password = document.getElementById("login-password").value;

  auth.signInWithEmailAndPassword(email, password)
    .then(() => { window.location.href = "main.html"; })
    .catch(err => alert(err.message));
});

// --------- Main Feed ---------
const logoutBtn = document?.getElementById("logout-btn");
logoutBtn?.addEventListener("click", () => auth.signOut().then(() => window.location.href = "index.html"));

// Check if user is logged in
auth.onAuthStateChanged(user => {
  if (!user && window.location.pathname.includes("main.html")) {
    window.location.href = "index.html";
  }
});

// Posting
const postBtn = document?.getElementById("post-btn");
postBtn?.addEventListener("click", () => {
  const text = document.getElementById("post-text").value;
  const user = auth.currentUser;

  if (!text || !user) return;

  db.collection("posts").add({
    uid: user.uid,
    text: text,
    timestamp: firebase.firestore.FieldValue.serverTimestamp(),
    likes: 0
  });

  document.getElementById("post-text").value = "";
});

// Display feed
const feed = document?.getElementById("feed");
if (feed) {
  db.collection("posts").orderBy("timestamp", "desc").onSnapshot(snapshot => {
    feed.innerHTML = "";
    snapshot.forEach(doc => {
      const data = doc.data();
      const post = document.createElement("div");
      post.className = "post";
      post.innerHTML = `<h3>${data.uid}</h3><p>${data.text}</p>
      <button class="like-btn">Like (${data.likes})</button>`;
      feed.appendChild(post);

      // Like button
      post.querySelector(".like-btn").addEventListener("click", () => {
        db.collection("posts").doc(doc.id).update({ likes: data.likes + 1 });
      });
    });
  });
}
