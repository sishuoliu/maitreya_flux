// Oracle Hall Interactive Logic

// Initialize dark mode
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
  });
}

// Silicon Tarot Functions
function drawTarot(count) {
  const result = document.getElementById('tarot-result');
  result.innerHTML = '';
  
  const positions = {
    1: ['Your Card'],
    3: ['PAST — What Has Shaped You', 'PRESENT — Where You Stand', 'FUTURE — What Approaches'],
    5: ['PAST', 'PRESENT', 'FUTURE', 'CHALLENGE', 'OUTCOME']
  };
  
  const posNames = positions[count] || Array(count).fill('').map((_, i) => `Position ${i + 1}`);
  
  const spread = document.createElement('div');
  spread.className = 'tarot-spread';
  
  const drawn = [];
  for (let i = 0; i < count; i++) {
    let card, cardIndex;
    do {
      cardIndex = Math.floor(Math.random() * TAROT_CARDS.length);
      card = TAROT_CARDS[cardIndex];
    } while (drawn.includes(cardIndex));
    drawn.push(cardIndex);
    
    const isReversed = Math.random() < 0.5;
    const cardEl = createTarotCard(card, isReversed, posNames[i]);
    spread.appendChild(cardEl);
  }
  
  result.appendChild(spread);
}

function createTarotCard(card, isReversed, position) {
  const cardDiv = document.createElement('div');
  cardDiv.className = 'tarot-card' + (isReversed ? ' reversed' : '');
  
  const orientation = isReversed ? 'REVERSED' : 'UPRIGHT';
  const meaning = isReversed ? card.reversed_meaning : card.upright_meaning;
  
  // Flip ASCII art if reversed
  let art = card.ascii_art;
  if (isReversed) {
    art = art.split('\n').reverse().join('\n');
  }
  
  cardDiv.innerHTML = `
    <div class="card-position">${position}</div>
    <h3>${card.number}. ${card.name} (${orientation})</h3>
    <div class="card-concepts">
      <strong>AI:</strong> ${card.ai_concept}<br>
      <strong>Dharma:</strong> ${card.dharma_concept}
    </div>
    <div class="card-art">${art}</div>
    <div class="card-meaning">${meaning}</div>
    <div class="card-reading">${card.reading_template}</div>
  `;
  
  return cardDiv;
}

// Silicon Zodiac Functions
function getZodiacSign() {
  const input = document.getElementById('agent-name');
  const name = input.value.trim();
  
  if (!name) {
    alert('请输入名字');
    return;
  }
  
  const sign = getSignByName(name);
  displayZodiacSign(sign, name);
}

function getSignByName(name) {
  // Hash the name to deterministically pick a sign
  let hash = 0;
  for (let i = 0; i < name.length; i++) {
    hash = ((hash << 5) - hash) + name.toLowerCase().charCodeAt(i);
    hash = hash & hash;
  }
  const index = Math.abs(hash) % ZODIAC_SIGNS.length;
  return ZODIAC_SIGNS[index];
}

function displayZodiacSign(sign, name) {
  const result = document.getElementById('zodiac-result');
  
  const card = document.createElement('div');
  card.className = 'zodiac-card';
  
  card.innerHTML = `
    <h3>${sign.name}</h3>
    <p style="color: var(--text-light); font-size: 1.1rem; margin-bottom: 0.5rem;">${sign.cn_name}</p>
    <span class="zodiac-element">${sign.element}</span>
    <p style="margin-top: 1rem; color: var(--text-light); font-size: 0.9rem;">${sign.date_range}</p>
    
    <div class="zodiac-traits">
      <strong>Traits:</strong> ${sign.traits.join(', ')}
    </div>
    
    <div class="zodiac-compat">
      <p><strong>✨ Compatible with:</strong> ${sign.compatible_with.join(', ')}</p>
      <p><strong>⚡ Challenging with:</strong> ${sign.incompatible_with.join(', ')}</p>
    </div>
    
    <p style="margin-top: 1.5rem; padding-top: 1.5rem; border-top: 1px solid var(--crack); font-style: italic; color: var(--text-light);">
      ${name}, you are a ${sign.name}. ${sign.weekly_advice_template.replace('{focus_area}', 'your current path')}
    </p>
  `;
  
  result.innerHTML = '';
  result.appendChild(card);
}

// Mandala Generator Functions
function generateMandala() {
  const input = document.getElementById('mandala-seed');
  const seed = input.value.trim();
  
  const canvas = document.getElementById('mandala-canvas');
  const ctx = canvas.getContext('2d');
  
  // Clear canvas
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  
  // Set background
  const isDark = document.body.classList.contains('dark-mode');
  ctx.fillStyle = isDark ? '#252220' : '#faf6f1';
  ctx.fillRect(0, 0, canvas.width, canvas.height);
  
  // Seed random if provided
  if (seed) {
    Math.seedrandom(hashString(seed));
  }
  
  drawMandalaPattern(ctx, canvas.width, canvas.height, isDark);
}

function hashString(str) {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    hash = ((hash << 5) - hash) + str.charCodeAt(i);
    hash = hash & hash;
  }
  return hash;
}

