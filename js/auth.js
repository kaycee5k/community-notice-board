// Authentication System using localStorage

const AUTH_STORAGE_KEY = 'communityHelp_users';
const CURRENT_USER_KEY = 'communityHelp_currentUser';

// Get all users from localStorage
function getUsers() {
  try {
    const users = localStorage.getItem(AUTH_STORAGE_KEY);
    return users ? JSON.parse(users) : [];
  } catch (e) {
    console.error('Error reading users:', e);
    return [];
  }
}

// Save users to localStorage
function saveUsers(users) {
  try {
    localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(users));
    return true;
  } catch (e) {
    console.error('Error saving users:', e);
    return false;
  }
}

// Register a new user
function registerUser({ name, email, password }) {
  // Validation
  if (!name || !email || !password) {
    return { ok: false, message: 'All fields are required' };
  }

  if (password.length < 6) {
    return { ok: false, message: 'Password must be at least 6 characters' };
  }

  // Email validation
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email)) {
    return { ok: false, message: 'Please enter a valid email' };
  }

  const users = getUsers();

  // Check if user already exists
  if (users.find(u => u.email === email)) {
    return { ok: false, message: 'Email already registered' };
  }

  // Create new user
  const newUser = {
    id: Date.now(),
    name,
    email,
    password, // In production, you should hash this!
    createdAt: new Date().toISOString()
  };

  users.push(newUser);
  
  if (!saveUsers(users)) {
    return { ok: false, message: 'Error creating account. Please try again.' };
  }

  // Auto-login after registration
  setCurrentUser(newUser);

  return { ok: true, user: newUser };
}

// Login user
function loginUser({ email, password }) {
  // Validation
  if (!email || !password) {
    return { ok: false, message: 'Email and password are required' };
  }

  const users = getUsers();
  const user = users.find(u => u.email === email && u.password === password);

  if (!user) {
    return { ok: false, message: 'Invalid email or password' };
  }

  // Set current user
  setCurrentUser(user);

  return { ok: true, user };
}

// Set current logged-in user
function setCurrentUser(user) {
  try {
    // Store user without password for security
    const safeUser = {
      id: user.id,
      name: user.name,
      email: user.email,
      createdAt: user.createdAt
    };
    localStorage.setItem(CURRENT_USER_KEY, JSON.stringify(safeUser));
  } catch (e) {
    console.error('Error setting current user:', e);
  }
}

// Get current logged-in user
function getCurrentUser() {
  try {
    const user = localStorage.getItem(CURRENT_USER_KEY);
    return user ? JSON.parse(user) : null;
  } catch (e) {
    console.error('Error getting current user:', e);
    return null;
  }
}

// Logout user
function logoutUser() {
  try {
    localStorage.removeItem(CURRENT_USER_KEY);
    return true;
  } catch (e) {
    console.error('Error logging out:', e);
    return false;
  }
}

// Check if user is authenticated
function isAuthenticated() {
  return getCurrentUser() !== null;
}

// Protect dashboard page - redirect to login if not authenticated
function protectPage() {
  if (!isAuthenticated()) {
    window.location.href = '../login.html';
  }
}