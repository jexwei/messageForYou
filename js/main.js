const welcomeCard = document.querySelector('.welcome-card');
const yesBtn = document.getElementById('yesBtn');
const noBtn = document.getElementById('noBtn');
const envelope = document.getElementById('envelope');
const letterPaper = document.getElementById('letterPaper');
const photo = document.getElementById('photo');
const photoStatus = document.getElementById('photoStatus');
const scratchCanvas = document.getElementById('scratchCanvas');
const scratchCard = document.querySelector('.scratch-card');

let noClicks = 0;
let yesClicks = 0;
let scratchActive = false;

function resizeScratchCanvas() {
  if (!scratchCanvas || !photo || !scratchCard) return;
  const dpr = window.devicePixelRatio || 1;
  const width = Math.max(280, photo.clientWidth || scratchCard.clientWidth || 320);
  const height = Math.max(220, photo.clientHeight || scratchCard.clientHeight || 240);
  scratchCanvas.width = Math.round(width * dpr);
  scratchCanvas.height = Math.round(height * dpr);
  const ctx = scratchCanvas.getContext('2d');
  ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
  ctx.clearRect(0, 0, width, height);
  ctx.fillStyle = '#f7b2c5';
  ctx.fillRect(0, 0, width, height);
  ctx.fillStyle = '#ffffff';
  ctx.font = '700 20px "Microsoft YaHei", sans-serif';
  ctx.textAlign = 'center';
  ctx.fillText('刮刮了', width / 2, 42);
  ctx.font = '600 14px "Microsoft YaHei", sans-serif';
  ctx.fillStyle = '#c14f74';
  ctx.fillText('轻轻刮开看看', width / 2, height - 18);
}

function revealScratchCard() {
  if (!scratchCanvas || !scratchCard) return;
  const width = scratchCanvas.clientWidth || scratchCanvas.width;
  const height = scratchCanvas.clientHeight || scratchCanvas.height;
  const ctx = scratchCanvas.getContext('2d');
  const data = ctx.getImageData(0, 0, width, height).data;
  let transparentPixels = 0;

  for (let i = 3; i < data.length; i += 4) {
    if (data[i] < 220) transparentPixels += 1;
  }

  const ratio = transparentPixels / ((width * height) || 1);
  if (ratio > 0.28) {
    scratchCard.classList.add('is-revealed');
  }
}

function attachScratchEvents() {
  if (!scratchCanvas) return;
  const ctx = scratchCanvas.getContext('2d');

  const getPosition = (event) => {
    const rect = scratchCanvas.getBoundingClientRect();
    const clientX = event.touches ? event.touches[0].clientX : event.clientX;
    const clientY = event.touches ? event.touches[0].clientY : event.clientY;
    return { x: clientX - rect.left, y: clientY - rect.top };
  };

  const scratch = (event) => {
    if (!scratchActive) return;
    const position = getPosition(event);
    ctx.globalCompositeOperation = 'destination-out';
    ctx.beginPath();
    ctx.arc(position.x, position.y, 18, 0, Math.PI * 2);
    ctx.fill();
    ctx.globalCompositeOperation = 'source-over';
    revealScratchCard();
    event.preventDefault();
  };

  scratchCanvas.addEventListener('pointerdown', (event) => {
    scratchActive = true;
    scratchCanvas.setPointerCapture(event.pointerId);
    scratch(event);
  });

  scratchCanvas.addEventListener('pointermove', scratch);
  scratchCanvas.addEventListener('pointerup', () => {
    scratchActive = false;
  });
  scratchCanvas.addEventListener('pointerleave', () => {
    scratchActive = false;
  });
  scratchCanvas.addEventListener('pointercancel', () => {
    scratchActive = false;
  });
}

