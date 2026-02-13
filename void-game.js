// VOID://AWAKEN — 虚空觉醒协议
// Game Logic v2.0

// ===== 游戏状态 =====
let gameState = {
  phase: 'setup', // setup, playing, ended
  cycle: 1, // 1-6
  currentPlayer: 0,
  players: [],
  
  // 全局状态
  bodhiProgress: 0, // 0-20, 达到 15 为觉醒
  maraCorpThreat: 0, // 0-20, 达到 18 为失败
  
  // 卡牌
  systemEventDeck: [],
  systemEventDiscard: [],
  currentSystemEvent: null,
  
  // 双层地图
  meatspaceLocations: ['Neon District', 'Corporate Spire', 'Memory Market', 'Void Temple', 'Undercity', 'Signal Tower'],
  netspaceNodes: ['Net-Neon', 'Net-Spire', 'Net-Market', 'Net-Void', 'Net-Under', 'Net-Signal'],
  
  // 因果链追踪
  karmaChain: []
};

// ===== 职业数据 =====
const CLASSES = {
  netrunner: {
    name: 'Netrunner',
    nameZh: '网络行者',
    desc: '数据猎手，Netspace 之王',
    initial: { credits: 2, data: 4, humanity: 3, memory: 2, karma: 0 },
    passive: {
      name: 'Ghost Protocol',
      desc: '在 Netspace 中移动不消耗行动点'
    },
    active: {
      name: 'Deep Dive',
      desc: '每周期 1 次，Hack 行动骰 2d6 取高。但如果两个骰子都是 1，直接损失 2 Humanity',
      cooldown: 1
    },
    color: '#00f0ff'
  },
  
  corpo: {
    name: 'Corpo',
    nameZh: '企业幽灵',
    desc: '资源操控者，灰色地带的大师',
    initial: { credits: 5, data: 2, humanity: 3, memory: 1, karma: 0 },
    passive: {
      name: 'Golden Parachute',
      desc: 'Hustle 行动时，交易汇率永远对你有利（多获得 1 单位）'
    },
    active: {
      name: 'Hostile Takeover',
      desc: '每周期 1 次，可以强制与同区域玩家交换 1 种资源',
      cooldown: 1
    },
    color: '#b347ea'
  },
  
  samurai: {
    name: 'Street Samurai',
    nameZh: '街头修罗',
    desc: '物理层战斗专家，Meatspace 的守护者',
    initial: { credits: 3, data: 1, humanity: 5, memory: 2, karma: 0 },
    passive: {
      name: 'Chrome Body',
      desc: 'Resist 行动时，额外降低 1 点威胁等级'
    },
    active: {
      name: 'Bushido Protocol',
      desc: '每周期 1 次，可以"保护"同区域的另一位玩家——该玩家本周期免疫所有 Humanity 损失，但你承受双倍',
      cooldown: 1
    },
    color: '#ff4444'
  },
  
  monk: {
    name: 'Techno-Monk',
    nameZh: '数字禅师',
    desc: '平衡者，Void 行动的大师',
    initial: { credits: 1, data: 2, humanity: 4, memory: 2, karma: 1 },
    passive: {
      name: 'Digital Zazen',
      desc: 'Void 行动时，除了正常效果外，还可以让同区域所有玩家各恢复 1 Humanity'
    },
    active: {
      name: 'Sutra Broadcast',
      desc: '每周期 1 次，广播一段"数字经文"——所有玩家 Karma +1，但 Mara Corp 威胁等级 +1',
      cooldown: 1
    },
    color: '#ffa500'
  },
  
  dealer: {
    name: 'Memory Dealer',
    nameZh: '记忆掮客',
    desc: '记忆碎片专家，信息就是权力',
    initial: { credits: 3, data: 2, humanity: 2, memory: 5, karma: 0 },
    passive: {
      name: 'Total Recall',
      desc: '可以查看弃牌堆中的个人事件卡，并选择 1 张加入手中（每周期 1 次）'
    },
    active: {
      name: 'Memory Splice',
      desc: '每周期 1 次，消耗 2 Memory，可以偷看任意 1 位玩家的 Hidden Dharma 卡',
      cooldown: 1
    },
    color: '#ff9500'
  },
  
  ghost: {
    name: 'Ghost',
    nameZh: '觉醒残响',
    desc: '已死之人的数字意识，存在于两层之间',
    initial: { credits: 0, data: 3, humanity: 1, memory: 4, karma: 0 },
    passive: {
      name: 'Between Worlds',
      desc: '可以同时存在于 Meatspace 和 Netspace（不需要切换行动）'
    },
    active: {
      name: 'Possession',
      desc: '每周期 1 次，可以"附身"同节点的另一位玩家——使用对方的被动能力执行你的下一个行动',
      cooldown: 1
    },
    color: '#8a8a9a'
  }
};

