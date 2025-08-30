// --- Shared --- 
const loadingScreen = document.getElementById("loadingScreen");
const togglePass = document.getElementById("togglePass");
const toggleConfirmPass = document.getElementById("toggleConfirmPass");

if(togglePass) setupToggle(togglePass, document.getElementById("password"));
if(toggleConfirmPass) setupToggle(toggleConfirmPass, document.getElementById("confirmPassword"));

function setupToggle(toggle, input) {
  toggle.addEventListener("click", () => {
    input.type = input.type === "password" ? "text" : "password";
    toggle.innerText = input.type === "password" ? "Show" : "Hide";
  });
}

// --- Login / Signup Page ---
if(document.getElementById("submitBtn")) {
  let isLogin = true;
  const messageBox = document.getElementById("message");

  document.querySelector(".toggle-link").addEventListener("click", () => {
    isLogin = !isLogin;
    document.getElementById("form-title").innerText = isLogin ? "Login" : "Sign Up";
    document.getElementById("submitBtn").innerText = isLogin ? "Login" : "Sign Up";
    document.getElementById("confirmPasswordGroup").style.display = isLogin ? "none" : "block";
    messageBox.innerText = "";
  });

  document.getElementById("submitBtn").addEventListener("click", () => {
    const username = document.getElementById("username").value.trim();
    const password = document.getElementById("password").value.trim();
    const confirm = document.getElementById("confirmPassword").value.trim();
    if(!username || !password || (!isLogin && !confirm)) return messageBox.innerText = "Fill all fields";

    let users = JSON.parse(localStorage.getItem("users") || "{}");

    if(isLogin) {
      if(!users[username]) return messageBox.innerText = "User not found";
      if(users[username].password !== password) return messageBox.innerText = "Wrong password";

      showLoading(() => {
        localStorage.setItem("currentUser", username);
        window.location.href = "main.html";
      });
    } else {
      if(users[username]) return messageBox.innerText = "Username taken";
      if(password !== confirm) return messageBox.innerText = "Passwords do not match";
      users[username] = {password: password, posts: []};
      localStorage.setItem("users", JSON.stringify(users));
      messageBox.style.color = "green";
      messageBox.innerText = "Account created! Please log in.";
    }
  });
}

function showLoading(callback) {
  loadingScreen.style.display = "flex";
  setTimeout(()=>{ loadingScreen.style.display = "none"; callback(); }, 800);
}

// --- Main Page Logic ---
if(document.getElementById("feed")) {
  const currentUser = localStorage.getItem("currentUser");
  if(!currentUser) { window.location.href="index.html"; }

  const users = JSON.parse(localStorage.getItem("users") || "{}");
  const feedEl = document.getElementById("feed");
  const postBtn = document.getElementById("postBtn");
  const postText = document.getElementById("post-text");
  const logoutBtn = document.getElementById("logoutBtn");
  const darkModeBtn = document.getElementById("darkModeBtn");
  const searchInput = document.getElementById("searchInput");
  const notifications = document.getElementById("notifications");

  let posts = JSON.parse(localStorage.getItem("posts") || "[]");

  function savePosts() { localStorage.setItem("posts", JSON.stringify(posts)); }

  function renderFeed(filter="") {
    feedEl.innerHTML = "";
    let filtered = posts.filter(p => p.text.toLowerCase().includes(filter.toLowerCase()));
    filtered.sort((a,b)=> new Date(b.timestamp) - new Date(a.timestamp));
    filtered.forEach(p => {
      const post = document.createElement("div"); post.className="post";
      post.innerHTML = `
        <h3>${p.author} - ${new Date(p.timestamp).toLocaleString()}</h3>
        <p>${p.text}</p>
        <button class="like-btn">Like (${p.likes})</button>
        ${p.author===currentUser?'<button class="edit-btn">Edit</button><button class="delete-btn">Delete</button>':''}
        <button class="comment-btn">Comment (${p.comments.length})</button>
        <div class="comments"></div>
      `;
      // Like
      post.querySelector(".like-btn").addEventListener("click", ()=>{
        p.likes++; savePosts(); renderFeed(searchInput.value);
      });
      // Edit
      if(p.author===currentUser) post.querySelector(".edit-btn").addEventListener("click", ()=>{
        const newText = prompt("Edit post:", p.text);
        if(newText){ p.text=newText; savePosts(); renderFeed(searchInput.value);}
      });
      // Delete
      if(p.author===currentUser) post.querySelector(".delete-btn").addEventListener("click", ()=>{
        if(confirm("Delete post?")){ posts=posts.filter(x=>x!==p); savePosts(); renderFeed(searchInput.value);}
      });
      // Comment
      post.querySelector(".comment-btn").addEventListener("click", ()=>{
        const commentText = prompt("Enter comment:");
        if(commentText){ p.comments.push({user:currentUser,text:commentText}); savePosts(); renderFeed(searchInput.value);}
      });

      const commentsDiv = post.querySelector(".comments");
      p.comments.forEach(c => {
        const com = document.createElement("div"); com.innerText=`${c.user}: ${c.text}`;
        commentsDiv.appendChild(com);
      });

      feedEl.appendChild(post);
    });
  }

  postBtn.addEventListener("click", ()=>{
    const text = postText.value.trim(); if(!text) return;
    const newPost = {author:currentUser,text:text,likes:0,comments:[],timestamp:new Date()};
    posts.push(newPost); savePosts(); postText.value=""; renderFeed();
    notifications.innerText="New post added!";
    setTimeout(()=>notifications.innerText="",2000);
  });

  logoutBtn.addEventListener("click", ()=>{ localStorage.removeItem("currentUser"); window.location.href="index.html"; });
  darkModeBtn.addEventListener("click", ()=>document.body.classList.toggle("dark"));
  searchInput.addEventListener("input", ()=>renderFeed(searchInput.value));

  renderFeed();
}
