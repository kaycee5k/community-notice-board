// Configuration - Single source of truth for categories
const CATEGORIES = [
  { id: "home", label: "Home & Errands" },
  { id: "care", label: "Care & Support" },
  { id: "learning", label: "Learning & Tech" },
  { id: "community", label: "Community & Services" },
  { id: "washing", label: "Washing and Settings" },
];

const STORAGE_KEYS = {
  POSTS: "posts",
  CLOSED_COUNT: "closedCount",
  HELP_COUNT: "helpCount",
};

// Protect the page - redirect to login if not authenticated
protectPage();

// Get current user
const currentUser = getCurrentUser();

const postContainer = document.getElementById("postContainer");
const searchInput = document.getElementById("searchInput");
const postForm = document.getElementById("postForm");
const postModal = document.getElementById("postModal");
const requestBtn = document.getElementById("requestBtn");
const closeModal = document.querySelector(".close");

let posts = [];
let closedCount = 0;
let helpCount = 0;
let currentFilter = "all";
let editingPostId = null;

function init() {
  loadData();
  renderCategories();
  renderCategoryOptions();
  setupEventListeners();
  displayUserInfo();
  displayPosts();
}

// Display user info in navbar
function displayUserInfo() {
  if (currentUser) {
    document.getElementById("userName").textContent = currentUser.name;
  }
}

// Load data from storage
function loadData() {
  try {
    posts = JSON.parse(localStorage.getItem(STORAGE_KEYS.POSTS)) || [];
    closedCount = parseInt(localStorage.getItem(STORAGE_KEYS.CLOSED_COUNT)) || 0;
    helpCount = parseInt(localStorage.getItem(STORAGE_KEYS.HELP_COUNT)) || 0;
  } catch (e) {
    console.error("Error loading data:", e);
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
    console.error("Error saving data:", e);
  }
}

// Dynamically render category tabs
function renderCategories() {
  const categoriesSection = document.querySelector(".categories");
  categoriesSection.innerHTML = "";

  const allTab = document.createElement("button");
  allTab.className = "tab active";
  allTab.dataset.category = "all";
  allTab.textContent = "All";
  categoriesSection.appendChild(allTab);

  CATEGORIES.forEach((cat) => {
    const tab = document.createElement("button");
    tab.className = "tab";
    tab.dataset.category = cat.id;
    tab.textContent = cat.label;
    categoriesSection.appendChild(tab);
  });
}

// Dynamically render category options in form
function renderCategoryOptions() {
  const categorySelect = document.getElementById("category");
  categorySelect.innerHTML = '<option value="">Select Category</option>';

  CATEGORIES.forEach((cat) => {
    const option = document.createElement("option");
    option.value = cat.id;
    option.textContent = cat.label;
    categorySelect.appendChild(option);
  });
}

function getCategoryLabel(categoryId) {
  const category = CATEGORIES.find((cat) => cat.id === categoryId);
  return category ? category.label : categoryId;
}

// Setup all event listeners
function setupEventListeners() {
  // Category tabs
  document.querySelector(".categories").addEventListener("click", (e) => {
    if (e.target.classList.contains("tab")) {
      document
        .querySelectorAll(".tab")
        .forEach((t) => t.classList.remove("active"));
      e.target.classList.add("active");
      currentFilter = e.target.dataset.category;
      displayPosts();
    }
  });

  // Search
  searchInput.addEventListener("input", displayPosts);

  // Modal controls
  requestBtn.addEventListener(
    "click",
    () => (postModal.style.display = "flex")
  );
  closeModal.addEventListener(
    "click",
    () => (postModal.style.display = "none")
  );
  window.addEventListener("click", (e) => {
    if (e.target === postModal) postModal.style.display = "none";
  });

  // Form submission
  postForm.addEventListener("submit", handleFormSubmit);

    // Logout button
  const logoutBtn = document.getElementById('logoutBtn');
  if (logoutBtn) {
    logoutBtn.addEventListener('click', handleLogout);
  }
}

