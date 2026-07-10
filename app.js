const STORAGE_KEY = "bobbie-weight-history";
const THEME_KEY = "bobbie-color-theme";
const NICKNAME_KEY = "bobbie-nicknames";

const elements = {
  today: document.querySelector("#today"),
  dialog: document.querySelector("#weightDialog"),
  form: document.querySelector("#weightForm"),
  input: document.querySelector("#weightInput"),
  error: document.querySelector("#formError"),
  latest: document.querySelector("#latestWeight"),
  unit: document.querySelector("#weightUnit"),
  meta: document.querySelector("#weightMeta"),
  historySection: document.querySelector("#historySection"),
  historyList: document.querySelector("#historyList"),
  toast: document.querySelector("#toast"),
  nicknameDialog: document.querySelector("#nicknameDialog"),
  nicknameForm: document.querySelector("#nicknameForm"),
  nicknameInput: document.querySelector("#nicknameInput"),
  nicknameError: document.querySelector("#nicknameError"),
  nicknamePreview: document.querySelector("#nicknamePreview"),
};

const dateFormatter = new Intl.DateTimeFormat("nl-NL", { day: "numeric", month: "long", year: "numeric" });
const shortDateFormatter = new Intl.DateTimeFormat("nl-NL", { weekday: "short", day: "numeric", month: "short" });
const weightFormatter = new Intl.NumberFormat("nl-NL", { minimumFractionDigits: 1, maximumFractionDigits: 1 });

function setTheme(theme) {
  document.documentElement.dataset.theme = theme;
  localStorage.setItem(THEME_KEY, theme);
  document.querySelectorAll(".theme-option").forEach(option => {
    option.classList.toggle("active", option.dataset.theme === theme);
  });
}

setTheme(localStorage.getItem(THEME_KEY) || "sage");

const themeToggle = document.querySelector("#themeToggle");
const themeMenu = document.querySelector("#themeMenu");
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

function getHistory() {
  try { return JSON.parse(localStorage.getItem(STORAGE_KEY)) ?? []; }
  catch { return []; }
}

function saveHistory(history) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(history));
}

function getNicknames() {
  try { return JSON.parse(localStorage.getItem(NICKNAME_KEY)) ?? []; }
  catch { return []; }
}

function saveNicknames(nicknames) {
  localStorage.setItem(NICKNAME_KEY, JSON.stringify(nicknames));
}

function escapeHtml(value) {
  const element = document.createElement("div");
  element.textContent = value;
  return element.innerHTML;
}

function render() {
  const history = getHistory();
  const latest = history[0];
  elements.today.textContent = dateFormatter.format(new Date());

  if (!latest) {
    elements.latest.textContent = "—";
    elements.unit.textContent = "";
    elements.meta.textContent = "Nog geen gewicht gelogd";
    elements.historySection.hidden = true;
    return;
  }

  elements.latest.textContent = weightFormatter.format(latest.weight);
  elements.unit.textContent = "kg";
  elements.meta.textContent = `Gemeten op ${dateFormatter.format(new Date(latest.date))}`;
  elements.historySection.hidden = false;
  elements.historyList.innerHTML = history.slice(0, 5).map((item, index) => `
    <div class="history-row">
      <span class="history-date">${index === 0 ? "Vandaag" : shortDateFormatter.format(new Date(item.date))}</span>
      <span class="history-actions">
        <span class="history-weight">${weightFormatter.format(item.weight)} kg</span>
        <button class="delete-entry" data-delete-weight="${item.date}" type="button" aria-label="Meting verwijderen">×</button>
      </span>
    </div>
  `).join("");
}

function renderNicknames() {
  const nicknames = getNicknames();
  if (!nicknames.length) {
    elements.nicknamePreview.innerHTML = "<p>Nog geen bijnaampjes toegevoegd</p>";
    return;
  }
  elements.nicknamePreview.innerHTML = nicknames.map(item => `
    <span class="nickname-chip">
      ${escapeHtml(item.name)}
      <button data-delete-nickname="${item.id}" type="button" aria-label="${escapeHtml(item.name)} verwijderen">×</button>
    </span>
  `).join("");
}

document.querySelector("#openWeight").addEventListener("click", () => {
  elements.error.textContent = "";
  elements.input.value = "";
  elements.dialog.showModal();
  setTimeout(() => elements.input.focus(), 100);
});

document.querySelector("#closeDialog").addEventListener("click", () => elements.dialog.close());

elements.dialog.addEventListener("click", (event) => {
  if (event.target === elements.dialog) elements.dialog.close();
});

elements.form.addEventListener("submit", (event) => {
  event.preventDefault();
  const weight = Number(elements.input.value.replace(",", "."));
  if (!Number.isFinite(weight) || weight <= 0 || weight > 150) {
    elements.error.textContent = "Vul een geldig gewicht tussen 0 en 150 kg in.";
    return;
  }

  const history = getHistory();
  history.unshift({ weight, date: new Date().toISOString() });
  saveHistory(history);
  elements.dialog.close();
  render();
  elements.toast.textContent = "Gewicht opgeslagen ✓";
  elements.toast.classList.add("show");
  setTimeout(() => elements.toast.classList.remove("show"), 2400);
});

document.querySelector("#clearHistory").addEventListener("click", () => {
  if (confirm("Weet je zeker dat je alle metingen wilt wissen?")) {
    localStorage.removeItem(STORAGE_KEY);
    render();
  }
});

elements.historyList.addEventListener("click", event => {
  const button = event.target.closest("[data-delete-weight]");
  if (!button) return;
  const updated = getHistory().filter(item => item.date !== button.dataset.deleteWeight);
  saveHistory(updated);
  render();
});

document.querySelector("#openNickname").addEventListener("click", () => {
  elements.nicknameError.textContent = "";
  elements.nicknameInput.value = "";
  elements.nicknameDialog.showModal();
  setTimeout(() => elements.nicknameInput.focus(), 100);
});

document.querySelector("#closeNicknameDialog").addEventListener("click", () => elements.nicknameDialog.close());
elements.nicknameDialog.addEventListener("click", event => {
  if (event.target === elements.nicknameDialog) elements.nicknameDialog.close();
});

elements.nicknameForm.addEventListener("submit", event => {
  event.preventDefault();
  const name = elements.nicknameInput.value.trim();
  if (!name || name.length > 30) {
    elements.nicknameError.textContent = "Vul een bijnaampje van maximaal 30 tekens in.";
    return;
  }
  const nicknames = getNicknames();
  if (nicknames.some(item => item.name.toLocaleLowerCase("nl-NL") === name.toLocaleLowerCase("nl-NL"))) {
    elements.nicknameError.textContent = "Dit bijnaampje staat al in de lijst.";
    return;
  }
  nicknames.unshift({ id: crypto.randomUUID ? crypto.randomUUID() : String(Date.now()), name });
  saveNicknames(nicknames);
  elements.nicknameDialog.close();
  renderNicknames();
  elements.toast.textContent = "Bijnaampje opgeslagen ✓";
  elements.toast.classList.add("show");
  setTimeout(() => elements.toast.classList.remove("show"), 2400);
});

elements.nicknamePreview.addEventListener("click", event => {
  const button = event.target.closest("[data-delete-nickname]");
  if (!button) return;
  saveNicknames(getNicknames().filter(item => item.id !== button.dataset.deleteNickname));
  renderNicknames();
});

render();
renderNicknames();