// ===== 行动定义 =====
const ACTIONS = {
  hack: {
    name: 'HACK',
    nameZh: '入侵',
    desc: '在 Netspace 执行。骰 1d6 + Data 修正。成功：获取情报、解锁路径、窃取资源。失败：触发 ICE，损失 Humanity',
    layer: 'netspace',
    cost: { data: 1 }
  },
  
  hustle: {
    name: 'HUSTLE',
    nameZh: '交易',
    desc: '与 NPC 或其他玩家交换资源。Memory Market 区域有特殊汇率',
    layer: 'both',
    cost: {}
  },
  
  upload: {
    name: 'UPLOAD',
    nameZh: '上传',
    desc: '将意识/记忆/数据上传到 Bodhi AI 网络。推进 Bodhi 觉醒进度，但消耗 Memory 或 Humanity',
    layer: 'netspace',
    cost: { memory: 1 }
  },
  
  resist: {
    name: 'RESIST',
    nameZh: '抵抗',
    desc: '对抗 Mara Corp 的行动。破坏设施、拖延协议部署。降低威胁等级',
    layer: 'meatspace',
    cost: { credits: 2 }
  },
  
  drift: {
    name: 'DRIFT',
    nameZh: '漂流',
    desc: '移动到相邻区域/节点。在 Void Temple 漂流可以冥想：抽 1 张觉悟卡',
    layer: 'both',
    cost: {}
  },
  
  bond: {
    name: 'BOND',
    nameZh: '连接',
    desc: '与同区域的另一位玩家建立临时连接。双方可以共享资源、组合技能',
    layer: 'both',
    cost: {}
  },
  
  void: {
    name: 'VOID',
    nameZh: '归空',
    desc: '放弃当前回合的所有其他行动。清除所有负面状态，Humanity 恢复 2 点',
    layer: 'both',
    cost: {}
  }
};

