/* =============================================================
   1. CONSTANTS & STATE
   ============================================================= */
const KEYS = {
  name:   'dash_name',
  theme:  'dash_theme',
  tasks:  'dash_tasks',
  links:  'dash_links',
  timer:  'dash_timer_duration',
};

const state = {
  tasks: [],   // [{ id, text, done }]
  links: [],   // [{ id, label, url }]
  timerDuration: 25,      // minutes
  timerRemaining: 25 * 60, // seconds
  timerRunning: false,
  timerInterval: null,
  editingTaskId: null,
};

/* =============================================================
   2. UTILITIES
   ============================================================= */
const save = (key, value) => localStorage.setItem(key, JSON.stringify(value));
const load = (key, fallback) => {
  try {
    const raw = localStorage.getItem(key);
    return raw !== null ? JSON.parse(raw) : fallback;
  } catch {
    return fallback;
  }
};

const uid = () => Date.now().toString(36) + Math.random().toString(36).slice(2);

// Toast notifications
let toastContainer = null;
const showToast = (message, type = 'info') => {
  if (!toastContainer) {
    toastContainer = document.createElement('div');
    toastContainer.className = 'toast-container';
    document.body.appendChild(toastContainer);
  }
  const toast = document.createElement('div');
  toast.className = `toast toast--${type}`;
  toast.textContent = message;
  toastContainer.appendChild(toast);
  setTimeout(() => toast.remove(), 2900);
};

/* =============================================================
   3. GREETING — time, date, custom name
   ============================================================= */
const datetimeEl = document.getElementById('datetime');
const greetingEl = document.getElementById('greeting');

const getGreeting = (hour) => {
  if (hour < 5)  return 'Good night';
  if (hour < 12) return 'Good morning';
  if (hour < 17) return 'Good afternoon';
  if (hour < 21) return 'Good evening';
  return 'Good night';
};

const updateClock = () => {
  const now = new Date();
  const h = now.getHours();
  const m = String(now.getMinutes()).padStart(2, '0');
  const dayNames = ['Sunday','Monday','Tuesday','Wednesday','Thursday','Friday','Saturday'];
  const monthNames = ['January','February','March','April','May','June',
                      'July','August','September','October','November','December'];
  datetimeEl.textContent =
    `${dayNames[now.getDay()]}, ${monthNames[now.getMonth()]} ${now.getDate()}, ${now.getFullYear()} — ${h}:${m}`;

  const name = load(KEYS.name, '');
  greetingEl.textContent = name
    ? `${getGreeting(h)}, ${name}! 👋`
    : `${getGreeting(h)}! 👋`;
};

// Name modal
const nameModal      = document.getElementById('name-modal');
const nameInput      = document.getElementById('name-input');
const nameSaveBtn    = document.getElementById('name-save-btn');
const nameCancelBtn  = document.getElementById('name-cancel-btn');
const editNameBtn    = document.getElementById('edit-name-btn');

const openNameModal = () => {
  nameInput.value = load(KEYS.name, '');
  nameModal.classList.remove('hidden');
  nameInput.focus();
};

const closeNameModal = () => nameModal.classList.add('hidden');

const saveName = () => {
  const trimmed = nameInput.value.trim();
  save(KEYS.name, trimmed);
  updateClock();
  closeNameModal();
  // First-time save: say hello
  if (trimmed) showToast(`Hello, ${trimmed}!`, 'success');
};

editNameBtn.addEventListener('click', openNameModal);
nameSaveBtn.addEventListener('click', saveName);
nameCancelBtn.addEventListener('click', closeNameModal);
nameInput.addEventListener('keydown', (e) => { if (e.key === 'Enter') saveName(); });
nameModal.querySelector('.modal__backdrop').addEventListener('click', closeNameModal);

// Show name modal on first visit (no name stored)
if (!load(KEYS.name, '')) {
  setTimeout(openNameModal, 400);
}

updateClock();
setInterval(updateClock, 1000);

/* =============================================================
   4. THEME — light / dark
   ============================================================= */
const themeToggle = document.getElementById('theme-toggle');

const applyTheme = (theme) => {
  document.documentElement.setAttribute('data-theme', theme);
  themeToggle.textContent = theme === 'dark' ? '☀️' : '🌙';
  themeToggle.setAttribute('aria-label', theme === 'dark' ? 'Switch to light mode' : 'Switch to dark mode');
};

const toggleTheme = () => {
  const current = document.documentElement.getAttribute('data-theme');
  const next = current === 'dark' ? 'light' : 'dark';
  save(KEYS.theme, next);
  applyTheme(next);
};

themeToggle.addEventListener('click', toggleTheme);
applyTheme(load(KEYS.theme, 'light'));

/* =============================================================
   5. FOCUS TIMER
   ============================================================= */
