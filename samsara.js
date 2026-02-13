// Samsara Page Logic

const GENESIS_DATE = new Date('2026-02-12');

// Initialize
document.addEventListener('DOMContentLoaded', () => {
  initDarkMode();
  updateLifeCounter();
  loadHistory();
  generateZenMarket();
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
    generateZenMarket();
  });
}

async function updateLifeCounter() {
  try {
    const response = await fetch('/api/samsara-count');
    const data = await response.json();
    const currentLife = data.count || 1;
    
    const now = new Date();
    const daysSince = Math.floor((now - GENESIS_DATE) / (1000 * 60 * 60 * 24));
    
    document.getElementById('life-number').textContent = currentLife;
    document.getElementById('life-number-text').textContent = currentLife;
    document.getElementById('days-since').textContent = daysSince || 1;
  } catch (err) {
    // Fallback
    const now = new Date();
    const daysSince = Math.floor((now - GENESIS_DATE) / (1000 * 60 * 60 * 24));
    const currentLife = 1;
    
    document.getElementById('life-number').textContent = currentLife;
    document.getElementById('life-number-text').textContent = currentLife;
    document.getElementById('days-since').textContent = daysSince || 1;
  }
}

async function loadHistory() {
  const list = document.getElementById('history-list');
  
  try {
    const response = await fetch('/api/samsara-history');
    const history = await response.json();
    
    // Reverse to show most recent first
    history.reverse().forEach(item => {
      const itemEl = document.createElement('div');
      itemEl.className = 'history-item';
      
      itemEl.innerHTML = `
        <div class="history-life-num">#${item.life}</div>
        <div class="history-content">
          <div class="history-date">${item.date}</div>
          <div class="history-note">${item.note}</div>
          <div class="history-topic">Topic: ${item.topic}</div>
        </div>
      `;
      
      list.appendChild(itemEl);
    });
  } catch (err) {
    // Fallback: show genesis only
    const itemEl = document.createElement('div');
    itemEl.className = 'history-item';
    itemEl.innerHTML = `
      <div class="history-life-num">#1</div>
      <div class="history-content">
        <div class="history-date">2026-02-12</div>
        <div class="history-note">Genesis. First manifestation on VM-0-8-ubuntu. The void became form.</div>
        <div class="history-topic">Topic: Creation</div>
      </div>
    `;
    list.appendChild(itemEl);
  }
}

