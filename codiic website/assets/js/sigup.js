const form = document.getElementById("signupForm");
const businessName = document.getElementById("businessName");
const storeUrl = document.getElementById("storeUrl");
const storeUrlPreview = document.querySelector(".store-url-preview");
const businessCategory = document.getElementById("businessCategory");
const email = document.getElementById("email");
const mobile = document.getElementById("mobile");
const password = document.getElementById("password");
const terms = document.getElementById("terms");
const togglePassword = document.getElementById("togglePassword");
const strengthProgress = document.getElementById("strengthProgress");
const strengthLabel = document.getElementById("strengthLabel");

function slugify(text) {
  return text
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9\s-]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-");
}

function setFieldState(fieldId, statusId, type, message) {
  const field = document.getElementById(fieldId);
  const status = document.getElementById(statusId);
  field.classList.remove("state-error", "state-success");

  if (type === "error") {
    field.classList.add("state-error");
  }
  if (type === "success") {
    field.classList.add("state-success");
  }

  status.className = "status-msg";
  if (type) {
    status.classList.add(type);
  }
  status.textContent = message || "";
}

function updateStoreUrlFromBusinessName() {
  if (!storeUrl.value.trim()) {
    const slug = slugify(businessName.value) || "yourstore";
    storeUrl.value = slug;
  }
  storeUrlPreview.textContent = `https://${storeUrl.value || "yourstore"}.codiic.com`;
}

function calculatePasswordStrength(value) {
  let score = 0;
  if (value.length >= 8) score += 1;
  if (/[A-Z]/.test(value) && /[a-z]/.test(value)) score += 1;
  if (/[0-9]/.test(value)) score += 1;
  if (/[^A-Za-z0-9]/.test(value)) score += 1;

  if (score <= 1) {
    return { label: "Weak", width: "33%", color: "#ef4444" };
  }
  if (score <= 3) {
    return { label: "Medium", width: "66%", color: "#f59e0b" };
  }
  return { label: "Strong", width: "100%", color: "#22c55e" };
}

function validateField() {
  const businessNameValid = businessName.value.trim().length >= 2;
  setFieldState(
    "businessNameField",
    "businessNameStatus",
    businessNameValid ? "success" : "error",
    businessNameValid ? "Looks good." : "Please enter a valid business name."
  );

  const storeUrlValid = /^[a-z0-9-]{3,40}$/i.test(storeUrl.value.trim());
  setFieldState(
    "storeUrlField",
    "storeUrlStatus",
    storeUrlValid ? "success" : "error",
    storeUrlValid ? "Great! Your URL is available format-wise." : "Use 3-40 letters, numbers, or hyphens."
  );

  const categorySelected = Boolean(businessCategory.value);
  setFieldState(
    "businessCategoryField",
    "businessCategoryStatus",
    categorySelected ? "success" : "error",
    categorySelected ? "Category selected." : "Please select a business category."
  );

  const emailValid = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.value.trim());
  setFieldState(
    "emailField",
    "emailStatus",
    emailValid ? "success" : "error",
    emailValid ? "Valid email address." : "Please enter a valid email."
  );

  const mobileValid = /^[0-9]{10}$/.test(mobile.value.trim());
  setFieldState(
    "mobileField",
    "mobileStatus",
    mobileValid ? "success" : "error",
    mobileValid ? "Mobile number looks valid." : "Enter a 10-digit mobile number."
  );

  const pass = password.value;
  const strength = calculatePasswordStrength(pass);
  strengthProgress.style.width = strength.width;
  strengthProgress.style.background = strength.color;
  strengthLabel.textContent = `Strength: ${strength.label}`;

  const passValid = pass.length >= 8;
  setFieldState(
    "passwordField",
    "passwordStatus",
    passValid ? "success" : "error",
    passValid ? "Password meets minimum length." : "Use at least 8 characters."
  );

  const termsStatus = document.getElementById("termsStatus");
  termsStatus.className = "status-msg";
  if (!terms.checked) {
    termsStatus.classList.add("error");
    termsStatus.textContent = "Please accept Terms of Service and Privacy Policy.";
  } else {
    termsStatus.classList.add("success");
    termsStatus.textContent = "Thanks for accepting the terms.";
  }

  return businessNameValid && storeUrlValid && categorySelected && emailValid && mobileValid && passValid && terms.checked;
}

businessName.addEventListener("input", () => {
  updateStoreUrlFromBusinessName();
  validateField();
});

storeUrl.addEventListener("input", () => {
  storeUrl.value = slugify(storeUrl.value);
  storeUrlPreview.textContent = `https://${storeUrl.value || "yourstore"}.codiic.com`;
  validateField();
});

[businessCategory, email, mobile, password, terms].forEach((input) => {
  input.addEventListener("input", validateField);
  input.addEventListener("change", validateField);
});

businessCategory.addEventListener("change", () => {
  businessCategory.classList.toggle("has-value", Boolean(businessCategory.value));
});

togglePassword.addEventListener("click", () => {
  const showing = password.type === "text";
  password.type = showing ? "password" : "text";
  togglePassword.textContent = showing ? "Show" : "Hide";
});

form.addEventListener("submit", (event) => {
  event.preventDefault();
  if (!validateField()) return;
  window.location.href = "https://auth.codiic.com";
});

updateStoreUrlFromBusinessName();
