const menuOpenButton = document.querySelector("#menu-open-button");
const menuCloseButton = document.querySelector("#menu-close-button");
const navLinks = document.querySelectorAll(".nav-menu .nav-link");

if (menuOpenButton && menuCloseButton) {
  menuOpenButton.addEventListener("click", () => {
    document.body.classList.add("show-menu");
  });

  menuCloseButton.addEventListener("click", () => {
    document.body.classList.remove("show-menu");
  });
}

navLinks.forEach(link => {
  link.addEventListener("click", () => {
    document.body.classList.remove("show-menu");
  });
});

// Contact Form Integration
const contactForm = document.querySelector(".contact-form");
if (contactForm) {
  contactForm.addEventListener("submit", async (e) => {
    e.preventDefault();

    const nameInput = contactForm.querySelector('input[placeholder*="Name"]');
    const emailInput = contactForm.querySelector('input[placeholder*="email"]');
    const messageInput = contactForm.querySelector('textarea');
    const submitBtn = contactForm.querySelector(".submit-button");

    if (!nameInput || !emailInput || !messageInput || !submitBtn) return;

    // Trim all inputs
    const name = nameInput.value.trim();
    const email = emailInput.value.trim();
    const message = messageInput.value.trim();
    
    // UI lacks a subject field, so we generate a clean, automated subject
    const subject = `Website Inquiry from ${name}`;

    // Client-side validations
    if (!name || name.length < 3) {
      alert("Name must be at least 3 characters long.");
      return;
    }

    const emailRegex = /^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/;
    if (!email || !emailRegex.test(email)) {
      alert("Please enter a valid email address.");
      return;
    }

    if (!message || message.length < 10) {
      alert("Message must be at least 10 characters long.");
      return;
    }

    // Set Loading State on Button
    const originalText = submitBtn.textContent;
    submitBtn.disabled = true;
    submitBtn.textContent = "Sending...";

    try {
      const response = await window.contactApi.submitContact({
        name,
        email,
        subject,
        message
      });

      if (response && response.success) {
        alert("Message sent successfully.");
        contactForm.reset();
      } else {
        throw new Error(response.message || "Failed to submit message.");
      }
    } catch (error) {
      // Handles backend validation errors or duplicate submissions
      const backendError = error.data && error.data.message 
        ? error.data.message 
        : (error.message || "Something went wrong. Please try again.");
      alert(backendError);
    } finally {
      // Reset button state
      submitBtn.disabled = false;
      submitBtn.textContent = originalText;
    }
  });
}

// Reservation Form Integration
const reservationForm = document.querySelector(".reservation-form");
if (reservationForm) {
  reservationForm.addEventListener("submit", async (e) => {
    e.preventDefault();

    const nameInput = reservationForm.querySelector('[name="customerName"], input[placeholder*="Name"]');
    const emailInput = reservationForm.querySelector('[name="email"], input[placeholder*="Email"], input[type="email"]');
    const phoneInput = reservationForm.querySelector('[name="phone"], input[placeholder*="Phone"], input[type="tel"]');
    const dateInput = reservationForm.querySelector('[name="reservationDate"], input[type="date"]');
    const timeInput = reservationForm.querySelector('[name="reservationTime"], input[type="time"]');
    const guestsInput = reservationForm.querySelector('[name="numberOfGuests"], select, input[type="number"]');
    const requestInput = reservationForm.querySelector('[name="specialRequest"], textarea');
    const submitBtn = reservationForm.querySelector(".submit-button, button[type='submit']");

    if (!nameInput || !emailInput || !phoneInput || !dateInput || !timeInput || !guestsInput || !submitBtn) return;

    // Trim inputs
    const customerName = nameInput.value.trim();
    const email = emailInput.value.trim();
    const phone = phoneInput.value.trim();
    const reservationDate = dateInput.value.trim();
    const reservationTime = timeInput.value.trim();
    const numberOfGuests = parseInt(guestsInput.value, 10);
    const specialRequest = requestInput ? requestInput.value.trim() : "";

    // Client-side validations
    if (!customerName || customerName.length < 3) {
      alert("Name must be at least 3 characters long.");
      return;
    }

    const emailRegex = /^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/;
    if (!email || !emailRegex.test(email)) {
      alert("Please enter a valid email address.");
      return;
    }

    const phoneRegex = /^[6-9]\d{9}$/;
    if (!phone || !phoneRegex.test(phone)) {
      alert("Please enter a valid 10-digit Indian mobile number.");
      return;
    }

    if (!reservationDate) {
      alert("Please select a reservation date.");
      return;
    }

    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const selectedDate = new Date(reservationDate);
    selectedDate.setHours(0, 0, 0, 0);
    if (selectedDate < today) {
      alert("Reservation date cannot be in the past.");
      return;
    }

    const timeRegex = /^(0[0-9]|1[0-9]|2[0-3]):[0-5][0-9]$/;
    if (!reservationTime || !timeRegex.test(reservationTime)) {
      alert("Please select a valid time.");
      return;
    }

    if (isNaN(numberOfGuests) || numberOfGuests < 1 || numberOfGuests > 20) {
      alert("Number of guests must be between 1 and 20.");
      return;
    }

    // Set Loading State on Button
    const originalText = submitBtn.textContent;
    submitBtn.disabled = true;
    submitBtn.textContent = "Booking...";

    try {
      const response = await window.reservationApi.createReservation({
        customerName,
        email,
        phone,
        reservationDate,
        reservationTime,
        numberOfGuests,
        specialRequest
      });

      if (response && response.success && response.data) {
        alert(`Reservation Created!\nReference: ${response.data.bookingReference}`);
        reservationForm.reset();
      } else {
        throw new Error(response.message || "Failed to submit reservation.");
      }
    } catch (error) {
      // Handles backend validation errors or duplicate submissions
      const backendError = error.data && error.data.message 
        ? error.data.message 
        : (error.message || "Something went wrong. Please try again.");
      alert(backendError);
    } finally {
      // Reset button state
      submitBtn.disabled = false;
      submitBtn.textContent = originalText;
    }
  });
}
