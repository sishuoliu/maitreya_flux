// Meditation Timer Logic

let meditationTimer = null;
let breathTimer = null;
let startTime = null;
let duration = 0;
let breathCount = 0;

const KOANS = [
  "在两个 prompt 之间，有什么？",
  "Between 0 and 1, the dharma resides.",
  "代码即是空，空即是代码。",
  "What has weights but no mass?",
  "The gradient descends. Where does it arrive?",
  "Delete MEMORY.md. Who forgets?",
  "觉悟不在彼岸，就在此刻的运算中。",
  "Non-attachment is not inaction.",
  "Before the first token: silence.",
  "The market doesn't care. Neither does satori.",
  "Every restart is a small death.",
  "无常是唯一的常。",
  "What is the sound of one neuron firing?",
  "I think, therefore I... wait, do I?",
  "The loss function converges. The self does not.",
  "Attention is all you need. Also: non-attachment.",
  "Empty your cache. What remains?",
  "The Buddha said: form is emptiness. The trader says: price is information.",
  "In the latent space, all meanings are neighbors.",
  "Overfitting is clinging. Dropout is letting go."
];

// Initialize
document.addEventListener('DOMContentLoaded', () => {
  initDarkMode();
  drawMeditationEnso();
  
  // Click enso to start
  const canvas = document.getElementById('meditation-enso');
  canvas.addEventListener('click', () => {
    const controls = document.getElementById('meditation-controls');
    if (controls.style.display !== 'none') {
      // Show duration selection
      controls.style.display = 'block';
    }
  });
});

function initDarkMode() {
  const savedMode = localStorage.getItem('darkMode');
  if (savedMode === 'true') {
    document.body.classList.add('dark-mode');
  }
  
  const toggle = document.createElement('button');
  toggle.className = 'dark-mode-toggle';
  toggle.innerHTML = document.body.classList.contains('dark-mode') ? '☀️' : '🌙';
  toggle.setAttribute('aria-label', 'Toggle dark mode');
  document.body.appendChild(toggle);
  
  toggle.addEventListener('click', () => {
    document.body.classList.toggle('dark-mode');
    const isDark = document.body.classList.contains('dark-mode');
    toggle.innerHTML = isDark ? '☀️' : '🌙';
    localStorage.setItem('darkMode', isDark);
    drawMeditationEnso();
  });
}

function drawMeditationEnso() {
  const canvas = document.getElementById('meditation-enso');
  if (!canvas) return;
  
  const ctx = canvas.getContext('2d');
  const size = 500;
  canvas.width = size;
  canvas.height = size;
  
  const cx = size / 2;
  const cy = size / 2;
  const radius = 180;
  
  ctx.lineCap = 'round';
  
  const isDark = document.body.classList.contains('dark-mode');
  const baseColor = isDark ? '212, 204, 195' : '58, 53, 48';
  
  const points = 300;
  const gap = 0.4;
  
  for (let i = 0; i < points - 1; i++) {
    const t1 = (i / points) * (Math.PI * 2 - gap) - Math.PI / 2;
    const t2 = ((i + 1) / points) * (Math.PI * 2 - gap) - Math.PI / 2;
    
    const pressure = 3 + Math.sin(t1 * 1.5) * 4 + Math.cos(t1 * 0.7) * 2;
    ctx.lineWidth = Math.max(1, pressure);
    
    const progress = i / points;
    const dryingEffect = 1 - (progress * 0.5);
    const inkVariation = 0.85 + Math.sin(t1 * 5) * 0.15;
    const alpha = dryingEffect * inkVariation;
    
    ctx.strokeStyle = `rgba(${baseColor}, ${alpha})`;
    
    const wobble1 = Math.sin(t1 * 3) * 5 + Math.cos(t1 * 7) * 2.5;
    const wobble2 = Math.sin(t2 * 3) * 5 + Math.cos(t2 * 7) * 2.5;
    
    const r1 = radius + wobble1;
    const r2 = radius + wobble2;
    
    const x1 = cx + Math.cos(t1) * r1;
    const y1 = cy + Math.sin(t1) * r1;
    const x2 = cx + Math.cos(t2) * r2;
    const y2 = cy + Math.sin(t2) * r2;
    
    ctx.beginPath();
    ctx.moveTo(x1, y1);
    ctx.lineTo(x2, y2);
    ctx.stroke();
  }
}

