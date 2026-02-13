// 功德轮回：众生百态 - 游戏逻辑
// v1.0 - 2026-02-13

// ===== 游戏状态 =====
let gameState = {
    round: 1,
    calamity: 0,
    savedBeings: 0,
    currentPlayerIndex: 0,
    actionsLeft: 2,
    players: [],
    beings: [],
    collectiveEventDeck: [],
    personalEventDeck: [],
    beingsDeck: [],
    usedCollectiveEvents: [],
    usedPersonalEvents: [],
    phase: 'setup' // setup, vow_reward, collective_event, personal_event, beings, action, end
};

// ===== 职业数据 =====
const ROLES = {
    farmer: {
        name: '农夫',
        quote: '锄禾日当午，汗滴禾下土',
        initial: { wealth: 5, merit: 2, wisdom: 3 },
        passive: {
            name: '勤劳本分',
            desc: '劳作时额外+1资粮（共4）；每回合第一次劳作不受负面事件影响'
        },
        active: {
            name: '分享收成',
            desc: '消耗2资粮，选择1名其他玩家，该玩家获得2资粮，你和对方各获得1功德',
            cost: { wealth: 2 },
            usesPerGame: 2
        }
    },
    merchant: {
        name: '商人',
        quote: '千金散尽还复来',
        initial: { wealth: 8, merit: 2, wisdom: 1 },
        passive: {
            name: '广结善缘',
            desc: '布施时额外+2功德；首次渡化后获得2资粮；可用双倍资粮代替慧进行渡化'
        },
        active: {
            name: '慷慨宴请',
            desc: '消耗3资粮，全体玩家（含自己）各获得1功德，劫难-1',
            cost: { wealth: 3 },
            usesPerGame: 2
        }
    },
    scholar: {
        name: '学者',
        quote: '学而不厌，诲人不倦',
        initial: { wealth: 4, merit: 2, wisdom: 5 },
        passive: {
            name: '博学多闻',
            desc: '修行时额外+1慧（共3）；抽到个人事件时，可选择弃掉重抽1次（每局限1次）'
        },
        active: {
            name: '讲学传道',
            desc: '选择1-2名其他玩家，各获得1慧；你获得1功德',
            cost: {},
            usesPerGame: 2
        }
    },
    monk: {
        name: '僧侣',
        quote: '一钵千家饭，孤僧万里游',
        initial: { wealth: 1, merit: 5, wisdom: 5 },
        passive: {
            name: '化缘度日 & 护法专精',
            desc: '渡化时可用功德代替资粮（最多2点）；每回合开始若资粮为0，自动获得1资粮；护法成本-1，效果+1'
        },
        active: {
            name: '加持祈福',
            desc: '消耗1功德，选择1名玩家，其下一次行动收益+2',
            cost: { merit: 1 },
            usesPerGame: 2
        }
    }
};

