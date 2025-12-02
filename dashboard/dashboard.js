// Configuration - Single source of truth for categories
const CATEGORIES = [
  { id: 'home', label: 'Home & Errands' },
  { id: 'care', label: 'Care & Support' },
  { id: 'learning', label: 'Learning & Tech' },
  { id: 'community', label: 'Community & Services' }
];

const STORAGE_KEYS = {
  POSTS: 'posts',
  CLOSED_COUNT: 'closedCount',
  HELP_COUNT: 'helpCount'
};

// Select elements
const postContainer = document.getElementById("postContainer");
const searchInput = document.getElementById("searchInput");
const postForm = document.getElementById("postForm");
const postModal = document.getElementById("postModal");
const requestBtn = document.getElementById("requestBtn");
const closeModal = document.querySelector(".close");

// State management
let posts = [];
let closedCount = 0;
let helpCount = 0;
let currentFilter = 'all';

// Initialize app
function init() {
  loadData();
  renderCategories();
  renderCategoryOptions();
  setupEventListeners();
  displayPosts();
}

// Load data from storage
function loadData() {
  try {
    posts = JSON.parse(localStorage.getItem(STORAGE_KEYS.POSTS)) || [];
    closedCount = parseInt(localStorage.getItem(STORAGE_KEYS.CLOSED_COUNT)) || 0;
    helpCount = parseInt(localStorage.getItem(STORAGE_KEYS.HELP_COUNT)) || 0;
  } catch (e) {
    console.error('Error loading data:', e);
    posts = [];
    closedCount = 0;
    helpCount = 0;
  }
}

// Save data to storage
function saveData() {
  try {
    localStorage.setItem(STORAGE_KEYS.POSTS, JSON.stringify(posts));
    localStorage.setItem(STORAGE_KEYS.CLOSED_COUNT, closedCount);
    localStorage.setItem(STORAGE_KEYS.HELP_COUNT, helpCount);
  } catch (e) {
    console.error('Error saving data:', e);
  }
}

// Dynamically render category tabs
function renderCategories() {
  const categoriesSection = document.querySelector('.categories');
  categoriesSection.innerHTML = '';
  
  // Add "All" tab
  const allTab = document.createElement('button');
  allTab.className = 'tab active';
  allTab.dataset.category = 'all';
  allTab.textContent = 'All';
  categoriesSection.appendChild(allTab);
  
  // Add category tabs
  CATEGORIES.forEach(cat => {
    const tab = document.createElement('button');
    tab.className = 'tab';
    tab.dataset.category = cat.id;
    tab.textContent = cat.label;
    categoriesSection.appendChild(tab);
  });
}

// Dynamically render category options in form
function renderCategoryOptions() {
  const categorySelect = document.getElementById('category');
  categorySelect.innerHTML = '<option value="">Select Category</option>';
  
  CATEGORIES.forEach(cat => {
    const option = document.createElement('option');
    option.value = cat.id;
    option.textContent = cat.label;
    categorySelect.appendChild(option);
  });
}

// Get category label by id
function getCategoryLabel(categoryId) {
  const category = CATEGORIES.find(cat => cat.id === categoryId);
  return category ? category.label : categoryId;
}

// Setup all event listeners
function setupEventListeners() {
  // Category tabs
  document.querySelector('.categories').addEventListener('click', (e) => {
    if (e.target.classList.contains('tab')) {
      document.querySelectorAll('.tab').forEach(t => t.classList.remove('active'));
      e.target.classList.add('active');
      currentFilter = e.target.dataset.category;
      displayPosts();
    }
  });
  
  // Search
  searchInput.addEventListener("input", displayPosts);
  
  // Modal controls
  requestBtn.addEventListener('click', () => postModal.style.display = "flex");
  closeModal.addEventListener('click', () => postModal.style.display = "none");
  window.addEventListener('click', (e) => {
    if (e.target === postModal) postModal.style.display = "none";
  });
  
  // Form submission
  postForm.addEventListener("submit", handleFormSubmit);
}

// Handle form submission
function handleFormSubmit(e) {
  e.preventDefault();

  const formData = {
    name: document.getElementById("name").value.trim(),
    category: document.getElementById("category").value,
    description: document.getElementById("description").value.trim(),
    contact: document.getElementById("contact").value.trim()
  };

  // Validation
  if (!formData.name || !formData.category || !formData.description || !formData.contact) {
    alert('Please fill in all fields');
    return;
  }

  const newPost = {
    ...formData,
    categoryLabel: getCategoryLabel(formData.category),
    id: Date.now(), // Unique identifier
    timestamp: new Date().toISOString()
  };

  posts.push(newPost);
  saveData();
  postForm.reset();
  postModal.style.display = "none";
  displayPosts();
}

// Display posts with filtering
function displayPosts() {
  const searchTerm = searchInput.value.toLowerCase();
  
  const filtered = posts.filter(post => {
    const matchesCategory = currentFilter === 'all' || post.category === currentFilter;
    const matchesSearch = !searchTerm || 
      post.name.toLowerCase().includes(searchTerm) ||
      post.description.toLowerCase().includes(searchTerm);
    
    return matchesCategory && matchesSearch;
  });

  renderPosts(filtered);
  updateStats();
}

// Render posts to DOM
function renderPosts(postsToRender) {
  if (postsToRender.length === 0) {
    postContainer.innerHTML = "<p style='text-align:center;'>No posts yet.</p>";
    return;
  }

  postContainer.innerHTML = postsToRender.map(post => `
    <div class="card" data-id="${post.id}">
      <span class="category-tag">${post.categoryLabel}</span>
      <h3>${escapeHtml(post.name)}</h3>
      <p>${escapeHtml(post.description)}</p>
      <small>Contact: ${escapeHtml(post.contact)}</small><br>
      <button class="offer-help" data-id="${post.id}">Offer Help</button>
    </div>
  `).join('');
  
  // Add event listeners to offer help buttons
  postContainer.querySelectorAll('.offer-help').forEach(btn => {
    btn.addEventListener('click', handleOfferHelp);
  });
}

// Handle offer help action
function handleOfferHelp(e) {
  const postId = parseInt(e.target.dataset.id);
  const postIndex = posts.findIndex(p => p.id === postId);
  
  if (postIndex !== -1) {
    if (confirm('Are you sure you want to mark this request as helped?')) {
      posts.splice(postIndex, 1);
      closedCount++;
      helpCount++;
      saveData();
      displayPosts();
    }
  }
}

// Update statistics
function updateStats() {
  document.getElementById("activeCount").textContent = posts.length;
  document.getElementById("closedCount").textContent = closedCount;
  document.getElementById("helpCount").textContent = helpCount;
  document.getElementById("communityCount").textContent = 10 + posts.length + closedCount;
}

// Security: Escape HTML to prevent XSS
function escapeHtml(text) {
  const map = {
    '&': '&amp;',
    '<': '&lt;',
    '>': '&gt;',
    '"': '&quot;',
    "'": '&#039;'
  };
  return text.replace(/[&<>"']/g, m => map[m]);
}

// Initialize the app
init();