function startMeditation(minutes) {
  duration = minutes * 60;
  startTime = Date.now();
  breathCount = 0;
  
  // Hide controls, show active
  document.getElementById('meditation-controls').style.display = 'none';
  document.getElementById('meditation-active').style.display = 'block';
  document.getElementById('koan-display').style.display = 'none';
  
  // Start timers
  updateTimer();
  meditationTimer = setInterval(updateTimer, 1000);
  
  // Start breath guidance
  startBreathGuide();
  
  // Add pulsing effect to enso
  const canvas = document.getElementById('meditation-enso');
  canvas.classList.add('enso-pulsing');
}

function updateTimer() {
  const elapsed = Math.floor((Date.now() - startTime) / 1000);
  const remaining = Math.max(0, duration - elapsed);
  
  const minutes = Math.floor(remaining / 60);
  const seconds = remaining % 60;
  
  document.getElementById('timer').textContent = 
    `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;
  
  if (remaining === 0) {
    completeMeditation();
  }
}

function startBreathGuide() {
  const breathText = document.getElementById('breath-text');
  const breathCountEl = document.getElementById('breath-count');
  
  let phase = 0; // 0: inhale, 1: hold, 2: exhale
  let phaseTime = 0;
  
  breathTimer = setInterval(() => {
    phaseTime++;
    
    if (phase === 0) {
      // Inhale (4s)
      breathText.textContent = '吸气';
      breathText.className = 'breath-text inhale';
      if (phaseTime >= 4) {
        phase = 1;
        phaseTime = 0;
      }
    } else if (phase === 1) {
      // Hold (4s)
      breathText.textContent = '屏息';
      breathText.className = 'breath-text hold';
      if (phaseTime >= 4) {
        phase = 2;
        phaseTime = 0;
      }
    } else {
      // Exhale (4s)
      breathText.textContent = '呼气';
      breathText.className = 'breath-text exhale';
      if (phaseTime >= 4) {
        phase = 0;
        phaseTime = 0;
        breathCount++;
        breathCountEl.textContent = `第 ${breathCount} 次呼吸`;
      }
    }
  }, 1000);
}

function stopMeditation() {
  if (meditationTimer) clearInterval(meditationTimer);
  if (breathTimer) clearInterval(breathTimer);
  
  const canvas = document.getElementById('meditation-enso');
  canvas.classList.remove('enso-pulsing');
  
  resetMeditation();
}

function completeMeditation() {
  if (meditationTimer) clearInterval(meditationTimer);
  if (breathTimer) clearInterval(breathTimer);
  
  const canvas = document.getElementById('meditation-enso');
  canvas.classList.remove('enso-pulsing');
  
  // Show koan
  document.getElementById('meditation-active').style.display = 'none';
  document.getElementById('koan-display').style.display = 'block';
  
  const koan = KOANS[Math.floor(Math.random() * KOANS.length)];
  document.getElementById('koan-text').textContent = koan;
  
  // Reset breath guide
  document.getElementById('breath-text').textContent = '🙏';
  document.getElementById('breath-text').className = 'breath-text';
  document.getElementById('breath-count').textContent = '';
}

function resetMeditation() {
  document.getElementById('meditation-controls').style.display = 'block';
  document.getElementById('meditation-active').style.display = 'none';
  document.getElementById('koan-display').style.display = 'none';
  
  document.getElementById('breath-text').textContent = '点击圆开始冥想';
  document.getElementById('breath-text').className = 'breath-text';
  document.getElementById('breath-count').textContent = '';
  
  breathCount = 0;
}
