// Select elements
const postContainer = document.getElementById("postContainer");
const tabs = document.querySelectorAll(".tab");
const searchInput = document.getElementById("searchInput");
const postForm = document.getElementById("postForm");
const postModal = document.getElementById("postModal");
const requestBtn = document.getElementById("requestBtn");
const closeModal = document.querySelector(".close");

// Load posts and counters
let posts = JSON.parse(localStorage.getItem("posts")) || [];
let closedCount = parseInt(localStorage.getItem("closedCount")) || 0;
let helpCount = parseInt(localStorage.getItem("helpCount")) || 0;

// Display posts
function displayPosts(filter = "all", searchTerm = "") {
  postContainer.innerHTML = "";

  let filtered = posts.filter(
    (post) =>
      (filter === "all" || post.category === filter) &&
      (post.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        post.description.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  if (filtered.length === 0) {
    postContainer.innerHTML =
      "<p style='text-align:center;'>No posts yet.</p>";
    updateStats();
    return;
  }

  filtered.forEach((post) => {
    const card = document.createElement("div");
    card.classList.add("card");
    card.innerHTML = `
      <span class="category-tag">${post.categoryLabel}</span>
      <h3>${post.name}</h3>
      <p>${post.description}</p>
      <small>Contact: ${post.contact}</small><br>
      <button class="offer-help">Offer Help</button>
    `;

    postContainer.appendChild(card);

    const offerBtn = card.querySelector(".offer-help");
    offerBtn.addEventListener("click", () => {
      const index = posts.indexOf(post);

      posts.splice(index, 1);

      closedCount++;
      helpCount++;

      // Save data
      localStorage.setItem("posts", JSON.stringify(posts));
      localStorage.setItem("closedCount", closedCount);
      localStorage.setItem("helpCount", helpCount);

      displayPosts(filter, searchTerm);
    });
  });

  updateStats();
}

// Update stats section
function updateStats() {
  document.getElementById("activeCount").textContent = posts.length;
  document.getElementById("closedCount").textContent = closedCount;
  document.getElementById("helpCount").textContent = helpCount;
  document.getElementById("communityCount").textContent = 10 + posts.length + closedCount;
}

// Category filter tabs
tabs.forEach((tab) => {
  tab.addEventListener("click", () => {
    tabs.forEach((t) => t.classList.remove("active"));
    tab.classList.add("active");

    displayPosts(tab.dataset.category, searchInput.value);
  });
});

// Search functionality
searchInput.addEventListener("input", (e) => {
  const activeCategory = document.querySelector(".tab.active").dataset.category;
  displayPosts(activeCategory, e.target.value);
});

// Modal controls
requestBtn.onclick = () => (postModal.style.display = "flex");
closeModal.onclick = () => (postModal.style.display = "none");
window.onclick = (e) => {
  if (e.target === postModal) postModal.style.display = "none";
};

// Handle form submission
postForm.addEventListener("submit", (e) => {
  e.preventDefault();

  const name = document.getElementById("name").value.trim();
  const category = document.getElementById("category").value;
  const description = document.getElementById("description").value.trim();
  const contact = document.getElementById("contact").value.trim();

  const categoryLabels = {
    home: "Home & Errands",
    care: "Care & Support",
    learning: "Learning & Tech",
    community: "Community & Services",
  };

  const newPost = {
    name,
    category,
    description,
    contact,
    categoryLabel: categoryLabels[category],
  };

  posts.push(newPost);

  localStorage.setItem("posts", JSON.stringify(posts));

  postForm.reset();
  postModal.style.display = "none";

  displayPosts();
});

displayPosts();