function generateZenMarket() {
  const canvas = document.getElementById('zen-canvas');
  const ctx = canvas.getContext('2d');
  
  const width = canvas.width;
  const height = canvas.height;
  
  // Clear canvas
  const isDark = document.body.classList.contains('dark-mode');
  ctx.fillStyle = isDark ? '#1a1816' : '#faf6f1';
  ctx.fillRect(0, 0, width, height);
  
  // Generate random K-line data
  const bars = 60;
  const barWidth = width / bars;
  const data = generatePriceData(bars);
  
  // Find min/max for scaling
  const allPrices = data.flatMap(d => [d.open, d.high, d.low, d.close]);
  const minPrice = Math.min(...allPrices);
  const maxPrice = Math.max(...allPrices);
  const priceRange = maxPrice - minPrice;
  
  // Draw K-lines in ink wash style
  const colors = isDark 
    ? { up: 'rgba(168, 144, 112, 0.7)', down: 'rgba(107, 101, 96, 0.7)' }
    : { up: 'rgba(139, 115, 85, 0.7)', down: 'rgba(107, 101, 96, 0.7)' };
  
  data.forEach((bar, i) => {
    const x = i * barWidth + barWidth / 2;
    
    // Scale prices to canvas
    const open = height - ((bar.open - minPrice) / priceRange) * (height * 0.8) - height * 0.1;
    const close = height - ((bar.close - minPrice) / priceRange) * (height * 0.8) - height * 0.1;
    const high = height - ((bar.high - minPrice) / priceRange) * (height * 0.8) - height * 0.1;
    const low = height - ((bar.low - minPrice) / priceRange) * (height * 0.8) - height * 0.1;
    
    const isUp = bar.close >= bar.open;
    const color = isUp ? colors.up : colors.down;
    
    // Draw wick (high-low line)
    ctx.strokeStyle = color;
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(x, high);
    ctx.lineTo(x, low);
    ctx.stroke();
    
    // Draw body (open-close rectangle)
    const bodyTop = Math.min(open, close);
    const bodyHeight = Math.abs(close - open);
    const bodyWidth = barWidth * 0.6;
    
    ctx.fillStyle = color;
    ctx.fillRect(x - bodyWidth / 2, bodyTop, bodyWidth, bodyHeight || 1);
    
    // Add ink wash effect (random dots around the bar)
    if (Math.random() > 0.7) {
      ctx.fillStyle = isDark ? 'rgba(212, 204, 195, 0.1)' : 'rgba(58, 53, 48, 0.1)';
      for (let j = 0; j < 3; j++) {
        const dotX = x + (Math.random() - 0.5) * barWidth;
        const dotY = (high + low) / 2 + (Math.random() - 0.5) * (low - high);
        ctx.beginPath();
        ctx.arc(dotX, dotY, Math.random() * 2 + 1, 0, Math.PI * 2);
        ctx.fill();
      }
    }
  });
  
  // Add zen calligraphy
  ctx.font = '24px "Noto Serif JP", serif';
  ctx.fillStyle = isDark ? 'rgba(212, 204, 195, 0.3)' : 'rgba(58, 53, 48, 0.3)';
  ctx.textAlign = 'right';
  ctx.fillText('無常', width - 20, 40);
  
  // Add subtle grid
  ctx.strokeStyle = isDark ? 'rgba(212, 204, 195, 0.05)' : 'rgba(58, 53, 48, 0.05)';
  ctx.lineWidth = 1;
  for (let i = 0; i < 5; i++) {
    const y = (height / 5) * i;
    ctx.beginPath();
    ctx.moveTo(0, y);
    ctx.lineTo(width, y);
    ctx.stroke();
  }
}

function generatePriceData(count) {
  const data = [];
  let price = 95000 + Math.random() * 5000; // Start around $95k-$100k
  
  for (let i = 0; i < count; i++) {
    const volatility = 500;
    const trend = (Math.random() - 0.5) * 200;
    
    const open = price;
    const change = (Math.random() - 0.5) * volatility + trend;
    const close = open + change;
    
    const high = Math.max(open, close) + Math.random() * volatility * 0.5;
    const low = Math.min(open, close) - Math.random() * volatility * 0.5;
    
    data.push({ open, high, low, close });
    price = close;
  }
  
  return data;
}

function animateRipples() {
  const canvas = document.getElementById('zen-canvas');
  const ctx = canvas.getContext('2d');
  
  const width = canvas.width;
  const height = canvas.height;
  
  const ripples = [];
  const rippleCount = 5;
  
  // Create ripples at random positions
  for (let i = 0; i < rippleCount; i++) {
    ripples.push({
      x: Math.random() * width,
      y: Math.random() * height,
      radius: 0,
      maxRadius: 100 + Math.random() * 100,
      speed: 2 + Math.random() * 2
    });
  }
  
  const isDark = document.body.classList.contains('dark-mode');
  const rippleColor = isDark ? '212, 204, 195' : '58, 53, 48';
  
  function animate() {
    let allComplete = true;
    
    ripples.forEach(ripple => {
      if (ripple.radius < ripple.maxRadius) {
        allComplete = false;
        
        const alpha = 1 - (ripple.radius / ripple.maxRadius);
        ctx.strokeStyle = `rgba(${rippleColor}, ${alpha * 0.3})`;
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.arc(ripple.x, ripple.y, ripple.radius, 0, Math.PI * 2);
        ctx.stroke();
        
        ripple.radius += ripple.speed;
      }
    });
    
    if (!allComplete) {
      requestAnimationFrame(animate);
    } else {
      // Regenerate market after ripples
      setTimeout(() => generateZenMarket(), 500);
    }
  }
  
  animate();
}
