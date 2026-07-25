const gameState = {
  score: 0,
  timer: 30,
  gameActive: false,
  playerX: 0,
  playerDirection: 0,
  spawnTimer: 0,
  dropSpeed: 1.6,
  lastTime: 0,
};

const gameArea = document.getElementById("gameArea");
const player = document.getElementById("player");
const overlay = document.getElementById("overlay");
const introOverlay = document.getElementById("introOverlay");
const startBtn = document.getElementById("startBtn");
const scoreEl = document.getElementById("score");
const timerEl = document.getElementById("timer");

function playCollectedSound() {
  const audio = new Audio("assets/sounds/pop1.mp3");
  audio.volume = 0.5;
  audio.play().catch(() => {});
}

function initDecorations() {
  const heartsLayer = document.querySelector(".hearts-layer");
  const sparklesLayer = document.querySelector(".sparkles");
  for (let i = 0; i < 18; i += 1) {
    const heart = document.createElement("span");
    heart.className = "heart";
    heart.textContent = "💖";
    heart.style.left = `${Math.random() * 100}%`;
    heart.style.top = `${Math.random() * 100}%`;
    heart.style.animationDuration = `${5 + Math.random() * 6}s`;
    heart.style.animationDelay = `${Math.random() * 3}s`;
    heartsLayer.appendChild(heart);
  }

  for (let i = 0; i < 24; i += 1) {
    const sparkle = document.createElement("span");
    sparkle.className = "sparkle";
    sparkle.style.left = `${Math.random() * 100}%`;
    sparkle.style.top = `${Math.random() * 100}%`;
    sparkle.style.animationDelay = `${Math.random() * 2}s`;
    sparklesLayer.appendChild(sparkle);
  }
}

function setPlayerPosition(x) {
  const areaRect = gameArea.getBoundingClientRect();
  const playerWidth = player.offsetWidth;
  const maxX = areaRect.width - playerWidth;
  const nextX = Math.max(0, Math.min(maxX, x));
  player.style.left = `${nextX}px`;
  gameState.playerX = nextX;
}

function hideOverlay() {
  overlay.hidden = true;
  overlay.innerHTML = "";
  overlay.style.display = "none";
  overlay.setAttribute("aria-hidden", "true");
}

function showOverlay(content) {
  overlay.hidden = false;
  overlay.style.display = "flex";
  overlay.setAttribute("aria-hidden", "false");
  overlay.innerHTML = content;
}

function startGame() {
  gameState.score = 0;
  gameState.timer = 30;
  gameState.gameActive = true;
  scoreEl.textContent = "0";
  timerEl.textContent = "30";
  hideOverlay();
  introOverlay.hidden = true;
  introOverlay.style.display = "none";
  document.querySelectorAll(".heart-drop, .bomb-drop, .particle").forEach((el) => el.remove());
  setPlayerPosition(Math.max(0, (gameArea.clientWidth - player.offsetWidth) / 2));
  gameState.lastTime = performance.now();
  requestAnimationFrame(step);
}

function endGame(result) {
  gameState.gameActive = false;
  showOverlay(`
    <p class="overlay-title">${result === "win" ? "恭喜！你成功完成挑戰！❤️" : "再試一次！😊"}</p>
    <button class="overlay-btn" type="button">${result === "win" ? "继续打开信封" : "再玩一次"}</button>
  `);
  const button = overlay.querySelector("button");
  button.addEventListener("click", () => {
    if (result === "win") {
      window.location.href = "letter.html";
    } else {
      startGame();
    }
  });
  if (result === "win") {
    MusicModule.playSound("success");
  } else {
    MusicModule.playSound("lose");
  }
}

function spawnItem() {
  const item = document.createElement("div");
  const isBomb = Math.random() < 0.22;
  item.className = isBomb ? "bomb-drop" : "heart-drop";
  item.textContent = isBomb ? "" : "💖";
  const startX = Math.random() * (gameArea.clientWidth - 40);
  item.style.left = `${startX}px`;
  item.style.top = `-20px`;
  item.style.setProperty("--drift", `${(Math.random() - 0.5) * 120}px`);
  gameArea.appendChild(item);
  return item;
}

function spawnParticles(x, y) {
  for (let i = 0; i < 10; i += 1) {
    const p = document.createElement("span");
    p.className = "particle";
    p.style.left = `${x + Math.random() * 8}px`;
    p.style.top = `${y + Math.random() * 8}px`;
    p.style.background = i % 2 === 0 ? "#ff6fa8" : "#ffd166";
    gameArea.appendChild(p);
  }
}

function detectCollision(item) {
  const playerRect = player.getBoundingClientRect();
  const itemRect = item.getBoundingClientRect();
  return !(playerRect.right < itemRect.left || playerRect.left > itemRect.right || playerRect.bottom < itemRect.top || playerRect.top > itemRect.bottom);
}

function step(timestamp) {
  if (!gameState.gameActive) return;
  const delta = (timestamp - gameState.lastTime) / 1000;
  gameState.lastTime = timestamp;
  gameState.timer -= delta;
  timerEl.textContent = Math.max(0, Math.ceil(gameState.timer));

  if (gameState.timer <= 0) {
    endGame(gameState.score >= 15 ? "win" : "lose");
    return;
  }

  gameState.spawnTimer -= delta;
  if (gameState.spawnTimer <= 0) {
    spawnItem();
    gameState.spawnTimer = 0.8 + Math.random() * 0.7;
  }

  const items = gameArea.querySelectorAll(".heart-drop, .bomb-drop");
  items.forEach((item) => {
    const currentTop = parseFloat(item.style.top || "0px");
    const nextTop = currentTop + 110 * delta;
    item.style.top = `${nextTop}px`;

    if (detectCollision(item)) {
      if (item.classList.contains("heart-drop")) {
        gameState.score += 1;
        scoreEl.textContent = gameState.score;
        spawnParticles(player.offsetLeft + 30, gameArea.clientHeight - 80);
        playCollectedSound();
      } else {
        MusicModule.playSound("lose");
      }
      item.remove();
    }

    if (nextTop > gameArea.clientHeight + 60) {
      item.remove();
    }
  });

  requestAnimationFrame(step);
}

function handlePointerMove(event) {
  const rect = gameArea.getBoundingClientRect();
  const x = event.touches ? event.touches[0].clientX : event.clientX;
  const relativeX = x - rect.left - player.offsetWidth / 2;
  setPlayerPosition(relativeX);
}

gameArea.addEventListener("pointermove", handlePointerMove);
gameArea.addEventListener("touchmove", handlePointerMove, { passive: false });

gameArea.addEventListener("click", (event) => {
  const rect = gameArea.getBoundingClientRect();
  const relativeX = event.clientX - rect.left - player.offsetWidth / 2;
  setPlayerPosition(relativeX);
});

gameArea.addEventListener("keydown", (event) => {
  if (event.key === "ArrowLeft") {
    setPlayerPosition(gameState.playerX - 30);
  } else if (event.key === "ArrowRight") {
    setPlayerPosition(gameState.playerX + 30);
  }
});

gameArea.setAttribute("tabindex", "0");

if (startBtn) {
  startBtn.addEventListener("click", () => {
    startGame();
  });
}

initDecorations();
