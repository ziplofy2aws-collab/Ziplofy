const signinForm = document.getElementById("signinForm");
const signinIdentity = document.getElementById("signinIdentity");

signinForm.addEventListener("submit", (event) => {
  event.preventDefault();

  if (!signinIdentity.value.trim()) {
    signinIdentity.focus();
    return;
  }

  window.location.href = "https://auth.codiic.com";
});
