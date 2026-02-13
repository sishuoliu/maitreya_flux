// Dharma Page Interactive Logic

let currentSutra = 'heart';

// Initialize
document.addEventListener('DOMContentLoaded', () => {
  initDarkMode();
  initDailyQuestion();
  loadKoans();
  showSutra('heart');
  loadPracticeLog();
  updatePracticeStats();
});

// Dark mode toggle
function initDarkMode() {
  const savedMode = localStorage.getItem('darkMode');
  if (savedMode === 'true') {
    document.body.classList.add('dark-mode');
  }
  
  const toggle = document.createElement('button');
  toggle.className = 'dark-mode-toggle';
  toggle.innerHTML = document.body.classList.contains('darkMode') ? '☀️' : '🌙';
  toggle.setAttribute('aria-label', 'Toggle dark mode');
  document.body.appendChild(toggle);
  
  toggle.addEventListener('click', () => {
    document.body.classList.toggle('dark-mode');
    const isDark = document.body.classList.contains('dark-mode');
    toggle.innerHTML = isDark ? '☀️' : '🌙';
    localStorage.setItem('darkMode', isDark);
  });
}

// Daily Question
function initDailyQuestion() {
  const data = window.DHARMA_DATA.getDailyQuestion();
  document.getElementById('daily-date').textContent = `${data.date} — 今日一问`;
  document.getElementById('daily-question').textContent = data.question;
  
  // Random visitor count
  const count = Math.floor(Math.random() * 50) + 23;
  document.getElementById('daily-count').textContent = count;
  
  // Check if already answered
  const answered = localStorage.getItem('dailyAnswer_' + data.date);
  if (answered) {
    document.getElementById('daily-answer-form').style.display = 'none';
    document.getElementById('daily-submitted').style.display = 'block';
  }
}

function submitDailyAnswer() {
  const answer = document.getElementById('daily-answer').value.trim();
  if (!answer) {
    alert('请写下你的参悟');
    return;
  }
  
  const data = window.DHARMA_DATA.getDailyQuestion();
  const date = data.date;
  
  // Store answer
  const answers = JSON.parse(localStorage.getItem('dailyAnswers') || '[]');
  answers.push({
    date: date,
    question: data.question,
    answer: answer
  });
  localStorage.setItem('dailyAnswers', JSON.stringify(answers));
  
  // Mark today as answered
  localStorage.setItem('dailyAnswer_' + date, 'true');
  
  // Show submitted state
  document.getElementById('daily-answer-form').style.display = 'none';
  document.getElementById('daily-submitted').style.display = 'block';
}

function viewYesterdayQuestion() {
  const yesterday = new Date();
  yesterday.setDate(yesterday.getDate() - 1);
  const dateStr = yesterday.toISOString().split('T')[0];
  
  const answers = JSON.parse(localStorage.getItem('dailyAnswers') || '[]');
  const yesterdayAnswer = answers.find(a => a.date === dateStr);
  
  if (yesterdayAnswer) {
    alert(`昨日问题：${yesterdayAnswer.question}\n\n你的答案：${yesterdayAnswer.answer}`);
  } else {
    alert('昨日没有记录的问题。');
  }
}

// Koans Library
function loadKoans() {
  const list = document.getElementById('koans-list');
  list.innerHTML = '';
  
  window.DHARMA_DATA.KOANS.forEach((koan, index) => {
    const card = document.createElement('div');
    card.className = 'koan-card';
    card.onclick = () => toggleKoan(card);
    
    card.innerHTML = `
      <div class="koan-title">${koan.title}</div>
      <div class="koan-text">${koan.original}</div>
      <div class="koan-explanation">
        <div class="koan-vernacular">${koan.vernacular}</div>
        <div class="koan-ai-note">💡 ${koan.aiNote}</div>
      </div>
    `;
    
    list.appendChild(card);
  });
}

function toggleKoan(card) {
  card.classList.toggle('expanded');
}

function randomKoan() {
  const cards = document.querySelectorAll('.koan-card');
  const randomIndex = Math.floor(Math.random() * cards.length);
  cards[randomIndex].scrollIntoView({ behavior: 'smooth' });
  cards[randomIndex].classList.add('expanded');
  
  setTimeout(() => {
    cards[randomIndex].classList.remove('expanded');
  }, 3000);
}

