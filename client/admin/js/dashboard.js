document.addEventListener('DOMContentLoaded', () => {
  const tokenKey = 'admin_token';
  const token = localStorage.getItem(tokenKey);
  if (!token) return; // Guarded by admin.js already

  // Helper to fetch authorization headers
  function getHeaders() {
    return {
      Authorization: `Bearer ${localStorage.getItem(tokenKey)}`
    };
  }

  // --- STATE FOR PAGINATION & FILTERING ---
  const state = {
    menu: { page: 1, limit: 10, search: '' },
    res: { page: 1, limit: 10, search: '', status: '' },
    contact: { page: 1, limit: 10, search: '' },
    review: { page: 1, limit: 10, search: '' }
  };

  // --- DOM SELECTORS ---
  const navTabs = document.querySelectorAll('.nav-tab');
  const tabPanes = document.querySelectorAll('.tab-pane');
  const pageTitle = document.getElementById('page-title');
  const logoutBtn = document.getElementById('logout-btn');

  // --- INITIALIZATION ---
  initDashboard();

  function initDashboard() {
    setupTabSwitching();
    loadOverview();
    setupModals();
    setupEventListeners();
  }

  // --- LOGOUT ---
  if (logoutBtn) {
    logoutBtn.addEventListener('click', () => {
      localStorage.removeItem(tokenKey);
      window.location.href = 'login.html';
    });
  }

  // --- TAB NAVIGATION ---
  function setupTabSwitching() {
    navTabs.forEach(tab => {
      tab.addEventListener('click', () => {
        navTabs.forEach(t => t.classList.remove('active'));
        tabPanes.forEach(pane => pane.classList.remove('active'));

        tab.classList.add('active');
        const targetId = tab.getAttribute('data-target');
        const targetPane = document.getElementById(targetId);
        targetPane.classList.add('active');

        // Update Header Title
        const sectionName = tab.querySelector('span').textContent;
        pageTitle.textContent = sectionName;

        // Load targeted tab content
        if (targetId === 'overview-section') loadOverview();
        if (targetId === 'menu-section') loadMenu();
        if (targetId === 'reservations-section') loadReservations();
        if (targetId === 'contacts-section') loadContacts();
        if (targetId === 'reviews-section') loadReviews();
      });
    });
  }

  // --- MODALS HELPER ---
  function setupModals() {
    const closeButtons = document.querySelectorAll('[data-close]');
    closeButtons.forEach(btn => {
      btn.addEventListener('click', () => {
        const modalId = btn.getAttribute('data-close');
        document.getElementById(modalId).classList.remove('active');
      });
    });
  }

  function openModal(modalId) {
    document.getElementById(modalId).classList.add('active');
  }

  function closeModal(modalId) {
    document.getElementById(modalId).classList.remove('active');
  }

  // --- 1. OVERVIEW VIEW ---
  async function loadOverview() {
    try {
      // Query with limit=1 to pull count meta-data quickly from different endpoints
      const [menuRes, resRes, contactRes, reviewRes] = await Promise.all([
        window.api.get('/menu?limit=1'),
        window.api.get('/reservations?status=Pending&limit=1', { headers: getHeaders() }),
        window.api.get('/contact?status=New&limit=1', { headers: getHeaders() }),
        window.api.get('/reviews?isApproved=false&limit=1', { headers: getHeaders() })
      ]);

      document.getElementById('stat-total-menu').textContent = menuRes.totalDocuments || 0;
      document.getElementById('stat-pending-reservations').textContent = resRes.totalDocuments || 0;
      document.getElementById('stat-new-contacts').textContent = contactRes.totalDocuments || 0;
      document.getElementById('stat-pending-reviews').textContent = reviewRes.totalDocuments || 0;

      // Load recent 5 reservations
      const recentRes = await window.api.get('/reservations?limit=5', { headers: getHeaders() });
      renderRecentReservations(recentRes.data || []);
    } catch (error) {
      console.error('Error loading dashboard overview:', error);
    }
  }

  function renderRecentReservations(reservations) {
    const tbody = document.getElementById('recent-reservations-tbody');
    if (!tbody) return;

    if (reservations.length === 0) {
      tbody.innerHTML = `<tr><td colspan="5" class="text-center">No recent bookings.</td></tr>`;
      return;
    }

    tbody.innerHTML = reservations.map(r => {
      const date = new Date(r.reservationDate).toLocaleDateString();
      return `
        <tr>
          <td><strong>${r.bookingReference}</strong></td>
          <td>${r.customerName}</td>
          <td>${date} @ ${r.reservationTime}</td>
          <td>${r.numberOfGuests}</td>
          <td><span class="badge badge-${r.status.toLowerCase()}">${r.status}</span></td>
        </tr>
      `;
    }).join('');
  }

  // --- 2. MENU TAB VIEW ---
  async function loadMenu() {
    const tbody = document.getElementById('menu-tbody');
    tbody.innerHTML = `<tr><td colspan="7" class="text-center">Loading...</td></tr>`;

    try {
      const { page, limit, search } = state.menu;
      const res = await window.api.get(`/menu?page=${page}&limit=${limit}&search=${encodeURIComponent(search)}`);
      
      renderMenuTable(res.data || []);
      renderPagination('menu-pagination', res.currentPage, res.totalPages, state.menu, loadMenu);
    } catch (error) {
      tbody.innerHTML = `<tr><td colspan="7" class="text-center text-danger">Failed to load menu items.</td></tr>`;
    }
  }

  function renderMenuTable(items) {
    const tbody = document.getElementById('menu-tbody');
    if (items.length === 0) {
      tbody.innerHTML = `<tr><td colspan="7" class="text-center">No menu items found.</td></tr>`;
      return;
    }

    tbody.innerHTML = items.map(item => `
      <tr>
        <td><img src="${item.image}" alt="${item.name}" class="table-image" onerror="this.src='../assets/images/hot-beverages.png'"></td>
        <td><strong>${item.name}</strong></td>
        <td>${item.category}</td>
        <td>₹${item.price}</td>
        <td>
          <label class="switch">
            <input type="checkbox" ${item.isAvailable ? 'checked' : ''} onchange="toggleMenuAvailability('${item._id}', this.checked)">
            <span class="slider"></span>
          </label>
        </td>
        <td>
          <label class="switch">
            <input type="checkbox" ${item.isFeatured ? 'checked' : ''} onchange="toggleMenuFeatured('${item._id}', this.checked)">
            <span class="slider"></span>
          </label>
        </td>
        <td>
          <div class="action-group">
            <button class="btn-icon edit-btn" onclick="editMenuItem('${item._id}')" title="Edit"><i class="fas fa-edit"></i></button>
            <button class="btn-icon delete-btn" onclick="deleteMenuItem('${item._id}')" title="Delete"><i class="fas fa-trash"></i></button>
          </div>
        </td>
      </tr>
    `).join('');
  }

  // --- 3. RESERVATIONS TAB VIEW ---
  async function loadReservations() {
    const tbody = document.getElementById('reservations-tbody');
    tbody.innerHTML = `<tr><td colspan="8" class="text-center">Loading...</td></tr>`;

    try {
      const { page, limit, search, status } = state.res;
      let url = `/reservations?page=${page}&limit=${limit}&search=${encodeURIComponent(search)}`;
      if (status) url += `&status=${status}`;

      const res = await window.api.get(url, { headers: getHeaders() });
      
      renderReservationsTable(res.data || []);
      renderPagination('res-pagination', res.currentPage, res.totalPages, state.res, loadReservations);
    } catch (error) {
      tbody.innerHTML = `<tr><td colspan="8" class="text-center text-danger">Failed to load reservations.</td></tr>`;
    }
  }

  function renderReservationsTable(reservations) {
    const tbody = document.getElementById('reservations-tbody');
    if (reservations.length === 0) {
      tbody.innerHTML = `<tr><td colspan="8" class="text-center">No reservations found.</td></tr>`;
      return;
    }

    tbody.innerHTML = reservations.map(r => {
      const date = new Date(r.reservationDate).toLocaleDateString();
      return `
        <tr>
          <td><strong>${r.bookingReference}</strong></td>
          <td>${r.customerName}</td>
          <td>${r.email}<br><small>${r.phone}</small></td>
          <td>${date} @ ${r.reservationTime}</td>
          <td>${r.numberOfGuests}</td>
          <td>${r.tableNumber || '<span class="text-warning">Not Assigned</span>'}</td>
          <td>
            <select class="badge badge-${r.status.toLowerCase()}" onchange="updateReservationStatus('${r._id}', this.value)">
              <option value="Pending" ${r.status === 'Pending' ? 'selected' : ''}>Pending</option>
              <option value="Confirmed" ${r.status === 'Confirmed' ? 'selected' : ''}>Confirmed</option>
              <option value="Cancelled" ${r.status === 'Cancelled' ? 'selected' : ''}>Cancelled</option>
              <option value="Completed" ${r.status === 'Completed' ? 'selected' : ''}>Completed</option>
            </select>
          </td>
          <td>
            <div class="action-group">
              <button class="btn-icon table-btn" onclick="openAssignTableModal('${r._id}', '${r.tableNumber || ''}')" title="Assign Table"><i class="fas fa-chair"></i></button>
              <button class="btn-icon delete-btn" onclick="deleteReservation('${r._id}')" title="Delete"><i class="fas fa-trash"></i></button>
            </div>
          </td>
        </tr>
      `;
    }).join('');
  }

  // --- 4. CONTACTS TAB VIEW ---
  async function loadContacts() {
    const tbody = document.getElementById('contacts-tbody');
    tbody.innerHTML = `<tr><td colspan="6" class="text-center">Loading...</td></tr>`;

    try {
      const { page, limit, search } = state.contact;
      const res = await window.api.get(`/contact?page=${page}&limit=${limit}&search=${encodeURIComponent(search)}`, { headers: getHeaders() });
      
      renderContactsTable(res.data || []);
      renderPagination('contact-pagination', res.currentPage, res.totalPages, state.contact, loadContacts);
    } catch (error) {
      tbody.innerHTML = `<tr><td colspan="6" class="text-center text-danger">Failed to load contact messages.</td></tr>`;
    }
  }

  function renderContactsTable(messages) {
    const tbody = document.getElementById('contacts-tbody');
    if (messages.length === 0) {
      tbody.innerHTML = `<tr><td colspan="6" class="text-center">No messages found.</td></tr>`;
      return;
    }

    tbody.innerHTML = messages.map(m => {
      const date = new Date(m.createdAt).toLocaleDateString();
      return `
        <tr>
          <td>${date}</td>
          <td><strong>${m.name}</strong><br><small>${m.email}</small></td>
          <td>${m.subject}</td>
          <td>
            <p class="text-preview" title="${m.message}">${m.message}</p>
            ${m.adminReply ? `<div class="admin-reply-box"><small><strong>Reply:</strong> ${m.adminReply}</small></div>` : ''}
          </td>
          <td>
            <select class="badge badge-${m.status.toLowerCase()}" onchange="updateContactStatus('${m._id}', this.value)">
              <option value="New" ${m.status === 'New' ? 'selected' : ''}>New</option>
              <option value="Read" ${m.status === 'Read' ? 'selected' : ''}>Read</option>
              <option value="Replied" ${m.status === 'Replied' ? 'selected' : ''}>Replied</option>
              <option value="Archived" ${m.status === 'Archived' ? 'selected' : ''}>Archived</option>
            </select>
          </td>
          <td>
            <div class="action-group">
              <button class="btn-icon confirm-btn" onclick="openContactReplyModal('${m._id}', \`${m.message.replace(/`/g, '\\`').replace(/'/g, "\\'")}\`)" title="Reply"><i class="fas fa-reply"></i></button>
              <button class="btn-icon delete-btn" onclick="deleteContact('${m._id}')" title="Delete"><i class="fas fa-trash"></i></button>
            </div>
          </td>
        </tr>
      `;
    }).join('');
  }

  // --- 5. REVIEWS TAB VIEW ---
  async function loadReviews() {
    const tbody = document.getElementById('reviews-tbody');
    tbody.innerHTML = `<tr><td colspan="7" class="text-center">Loading...</td></tr>`;

    try {
      const { page, limit, search } = state.review;
      const res = await window.api.get(`/reviews?page=${page}&limit=${limit}&search=${encodeURIComponent(search)}`, { headers: getHeaders() });
      
      renderReviewsTable(res.data || []);
      renderPagination('reviews-pagination', res.currentPage, res.totalPages, state.review, loadReviews);
    } catch (error) {
      tbody.innerHTML = `<tr><td colspan="7" class="text-center text-danger">Failed to load reviews.</td></tr>`;
    }
  }

  function renderReviewsTable(reviews) {
    const tbody = document.getElementById('reviews-tbody');
    if (reviews.length === 0) {
      tbody.innerHTML = `<tr><td colspan="7" class="text-center">No reviews found.</td></tr>`;
      return;
    }

    tbody.innerHTML = reviews.map(r => `
      <tr>
        <td><strong>${r.customerName}</strong><br><small>${r.email}</small></td>
        <td>
          <div class="rating-stars">${'★'.repeat(r.rating)}${'☆'.repeat(5 - r.rating)}</div>
          <strong>${r.title}</strong>
          <p>${r.comment}</p>
          ${r.menuItem ? `<small class="text-warning">Item: ${r.menuItem.name}</small>` : ''}
        </td>
        <td>
          <label class="switch">
            <input type="checkbox" ${r.isApproved ? 'checked' : ''} onchange="toggleReviewApproval('${r._id}', this.checked)">
            <span class="slider"></span>
          </label>
        </td>
        <td>
          <label class="switch">
            <input type="checkbox" ${r.isFeatured ? 'checked' : ''} onchange="toggleReviewFeatured('${r._id}', this.checked)">
            <span class="slider"></span>
          </label>
        </td>
        <td>${r.likes}</td>
        <td>
          ${r.adminReply ? `<small>${r.adminReply}</small>` : '<span class="text-secondary">No reply</span>'}
        </td>
        <td>
          <div class="action-group">
            <button class="btn-icon confirm-btn" onclick="openReviewReplyModal('${r._id}', \`${r.comment.replace(/`/g, '\\`').replace(/'/g, "\\'")}\`)" title="Reply"><i class="fas fa-reply"></i></button>
            <button class="btn-icon delete-btn" onclick="deleteReview('${r._id}')" title="Delete"><i class="fas fa-trash"></i></button>
          </div>
        </td>
      </tr>
    `).join('');
  }

  // --- GENERAL PAGINATION GENERATOR ---
  function renderPagination(elementId, currentPage, totalPages, subState, fetchFunction) {
    const footer = document.getElementById(elementId);
    if (!footer) return;

    footer.innerHTML = `
      <span>Page ${currentPage} of ${totalPages || 1}</span>
      <div class="pagination-btns">
        <button class="btn-pagination" id="${elementId}-prev" ${currentPage <= 1 ? 'disabled' : ''}>Previous</button>
        <button class="btn-pagination" id="${elementId}-next" ${currentPage >= totalPages ? 'disabled' : ''}>Next</button>
      </div>
    `;

    document.getElementById(`${elementId}-prev`).addEventListener('click', () => {
      subState.page -= 1;
      fetchFunction();
    });

    document.getElementById(`${elementId}-next`).addEventListener('click', () => {
      subState.page += 1;
      fetchFunction();
    });
  }

  // --- GLOBAL EVENT LISTENERS & SEARCH TRIGGER ---
  function setupEventListeners() {
    // Menu Search Input
    document.getElementById('menu-search-input').addEventListener('input', debounce((e) => {
      state.menu.search = e.target.value;
      state.menu.page = 1;
      loadMenu();
    }, 400));

    // Reservation Search Input
    document.getElementById('res-search-input').addEventListener('input', debounce((e) => {
      state.res.search = e.target.value;
      state.res.page = 1;
      loadReservations();
    }, 400));

    // Reservation Status Filter
    document.getElementById('res-filter-status').addEventListener('change', (e) => {
      state.res.status = e.target.value;
      state.res.page = 1;
      loadReservations();
    });

    // Contact Search Input
    document.getElementById('contact-search-input').addEventListener('input', debounce((e) => {
      state.contact.search = e.target.value;
      state.contact.page = 1;
      loadContacts();
    }, 400));

    // Review Search Input
    document.getElementById('review-search-input').addEventListener('input', debounce((e) => {
      state.review.search = e.target.value;
      state.review.page = 1;
      loadReviews();
    }, 400));

    // Menu Add Item trigger modal
    document.getElementById('open-menu-modal-btn').addEventListener('click', () => {
      document.getElementById('menu-item-form').reset();
      document.getElementById('menu-item-id').value = '';
      document.getElementById('menu-modal-title').textContent = 'Add Menu Item';
      openModal('menu-modal');
    });

    // Menu form save submit handler
    document.getElementById('menu-item-form').addEventListener('submit', handleMenuSubmit);

    // Reservation assign table submit
    document.getElementById('table-assign-form').addEventListener('submit', handleTableSubmit);

    // Contact Reply form submit
    document.getElementById('contact-reply-form').addEventListener('submit', handleContactReplySubmit);

    // Review Reply form submit
    document.getElementById('review-reply-form').addEventListener('submit', handleReviewReplySubmit);
  }

  // --- SUBMIT HANDLERS (POST / PATCH calls) ---

  async function handleMenuSubmit(e) {
    e.preventDefault();
    const id = document.getElementById('menu-item-id').value;
    const name = document.getElementById('menu-name').value.trim();
    const category = document.getElementById('menu-category').value;
    const price = parseFloat(document.getElementById('menu-price').value);
    const image = document.getElementById('menu-image').value.trim();
    const ingredientsRaw = document.getElementById('menu-ingredients').value;
    const description = document.getElementById('menu-description').value.trim();

    const ingredients = ingredientsRaw ? ingredientsRaw.split(',').map(s => s.trim()).filter(Boolean) : [];

    const payload = { name, category, price, image, ingredients, description };

    try {
      if (id) {
        // Edit Menu Item
        await window.api.patch(`/menu/${id}`, payload, { headers: getHeaders() });
        alert('Menu item updated successfully.');
      } else {
        // Add Menu Item
        await window.api.post('/menu', payload, { headers: getHeaders() });
        alert('Menu item added successfully.');
      }
      closeModal('menu-modal');
      loadMenu();
    } catch (err) {
      alert(err.data && err.data.message ? err.data.message : 'Save menu item failed.');
    }
  }

  async function handleTableSubmit(e) {
    e.preventDefault();
    const id = document.getElementById('table-res-id').value;
    const tableNumber = parseInt(document.getElementById('assign-table-number').value, 10);

    try {
      await window.api.patch(`/reservations/${id}/table`, { tableNumber }, { headers: getHeaders() });
      alert('Table successfully assigned.');
      closeModal('table-modal');
      loadReservations();
    } catch (err) {
      alert(err.data && err.data.message ? err.data.message : 'Assign table failed.');
    }
  }

  async function handleContactReplySubmit(e) {
    e.preventDefault();
    const id = document.getElementById('contact-msg-id').value;
    const adminReply = document.getElementById('contact-admin-reply').value.trim();

    try {
      await window.api.patch(`/contact/${id}/reply`, { adminReply }, { headers: getHeaders() });
      alert('Reply sent successfully.');
      closeModal('contact-reply-modal');
      loadContacts();
    } catch (err) {
      alert(err.data && err.data.message ? err.data.message : 'Submit reply failed.');
    }
  }

  async function handleReviewReplySubmit(e) {
    e.preventDefault();
    const id = document.getElementById('review-item-id').value;
    const adminReply = document.getElementById('review-admin-reply').value.trim();

    try {
      await window.api.patch(`/reviews/${id}/reply`, { adminReply }, { headers: getHeaders() });
      alert('Review reply saved successfully.');
      closeModal('review-reply-modal');
      loadReviews();
    } catch (err) {
      alert(err.data && err.data.message ? err.data.message : 'Submit reply failed.');
    }
  }

  // --- DYNAMIC ACTIONS TRIGGERS (EXPOSED GLOBALLY) ---

  window.toggleMenuAvailability = async (id, isAvailable) => {
    try {
      await window.api.patch(`/menu/${id}/availability`, { isAvailable }, { headers: getHeaders() });
    } catch (err) {
      alert('Update availability failed.');
      loadMenu();
    }
  };

  window.toggleMenuFeatured = async (id, isFeatured) => {
    try {
      await window.api.patch(`/menu/${id}/featured`, { isFeatured }, { headers: getHeaders() });
    } catch (err) {
      alert('Update featured status failed.');
      loadMenu();
    }
  };

  window.editMenuItem = async (id) => {
    try {
      const res = await window.api.get(`/menu/${id}`);
      if (res && res.data) {
        document.getElementById('menu-item-id').value = res.data._id;
        document.getElementById('menu-name').value = res.data.name;
        document.getElementById('menu-category').value = res.data.category;
        document.getElementById('menu-price').value = res.data.price;
        document.getElementById('menu-image').value = res.data.image;
        document.getElementById('menu-ingredients').value = (res.data.ingredients || []).join(', ');
        document.getElementById('menu-description').value = res.data.description;

        document.getElementById('menu-modal-title').textContent = 'Edit Menu Item';
        openModal('menu-modal');
      }
    } catch (err) {
      alert('Fetch menu details failed.');
    }
  };

  window.deleteMenuItem = async (id) => {
    if (confirm('Are you sure you want to delete this menu item?')) {
      try {
        await window.api.delete(`/menu/${id}`, { headers: getHeaders() });
        alert('Menu item deleted successfully.');
        loadMenu();
      } catch (err) {
        alert('Delete failed.');
      }
    }
  };

  window.updateReservationStatus = async (id, status) => {
    try {
      await window.api.patch(`/reservations/${id}/status`, { status }, { headers: getHeaders() });
      alert(`Reservation status updated to ${status}.`);
      loadReservations();
    } catch (err) {
      alert(err.data && err.data.message ? err.data.message : 'Update status failed.');
      loadReservations();
    }
  };

  window.openAssignTableModal = (id, currentTable) => {
    document.getElementById('table-res-id').value = id;
    document.getElementById('assign-table-number').value = currentTable;
    openModal('table-modal');
  };

  window.deleteReservation = async (id) => {
    if (confirm('Are you sure you want to delete this reservation?')) {
      try {
        await window.api.delete(`/reservations/${id}`, { headers: getHeaders() });
        alert('Reservation deleted successfully.');
        loadReservations();
      } catch (err) {
        alert('Delete reservation failed.');
      }
    }
  };

  window.updateContactStatus = async (id, status) => {
    try {
      await window.api.patch(`/contact/${id}/status`, { status }, { headers: getHeaders() });
      loadContacts();
    } catch (err) {
      alert('Update contact status failed.');
      loadContacts();
    }
  };

  window.openContactReplyModal = (id, messageText) => {
    document.getElementById('contact-msg-id').value = id;
    document.getElementById('original-contact-msg').textContent = messageText;
    document.getElementById('contact-admin-reply').value = '';
    openModal('contact-reply-modal');
  };

  window.deleteContact = async (id) => {
    if (confirm('Are you sure you want to delete this contact message?')) {
      try {
        await window.api.delete(`/contact/${id}`, { headers: getHeaders() });
        alert('Message deleted successfully.');
        loadContacts();
      } catch (err) {
        alert('Delete failed.');
      }
    }
  };

  window.toggleReviewApproval = async (id, isApproved) => {
    try {
      if (isApproved) {
        await window.api.patch(`/reviews/${id}/approve`, {}, { headers: getHeaders() });
        alert('Review approved successfully.');
      } else {
        // Toggle approval back off (can update review update endpoint directly)
        await window.api.patch(`/reviews/${id}`, { isApproved: false }, { headers: getHeaders() });
        alert('Review approval revoked.');
      }
      loadReviews();
    } catch (err) {
      alert('Review approval update failed.');
      loadReviews();
    }
  };

  window.toggleReviewFeatured = async (id, isFeatured) => {
    try {
      await window.api.patch(`/reviews/${id}/feature`, { isFeatured }, { headers: getHeaders() });
      loadReviews();
    } catch (err) {
      alert('Update featured status failed.');
      loadReviews();
    }
  };

  window.openReviewReplyModal = (id, commentText) => {
    document.getElementById('review-item-id').value = id;
    document.getElementById('original-review-comment').textContent = commentText;
    document.getElementById('review-admin-reply').value = '';
    openModal('review-reply-modal');
  };

  window.deleteReview = async (id) => {
    if (confirm('Are you sure you want to delete this review?')) {
      try {
        await window.api.delete(`/reviews/${id}`, { headers: getHeaders() });
        alert('Review deleted successfully.');
        loadReviews();
      } catch (err) {
        alert('Delete failed.');
      }
    }
  };

  // --- UTILITIES (Debounce helper) ---
  function debounce(func, wait) {
    let timeout;
    return function (...args) {
      clearTimeout(timeout);
      timeout = setTimeout(() => func.apply(this, args), wait);
    };
  }
});