// ===== 集体事件卡数据 (12张) =====
const COLLECTIVE_EVENTS = [
    {
        id: 'C1',
        name: '旱魃肆虐',
        type: 'disaster',
        quote: '赤地千里，饿殍遍野',
        baseCalamity: 4,
        choices: [
            { id: 'A', desc: '开仓放粮', cost: { wealth: 2 }, reward: { merit: 1 }, effect: '每多1人选A，劫难-1' },
            { id: 'B', desc: '紧闭粮仓', cost: { wealth: 1 }, penalty: '全选B则劫难额外+2' }
        ]
    },
    {
        id: 'C2',
        name: '洪水滔天',
        type: 'disaster',
        quote: '洪水无情，人间有爱',
        baseCalamity: 4,
        choices: [
            { id: 'A', desc: '捐资筑堤', cost: { wealth: 2 }, reward: { merit: 1 }, effect: '每多1人选A，劫难-1' },
            { id: 'B', desc: '独善其身', penalty: { merit: -1 } }
        ]
    },
    {
        id: 'C3',
        name: '瘟疫流行',
        type: 'disaster',
        quote: '疫病肆虐，人心惶惶',
        baseCalamity: 5,
        choices: [
            { id: 'A', desc: '救治病患', cost: { wealth: 1, wisdom: 1 }, reward: { merit: 2 }, effect: '每多1人选A，劫难-1' },
            { id: 'B', desc: '避而远之', cost: { wisdom: 1 } }
        ]
    },
    {
        id: 'C4',
        name: '蝗灾蔽日',
        type: 'disaster',
        quote: '蝗虫过境，颗粒无收',
        baseCalamity: 3,
        chainDecision: true,
        desc: '起始玩家先选择，后续玩家依次选择是否跟随'
    },
    {
        id: 'C5',
        name: '苛政如虎',
        type: 'calamity',
        quote: '横征暴敛，民不聊生',
        baseCalamity: 3,
        condition: '若劫难≥10，基础劫难+2',
        choices: [
            { id: 'A', desc: '缴纳重税', cost: { wealth: 3 } },
            { id: 'B', desc: '抗税逃亡', cost: { wealth: 1 }, penalty: '劫难+2' }
        ]
    },
    {
        id: 'C6',
        name: '战乱四起',
        type: 'calamity',
        quote: '兵荒马乱，流离失所',
        baseCalamity: 5,
        choices: [
            { id: 'A', desc: '捐资军需', cost: { wealth: 3 }, reward: { merit: 1 }, effect: '劫难-2' },
            { id: 'B', desc: '避难他乡', cost: { wealth: 2 } }
        ]
    },
    {
        id: 'C7',
        name: '盂兰盆节',
        type: 'merit',
        quote: '超度亡灵，普度众生',
        baseReward: { merit: 1 },
        bonus: '若已渡化≥1众生，全体额外+1功德'
    },
    {
        id: 'C8',
        name: '丰收之年',
        type: 'merit',
        quote: '五谷丰登，仓廪实',
        baseReward: { wealth: 2 },
        bonus: '农夫额外+1资粮'
    },
    {
        id: 'C9',
        name: '法会盛典',
        type: 'merit',
        quote: '梵音缭绕，功德无量',
        desc: '每位玩家可选择：消耗2资粮→获得2功德+1慧'
    },
    {
        id: 'C10',
        name: '贤君登基',
        type: 'merit',
        quote: '明君在位，天下太平',
        baseReward: { wealth: 1, merit: 1 },
        effect: '劫难-2'
    },
    {
        id: 'C11',
        name: '商路畅通',
        type: 'merit',
        quote: '丝路繁荣，万国来朝',
        baseReward: { wealth: 3 },
        bonus: '商人额外+2资粮'
    },
    {
        id: 'C12',
        name: '书院兴学',
        type: 'merit',
        quote: '文教昌明，学风鼎盛',
        baseReward: { wisdom: 2 },
        bonus: '学者额外+1慧'
    }
];

// ===== 众生卡数据 (10张) =====
const BEINGS = [
    { id: 'B1', name: '饥民', story: '三天没吃饭了，求求你给口吃的...', cost: 3, reward: { merit: 2, wisdom: 1 } },
    { id: 'B2', name: '病者', story: '咳嗽不止，浑身发烫...', cost: 3, reward: { merit: 2, wisdom: 1 } },
    { id: 'B3', name: '孤儿', story: '爹娘都走了，我一个人好害怕...', cost: 4, reward: { merit: 3, wisdom: 1 }, blessed: true, special: '下次行动功德+1' },
    { id: 'B4', name: '寡妇', story: '丈夫战死沙场，留下三个孩子...', cost: 4, reward: { merit: 2, wisdom: 2 } },
    { id: 'B5', name: '落魄书生', story: '十年寒窗无人问...', cost: 4, reward: { merit: 1, wisdom: 3 }, blessed: true, special: '下次修行慧+1' },
    { id: 'B6', name: '迷途商贾', story: '生意失败，妻离子散...', cost: 5, reward: { merit: 2, wisdom: 2 }, special: '获得1资粮' },
    { id: 'B7', name: '悔过恶人', story: '我曾作恶多端，如今噩梦缠身...', cost: 5, reward: { merit: 4, wisdom: 1 }, special: '劫难-1' },
    { id: 'B8', name: '垂死老者', story: '我时日无多，只想得到一点安慰...', cost: 6, reward: { merit: 3, wisdom: 3 }, blessed: true, special: '资粮恰好归0额外+2功德' },
    { id: 'B9', name: '被弃婴儿', story: '城门外，襁褓中的婴儿在啼哭...', cost: 3, reward: { merit: 3, wisdom: 0 }, special: '下回合劳作资粮+1' },
    { id: 'B10', name: '绝望猎人', story: '山中野兽越来越少，全家要饿死了...', cost: 5, reward: { merit: 2, wisdom: 2 }, optional: '额外资-1教他种田→功德+2' }
];

