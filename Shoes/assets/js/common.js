(() => {
  const mobileToggle = document.getElementById("mobileToggle");
  const primaryNav = document.getElementById("primaryNav");

  if (mobileToggle && primaryNav) {
    mobileToggle.addEventListener("click", () => {
      primaryNav.classList.toggle("is-open");
    });
  }
})();
