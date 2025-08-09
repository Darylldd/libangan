const canvas = document.getElementById("gameCanvas");
const ctx = canvas.getContext("2d");

const menuOverlay = document.getElementById("menuOverlay");
const customizeOverlay = document.getElementById("customizeOverlay");
const settingsOverlay = document.getElementById("settingsOverlay");
const gameOverOverlay = document.getElementById("gameOverOverlay");
const controls = document.querySelector(".controls");

const playBtn = document.getElementById("playBtn");
const customizeBtn = document.getElementById("customizeBtn");
const adjustSpeedBtn = document.getElementById("adjustSpeedBtn");
const quitBtn = document.getElementById("quitBtn");

const customizeBackBtn = document.getElementById("customizeBackBtn");

const speedRange = document.getElementById("speedRange");
const speedValue = document.getElementById("speedValue");
const bgUploadInput = document.getElementById("bgUploadInput");
const settingsBackBtn = document.getElementById("settingsBackBtn");

const playAgainBtn = document.getElementById("playAgainBtn");
const gameOverMenuBtn = document.getElementById("gameOverMenuBtn");
const finalScoreSpan = document.getElementById("finalScore");

const headColorInput = document.getElementById("headColor");
const bodyColorInput = document.getElementById("bodyColor");

canvas.width = 400;
canvas.height = 400;
let box = 20;

let snake = [];
let direction = "RIGHT";
let food = {};
let score = 0;
let gameSpeed = parseInt(speedRange.value);

let gameRunning = false;
let gameTimeout = null;

let bgImage = null;

let snakeHeadColor = headColorInput.value;
let snakeBodyColor = bodyColorInput.value;

// Initialize snake starting position
function resetGame() {
  snake = [{ x: 9 * box, y: 10 * box }];
  direction = "RIGHT";
  placeFood();
  score = 0;
}

// Place food at random location not colliding with snake
function placeFood() {
  let x, y, collisionWithSnake;
  do {
    x = Math.floor(Math.random() * (canvas.width / box)) * box;
    y = Math.floor(Math.random() * (canvas.height / box)) * box;
    collisionWithSnake = snake.some(segment => segment.x === x && segment.y === y);
  } while (collisionWithSnake);

  food = { x, y };
}

// Show / Hide UI helpers
function showMenu() {
  menuOverlay.classList.remove("hidden");
  customizeOverlay.classList.add("hidden");
  settingsOverlay.classList.add("hidden");
  gameOverOverlay.classList.add("hidden");
  canvas.style.display = "none";
  controls.classList.add("hidden");
}

function showGameUI() {
  canvas.style.display = "block";
  controls.classList.remove("hidden");
  menuOverlay.classList.add("hidden");
  customizeOverlay.classList.add("hidden");
  settingsOverlay.classList.add("hidden");
  gameOverOverlay.classList.add("hidden");
}

function showCustomize() {
  customizeOverlay.classList.remove("hidden");
  menuOverlay.classList.add("hidden");
  settingsOverlay.classList.add("hidden");
  gameOverOverlay.classList.add("hidden");
  canvas.style.display = "none";
  controls.classList.add("hidden");
}

function showSettings() {
  settingsOverlay.classList.remove("hidden");
  menuOverlay.classList.add("hidden");
  customizeOverlay.classList.add("hidden");
  gameOverOverlay.classList.add("hidden");
  canvas.style.display = "none";
  controls.classList.add("hidden");
}

function showGameOver() {
  gameOverOverlay.classList.remove("hidden");
  menuOverlay.classList.add("hidden");
  customizeOverlay.classList.add("hidden");
  settingsOverlay.classList.add("hidden");
  canvas.style.display = "none";
  controls.classList.add("hidden");
  finalScoreSpan.textContent = score;
}

// Menu buttons
playBtn.addEventListener("click", () => {
  resetGame();
  gameSpeed = parseInt(speedRange.value);
  gameRunning = true;
  showGameUI();
  gameLoop();
});

customizeBtn.addEventListener("click", () => {
  showCustomize();
  gameRunning = false;
  clearTimeout(gameTimeout);
});

adjustSpeedBtn.addEventListener("click", () => {
  showSettings();
  gameRunning = false;
  clearTimeout(gameTimeout);
});