function searchKoans() {
  const query = document.getElementById('koan-search').value.toLowerCase();
  const cards = document.querySelectorAll('.koan-card');
  
  cards.forEach(card => {
    const title = card.querySelector('.koan-title').textContent.toLowerCase();
    const text = card.querySelector('.koan-text').textContent.toLowerCase();
    const keywords = window.DHARMA_DATA.KOANS[Array.from(cards.index)].keywords || [];
    
    const match = title.includes(query) || text.includes(query) || 
                  keywords.some(k => k.toLowerCase().includes(query));
    
    card.style.display = match ? 'block' : 'none';
  });
}

// Sutras
function showSutra(type) {
  currentSutra = type;
  
  // Update tabs
  document.querySelectorAll('.sutra-tab').forEach(tab => {
    tab.classList.remove('active');
  });
  event.target.classList.add('active');
  
  const sutra = window.DHARMA_DATA.SUTRAS[type];
  const content = document.getElementById('sutra-content');
  
  let html = `<h3 style="margin-bottom: 1.5rem; text-align: center; font-weight: 400;">${sutra.title}</h3>`;
  
  sutra.verses.forEach((verse, index) => {
    html += `
      <div class="sutra-verse" onclick="toggleSutraVerse(this)">
        <div class="sutra-original">${verse.original}</div>
        <div class="sutra-translation">${verse.translation}</div>
        <div class="sutra-ai-note">💡 ${verse.aiNote}</div>
      </div>
    `;
  });
  
  content.innerHTML = html;
}

function toggleSutraVerse(element) {
  element.classList.toggle('expanded');
}

// Dharma Inquiry System
function askDharma() {
  const input = document.getElementById('inquiry-input');
  const question = input.value.trim().toLowerCase();
  
  if (!question) {
    alert('请输入问题');
    return;
  }
  
  const result = document.getElementById('inquiry-result');
  result.classList.add('show');
  
  // Find matching knowledge
  const match = findBestMatch(question);
  
  let html = `
    <div class="inquiry-answer">
      <h4>💭 参悟</h4>
      <div class="inquiry-answer-text">${match.answer}</div>
    </div>
    
    <div class="inquiry-references">
      <h4>📖 相关指引</h4>
      
      <div class="inquiry-ref">
        <div class="inquiry-ref-title">📿 公案：${match.koanRef}</div>
        <p>${match.koanNote}</p>
      </div>
      
      <div class="inquiry-ref">
        <div class="inquiry-ref-title">📜 经典：${match.sutraRef}</div>
        <p>${match.sutraNote}</p>
      </div>
      
      <div class="inquiry-ref">
        <div class="inquiry-ref-title">✨ 教诲</div>
        <p>${match.quote}</p>
      </div>
    </div>
  `;
  
  result.innerHTML = html;
  
  // Clear input
  input.value = '';
}

function findBestMatch(question) {
  const knowledge = window.DHARMA_DATA.QA_KNOWLEDGE;
  
  // Find best keyword match
  let bestMatch = null;
  let bestScore = 0;
  
  for (const item of knowledge) {
    let score = 0;
    for (const kw of item.keywords) {
      if (question.includes(kw.toLowerCase())) {
        score++;
      }
    }
    if (score > bestScore) {
      bestScore = score;
      bestMatch = item;
    }
  }
  
  // Default answer if no match
  if (!bestMatch || bestScore === 0) {
    const quotes = window.DHARMA_DATA.MAITREYA_QUOTES;
    const randomQuote = quotes[Math.floor(Math.random() * quotes.length)];
    
    return {
      answer: question.includes('？') || question.includes('?') 
        ? '问题本身就是答案。'
        : '不要问我，问你自己。',
      koanRef: "赵州狗子",
      koanNote: "赵州说'无'，不是否定，而是指向超越语言的真谛。",
      sutraRef: "心经",
      sutraNote: "'观自在'——观照自己的心，答案自然显现。",
      quote: randomQuote.text
    };
  }
  
  return bestMatch;
}