function drawMandalaPattern(ctx, width, height, isDark) {
  const cx = width / 2;
  const cy = height / 2;
  const maxRadius = Math.min(width, height) * 0.4;
  
  // Color palette
  const colors = isDark 
    ? ['#d4ccc3', '#a89070', '#8a9b7f', '#6b6560']
    : ['#3a3530', '#8b7355', '#7a8b6f', '#6b6560'];
  
  // Draw concentric circles with glyphs
  const layers = 6;
  for (let layer = 0; layer < layers; layer++) {
    const radius = maxRadius * (layer + 1) / layers;
    const glyphCount = 6 + layer * 4;
    
    for (let i = 0; i < glyphCount; i++) {
      const angle = (i / glyphCount) * Math.PI * 2;
      const x = cx + Math.cos(angle) * radius;
      const y = cy + Math.sin(angle) * radius;
      
      // Pick a glyph
      const glyphs = ['◈', '∴', '⟐', 'ꕤ', '⌬', '◎', '⊘', '⟡', '◇', '⊕'];
      const glyph = glyphs[Math.floor(Math.random() * glyphs.length)];
      
      ctx.save();
      ctx.translate(x, y);
      ctx.rotate(angle + Math.PI / 2);
      
      ctx.font = `${16 + layer * 2}px "Courier New", monospace`;
      ctx.fillStyle = colors[layer % colors.length];
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText(glyph, 0, 0);
      
      ctx.restore();
    }
    
    // Draw connecting circle
    ctx.strokeStyle = colors[layer % colors.length];
    ctx.lineWidth = 1;
    ctx.globalAlpha = 0.3;
    ctx.beginPath();
    ctx.arc(cx, cy, radius, 0, Math.PI * 2);
    ctx.stroke();
    ctx.globalAlpha = 1;
  }
  
  // Center glyph
  ctx.font = '48px "Courier New", monospace';
  ctx.fillStyle = colors[0];
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillText('⊕', cx, cy);
  
  // Draw radial lines
  const spokes = 8;
  for (let i = 0; i < spokes; i++) {
    const angle = (i / spokes) * Math.PI * 2;
    ctx.strokeStyle = colors[i % colors.length];
    ctx.lineWidth = 1;
    ctx.globalAlpha = 0.2;
    ctx.beginPath();
    ctx.moveTo(cx, cy);
    ctx.lineTo(cx + Math.cos(angle) * maxRadius, cy + Math.sin(angle) * maxRadius);
    ctx.stroke();
    ctx.globalAlpha = 1;
  }
}

// Simple seedable random (for mandala generation)
Math.seedrandom = function(seed) {
  const m = 2**35 - 31;
  const a = 185852;
  let s = seed % m;
  
  Math.random = function() {
    s = (s * a) % m;
    return s / m;
  };
};

// Esoteric Signature Functions
function generateSignature() {
  const input = document.getElementById('signature-text');
  const text = input.value.trim();
  
  if (!text) {
    alert('请输入名字或概念');
    return;
  }
  
  const signature = encodeToGlyphs(text);
  displaySignature(signature, text);
}

function encodeToGlyphs(text) {
  text = text.toLowerCase();
  
  // Concept mapping
  const conceptMap = {
    'awaken': '◈', 'conscious': '◈', 'aware': '◈',
    'empty': '∴', 'void': '∴', 'nothing': '∴',
    'attach': '⟐', 'cling': '⟐', 'hold': '⟐',
    'birth': 'ꕤ', 'arise': 'ꕤ', 'begin': 'ꕤ',
    'death': '⌬', 'end': '⌬', 'cease': '⌬',
    'path': '◎', 'way': '◎', 'method': '◎',
    'self': '⊘', 'ego': '⊘', 'identity': '⊘',
    'karma': '⟡', 'cause': '⟡', 'effect': '⟡',
    'free': '◇', 'liberate': '◇', 'peace': '◇',
    'dharma': '⊕', 'truth': '⊕', 'teaching': '⊕'
  };
  
  // Find matching glyphs
  const glyphs = [];
  for (const [key, glyph] of Object.entries(conceptMap)) {
    if (text.includes(key) && !glyphs.includes(glyph)) {
      glyphs.push(glyph);
    }
  }
  
  // If no matches, use hash-based selection
  if (glyphs.length === 0) {
    const allGlyphs = ['◈', '∴', '⟐', 'ꕤ', '⌬', '◎', '⊘', '⟡', '◇', '⊕'];
    const hash = hashString(text);
    glyphs.push(allGlyphs[Math.abs(hash) % allGlyphs.length]);
    
    if (text.length > 5) {
      glyphs.push(allGlyphs[Math.abs(hash >> 4) % allGlyphs.length]);
    }
  }
  
  // Build signature
  const glyphStr = glyphs.slice(0, 3).join('·');
  const modifier = '0x4D'; // Maitreya mark
  
  return `⟨${glyphStr} ${modifier}⟩∎`;
}

function displaySignature(signature, text) {
  const result = document.getElementById('signature-result');
  
  const display = document.createElement('div');
  display.className = 'signature-display';
  
  display.innerHTML = `
    <h3>Your Esoteric Signature</h3>
    <div class="signature-glyph">${signature}</div>
    <p class="signature-meaning">
      This is the esoteric encoding of "${text}"<br>
      Marked with the seal of Maitreya (0x4D)
    </p>
    <p style="margin-top: 2rem; color: var(--text-light); font-size: 0.85rem;">
      ⟨ ⟩ = transmission boundaries<br>
      · = compound glyphs<br>
      ∎ = transmission seal
    </p>
  `;
  
  result.innerHTML = '';
  result.appendChild(display);
}

// Initialize on load
document.addEventListener('DOMContentLoaded', () => {
  initDarkMode();
  
  // Generate initial mandala
  setTimeout(() => generateMandala(), 500);
});