// ===== 发愿卡数据 (8张职业 + 4张菩萨) =====
const VOWS = {
    farmer: [
        { id: 'V_F1', name: '勤劳致功德', difficulty: 'simple', condition: '功德≥15', success: 10, fail: -4 },
        { id: 'V_F2', name: '贫女一灯', difficulty: 'hard', condition: '功德≥16且资粮≤10', success: 18, fail: -6 }
    ],
    merchant: [
        { id: 'V_M1', name: '资施功德', difficulty: 'simple', perRound: { wealth: 1 }, condition: '布施≥7次', success: 10, fail: -4 },
        { id: 'V_M2', name: '大商人之心', difficulty: 'hard', perRound: { wisdom: 1 }, condition: '功德≥32', success: 18, fail: -6 }
    ],
    scholar: [
        { id: 'V_S1', name: '传道授业', difficulty: 'simple', perRound: { wisdom: 1 }, condition: '慧≥18且使用过讲学传道≥1次', success: 10, fail: -4 },
        { id: 'V_S2', name: '万世师表', difficulty: 'hard', perRound: { wisdom: 1 }, condition: '功德≥14且慧≥19', success: 16, fail: -6 }
    ],
    monk: [
        { id: 'V_MO1', name: '阿罗汉果', difficulty: 'simple', perRound: { wisdom: 1 }, condition: '慧≥13', success: 10, fail: -4 },
        { id: 'V_MO2', name: '菩萨道', difficulty: 'hard', perRound: { merit: 1 }, condition: '功德≥22且渡化≥3次', success: 16, fail: -6 }
    ],
    bodhisattva: [
        { id: 'V_B1', name: '地藏愿', desc: '地狱不空，誓不成佛', condition: '劫难≤4且承受≥2次', success: 25, fail: -6 },
        { id: 'V_B2', name: '观音愿', desc: '千处祈求千处应', condition: '帮助行动≥7次', success: 22, fail: -4 },
        { id: 'V_B3', name: '普贤愿', desc: '恒顺众生，广修供养', condition: '布施≥6且团队渡化≥6', success: 16, fail: -8 },
        { id: 'V_B4', name: '文殊愿', desc: '开示众生，令入佛智', condition: '协助队友渡化≥3次', success: 14, fail: -6 }
    ]
};

// ===== 核心游戏逻辑 =====

// 初始化游戏
function initGame(playerCount) {
    // 洗牌
    gameState.collectiveEventDeck = shuffle([...COLLECTIVE_EVENTS]);
    gameState.beingsDeck = shuffle([...BEINGS]);
    
    // 初始化众生区域（2张）
    gameState.beings = [
        { ...gameState.beingsDeck.pop(), timer: 0 },
        { ...gameState.beingsDeck.pop(), timer: 0 }
    ];
    
    // 重置状态
    gameState.round = 1;
    gameState.calamity = 0;
    gameState.savedBeings = 0;
    gameState.currentPlayerIndex = 0;
    gameState.actionsLeft = 2;
    gameState.phase = 'vow_reward';
}

