document.addEventListener('DOMContentLoaded', () => {
  const tokenKey = 'admin_token';
  const loginForm = document.getElementById('login-form');

  // 1. Auth Guard Checks
  const token = localStorage.getItem(tokenKey);
  const path = window.location.pathname;
  const isLoginPage = path.includes('login.html');

  if (isLoginPage) {
    if (token) {
      // Attempting to check if token is valid, redirect to dashboard if profile loads
      window.authApi.getProfile()
        .then(() => {
          window.location.href = 'dashboard.html';
        })
        .catch(() => {
          // Token is invalid, remove it
          localStorage.removeItem(tokenKey);
        });
    }

    // Handle Login Form Submission
    if (loginForm) {
      loginForm.addEventListener('submit', async (e) => {
        e.preventDefault();

        const emailInput = document.getElementById('email');
        const passwordInput = document.getElementById('password');
        const submitBtn = document.getElementById('login-submit-btn');

        if (!emailInput || !passwordInput || !submitBtn) return;

        const email = emailInput.value.trim();
        const password = passwordInput.value;

        // Set Loading State
        const originalText = submitBtn.innerHTML;
        submitBtn.disabled = true;
        submitBtn.innerHTML = '<span>Verifying...</span> <i class="fas fa-spinner fa-spin"></i>';

        try {
          const response = await window.authApi.login(email, password);

          if (response && response.success && response.token) {
            localStorage.setItem(tokenKey, response.token);
            window.location.href = 'dashboard.html';
          } else {
            throw new Error(response.message || 'Login failed.');
          }
        } catch (error) {
          const errMsg = error.data && error.data.message 
            ? error.data.message 
            : (error.message || 'Incorrect credentials. Please try again.');
          alert(errMsg);
        } finally {
          submitBtn.disabled = false;
          submitBtn.innerHTML = originalText;
        }
      });
    }
  } else {
    // We are on a protected dashboard page
    if (!token) {
      window.location.href = 'login.html';
    } else {
      // Validate Token by fetching profile
      window.authApi.getProfile()
        .then(profileResponse => {
          // Populates admin profile details
          const adminNameEl = document.getElementById('admin-display-name');
          if (adminNameEl && profileResponse && profileResponse.data) {
            adminNameEl.textContent = profileResponse.data.name;
          }
        })
        .catch(() => {
          localStorage.removeItem(tokenKey);
          window.location.href = 'login.html';
        });
    }
  }
});