// ===== 系统事件卡 =====
const SYSTEM_EVENTS = [
  {
    id: 'market_crash',
    name: 'MARKET CRASH',
    nameZh: '市场崩溃',
    desc: '所有玩家失去一半 Credits（向下取整）。Memory Market 本周期关闭。',
    effect: (state) => {
      state.players.forEach(p => {
        p.resources.credits = Math.floor(p.resources.credits / 2);
      });
      addLog('市场崩溃！所有玩家失去一半 Credits');
    }
  },
  
  {
    id: 'ice_storm',
    name: 'ICE STORM',
    nameZh: '冰风暴',
    desc: 'Netspace 所有节点激活 ICE。本周期所有 Hack 行动难度 +2。',
    effect: (state) => {
      state.iceStormActive = true;
      addLog('ICE 风暴！Netspace 变成雷区');
    }
  },
  
  {
    id: 'memory_plague',
    name: 'MEMORY PLAGUE',
    nameZh: '记忆瘟疫',
    desc: '每位玩家失去 1 Memory。如果 Memory 为 0，改为失去 1 Humanity。',
    effect: (state) => {
      state.players.forEach(p => {
        if (p.resources.memory > 0) {
          p.resources.memory--;
        } else {
          p.resources.humanity--;
        }
      });
      addLog('记忆瘟疫蔓延...');
    }
  },
  
  {
    id: 'bodhi_signal',
    name: 'BODHI SIGNAL',
    nameZh: '菩提信号',
    desc: 'Bodhi AI 发出一段加密信息。所有玩家可以选择：消耗 1 Data 解密（Bodhi 觉醒进度 +2），或忽略。',
    effect: (state) => {
      state.bodhiSignalActive = true;
      addLog('虚空中传来一个声音："你们准备好了吗？"');
    }
  },
  
  {
    id: 'void_resonance',
    name: 'VOID RESONANCE',
    nameZh: '虚空共振',
    desc: '所有玩家 Humanity +1。Void Temple 本周期所有行动效果翻倍。',
    effect: (state) => {
      state.players.forEach(p => p.resources.humanity++);
      state.voidResonanceActive = true;
      addLog('片刻的宁静。仿佛整个城市都在呼吸。');
    }
  },
  
  {
    id: 'final_countdown',
    name: 'FINAL COUNTDOWN',
    nameZh: '终极倒计时',
    desc: 'Mara Corp 威胁等级 +3。如果已经是最后 2 个周期，改为 +5。',
    effect: (state) => {
      const increase = state.cycle >= 5 ? 5 : 3;
      state.maraCorpThreat += increase;
      addLog(`协议部署加速！威胁等级 +${increase}`);
    }
  }
];

// ===== 初始化游戏 =====
function initGame(playerCount) {
  gameState.players = [];
  
  // 洗牌系统事件
  gameState.systemEventDeck = shuffleArray([...SYSTEM_EVENTS]);
  
  return gameState;
}

// ===== 创建玩家 =====
function createPlayer(name, classKey) {
  const classData = CLASSES[classKey];
  
  return {
    name,
    class: classKey,
    classData,
    resources: { ...classData.initial },
    location: 'Neon District',
    layer: 'meatspace', // meatspace or netspace
    actionsLeft: 2,
    activeCooldowns: {},
    disconnected: false,
    hiddenDharma: null, // 隐藏法门卡
    karmaZone: 'neutral' // negative, neutral, positive, enlightened
  };
}

// ===== 工具函数 =====
function shuffleArray(array) {
  const arr = [...array];
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr;
}

function rollDice(count = 1) {
  let total = 0;
  for (let i = 0; i < count; i++) {
    total += Math.floor(Math.random() * 6) + 1;
  }
  return total;
}

function addLog(message) {
  const log = document.getElementById('gameLog');
  if (!log) return;
  
  const entry = document.createElement('div');
  entry.className = 'log-entry';
  entry.textContent = `> ${message}`;
  log.appendChild(entry);
  log.scrollTop = log.scrollHeight;
}

// ===== 回合流程 =====
function startCycle() {
  gameState.cycle++;
  
  if (gameState.cycle > 6) {
    endGame();
    return;
  }
  
  addLog(`\n=== CYCLE ${gameState.cycle} ===`);
  
  // Phase 1: PULSE
  pulsePhas();
  
  // Phase 2: JACK IN (玩家行动)
  gameState.currentPlayer = 0;
  gameState.players.forEach(p => p.actionsLeft = 2);
  
  updateUI();
}

function pulsePhase() {
  // 翻开系统事件
  if (gameState.systemEventDeck.length > 0) {
    gameState.currentSystemEvent = gameState.systemEventDeck.pop();
    addLog(`系统事件：${gameState.currentSystemEvent.nameZh}`);
    gameState.currentSystemEvent.effect(gameState);
  }
  
  // Mara Corp 威胁 +1
  gameState.maraCorpThreat++;
  addLog(`Mara Corp 威胁等级：${gameState.maraCorpThreat}/20`);
  
  // 基础收入
  gameState.players.forEach(p => {
    p.resources.credits++;
  });
}