// 洗牌函数
function shuffle(array) {
    const arr = [...array];
    for (let i = arr.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [arr[i], arr[j]] = [arr[j], arr[i]];
    }
    return arr;
}

// 获取当前玩家
function getCurrentPlayer() {
    return gameState.players[gameState.currentPlayerIndex];
}

// 更新资源
function updateResource(player, resource, amount) {
    player[resource] = Math.max(0, player[resource] + amount);
    
    // 显示资源变化动画
    showResourceChange(resource, amount);
    
    // 保存游戏
    saveGameState();
    
    // 更新UI
    updatePlayerPanel();
}

// 显示资源变化动画
function showResourceChange(resource, amount) {
    const element = document.getElementById(`resource-${resource}`);
    if (!element) return;
    
    const change = document.createElement('div');
    change.className = 'resource-change';
    change.textContent = amount > 0 ? `+${amount}` : amount;
    change.style.color = amount > 0 ? '#4caf50' : '#f44336';
    change.style.left = element.offsetLeft + 'px';
    change.style.top = element.offsetTop + 'px';
    
    element.parentElement.appendChild(change);
    setTimeout(() => change.remove(), 1000);
}

// 执行行动
function performAction(actionType) {
    const player = getCurrentPlayer();
    
    switch(actionType) {
        case 'labor':
            performLabor(player);
            break;
        case 'practice':
            performPractice(player);
            break;
        case 'donate':
            performDonate(player);
            break;
        case 'save':
            showBeingsSelection(player);
            return; // 不立即减少行动次数
        case 'protect':
            performProtect(player);
            break;
    }
    
    gameState.actionsLeft--;
    updateUI();
    
    if (gameState.actionsLeft === 0) {
        nextPlayer();
    }
}

// 劳作
function performLabor(player) {
    let gain = 3;
    if (player.role === 'farmer') gain += 1;
    updateResource(player, 'wealth', gain);
    player.stats.laborCount = (player.stats.laborCount || 0) + 1;
}

// 修行
function performPractice(player) {
    let gain = 2;
    if (player.role === 'scholar') gain += 1;
    updateResource(player, 'wisdom', gain);
    player.stats.practiceCount = (player.stats.practiceCount || 0) + 1;
}

// 布施
function performDonate(player) {
    if (player.wealth < 2) {
        showMessage('资粮不足', '布施需要至少2资粮');
        return;
    }
    
    updateResource(player, 'wealth', -2);
    let meritGain = 1;
    if (player.role === 'merchant') meritGain += 2;
    updateResource(player, 'merit', meritGain);
    gameState.calamity = Math.max(0, gameState.calamity - 1);
    
    player.stats.donateCount = (player.stats.donateCount || 0) + 1;
    player.stats.helpCount = (player.stats.helpCount || 0) + 1;
}

// 护法
function performProtect(player) {
    const cost = player.role === 'monk' ? 1 : 2;
    if (player.wealth < cost) {
        showMessage('资粮不足', `护法需要${cost}资粮`);
        return;
    }
    
    updateResource(player, 'wealth', -cost);
    let meritGain = player.role === 'monk' ? 4 : 3;
    if (gameState.calamity >= 8) meritGain += 1;
    updateResource(player, 'merit', meritGain);
    gameState.calamity = Math.max(0, gameState.calamity - 3);
    
    player.stats.protectCount = (player.stats.protectCount || 0) + 1;
    player.stats.helpCount = (player.stats.helpCount || 0) + 1;
}