quitBtn.addEventListener("click", () => {
  gameRunning = false;
  clearTimeout(gameTimeout);
  showMenu();
});

customizeBackBtn.addEventListener("click", () => {
  showMenu();
});

settingsBackBtn.addEventListener("click", () => {
  showMenu();
});

playAgainBtn.addEventListener("click", () => {
  resetGame();
  gameSpeed = parseInt(speedRange.value);
  gameRunning = true;
  showGameUI();
  gameLoop();
});

gameOverMenuBtn.addEventListener("click", () => {
  showMenu();
});

headColorInput.addEventListener("input", () => {
  snakeHeadColor = headColorInput.value;
});

bodyColorInput.addEventListener("input", () => {
  snakeBodyColor = bodyColorInput.value;
});

speedRange.addEventListener("input", () => {
  gameSpeed = parseInt(speedRange.value);
  speedValue.textContent = gameSpeed;
});

// Background image upload and immediate redraw
bgUploadInput.addEventListener("change", (e) => {
  const file = e.target.files[0];
  if (!file) return;

  const reader = new FileReader();
  reader.onload = function(event) {
    const img = new Image();
    img.onload = function() {
      bgImage = img;
      if (!gameRunning) {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        ctx.drawImage(bgImage, 0, 0, canvas.width, canvas.height);
      }
    };
    img.src = event.target.result;
  };
  reader.readAsDataURL(file);
});

// Keyboard controls
document.addEventListener("keydown", e => {
  if (!gameRunning) return;
  if (e.key === "ArrowLeft" && direction !== "RIGHT") direction = "LEFT";
  else if (e.key === "ArrowUp" && direction !== "DOWN") direction = "UP";
  else if (e.key === "ArrowRight" && direction !== "LEFT") direction = "RIGHT";
  else if (e.key === "ArrowDown" && direction !== "UP") direction = "DOWN";
});

// Mobile buttons
document.getElementById("up").onclick = () => { if (gameRunning && direction !== "DOWN") direction = "UP"; };
document.getElementById("down").onclick = () => { if (gameRunning && direction !== "UP") direction = "DOWN"; };
document.getElementById("left").onclick = () => { if (gameRunning && direction !== "RIGHT") direction = "LEFT"; };
document.getElementById("right").onclick = () => { if (gameRunning && direction !== "LEFT") direction = "RIGHT"; };

function draw() {
  // Draw background or black
  if (bgImage) {
    ctx.drawImage(bgImage, 0, 0, canvas.width, canvas.height);
  } else {
    ctx.fillStyle = "black";
    ctx.fillRect(0, 0, canvas.width, canvas.height);
  }

  // Draw snake
  for (let i = 0; i < snake.length; i++) {
    ctx.fillStyle = (i === 0) ? snakeHeadColor : snakeBodyColor;
    ctx.fillRect(snake[i].x, snake[i].y, box, box);
  }

  // Draw food
  ctx.fillStyle = "red";
  ctx.fillRect(food.x, food.y, box, box);

  // Draw score
  ctx.fillStyle = "white";
  ctx.font = "18px Arial";
  ctx.fillText("Score: " + score, 10, canvas.height - 10);
}

function update() {
  let snakeX = snake[0].x;
  let snakeY = snake[0].y;

  if (direction === "LEFT") snakeX -= box;
  else if (direction === "UP") snakeY -= box;
  else if (direction === "RIGHT") snakeX += box;
  else if (direction === "DOWN") snakeY += box;

  // Check collision with food
  if (snakeX === food.x && snakeY === food.y) {
    score++;
    placeFood();
  } else {
    snake.pop();
  }

  let newHead = { x: snakeX, y: snakeY };

  // Check collisions
  if (
    snakeX < 0 || snakeY < 0 ||
    snakeX >= canvas.width || snakeY >= canvas.height ||
    collision(newHead, snake)
  ) {
    // Game Over
    gameRunning = false;
    clearTimeout(gameTimeout);
    showGameOver();
    return;
  }

  snake.unshift(newHead);
}

function collision(head, array) {
  return array.some(segment => head.x === segment.x && head.y === segment.y);
}

function gameLoop() {
  if (!gameRunning) return;
  update();
  draw();
  gameTimeout = setTimeout(gameLoop, gameSpeed);
}

// Initial UI setup
showMenu();
