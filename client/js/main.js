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