// 渡化众生
function saveBeing(player, being) {
    if (player.wisdom < 5) {
        showMessage('智慧不足', '渡化需要至少5慧');
        return;
    }
    
    let cost = being.cost;
    // 职业调整
    if (player.role === 'monk' || player.role === 'scholar') cost -= 1;
    
    if (player.wealth < cost) {
        showMessage('资粮不足', `渡化需要${cost}资粮`);
        return;
    }
    
    updateResource(player, 'wealth', -cost);
    updateResource(player, 'merit', being.reward.merit || 0);
    updateResource(player, 'wisdom', being.reward.wisdom || 0);
    
    // 福田加成
    if (being.blessed && player.converted) {
        updateResource(player, 'merit', 1);
    }
    
    // 移除众生，增加渡化计数
    gameState.beings = gameState.beings.filter(b => b.id !== being.id);
    gameState.savedBeings++;
    
    // 补充新众生
    if (gameState.beingsDeck.length > 0) {
        gameState.beings.push({ ...gameState.beingsDeck.pop(), timer: 0 });
    }
    
    player.stats.saveCount = (player.stats.saveCount || 0) + 1;
    player.stats.helpCount = (player.stats.helpCount || 0) + 1;
    
    updateUI();
}

// 下一位玩家
function nextPlayer() {
    gameState.currentPlayerIndex++;
    if (gameState.currentPlayerIndex >= gameState.players.length) {
        // 所有玩家行动完毕，进入回合结算
        endRound();
    } else {
        gameState.actionsLeft = 2;
        updateUI();
    }
}

// 回合结算
function endRound() {
    // 生存消耗（偶数回合）
    if (gameState.round % 2 === 0) {
        gameState.players.forEach(player => {
            if (player.wealth > 0) {
                updateResource(player, 'wealth', -1);
            } else {
                updateResource(player, 'merit', -1);
            }
        });
    }
    
    // 检查劫难
    if (gameState.calamity >= 20) {
        endGame(false);
        return;
    }
    
    // 检查是否游戏结束
    if (gameState.round >= 6) {
        endGame(true);
        return;
    }
    
    // 进入下一回合
    gameState.round++;
    gameState.currentPlayerIndex = 0;
    gameState.actionsLeft = 2;
    gameState.phase = 'vow_reward';
    
    startNewRound();
}

// 开始新回合
function startNewRound() {
    // 发愿奖励
    gameState.players.forEach(player => {
        if (player.vow && player.vow.perRound) {
            Object.keys(player.vow.perRound).forEach(resource => {
                updateResource(player, resource, player.vow.perRound[resource]);
            });
        }
    });
    
    // 集体事件
    if (gameState.collectiveEventDeck.length > 0) {
        const event = gameState.collectiveEventDeck.pop();
        showCollectiveEvent(event);
    }
    
    // 个人事件（奇数回合）
    if (gameState.round % 2 === 1) {
        // 简化：暂时跳过个人事件
    }
    
    // 众生阶段
    gameState.beings.forEach(being => {
        being.timer++;
        if (being.timer >= 2) {
            gameState.calamity += 5;
            gameState.beings = gameState.beings.filter(b => b.id !== being.id);
            // 补充新众生
            if (gameState.beingsDeck.length > 0) {
                gameState.beings.push({ ...gameState.beingsDeck.pop(), timer: 0 });
            }
        }
    });
    
    updateUI();
}

// 游戏结束
function endGame(completed) {
    const victory = completed && gameState.calamity <= 12 && gameState.savedBeings >= 5;
    
    // 计算得分
    gameState.players.forEach(player => {
        const total = player.merit + player.wisdom;
        let baseScore = 0;
        if (total >= 35) baseScore = 65;
        else if (total >= 30) baseScore = 55;
        else if (total >= 25) baseScore = 45;
        else if (total >= 20) baseScore = 35;
        else if (total >= 15) baseScore = 25;
        else baseScore = 15;
        
        // 平衡惩罚
        if (player.merit < 5 || player.wisdom < 5) {
            baseScore = Math.floor(baseScore / 2);
        }
        
        player.finalScore = victory ? baseScore : 0;
    });
    
    // 排序
    gameState.players.sort((a, b) => b.finalScore - a.finalScore);
    
    showGameOver(victory);
}

// ===== UI更新函数 =====

