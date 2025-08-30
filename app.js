// Elements
const username = document.getElementById('username');
const password = document.getElementById('password');
const confirmPassword = document.getElementById('confirmPassword');
const submitBtn = document.getElementById('submitBtn');
const togglePass = document.getElementById('togglePass');
const toggleConfirmPass = document.getElementById('toggleConfirmPass');
const confirmPasswordGroup = document.getElementById('confirmPasswordGroup');
const formTitle = document.getElementById('form-title');
const message = document.getElementById('message');
const loadingScreen = document.getElementById('loadingScreen');

let isLogin = true;

// Toggle login/signup form
function toggleForm() {
  isLogin = !isLogin;
  if (isLogin) {
    formTitle.textContent = 'Login';
    submitBtn.textContent = 'Login';
    confirmPasswordGroup.style.display = 'none';
    document.querySelector('.toggle-link').textContent = 'Don’t have an account? Sign up';
  } else {
    formTitle.textContent = 'Signup';
    submitBtn.textContent = 'Signup';
    confirmPasswordGroup.style.display = 'block';
    document.querySelector('.toggle-link').textContent = 'Already have an account? Login';
  }
  message.textContent = '';
  username.value = '';
  password.value = '';
  confirmPassword.value = '';
}

// Toggle password visibility
togglePass.addEventListener('click', () => {
  password.type = password.type === 'password' ? 'text' : 'password';
  togglePass.textContent = password.type === 'password' ? 'Show' : 'Hide';
});

toggleConfirmPass.addEventListener('click', () => {
  confirmPassword.type = confirmPassword.type === 'password' ? 'text' : 'password';
  toggleConfirmPass.textContent = confirmPassword.type === 'password' ? 'Show' : 'Hide';
});

// Fake local storage backend for demonstration
let users = JSON.parse(localStorage.getItem('users')) || {};

// Submit button handler
submitBtn.addEventListener('click', () => {
  const user = username.value.trim();
  const pass = password.value.trim();

  if (!user || !pass) {
    message.textContent = 'Please fill in all fields';
    return;
  }

  if (isLogin) {
    // Login flow
    if (users[user] && users[user] === pass) {
      showLoading();
      setTimeout(() => {
        message.style.color = 'green';
        message.textContent = `Welcome back, ${user}!`;
        hideLoading();
      }, 1000);
    } else {
      message.style.color = 'red';
      message.textContent = 'Invalid username or password';
    }
  } else {
    // Signup flow
    if (pass !== confirmPassword.value.trim()) {
      message.textContent = 'Passwords do not match';
      return;
    }
    if (users[user]) {
      message.textContent = 'Username already exists';
      return;
    }
    users[user] = pass;
    localStorage.setItem('users', JSON.stringify(users));
    showLoading();
    setTimeout(() => {
      message.style.color = 'green';
      message.textContent = 'Account created! You can login now';
      hideLoading();
      toggleForm();
    }, 1000);
  }
});

// Loading screen functions
function showLoading() {
  loadingScreen.style.display = 'flex';
}

function hideLoading() {
  loadingScreen.style.display = 'none';
}
