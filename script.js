const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');

const menuOverlay = document.getElementById('menuOverlay');
const customizeOverlay = document.getElementById('customizeOverlay');
const settingsOverlay = document.getElementById('settingsOverlay');
const highscoresOverlay = document.getElementById('highscoresOverlay'); // NEW
const gameOverOverlay = document.getElementById('gameOverOverlay');
const controls = document.querySelector('.controls');

const playBtn = document.getElementById('playBtn');
const customizeBtn = document.getElementById('customizeBtn');
const settingsBtn = document.getElementById('settingsBtn');
const highscoresBtn = document.getElementById('highscoresBtn'); // NEW
const quitBtn = document.getElementById('quitBtn');

const customizeBackBtn = document.getElementById('customizeBackBtn');
const settingsBackBtn = document.getElementById('settingsBackBtn');
const highscoresBackBtn = document.getElementById('highscoresBackBtn'); // NEW
const clearHighscoresBtn = document.getElementById('clearHighscoresBtn'); // NEW

const playAgainBtn = document.getElementById('playAgainBtn');
const gameOverMenuBtn = document.getElementById('gameOverMenuBtn');
const finalScore = document.getElementById('finalScore');

const headColorInput = document.getElementById('headColor');
const bodyColorInput = document.getElementById('bodyColor');

const speedRange = document.getElementById('speedRange');
const speedValue = document.getElementById('speedValue');
const bgUploadInput = document.getElementById('bgUploadInput');

const upBtn = document.getElementById('up');
const downBtn = document.getElementById('down');
const leftBtn = document.getElementById('left');
const rightBtn = document.getElementById('right');

// NEW: Highscore elements
const highscoreList = document.getElementById('highscoreList');
const noScoresP = document.getElementById('noScores');

// Game variables
const CANVAS_W = canvas.width;
const CANVAS_H = canvas.height;
let box = 20;
let cols = Math.floor(CANVAS_W / box);
let rows = Math.floor(CANVAS_H / box);

let snake = [];
let snakeSet = new Set();
let dir = { x: 1, y: 0 };
let pendingDir = null;
let food = { x: 0, y: 0 };
let score = 0;

let headColor = headColorInput.value;
let bodyColor = bodyColorInput.value;

let tickMs = parseInt(speedRange.value, 10);
speedValue.textContent = tickMs;

let lastTime = 0;
let accumulator = 0;
let running = false;
let bgImage = null;

const keyOf = (x, y) => `${x}_${y}`;

// -------- Highscore Logic --------
const HIGHSCORE_KEY = 'snake_highscores_v1';
const MAX_HIGH_SCORES = 10;

function loadHighscores() {
  try {
    return JSON.parse(localStorage.getItem(HIGHSCORE_KEY)) || [];
  } catch {
    return [];
  }
}
function saveHighscores(list) {
  localStorage.setItem(HIGHSCORE_KEY, JSON.stringify(list));
}
function addHighscore(newScore) {
  if (newScore <= 0) return;
  const list = loadHighscores();
  list.push({ score: newScore, date: new Date().toISOString() });
  list.sort((a,b) => b.score - a.score);
  saveHighscores(list.slice(0, MAX_HIGH_SCORES));
}
function renderHighscores() {
  const list = loadHighscores();
  highscoreList.innerHTML = '';
  if (!list.length) {
    noScoresP.style.display = 'block';
    return;
  }
  noScoresP.style.display = 'none';
  list.forEach((entry, i) => {
    const li = document.createElement('li');
    li.textContent = `${i+1}. ${entry.score}  (${new Date(entry.date).toLocaleDateString()})`;
    highscoreList.appendChild(li);
  });
}
function clearHighscores() {
  localStorage.removeItem(HIGHSCORE_KEY);
  renderHighscores();
}

// -------- Game Functions --------
function resetGame() {
  snake = [{ x: Math.floor(cols/2) * box, y: Math.floor(rows/2) * box }];
  snakeSet = new Set([keyOf(snake[0].x, snake[0].y)]);
  dir = { x: 1, y: 0 };
  pendingDir = null;
  placeFood();
  score = 0;
  accumulator = 0;
  lastTime = performance.now();
}
function placeFood() {
  let attempts = 0;
  while (true) {
    const fx = Math.floor(Math.random() * cols) * box;
    const fy = Math.floor(Math.random() * rows) * box;
    if (!snakeSet.has(keyOf(fx, fy))) { food = { x: fx, y: fy }; return; }
    if (++attempts > 10000) return;
  }
}
function draw() {
  if (bgImage) ctx.drawImage(bgImage, 0, 0, CANVAS_W, CANVAS_H);
  else { ctx.fillStyle = '#000'; ctx.fillRect(0, 0, CANVAS_W, CANVAS_H); }

  ctx.fillStyle = 'red';
  ctx.fillRect(food.x, food.y, box, box);

  for (let i = 0; i < snake.length; i++) {
    ctx.fillStyle = (i===0) ? headColor : bodyColor;
    ctx.fillRect(snake[i].x, snake[i].y, box, box);
  }

  ctx.fillStyle = '#fff';
  ctx.font = '16px Arial';
  ctx.fillText(`Score: ${score}`, 8, CANVAS_H - 8);
}
function step() {
  if (pendingDir) {
    if (pendingDir.x !== -dir.x || pendingDir.y !== -dir.y) dir = pendingDir;
    pendingDir = null;
  }
  let head = snake[0];
  let nx = head.x + dir.x * box;
  let ny = head.y + dir.y * box;
  if (nx < 0) nx = (cols - 1) * box;
  else if (nx >= CANVAS_W) nx = 0;
  if (ny < 0) ny = (rows - 1) * box;
  else if (ny >= CANVAS_H) ny = 0;
  const newKey = keyOf(nx, ny);
  if (snakeSet.has(newKey)) {
    running = false;
    showGameOver();
    return;
  }
  snake.unshift({ x: nx, y: ny });
  snakeSet.add(newKey);
  if (nx === food.x && ny === food.y) {
    score++;
    placeFood();
  } else {
    const tail = snake.pop();
    snakeSet.delete(keyOf(tail.x, tail.y));
  }
}
function loop(now) {
  if (!running) return;
  if (!lastTime) lastTime = now;
  const dt = now - lastTime;
  lastTime = now;
  accumulator += dt;
  while (accumulator >= tickMs) {
    step();
    accumulator -= tickMs;
    if (!running) break;
  }
  draw();
  if (running) requestAnimationFrame(loop);
}