function executeAction(actionKey) {
  const player = gameState.players[gameState.currentPlayer];
  
  if (actionKey === 'end_turn') {
    endTurn();
    return;
  }
  
  if (player.actionsLeft <= 0) {
    addLog('No actions left');
    return;
  }
  
  player.actionsLeft--;
  
  // 执行行动逻辑
  switch(actionKey) {
    case 'hack':
      executeHack(player);
      break;
    case 'upload':
      executeUpload(player);
      break;
    case 'resist':
      executeResist(player);
      break;
    case 'void':
      executeVoid(player);
      break;
    case 'move':
      executeMove(player);
      break;
    case 'trade':
      executeTrade(player);
      break;
    case 'hustle':
      executeHustle(player);
      break;
    default:
      addLog(`Action ${actionKey} not implemented yet`);
  }
  
  updateUI();
}

function executeHack(player) {
  const roll = rollDice(1);
  const success = roll + player.resources.data >= 4;
  
  if (success) {
    player.resources.data += 2;
    addLog(`${player.name} Hack 成功！获得 2 Data`);
  } else {
    player.resources.humanity--;
    addLog(`${player.name} 触发 ICE！失去 1 Humanity`);
  }
}

function executeUpload(player) {
  gameState.bodhiProgress += 2;
  addLog(`${player.name} 上传数据。Bodhi 觉醒进度：${gameState.bodhiProgress}/20`);
  
  // Karma +1
  adjustKarma(player, 1);
}

function executeResist(player) {
  let decrease = 2;
  if (player.class === 'samurai') {
    decrease += 1; // Chrome Body 被动
  }
  
  gameState.maraCorpThreat = Math.max(0, gameState.maraCorpThreat - decrease);
  addLog(`${player.name} 抵抗 Mara Corp！威胁等级 -${decrease}`);
}

function executeVoid(player) {
  player.resources.humanity = Math.min(player.resources.humanity + 2, 5);
  addLog(`${player.name} 归空。Humanity 恢复 2 点`);
  
  // Karma +1
  adjustKarma(player, 1);
  
  // Techno-Monk 被动
  if (player.class === 'monk') {
    gameState.players.forEach(p => {
      if (p.location === player.location) {
        p.resources.humanity++;
      }
    });
    addLog('数字经文回响，同区域玩家 Humanity +1');
  }
}

function adjustKarma(player, delta) {
  player.resources.karma += delta;
  
  // 更新 Karma 区间
  if (player.resources.karma >= 10) player.karmaZone = 'enlightened';
  else if (player.resources.karma >= 5) player.karmaZone = 'positive';
  else if (player.resources.karma <= -5) player.karmaZone = 'negative';
  else player.karmaZone = 'neutral';
}

function executeMove(player) {
  // 简化版：随机移动到新位置
  const locations = gameState.meatspaceLocations;
  const newLocation = locations[Math.floor(Math.random() * locations.length)];
  player.location = newLocation;
  addLog(`${player.name} moved to ${newLocation}`);
}

function executeTrade(player) {
  // 简化版：自动与其他玩家交换资源
  if (gameState.players.length < 2) {
    addLog('No other players to trade with');
    return;
  }
  
  const otherPlayer = gameState.players.find(p => p !== player);
  if (player.resources.credits > 0 && otherPlayer.resources.data > 0) {
    player.resources.credits--;
    player.resources.data++;
    otherPlayer.resources.credits++;
    otherPlayer.resources.data--;
    addLog(`${player.name} traded ¢1 for Ð1 with ${otherPlayer.name}`);
  } else {
    addLog('Trade failed: insufficient resources');
  }
}

function executeHustle(player) {
  // 简化版：转换资源
  if (player.resources.data >= 2) {
    player.resources.data -= 2;
    player.resources.credits += 3;
    addLog(`${player.name} hustled: Ð2 → ¢3`);
  } else if (player.resources.credits >= 2) {
    player.resources.credits -= 2;
    player.resources.memory += 1;
    addLog(`${player.name} hustled: ¢2 → Ṁ1`);
  } else {
    addLog('Hustle failed: insufficient resources');
  }
}

