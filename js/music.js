const MusicModule = (() => {
  let audioContext;
  let masterGain;
  let melodyInterval;
  let started = false;
  let bgMusic;
  const melody = [261.63, 329.63, 392, 329.63, 293.66, 261.63];

  function ensureAudio() {
    if (audioContext) return audioContext;
    const AudioCtx = window.AudioContext || window.webkitAudioContext;
    audioContext = new AudioCtx();
    masterGain = audioContext.createGain();
    masterGain.gain.value = 0.03;
    masterGain.connect(audioContext.destination);
    return audioContext;
  }

  function startBackgroundMusic() {
    if (started) return;
    started = true;

    if (!bgMusic) {
      bgMusic = new Audio('assets/music/bg1.mp3');
      bgMusic.loop = true;
      bgMusic.volume = 0.3;
    }

    bgMusic.play().catch(() => {});

    const ctx = ensureAudio();
    let index = 0;
    const playNote = () => {
      if (!audioContext) return;
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = "sine";
      osc.frequency.value = melody[index % melody.length];
      gain.gain.value = 0.0001;
      osc.connect(gain);
      gain.connect(masterGain);
      const now = ctx.currentTime;
      gain.gain.setValueAtTime(0.0001, now);
      gain.gain.exponentialRampToValueAtTime(0.06, now + 0.05);
      gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.4);
      osc.start(now);
      osc.stop(now + 0.45);
      index += 1;
    };

    playNote();
    melodyInterval = setInterval(playNote, 450);
  }

  function playSound(type) {
    if (!audioContext) ensureAudio();
    const ctx = audioContext;
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.connect(gain);
    gain.connect(masterGain);

    const now = ctx.currentTime;
    let frequency = 440;
    let duration = 0.12;

    if (type === "pop") {
      frequency = 620;
      duration = 0.14;
    } else if (type === "love") {
      frequency = 780;
      duration = 0.1;
    } else if (type === "hover") {
      frequency = 540;
      duration = 0.08;
    } else if (type === "success") {
      frequency = 700;
      duration = 0.2;
    } else if (type === "lose") {
      frequency = 220;
      duration = 0.18;
    }

    osc.type = "triangle";
    osc.frequency.setValueAtTime(frequency, now);
    gain.gain.setValueAtTime(0.0001, now);
    gain.gain.exponentialRampToValueAtTime(0.04, now + 0.04);
    gain.gain.exponentialRampToValueAtTime(0.0001, now + duration);
    osc.start(now);
    osc.stop(now + duration);
  }

  function stopBackgroundMusic() {
    if (melodyInterval) clearInterval(melodyInterval);
  }

  return { startBackgroundMusic, playSound, stopBackgroundMusic };
})();

window.addEventListener("pointerdown", () => {
  if (window.location.pathname.includes("letter")) {
    const envelope = document.getElementById("envelope");
    if (envelope && envelope.classList.contains("is-open")) {
      MusicModule.startBackgroundMusic();
    }
  }
}, { once: true });

window.addEventListener("keydown", () => {
  if (window.location.pathname.includes("letter")) {
    const envelope = document.getElementById("envelope");
    if (envelope && envelope.classList.contains("is-open")) {
      MusicModule.startBackgroundMusic();
    }
  }
}, { once: true });

window.addEventListener("load", () => {
  if (window.location.pathname.includes("letter")) {
    const envelope = document.getElementById("envelope");
    if (envelope && envelope.classList.contains("is-open")) {
      MusicModule.startBackgroundMusic();
    }
  }
});