// Handle logout
function handleLogout() {
  if (confirm('Are you sure you want to logout?')) {
    logoutUser();
    window.location.href = '../login.html';
  }
}

// Handle form submission
function handleFormSubmit(e) {
  e.preventDefault();

  const formData = {
    name: document.getElementById("name").value.trim(),
    category: document.getElementById("category").value,
    description: document.getElementById("description").value.trim(),
    contact: document.getElementById("contact").value.trim(),
  };

  // Validation
  if (
    !formData.name ||
    !formData.category ||
    !formData.description ||
    !formData.contact
  ) {
    showNotification("Please fill in all fields", "error");
    return;
  }

  if (editingPostId) {
    // Update existing post
    const post = posts.find((p) => p.id === editingPostId);
    if (post) {
      post.name = formData.name;
      post.category = formData.category;
      post.description = formData.description;
      post.contact = formData.contact;
      post.categoryLabel = getCategoryLabel(formData.category);
      post.editedAt = new Date().toISOString();

      saveData();
      showNotification("Request updated successfully! ✏️", "success");
    }
    editingPostId = null;
  } else {
    // Create new post
    const newPost = {
      ...formData,
      categoryLabel: getCategoryLabel(formData.category),
      id: Date.now(),
      timestamp: new Date().toISOString(),
    };

    posts.push(newPost);
    saveData();
    showNotification("Request added successfully! 🎉", "success");
  }

  postForm.reset();
  postModal.style.display = "none";
  document.querySelector(".modal-content h2").textContent = "Request Help";
  displayPosts();
}

// Display posts with filtering
function displayPosts() {
  const searchTerm = searchInput.value.toLowerCase();

  const filtered = posts.filter((post) => {
    const matchesCategory =
      currentFilter === "all" || post.category === currentFilter;
    const matchesSearch =
      !searchTerm ||
      post.name.toLowerCase().includes(searchTerm) ||
      post.description.toLowerCase().includes(searchTerm);

    return matchesCategory && matchesSearch;
  });

  // Sort: open requests first, then closed ones
  const sorted = filtered.sort((a, b) => {
    if (a.closed === b.closed) return 0;
    return a.closed ? 1 : -1;
  });

  renderPosts(sorted);
  updateStats();
}

// Render posts to DOM
function renderPosts(postsToRender) {
  if (postsToRender.length === 0) {
    postContainer.innerHTML = "<div class='post'><img class='image' src='../assets/images/post.png' style='' /><p style=''>No posts yet.</p></div>";
    // postContainer.innerHTML = postContainer.innerHTML = '<p class="post" style="background-image: url(\'../assets/images/post.png\');">No posts yet.</p>';
    return;
  }

  postContainer.innerHTML = postsToRender
    .map(
      (post) => `
    <div class="card ${post.closed ? "closed-card" : ""}" data-id="${
        post.id
      }" title="${post.closed ? "Closed" : ""}">
      <div class="timestamp-category">
      <span class="category-tag">${post.categoryLabel}</span>
      <div class="timestamp">${formatTimestamp(post.timestamp)}</div>
      </div>
      <h3>${escapeHtml(post.name)}</h3>
      <p>${escapeHtml(post.description)}</p>
      <small>Contact: ${escapeHtml(post.contact)}</small><br>
      <div class="card-actions">
        <button class="offer-help ${post.closed ? "disabled" : ""}" data-id="${
        post.id
      }" ${post.closed ? "disabled" : ""}>
          ${post.closed ? "Closed" : "Offer Help"}
        </button>
        ${
          !post.closed
            ? `<button class="edit-btn" data-id="${post.id}"><i class="fas fa-edit"></i></button>`
            : ""
        }
        <button class="delete-btn" data-id="${
          post.id
        }"><i class="fas fa-trash-alt"></i> </button>
      </div>
    </div>
  `
    )
    .join("");

  // Add event listeners to offer help buttons
  postContainer
    .querySelectorAll(".offer-help:not(.disabled)")
    .forEach((btn) => {
      btn.addEventListener("click", handleOfferHelp);
    });

  // Add event listeners to edit buttons
  postContainer.querySelectorAll(".edit-btn").forEach((btn) => {
    btn.addEventListener("click", handleEdit);
  });

  // Add event listeners to delete buttons
  postContainer.querySelectorAll(".delete-btn").forEach((btn) => {
    btn.addEventListener("click", handleDelete);
  });
}