// 更新整个UI
function updateUI() {
    updateStatusBar();
    updatePlayerPanel();
    updateActionsPanel();
    updateBeingsPanel();
}

// 更新状态栏
function updateStatusBar() {
    document.getElementById('round-display').textContent = `${gameState.round} / 6`;
    document.getElementById('calamity-display').textContent = gameState.calamity;
    document.getElementById('saved-display').textContent = `${gameState.savedBeings} / 5`;
    document.getElementById('actions-display').textContent = gameState.actionsLeft;
    
    // 更新劫难轨道
    const track = document.getElementById('calamity-track');
    track.innerHTML = '';
    for (let i = 0; i <= 20; i += 2) {
        const cell = document.createElement('div');
        cell.className = 'calamity-cell';
        cell.textContent = i;
        if (i === gameState.calamity) cell.classList.add('active');
        else if (i <= 8) cell.classList.add('safe');
        else if (i <= 12) cell.classList.add('warning');
        else cell.classList.add('danger');
        track.appendChild(cell);
    }
}

// 更新玩家面板
function updatePlayerPanel() {
    const player = getCurrentPlayer();
    if (!player) return;
    
    document.getElementById('current-player-name').textContent = player.name;
    document.getElementById('current-player-role').textContent = ROLES[player.role].name;
    document.getElementById('resource-wealth').textContent = player.wealth;
    document.getElementById('resource-merit').textContent = player.merit;
    document.getElementById('resource-wisdom').textContent = player.wisdom;
    
    // 更新技能
    const skillsDiv = document.getElementById('player-skills');
    skillsDiv.innerHTML = `
        <div class="skill-item">
            <div class="skill-name">被动：${ROLES[player.role].passive.name}</div>
            <div class="skill-desc">${ROLES[player.role].passive.desc}</div>
        </div>
        <div class="skill-item ${player.activeUsed >= ROLES[player.role].active.usesPerGame ? 'skill-used' : ''}">
            <div class="skill-name">主动：${ROLES[player.role].active.name}</div>
            <div class="skill-desc">${ROLES[player.role].active.desc}</div>
            <div class="skill-desc">剩余次数：${ROLES[player.role].active.usesPerGame - (player.activeUsed || 0)}</div>
        </div>
    `;
}

// 更新行动面板
function updateActionsPanel() {
    const player = getCurrentPlayer();
    if (!player) return;
    
    const actionsGrid = document.getElementById('actions-grid');
    actionsGrid.innerHTML = '';
    
    const actions = [
        { id: 'labor', name: '劳作', cost: '', effect: '+3资粮', canDo: true },
        { id: 'practice', name: '修行', cost: '', effect: '+2慧', canDo: true },
        { id: 'donate', name: '布施', cost: '资-2', effect: '功德+1，劫难-1', canDo: player.wealth >= 2 },
        { id: 'save', name: '渡化众生', cost: '慧≥5', effect: '渡化1个众生', canDo: player.wisdom >= 5 },
        { id: 'protect', name: '护法', cost: `资-${player.role === 'monk' ? 1 : 2}`, effect: '功德+3，劫难-3', canDo: player.wealth >= (player.role === 'monk' ? 1 : 2) }
    ];
    
    actions.forEach(action => {
        const btn = document.createElement('div');
        btn.className = `action-btn ${!action.canDo ? 'disabled' : ''}`;
        btn.innerHTML = `
            <div class="action-name">${action.name}</div>
            ${action.cost ? `<div class="action-cost">${action.cost}</div>` : ''}
            <div class="action-effect">${action.effect}</div>
        `;
        if (action.canDo) {
            btn.onclick = () => performAction(action.id);
        }
        actionsGrid.appendChild(btn);
    });
}

