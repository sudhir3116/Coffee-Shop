document.addEventListener('DOMContentLoaded', () => {
  const menuList = document.querySelector('.menu-section .menu-list');
  const API_URL = 'http://localhost:8000/api/menu?limit=100&isAvailable=true';

  if (!menuList) return;

  /**
   * Fetches menu items from the backend and handles loading, error, and rendering states.
   */
  async function fetchMenu() {
    showLoading();

    try {
      const response = await fetch(API_URL);
      if (!response.ok) {
        throw new Error(`Failed to fetch menu: ${response.statusText}`);
      }

      const result = await response.json();
      
      if (!result.success || !result.data || !Array.isArray(result.data)) {
        throw new Error('Invalid menu response payload');
      }

      // Filter to only display isAvailable = true (already filtered via query, but enforce client-side too)
      const availableItems = result.data.filter(item => item.isAvailable === true);

      if (availableItems.length === 0) {
        showEmpty();
      } else {
        renderMenu(availableItems);
      }
    } catch (error) {
      console.error('Error fetching menu items:', error);
      showError();
    }
  }

  /**
   * Renders the loading spinner inside the menu list container.
   */
  function showLoading() {
    menuList.innerHTML = `
      <div class="menu-loading">
        <div class="spinner"></div>
        <p>Loading fresh delights for you...</p>
      </div>
    `;
  }

  /**
   * Renders an error message with a retry button.
   */
  function showError() {
    menuList.innerHTML = `
      <div class="menu-error">
        <p>Oops! We couldn't load the menu. Please check your connection.</p>
        <button id="retry-menu-btn" class="retry-btn">
          <i class="fas fa-redo"></i> Retry
        </button>
      </div>
    `;

    const retryBtn = document.getElementById('retry-menu-btn');
    if (retryBtn) {
      retryBtn.addEventListener('click', fetchMenu);
    }
  }

  /**
   * Renders an empty state message if no items are available.
   */
  function showEmpty() {
    menuList.innerHTML = `
      <div class="menu-empty">
        <p>Our kitchen is currently resting. No items available right now!</p>
      </div>
    `;
  }

  /**
   * Dynamically constructs card elements and inserts them into the DOM.
   * @param {Array} items - List of menu items to render.
   */
  function renderMenu(items) {
    menuList.innerHTML = ''; // Clear loading spinner

    items.forEach(item => {
      const li = document.createElement('li');
      li.className = 'menu-item';

      // Resolve image URL/path (handling absolute URLs or prepending backend origin if path is relative)
      let imageSrc = item.image;
      if (imageSrc && !imageSrc.startsWith('http') && !imageSrc.startsWith('assets')) {
        // Prepend backend origin if it's stored as a absolute path on backend e.g. /uploads/image.jpg
        imageSrc = `http://localhost:8000${imageSrc.startsWith('/') ? '' : '/'}${imageSrc}`;
      }

      // Add featured badge if applicable
      const featuredBadge = item.isFeatured 
        ? `<span class="featured-badge">Featured</span>` 
        : '';

      li.innerHTML = `
        ${featuredBadge}
        <img src="${imageSrc || 'assets/images/hot-beverages.png'}" alt="${item.name}" class="menu-image" onerror="this.onerror=null; this.src='assets/images/hot-beverages.png';">
        <h3 class="name">${item.name}</h3>
        <p class="category">${item.category}</p>
        <p class="text">${item.description}</p>
        <p class="price">₹${item.price}</p>
      `;

      menuList.appendChild(li);
    });
  }

  // Trigger initial fetch
  fetchMenu();
});