const timerDisplay  = document.getElementById('timer-display');
const timerStart    = document.getElementById('timer-start');
const timerStop     = document.getElementById('timer-stop');
const timerReset    = document.getElementById('timer-reset');
const timerDurInput = document.getElementById('timer-duration');
const timerSetBtn   = document.getElementById('timer-set-btn');

const formatTime = (seconds) => {
  const m = String(Math.floor(seconds / 60)).padStart(2, '0');
  const s = String(seconds % 60).padStart(2, '0');
  return `${m}:${s}`;
};

const renderTimer = () => {
  timerDisplay.textContent = formatTime(state.timerRemaining);
  document.title = state.timerRunning
    ? `${formatTime(state.timerRemaining)} — Dashboard`
    : 'My Dashboard';
};

const initTimer = () => {
  const saved = load(KEYS.timer, 25);
  state.timerDuration = saved;
  state.timerRemaining = saved * 60;
  timerDurInput.value = saved;
  renderTimer();
};

const startTimer = () => {
  if (state.timerRunning) return;
  state.timerRunning = true;
  timerStart.disabled = true;
  timerStop.disabled = false;

  state.timerInterval = setInterval(() => {
    if (state.timerRemaining <= 0) {
      clearInterval(state.timerInterval);
      state.timerRunning = false;
      timerStart.disabled = false;
      timerStop.disabled = true;
      document.title = 'My Dashboard';
      showToast('⏰ Time is up! Take a break.', 'success');
      return;
    }
    state.timerRemaining -= 1;
    renderTimer();
  }, 1000);
};

const stopTimer = () => {
  if (!state.timerRunning) return;
  clearInterval(state.timerInterval);
  state.timerRunning = false;
  timerStart.disabled = false;
  timerStop.disabled = true;
  document.title = 'My Dashboard';
};

const resetTimer = () => {
  stopTimer();
  state.timerRemaining = state.timerDuration * 60;
  renderTimer();
};

const setTimerDuration = () => {
  const val = parseInt(timerDurInput.value, 10);
  if (isNaN(val) || val < 1 || val > 60) {
    showToast('Enter a duration between 1 and 60 minutes.', 'error');
    timerDurInput.value = state.timerDuration;
    return;
  }
  stopTimer();
  state.timerDuration = val;
  state.timerRemaining = val * 60;
  save(KEYS.timer, val);
  renderTimer();
  showToast(`Timer set to ${val} minutes.`, 'info');
};

timerStart.addEventListener('click', startTimer);
timerStop.addEventListener('click', stopTimer);
timerReset.addEventListener('click', resetTimer);
timerSetBtn.addEventListener('click', setTimerDuration);
timerDurInput.addEventListener('keydown', (e) => { if (e.key === 'Enter') setTimerDuration(); });

initTimer();

/* =============================================================
   6. TO-DO LIST
   ============================================================= */
const todoForm    = document.getElementById('todo-form');
const todoInput   = document.getElementById('todo-input');
const todoListEl  = document.getElementById('todo-list');
const sortSelect  = document.getElementById('sort-select');

// Edit modal
const editModal    = document.getElementById('edit-modal');
const editInput    = document.getElementById('edit-input');
const editSaveBtn  = document.getElementById('edit-save-btn');
const editCancelBtn= document.getElementById('edit-cancel-btn');

const saveTasks = () => save(KEYS.tasks, state.tasks);

const getSortedTasks = () => {
  const copy = [...state.tasks];
  switch (sortSelect.value) {
    case 'az':   return copy.sort((a, b) => a.text.localeCompare(b.text));
    case 'za':   return copy.sort((a, b) => b.text.localeCompare(a.text));
    case 'done': return copy.sort((a, b) => Number(a.done) - Number(b.done));
    default:     return copy;
  }
};

const renderTasks = () => {
  todoListEl.innerHTML = '';
  const sorted = getSortedTasks();

  if (sorted.length === 0) {
    todoListEl.innerHTML = '<li class="todo__empty">No tasks yet. Add one above!</li>';
    return;
  }

  sorted.forEach((task) => {
    const li = document.createElement('li');
    li.className = `todo-item${task.done ? ' todo-item--done' : ''}`;
    li.dataset.id = task.id;

    li.innerHTML = `
      <input class="todo-item__check" type="checkbox" aria-label="Mark as done" ${task.done ? 'checked' : ''} />
      <span class="todo-item__text">${escapeHtml(task.text)}</span>
      <div class="todo-item__actions">
        <button class="todo-item__btn todo-item__btn--edit" aria-label="Edit task" title="Edit">✏️</button>
        <button class="todo-item__btn todo-item__btn--delete" aria-label="Delete task" title="Delete">🗑️</button>
      </div>
    `;

    li.querySelector('.todo-item__check').addEventListener('change', () => toggleTask(task.id));
    li.querySelector('.todo-item__btn--edit').addEventListener('click', () => openEditModal(task.id));
    li.querySelector('.todo-item__btn--delete').addEventListener('click', () => deleteTask(task.id));

    todoListEl.appendChild(li);
  });
};