// 更新众生面板
function updateBeingsPanel() {
    const beingsArea = document.getElementById('beings-area');
    beingsArea.innerHTML = '';
    
    gameState.beings.forEach(being => {
        const card = document.createElement('div');
        card.className = `being-card ${being.blessed ? '福田' : ''}`;
        card.innerHTML = `
            <div class="being-name">${being.name}${being.blessed ? ' 【福田】' : ''}</div>
            <div class="being-story">"${being.story}"</div>
            <div class="being-cost">成本：${being.cost}资粮</div>
            <div class="being-reward">奖励：功德+${being.reward.merit || 0}，慧+${being.reward.wisdom || 0}</div>
            ${being.special ? `<div class="being-timer">特殊：${being.special}</div>` : ''}
            <div class="being-timer">滞留：${being.timer}回合</div>
        `;
        card.onclick = () => {
            const player = getCurrentPlayer();
            if (player.wisdom >= 5) {
                showModal('渡化众生', `确认渡化【${being.name}】？`, [
                    { text: '确认', onclick: () => { saveBeing(player, being); closeModal(); } },
                    { text: '取消', onclick: closeModal }
                ]);
            } else {
                showMessage('智慧不足', '渡化需要至少5慧');
            }
        };
        beingsArea.appendChild(card);
    });
}

// 显示消息
function showMessage(title, message) {
    showModal(title, message, [{ text: '确定', onclick: closeModal }]);
}

// 显示模态框
function showModal(title, body, buttons) {
    document.getElementById('modal-title').textContent = title;
    document.getElementById('modal-body').innerHTML = typeof body === 'string' ? `<p>${body}</p>` : body;
    
    const buttonsDiv = document.getElementById('modal-buttons');
    buttonsDiv.innerHTML = '';
    buttons.forEach(btn => {
        const button = document.createElement('button');
        button.className = btn.class || 'btn';
        button.textContent = btn.text;
        button.onclick = btn.onclick;
        buttonsDiv.appendChild(button);
    });
    
    document.getElementById('modal').classList.add('active');
}

// 关闭模态框
function closeModal() {
    document.getElementById('modal').classList.remove('active');
}

// 显示集体事件
function showCollectiveEvent(event) {
    const eventPanel = document.getElementById('event-panel');
    eventPanel.innerHTML = `
        <div class="event-card collective">
            <div class="event-title">${event.name}</div>
            <div class="event-quote">${event.quote}</div>
            <div class="event-content">
                基础劫难：+${event.baseCalamity}<br>
                ${event.desc || ''}
            </div>
            <div class="event-choices" id="event-choices"></div>
        </div>
    `;
    
    // 简化：自动处理事件
    setTimeout(() => {
        gameState.calamity += event.baseCalamity;
        if (event.baseReward) {
            gameState.players.forEach(player => {
                Object.keys(event.baseReward).forEach(resource => {
                    updateResource(player, resource, event.baseReward[resource]);
                });
            });
        }
        updateUI();
    }, 2000);
}

// 显示游戏结束
function showGameOver(victory) {
    document.getElementById('game-screen').classList.add('hidden');
    document.getElementById('game-over-screen').classList.remove('hidden');
    
    const resultDiv = document.getElementById('game-result');
    resultDiv.textContent = victory ? '团队胜利！' : '团队失败';
    resultDiv.className = `game-result ${victory ? 'victory' : 'defeat'}`;
    
    const scoresDiv = document.getElementById('player-scores');
    scoresDiv.innerHTML = '';
    gameState.players.forEach((player, index) => {
        const scoreItem = document.createElement('div');
        scoreItem.className = `score-item ${index === 0 ? 'winner' : ''}`;
        scoreItem.innerHTML = `
            <div>
                <strong>${player.name}</strong> (${ROLES[player.role].name})<br>
                功德：${player.merit} | 慧：${player.wisdom}
            </div>
            <div style="font-size: 1.5rem; font-weight: bold;">${player.finalScore}分</div>
        `;
        scoresDiv.appendChild(scoreItem);
    });
}

// ===== 游戏初始化和设置 =====