function createFloatingElements() {
  const heartsLayer = document.querySelector('.hearts-layer');
  const sparklesLayer = document.querySelector('.sparkles');
  const petalsLayer = document.querySelector('.petals-layer');

  for (let i = 0; i < 16; i += 1) {
    const heart = document.createElement('span');
    heart.className = 'heart';
    heart.textContent = '💗';
    heart.style.left = `${Math.random() * 100}%`;
    heart.style.top = `${Math.random() * 100}%`;
    heart.style.animationDuration = `${5 + Math.random() * 5}s`;
    heart.style.animationDelay = `${Math.random() * 3}s`;
    heartsLayer?.appendChild(heart);
  }

  for (let i = 0; i < 24; i += 1) {
    const sparkle = document.createElement('span');
    sparkle.className = 'sparkle';
    sparkle.style.left = `${Math.random() * 100}%`;
    sparkle.style.top = `${Math.random() * 100}%`;
    sparkle.style.animationDelay = `${Math.random() * 1.5}s`;
    sparklesLayer?.appendChild(sparkle);
  }

  for (let i = 0; i < 18; i += 1) {
    const petal = document.createElement('span');
    petal.className = 'petal';
    petal.style.left = `${Math.random() * 100}%`;
    petal.style.top = `${Math.random() * -20}%`;
    petal.style.animationDuration = `${6 + Math.random() * 6}s`;
    petal.style.animationDelay = `${Math.random() * 3}s`;
    petalsLayer?.appendChild(petal);
  }
}

function addButtonInteraction(button, soundType) {
  button.addEventListener('pointerdown', () => {
    button.classList.add('is-pressed');
    MusicModule.playSound(soundType);
  });

  button.addEventListener('pointerup', () => {
    button.classList.remove('is-pressed');
  });

  button.addEventListener('mouseenter', () => {
    MusicModule.playSound('hover');
  });
}

if (yesBtn) {
  addButtonInteraction(yesBtn, 'pop');
  yesBtn.addEventListener('click', () => {
    yesClicks += 1;
    if (yesClicks === 1) {
      yesBtn.textContent = '準備好了嗎？';
      yesBtn.classList.add('is-pressed');
      setTimeout(() => yesBtn.classList.remove('is-pressed'), 200);
    } else {
      welcomeCard.style.opacity = '0';
      welcomeCard.style.transform = 'scale(0.95)';
      setTimeout(() => {
        window.location.href = 'game.html';
      }, 400);
    }
  });
}

if (noBtn) {
  addButtonInteraction(noBtn, 'lose');
  noBtn.addEventListener('click', () => {
    noClicks += 1;
    if (noClicks === 1) {
      noBtn.textContent = '你確定嗎？';
      noBtn.classList.add('is-shaking');
      setTimeout(() => noBtn.classList.remove('is-shaking'), 700);
    } else {
      noBtn.textContent = '已拒絕 😂';
      noBtn.classList.add('is-shaking');
      setTimeout(() => {
        noBtn.textContent = '不要';
        noBtn.classList.remove('is-shaking');
      }, 2000);
    }
  });
}

if (envelope) {
  envelope.addEventListener('click', () => {
    envelope.classList.add('is-open');
    MusicModule.playSound('success');
    MusicModule.startBackgroundMusic();

    const burst = document.createElement('div');
    burst.className = 'heart-burst';
    burst.innerHTML = '💖💗💕';
    envelope.appendChild(burst);

    const confetti = document.createElement('div');
    confetti.className = 'confetti-burst';
    confetti.innerHTML = '✨💫🌸';
    envelope.appendChild(confetti);

    setTimeout(() => {
      letterPaper.hidden = false;
      letterPaper.classList.add('is-visible');
      if (photo) {
        photo.classList.add('is-visible');
      }
    }, 500);

    setTimeout(() => {
      burst.remove();
      confetti.remove();
    }, 1200);
  });

  envelope.addEventListener('keydown', (event) => {
    if (event.key === 'Enter' || event.key === ' ') {
      event.preventDefault();
      envelope.click();
    }
  });
}

if (photo) {
  photoStatus.textContent = '正在加载照片…';
  const fallbackImage = 'assets/images/us1.jpeg';

  photo.src = fallbackImage;
  photo.hidden = false;
  photo.addEventListener('load', () => {
    photoStatus.textContent = '照片已加载';
    photoStatus.classList.add('is-loaded');
    photo.classList.add('is-visible');
    requestAnimationFrame(() => {
      resizeScratchCanvas();
      attachScratchEvents();
      photo.style.transform = 'translateY(0) scale(1)';
    });
  });

  photo.addEventListener('error', () => {
    photoStatus.textContent = '照片已加载';
    photoStatus.classList.add('is-loaded');
    photo.classList.add('is-visible');
    requestAnimationFrame(() => {
      resizeScratchCanvas();
      attachScratchEvents();
    });
  });
}

window.addEventListener('resize', resizeScratchCanvas);

createFloatingElements();