const escapeHtml = (str) =>
  str.replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;');

const addTask = (text) => {
  // Duplicate check (case-insensitive)
  const duplicate = state.tasks.some((t) => t.text.toLowerCase() === text.toLowerCase());
  if (duplicate) {
    showToast('That task already exists.', 'error');
    return false;
  }
  state.tasks.push({ id: uid(), text, done: false });
  saveTasks();
  renderTasks();
  return true;
};

const toggleTask = (id) => {
  const task = state.tasks.find((t) => t.id === id);
  if (task) {
    task.done = !task.done;
    saveTasks();
    renderTasks();
  }
};

const deleteTask = (id) => {
  state.tasks = state.tasks.filter((t) => t.id !== id);
  saveTasks();
  renderTasks();
};

const openEditModal = (id) => {
  const task = state.tasks.find((t) => t.id === id);
  if (!task) return;
  state.editingTaskId = id;
  editInput.value = task.text;
  editModal.classList.remove('hidden');
  editInput.focus();
};

const closeEditModal = () => {
  editModal.classList.add('hidden');
  state.editingTaskId = null;
};

const saveEdit = () => {
  const trimmed = editInput.value.trim();
  if (!trimmed) { showToast('Task cannot be empty.', 'error'); return; }

  // Duplicate check excluding current task
  const duplicate = state.tasks.some(
    (t) => t.id !== state.editingTaskId && t.text.toLowerCase() === trimmed.toLowerCase()
  );
  if (duplicate) { showToast('That task already exists.', 'error'); return; }

  const task = state.tasks.find((t) => t.id === state.editingTaskId);
  if (task) {
    task.text = trimmed;
    saveTasks();
    renderTasks();
  }
  closeEditModal();
};

todoForm.addEventListener('submit', (e) => {
  e.preventDefault();
  const trimmed = todoInput.value.trim();
  if (!trimmed) return;
  if (addTask(trimmed)) todoInput.value = '';
});

sortSelect.addEventListener('change', renderTasks);
editSaveBtn.addEventListener('click', saveEdit);
editCancelBtn.addEventListener('click', closeEditModal);
editInput.addEventListener('keydown', (e) => { if (e.key === 'Enter') saveEdit(); });
editModal.querySelector('.modal__backdrop').addEventListener('click', closeEditModal);

// Load persisted tasks
state.tasks = load(KEYS.tasks, []);
renderTasks();

/* =============================================================
   7. QUICK LINKS
   ============================================================= */
const linksGrid  = document.getElementById('links-grid');
const linkForm   = document.getElementById('link-form');
const linkNameIn = document.getElementById('link-name');
const linkUrlIn  = document.getElementById('link-url');

const saveLinks = () => save(KEYS.links, state.links);

const renderLinks = () => {
  linksGrid.innerHTML = '';
  if (state.links.length === 0) {
    linksGrid.innerHTML = '<span style="font-size:0.8rem;color:var(--color-text-secondary)">No links yet.</span>';
    return;
  }
  state.links.forEach((link) => {
    const chip = document.createElement('a');
    chip.className = 'link-chip';
    chip.href = link.url;
    chip.target = '_blank';
    chip.rel = 'noopener noreferrer';
    chip.setAttribute('aria-label', `Open ${link.label}`);
    chip.innerHTML = `
      <span class="link-chip__label">${escapeHtml(link.label)}</span>
      <button class="link-chip__delete" aria-label="Remove ${escapeHtml(link.label)}" title="Remove">✕</button>
    `;
    chip.querySelector('.link-chip__delete').addEventListener('click', (e) => {
      e.preventDefault();
      e.stopPropagation();
      removeLink(link.id);
    });
    linksGrid.appendChild(chip);
  });
};

const addLink = (label, url) => {
  // Normalise URL
  let href = url.trim();
  if (!/^https?:\/\//i.test(href)) href = 'https://' + href;

  state.links.push({ id: uid(), label: label.trim(), url: href });
  saveLinks();
  renderLinks();
};

const removeLink = (id) => {
  state.links = state.links.filter((l) => l.id !== id);
  saveLinks();
  renderLinks();
};

linkForm.addEventListener('submit', (e) => {
  e.preventDefault();
  const label = linkNameIn.value.trim();
  const url   = linkUrlIn.value.trim();
  if (!label || !url) { showToast('Enter both a label and a URL.', 'error'); return; }
  addLink(label, url);
  linkNameIn.value = '';
  linkUrlIn.value  = '';
  linkNameIn.focus();
});

// Load persisted links
state.links = load(KEYS.links, []);
renderLinks();