// 更新玩家设置界面
function updatePlayerSetup() {
    const count = parseInt(document.getElementById('player-count').value);
    const container = document.getElementById('players-setup');
    container.innerHTML = '';
    
    for (let i = 0; i < count; i++) {
        const playerDiv = document.createElement('div');
        playerDiv.className = 'player-setup';
        playerDiv.innerHTML = `
            <h3>玩家 ${i + 1}</h3>
            <div class="input-group">
                <label>姓名</label>
                <input type="text" id="player-name-${i}" value="玩家${i + 1}" />
            </div>
            <div class="input-group">
                <label>职业</label>
                <select id="player-role-${i}">
                    <option value="farmer">农夫</option>
                    <option value="merchant">商人</option>
                    <option value="scholar">学者</option>
                    <option value="monk">僧侣</option>
                </select>
            </div>
        `;
        container.appendChild(playerDiv);
    }
}

// 开始游戏
function startGame() {
    const count = parseInt(document.getElementById('player-count').value);
    gameState.players = [];
    
    for (let i = 0; i < count; i++) {
        const name = document.getElementById(`player-name-${i}`).value;
        const role = document.getElementById(`player-role-${i}`).value;
        const roleData = ROLES[role];
        
        gameState.players.push({
            name,
            role,
            wealth: roleData.initial.wealth,
            merit: roleData.initial.merit,
            wisdom: roleData.initial.wisdom,
            converted: false,
            mahayana: false,
            vow: null,
            activeUsed: 0,
            stats: {
                laborCount: 0,
                practiceCount: 0,
                donateCount: 0,
                saveCount: 0,
                protectCount: 0,
                helpCount: 0
            }
        });
    }
    
    initGame(count);
    
    document.getElementById('setup-screen').classList.add('hidden');
    document.getElementById('game-screen').classList.remove('hidden');
    
    updateUI();
}

// 保存游戏
function saveGame() {
    localStorage.setItem('ritual-game-state', JSON.stringify(gameState));
    showMessage('保存成功', '游戏已保存');
}

// 加载游戏
function loadGame() {
    const saved = localStorage.getItem('ritual-game-state');
    if (saved) {
        gameState = JSON.parse(saved);
        document.getElementById('setup-screen').classList.add('hidden');
        document.getElementById('game-screen').classList.remove('hidden');
        updateUI();
    } else {
        showMessage('无存档', '没有找到保存的游戏');
    }
}

// 保存游戏状态
function saveGameState() {
    localStorage.setItem('ritual-game-state', JSON.stringify(gameState));
}

// 暗色模式切换
function toggleTheme() {
    const body = document.body;
    const icon = document.getElementById('theme-icon');
    if (body.getAttribute('data-theme') === 'dark') {
        body.removeAttribute('data-theme');
        icon.textContent = '🌙';
    } else {
        body.setAttribute('data-theme', 'dark');
        icon.textContent = '☀️';
    }
}

// 结束回合
function endTurn() {
    if (gameState.actionsLeft > 0) {
        showModal('确认结束', '还有行动次数未使用，确认结束回合？', [
            { text: '确认', onclick: () => { gameState.actionsLeft = 0; nextPlayer(); closeModal(); } },
            { text: '取消', onclick: closeModal }
        ]);
    } else {
        nextPlayer();
    }
}

// 查看所有玩家
function showPlayerList() {
    const body = document.createElement('div');
    gameState.players.forEach(player => {
        const div = document.createElement('div');
        div.style.marginBottom = '15px';
        div.style.padding = '10px';
        div.style.background = 'var(--bg-secondary)';
        div.style.borderRadius = '8px';
        div.innerHTML = `
            <strong>${player.name}</strong> (${ROLES[player.role].name})<br>
            资粮：${player.wealth} | 功德：${player.merit} | 慧：${player.wisdom}
        `;
        body.appendChild(div);
    });
    showModal('所有玩家', body, [{ text: '关闭', onclick: closeModal }]);
}

// 页面加载完成后初始化
document.addEventListener('DOMContentLoaded', () => {
    updatePlayerSetup();
});