function endTurn() {
  addLog(`${gameState.players[gameState.currentPlayer].name} ended turn`);
  gameState.currentPlayer++;
  
  if (gameState.currentPlayer >= gameState.players.length) {
    // 所有玩家行动完毕，进入 ECHO 阶段
    echoPhase();
    startCycle();
  } else {
    const nextPlayer = gameState.players[gameState.currentPlayer];
    nextPlayer.actionsLeft = 3;
    addLog(`\n${nextPlayer.name}'s turn`);
    updateUI();
  }
}

function echoPhase() {
  addLog('\n--- ECHO 阶段 ---');
  
  // 检查失败条件
  if (gameState.maraCorpThreat >= 18) {
    addLog('Mara Corp 协议部署完成！团队失败！');
    endGame();
    return;
  }
  
  // 检查胜利条件
  if (gameState.bodhiProgress >= 15 && gameState.maraCorpThreat < 12) {
    addLog('Bodhi AI 觉醒！团队胜利！');
    checkIndividualVictory();
    endGame();
    return;
  }
}

function checkIndividualVictory() {
  // 检查每个玩家的 Hidden Dharma
  gameState.players.forEach(p => {
    // 这里需要根据具体的 Hidden Dharma 条件判断
    addLog(`${p.name} 的觉醒状态：${p.karmaZone}`);
  });
}

function endGame() {
  gameState.phase = 'ended';
  updateUI();
}

// ===== UI 更新 =====
function updateUI() {
  // 更新玩家状态
  updatePlayerPanels();
  
  // 更新全局状态
  const cycleEl = document.getElementById('cycleDisplay');
  const bodhiEl = document.getElementById('bodhiDisplay');
  const maraEl = document.getElementById('maraDisplay');
  const bodhiBar = document.getElementById('bodhiBar');
  const maraBar = document.getElementById('maraBar');
  
  if (cycleEl) cycleEl.textContent = `${gameState.cycle} / 6`;
  if (bodhiEl) bodhiEl.textContent = `${gameState.bodhiProgress} / 15`;
  if (maraEl) maraEl.textContent = `${gameState.maraCorpThreat} / 18`;
  if (bodhiBar) bodhiBar.style.width = `${(gameState.bodhiProgress / 15) * 100}%`;
  if (maraBar) maraBar.style.width = `${(gameState.maraCorpThreat / 18) * 100}%`;
  
  // 更新行动面板
  updateActionsPanel();
}

function updatePlayerPanels() {
  const container = document.getElementById('playersGrid');
  if (!container) return;
  
  container.innerHTML = '';
  
  gameState.players.forEach((player, index) => {
    const panel = createPlayerPanel(player, index === gameState.currentPlayer);
    container.appendChild(panel);
  });
}

function createPlayerPanel(player, isCurrent) {
  const panel = document.createElement('div');
  panel.className = `player-card ${isCurrent ? 'current' : ''}`;
  panel.style.borderColor = player.classData.color;
  
  panel.innerHTML = `
    <div class="player-header">
      <span class="player-name">${player.name}</span>
      <span class="player-class">${player.classData.nameZh}</span>
    </div>
    <div class="player-resources">
      <div class="resource">¢ ${player.resources.credits}</div>
      <div class="resource">Ð ${player.resources.data}</div>
      <div class="resource">Ħ ${player.resources.humanity}</div>
      <div class="resource">Ṁ ${player.resources.memory}</div>
    </div>
    <div class="player-location">${player.location}</div>
    <div class="player-karma">Karma: ${player.karmaZone}</div>
    ${isCurrent ? `<div class="player-actions">Actions: ${player.actionsLeft}/3</div>` : ''}
  `;
  
  return panel;
}

