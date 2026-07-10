const THEME_KEY = "bobbie-color-theme";
const savedTheme = localStorage.getItem(THEME_KEY) || "sage";
document.documentElement.dataset.theme = savedTheme;

const themeToggle = document.querySelector("#themeToggle");
const themeMenu = document.querySelector("#themeMenu");

function setTheme(theme) {
  document.documentElement.dataset.theme = theme;
  localStorage.setItem(THEME_KEY, theme);
  document.querySelectorAll(".theme-option").forEach(option => {
    option.classList.toggle("active", option.dataset.theme === theme);
  });
}

setTheme(savedTheme);
themeToggle.addEventListener("click", event => {
  event.stopPropagation();
  const isOpen = themeMenu.classList.toggle("open");
  themeToggle.setAttribute("aria-expanded", isOpen);
});
document.querySelectorAll(".theme-option").forEach(option => option.addEventListener("click", () => {
  setTheme(option.dataset.theme);
  themeMenu.classList.remove("open");
  themeToggle.setAttribute("aria-expanded", "false");
}));
document.addEventListener("click", event => {
  if (!event.target.closest(".theme-picker")) {
    themeMenu.classList.remove("open");
    themeToggle.setAttribute("aria-expanded", "false");
  }
});