// Handle offer help action
function handleOfferHelp(e) {
  const postId = parseInt(e.target.dataset.id);
  const post = posts.find((p) => p.id === postId);

  if (post && !post.closed) {
    post.closed = true;
    post.closedAt = new Date().toISOString();
    closedCount++;
    helpCount++;
    saveData();
    displayPosts();
    showNotification("Thank you for your service! 👏", "success");
  }
}

// Update statistics
function updateStats() {
  const activeRequests = posts.filter((p) => !p.closed).length;
  document.getElementById("activeCount").textContent = activeRequests;
  document.getElementById("closedCount").textContent = closedCount;
  document.getElementById("helpCount").textContent = helpCount;
  document.getElementById("communityCount").textContent =
    10 + posts.length + closedCount;
}

// Security: Escape HTML to prevent XSS
function escapeHtml(text) {
  const map = {
    "&": "&amp;",
    "<": "&lt;",
    ">": "&gt;",
    '"': "&quot;",
    "'": "&#039;",
  };
  return text.replace(/[&<>"']/g, (m) => map[m]);
}

// Format timestamp
function formatTimestamp(timestamp) {
  const date = new Date(timestamp);
  const now = new Date();
  const diffInMinutes = Math.floor((now - date) / (1000 * 60));

  if (diffInMinutes < 1) return "Just now";
  if (diffInMinutes < 60) return `${diffInMinutes} min ago`;

  const diffInHours = Math.floor(diffInMinutes / 60);
  if (diffInHours < 24)
    return `${diffInHours} hour${diffInHours > 1 ? "s" : ""} ago`;

  const diffInDays = Math.floor(diffInHours / 24);
  if (diffInDays < 7)
    return `${diffInDays} day${diffInDays > 1 ? "s" : ""} ago`;

  // For older posts, show the date
  return date.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

// Handle edit
function handleEdit(e) {
  const postId = parseInt(e.target.dataset.id);
  const post = posts.find((p) => p.id === postId);

  if (post && !post.closed) {
    editingPostId = postId;

    // Populate form with post data
    document.getElementById("name").value = post.name;
    document.getElementById("category").value = post.category;
    document.getElementById("description").value = post.description;
    document.getElementById("contact").value = post.contact;

    // Change modal title
    document.querySelector(".modal-content h2").textContent = "Edit Request";

    // Show modal
    postModal.style.display = "flex";
  }
}

// Handle delete
function handleDelete(e) {
  const postId = parseInt(e.target.dataset.id);
  const post = posts.find((p) => p.id === postId);

  if (post) {
    const confirmMessage = post.closed
      ? "Are you sure you want to delete this closed request?"
      : "Are you sure you want to delete this request?";

    if (confirm(confirmMessage)) {
      const index = posts.findIndex((p) => p.id === postId);
      posts.splice(index, 1);

      saveData();
      displayPosts();
      showNotification("Request deleted successfully! 🗑️", "info");
    }
  }
}

// Notification system
function showNotification(message, type = "success") {
  // Create notification element
  const notification = document.createElement("div");
  notification.className = `notification ${type}`;
  notification.innerHTML = message;

  // Add to body
  document.body.appendChild(notification);

  // Trigger animation
  setTimeout(() => notification.classList.add("show"), 100);

  // Remove after 3 seconds
  setTimeout(() => {
    notification.classList.remove("show");
    setTimeout(() => notification.remove(), 300);
  }, 3000);
}

// Initialize the app
init();