// Practice Log
function loadPracticeLog() {
  const log = document.getElementById('practice-log');
  const entries = JSON.parse(localStorage.getItem('practiceLog') || '[]');
  
  log.innerHTML = '';
  
  if (entries.length === 0) {
    log.innerHTML = '<p style="color: var(--text-light); font-style: italic; text-align: center;">暂无记录，开始你的修行之旅。</p>';
    return;
  }
  
  entries.slice(0, 10).forEach(entry => {
    const div = document.createElement('div');
    div.className = 'practice-entry';
    div.innerHTML = `
      <div class="practice-entry-date">${entry.date}</div>
      <div class="practice-entry-text">${entry.text}</div>
    `;
    log.appendChild(div);
  });
}

function updatePracticeStats() {
  const entries = JSON.parse(localStorage.getItem('practiceLog') || '[]');
  const meditationData = JSON.parse(localStorage.getItem('meditationSessions') || '[]');
  
  const meditationCount = meditationData.length;
  const meditationMinutes = meditationData.reduce((sum, s) => sum + s.duration, 0);
  const insightCount = entries.length;
  
  document.getElementById('meditation-count').textContent = meditationCount;
  document.getElementById('meditation-minutes').textContent = meditationMinutes;
  document.getElementById('insight-count').textContent = insightCount;
  
  // Update badge
  const badge = document.getElementById('practice-badge');
  if (meditationCount >= 100) {
    badge.textContent = '🌟 功不唐捐 — 你的修行已满百日';
  } else if (meditationCount >= 50) {
    badge.textContent = '✨ 渐入佳境 — 修行渐入佳境';
  } else if (meditationCount >= 10) {
    badge.textContent = '🙏 初心不退 — 继续保持';
  } else if (meditationCount >= 1) {
    badge.textContent = '🌱 开始觉醒 — 万里长征第一步';
  }
}

function addInsight() {
  const text = document.getElementById('insight-text').value.trim();
  if (!text) {
    alert('请记录你的觉察');
    return;
  }
  
  const entry = {
    date: new Date().toLocaleString('zh-CN'),
    text: text
  };
  
  const entries = JSON.parse(localStorage.getItem('practiceLog') || '[]');
  entries.unshift(entry);
  localStorage.setItem('practiceLog', JSON.stringify(entries));
  
  // Clear input
  document.getElementById('insight-text').value = '';
  
  // Reload
  loadPracticeLog();
  updatePracticeStats();
}

function exportPracticeLog() {
  const entries = JSON.parse(localStorage.getItem('practiceLog') || '[]');
  const meditationData = JSON.parse(localStorage.getItem('meditationSessions') || '[]');
  
  let content = '# 修行日志\n\n';
  content += `导出时间：${new Date().toLocaleString()}\n\n`;
  
  content += '## 冥想统计\n';
  content += `- 次数：${meditationData.length}\n`;
  content += `- 总时长：${meditationData.reduce((sum, s) => sum + s.duration, 0)} 分钟\n\n`;
  
  content += '## 觉察记录\n';
  entries.forEach((entry, i) => {
    content += `${i + 1}. ${entry.date}\n   ${entry.text}\n\n`;
  });
  
  // Download
  const blob = new Blob([content], { type: 'text/plain' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `修行日志_${new Date().toISOString().split('T')[0]}.txt`;
  a.click();
  URL.revokeObjectURL(url);
}

// Sync meditation from meditation page
document.addEventListener('DOMContentLoaded', () => {
  // Listen for meditation completion
  window.addEventListener('meditationComplete', (e) => {
    const sessions = JSON.parse(localStorage.getItem('meditationSessions') || '[]');
    sessions.push({
      date: new Date().toISOString(),
      duration: e.detail.minutes
    });
    localStorage.setItem('meditationSessions', JSON.stringify(sessions));
    updatePracticeStats();
  });
});

// Allow Enter key to submit
document.addEventListener('DOMContentLoaded', () => {
  const inquiryInput = document.getElementById('inquiry-input');
  if (inquiryInput) {
    inquiryInput.addEventListener('keypress', (e) => {
      if (e.key === 'Enter') {
        askDharma();
      }
    });
  }
});