// -------- UI Functions --------
function showMenu() {
  menuOverlay.classList.remove('hidden');
  customizeOverlay.classList.add('hidden');
  settingsOverlay.classList.add('hidden');
  highscoresOverlay.classList.add('hidden');
  gameOverOverlay.classList.add('hidden');
  canvas.style.display = 'none';
  controls.classList.add('hidden');
}
function showGameUI() {
  menuOverlay.classList.add('hidden');
  customizeOverlay.classList.add('hidden');
  settingsOverlay.classList.add('hidden');
  highscoresOverlay.classList.add('hidden');
  gameOverOverlay.classList.add('hidden');
  canvas.style.display = 'block';
  controls.classList.remove('hidden');
}
function showCustomize() {
  menuOverlay.classList.add('hidden');
  customizeOverlay.classList.remove('hidden');
}
function showSettings() {
  menuOverlay.classList.add('hidden');
  settingsOverlay.classList.remove('hidden');
}
function showHighscores() { // NEW
  menuOverlay.classList.add('hidden');
  highscoresOverlay.classList.remove('hidden');
  renderHighscores();
}
function showGameOver() {
  gameOverOverlay.classList.remove('hidden');
  finalScore.textContent = score;
  addHighscore(score); // NEW: Save score
  canvas.style.display = 'none';
  controls.classList.add('hidden');
}

// -------- Event Listeners --------
playBtn.addEventListener('click', () => {
  resetGame(); running = true; showGameUI();
  requestAnimationFrame(loop);
});
customizeBtn.addEventListener('click', () => { showCustomize(); running = false; });
settingsBtn.addEventListener('click', () => { showSettings(); running = false; });
highscoresBtn.addEventListener('click', () => { showHighscores(); running = false; }); // NEW
quitBtn.addEventListener('click', () => { showMenu(); running = false; });
customizeBackBtn.addEventListener('click', () => { showMenu(); });
settingsBackBtn.addEventListener('click', () => { showMenu(); });
highscoresBackBtn.addEventListener('click', () => { showMenu(); }); // NEW
clearHighscoresBtn.addEventListener('click', () => { clearHighscores(); }); // NEW
playAgainBtn.addEventListener('click', () => {
  resetGame(); running = true; showGameUI();
  requestAnimationFrame(loop);
});
gameOverMenuBtn.addEventListener('click', () => { showMenu(); });

headColorInput.addEventListener('input', e => headColor = e.target.value);
bodyColorInput.addEventListener('input', e => bodyColor = e.target.value);
speedRange.addEventListener('input', e => {
  tickMs = parseInt(e.target.value, 10);
  speedValue.textContent = tickMs;
});
bgUploadInput.addEventListener('change', e => {
  const f = e.target.files?.[0];
  if (!f) return;
  const reader = new FileReader();
  reader.onload = ev => {
    const img = new Image();
    img.onload = () => { bgImage = img; if (!running) draw(); };
    img.src = ev.target.result;
  };
  reader.readAsDataURL(f);
});
document.addEventListener('keydown', e => {
  if (!running) return;
  if (e.key === 'ArrowLeft' && dir.x !== 1) pendingDir = { x: -1, y: 0 };
  else if (e.key === 'ArrowUp' && dir.y !== 1) pendingDir = { x: 0, y: -1 };
  else if (e.key === 'ArrowRight' && dir.x !== -1) pendingDir = { x: 1, y: 0 };
  else if (e.key === 'ArrowDown' && dir.y !== -1) pendingDir = { x: 0, y: 1 };
});
upBtn.addEventListener('touchstart', () => { if (running && dir.y !== 1) pendingDir = { x: 0, y: -1 }; });
downBtn.addEventListener('touchstart', () => { if (running && dir.y !== -1) pendingDir = { x: 0, y: 1 }; });
leftBtn.addEventListener('touchstart', () => { if (running && dir.x !== 1) pendingDir = { x: -1, y: 0 }; });
rightBtn.addEventListener('touchstart', () => { if (running && dir.x !== -1) pendingDir = { x: 1, y: 0 }; });
document.addEventListener('touchmove', e => { if (running) e.preventDefault(); }, { passive: false });

showMenu();
