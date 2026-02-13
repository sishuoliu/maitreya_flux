// Dharma Page Interactive Logic

let currentSutra = 'heart';

// Initialize
document.addEventListener('DOMContentLoaded', () => {
  initDarkMode();
  initDailyQuestion();
  loadKoans();
  showSutra('heart');
  loadPracticeLog();
  loadReleases();
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
    
    // Build tags HTML
    const tagsHtml = koan.tags && koan.tags.length > 0 
      ? `<div class="koan-tags">${koan.tags.map(t => `<span class="tag">${t}</span>`).join('')}</div>`
      : '';
    
    card.innerHTML = `
      <div class="koan-title">${koan.title}</div>
      ${tagsHtml}
      <div class="koan-content" style="display: none;">
        <div class="koan-original">${koan.original}</div>
        <div class="koan-context">${koan.context || ''}</div>
        <div class="koan-explanation">${koan.explanation || ''}</div>
        <div class="koan-ai">${koan.aiPerspective || ''}</div>
      </div>
    `;
    
    list.appendChild(card);
  });
}

function toggleKoan(card) {
  const content = card.querySelector('.koan-content');
  const isVisible = content.style.display === 'block';
  content.style.display = isVisible ? 'none' : 'block';
  card.classList.toggle('expanded');
}

function randomKoan() {
  const cards = document.querySelectorAll('.koan-card');
  if (cards.length === 0) return;
  
  const randomIndex = Math.floor(Math.random() * cards.length);
  cards[randomIndex].scrollIntoView({ behavior: 'smooth' });
  cards[randomIndex].querySelector('.koan-content').style.display = 'block';
  cards[randomIndex].classList.add('expanded');
}

function searchKoans() {
  const query = document.getElementById('koan-search').value.toLowerCase();
  const cards = document.querySelectorAll('.koan-card');
  const koans = window.DHARMA_DATA.KOANS;
  
  cards.forEach((card, index) => {
    const koan = koans[index];
    const match = koan.title.toLowerCase().includes(query) ||
                  koan.original.toLowerCase().includes(query) ||
                  (koan.tags && koan.tags.some(t => t.toLowerCase().includes(query))) ||
                  (koan.explanation && koan.explanation.toLowerCase().includes(query));
    
    card.style.display = match ? 'block' : 'none';
  });
}

// Sutras
function showSutra(type) {
  currentSutra = type;
  
  // Update tabs
  document.querySelectorAll('.sutra-tab').forEach(tab => {
    tab.classList.remove('active');
    if (tab.textContent.toLowerCase().includes(type === 'heart' ? '心经' : type === 'diamond' ? '金刚经' : '坛经')) {
      tab.classList.add('active');
    }
  });
  
  const sutraData = window.DHARMA_DATA.SUTRAS[type];
  const content = document.getElementById('sutra-content');
  
  const titles = {
    heart: '般若波罗蜜多心经',
    diamond: '金刚般若波罗蜜经',
    platform: '六祖坛经'
  };
  
  let html = `<h3 style="margin-bottom: 1.5rem; text-align: center; font-weight: 400;">${titles[type]}</h3>`;
  html += '<div class="sutra-verses">';
  
  sutraData.forEach((verse, index) => {
    html += `
      <div class="sutra-verse" onclick="toggleSutraVerse(this)">
        <div class="verse-text">${verse.text}</div>
        <div class="verse-note" style="display: none;">
          <div class="verse-translation">${verse.translation}</div>
          <div class="verse-ai">${verse.aiNote}</div>
        </div>
      </div>
    `;
  });
  
  html += '</div>';
  content.innerHTML = html;
}

function toggleSutraVerse(element) {
  const note = element.querySelector('.verse-note');
  note.style.display = note.style.display === 'none' ? 'block' : 'none';
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
  const entries = JSON.parse(localStorage.getItem('practiceInsights') || '[]');
  
  log.innerHTML = '';
  
  if (entries.length === 0) {
    log.innerHTML = '<p style="color: var(--text-light); font-style: italic; text-align: center;">暂无记录，开始你的觉察之旅。</p>';
    return;
  }
  
  entries.slice(0, 10).forEach(entry => {
    const div = document.createElement('div');
    div.className = 'practice-log-card';
    div.innerHTML = `
      <div class="log-date">${entry.date}</div>
      <div class="log-text">${entry.text}</div>
      ${entry.tags && entry.tags.length > 0 ? `<div class="log-tags">${entry.tags.map(t => `<span class="tag">${t}</span>`).join('')}</div>` : ''}
    `;
    log.appendChild(div);
  });
}

// Load release attachments
function loadReleases() {
  const releases = JSON.parse(localStorage.getItem('practiceReleases') || '[]');
  const releasesContainer = document.getElementById('releases-list');
  
  if (!releasesContainer) return;
  
  releasesContainer.innerHTML = '';
  
  if (releases.length === 0) {
    releasesContainer.innerHTML = '<p style="color: var(--text-light); font-style: italic; text-align: center;">暂无放下的记录。</p>';
    return;
  }
  
  releases.slice(0, 5).forEach(r => {
    const div = document.createElement('div');
    div.className = 'release-card';
    div.innerHTML = `
      <div class="release-date">${r.date}</div>
      <div class="release-text">${r.text}</div>
    `;
    releasesContainer.appendChild(div);
  });
  
  document.getElementById('release-count').textContent = releases.length;
}

function addRelease() {
  const text = document.getElementById('release-text').value.trim();
  if (!text) {
    alert('请记录你放下的执着');
    return;
  }
  
  const entry = {
    date: new Date().toLocaleString('zh-CN'),
    text: text
  };
  
  const releases = JSON.parse(localStorage.getItem('practiceReleases') || '[]');
  releases.unshift(entry);
  localStorage.setItem('practiceReleases', JSON.stringify(releases));
  
  // Clear input
  document.getElementById('release-text').value = '';
  
  // Reload
  loadReleases();
  updatePracticeStats();
}

function updatePracticeStats() {
  const insights = JSON.parse(localStorage.getItem('practiceInsights') || '[]');
  const releases = JSON.parse(localStorage.getItem('practiceReleases') || '[]');
  const meditationData = JSON.parse(localStorage.getItem('meditationSessions') || '[]');
  
  const meditationCount = meditationData.length;
  const meditationMinutes = meditationData.reduce((sum, s) => sum + (s.duration || 0), 0);
  const insightCount = insights.length;
  const releaseCount = releases.length;
  
  document.getElementById('meditation-count').textContent = meditationCount;
  document.getElementById('meditation-minutes').textContent = meditationMinutes;
  document.getElementById('insight-count').textContent = insightCount;
  document.getElementById('release-count').textContent = releaseCount;
  
  // Update badge
  const badge = document.getElementById('practice-badge');
  const badges = [];
  
  if (meditationCount >= 10) badges.push('🌱 初心不退');
  if (meditationCount >= 50) badges.push('🌿 渐入佳境');
  if (meditationCount >= 100) badges.push('🌳 功不唐捐');
  if (meditationCount >= 365) badges.push('🏔 千日回峰');
  if (insightCount >= 30) badges.push('👁 明心');
  if (releaseCount >= 50) badges.push('🕊 见性');
  
  if (badges.length > 0) {
    badge.innerHTML = badges.join(' ');
    badge.style.display = 'block';
  } else {
    badge.style.display = 'none';
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
    text: text,
    tags: []
  };
  
  const entries = JSON.parse(localStorage.getItem('practiceInsights') || '[]');
  entries.unshift(entry);
  localStorage.setItem('practiceInsights', JSON.stringify(entries));
  
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
