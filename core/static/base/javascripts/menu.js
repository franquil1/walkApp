// scripts/menu

document.addEventListener("DOMContentLoaded", function () {
  const menu = document.getElementById("mobileMenu");
  const hamburger = document.querySelector(".hamburger");
  const closeBtn = document.getElementById("closeMenu");
  const menuLinks = menu.querySelectorAll("a");
  

  hamburger.addEventListener("click", function () {
    menu.classList.toggle("active");
  });

  closeBtn.addEventListener("click", function () {
    menu.classList.remove("active");
  });

  menuLinks.forEach((link) => {
    link.addEventListener("click", function () {
      menu.classList.remove("active");
    });
  });
});