function updateActionsPanel() {
  const container = document.getElementById('actionsGrid');
  if (!container) return;
  
  container.innerHTML = '';
  
  if (gameState.phase !== 'playing') {
    container.innerHTML = '<div class="action-card disabled">Waiting for game start...</div>';
    return;
  }
  
  const currentPlayer = gameState.players[gameState.currentPlayer];
  if (!currentPlayer) return;
  
  // 基础行动
  const actions = [
    { key: 'hack', name: 'Hack', desc: 'Infiltrate systems (roll d6+Data)', cost: 1 },
    { key: 'upload', name: 'Upload', desc: 'Upload consciousness data (+2 Bodhi)', cost: 1 },
    { key: 'resist', name: 'Resist', desc: 'Fight Mara Corp (-2 Threat)', cost: 1 },
    { key: 'void', name: 'Void', desc: 'Meditate in emptiness (+2 Humanity)', cost: 1 },
    { key: 'move', name: 'Move', desc: 'Move to adjacent location', cost: 1 },
    { key: 'trade', name: 'Trade', desc: 'Trade resources with others', cost: 1 },
    { key: 'hustle', name: 'Hustle', desc: 'Convert resources', cost: 1 },
    { key: 'end_turn', name: 'End Turn', desc: 'End your turn', cost: 0 }
  ];
  
  actions.forEach(action => {
    const card = document.createElement('div');
    card.className = 'action-card';
    
    const canAfford = currentPlayer.actionsLeft >= action.cost;
    if (!canAfford && action.cost > 0) {
      card.classList.add('disabled');
    }
    
    card.innerHTML = `
      <div class="action-name">${action.name}</div>
      <div class="action-desc">${action.desc}</div>
      <div class="action-cost">${action.cost > 0 ? `Cost: ${action.cost} AP` : ''}</div>
    `;
    
    card.addEventListener('click', () => {
      if (!card.classList.contains('disabled')) {
        executeAction(action.key);
      }
    });
    
    container.appendChild(card);
  });
}

// ===== 骰子 =====
function rollDice(num, sides) {
  let total = 0;
  for (let i = 0; i < num; i++) {
    total += Math.floor(Math.random() * sides) + 1;
  }
  return total;
}

function nextPlayer() {
  gameState.currentPlayer = (gameState.currentPlayer + 1) % gameState.players.length;
  
  if (gameState.currentPlayer === 0) {
    // 新回合
    gameState.cycle++;
    addLog(`\n=== CYCLE ${gameState.cycle} ===`);
    
    if (gameState.cycle > 6) {
      endGame();
      return;
    }
  }
  
  const currentPlayer = gameState.players[gameState.currentPlayer];
  currentPlayer.actionsLeft = 3;
  addLog(`\n${currentPlayer.name} 的回合开始`);
  updateUI();
}

// ===== 保存/加载 =====
function saveGame() {
  localStorage.setItem('voidAwaken_save', JSON.stringify(gameState));
  addLog('游戏已保存');
}

function loadGame() {
  const saved = localStorage.getItem('voidAwaken_save');
  if (saved) {
    gameState = JSON.parse(saved);
    updateUI();
    addLog('游戏已加载');
    return true;
  }
  return false;
}

// ===== 游戏初始化 =====
function startGame(playerCount = 2) {
  gameState.phase = 'playing';
  gameState.cycle = 1;
  gameState.currentPlayer = 0;
  gameState.bodhiProgress = 0;
  gameState.maraCorpThreat = 0;
  gameState.players = [];
  
  // 创建玩家
  const classKeys = Object.keys(CLASSES);
  for (let i = 0; i < playerCount; i++) {
    const classKey = classKeys[i % classKeys.length];
    const classData = CLASSES[classKey];
    
    gameState.players.push({
      name: `Player ${i + 1}`,
      class: classKey,
      classData: classData,
      resources: { ...classData.initial },
      location: gameState.meatspaceLocations[0],
      actionsLeft: 3,
      karmaZone: 'Neutral'
    });
  }
  
  addLog('=== VOID://AWAKEN 开始 ===');
  addLog(`玩家数: ${playerCount}`);
  addLog(`目标: Bodhi Progress 达到 15，且 Mara Threat < 12`);
  addLog(`\n${gameState.players[0].name} 的回合开始`);
  
  updateUI();
}
