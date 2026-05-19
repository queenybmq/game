(() => {
  function requiredElement(id) {
    const element = document.getElementById(id);
    if (!element) {
      throw new Error(`Missing required element: ${id}`);
    }
    return element;
  }

  const canvas = requiredElement("gameCanvas");
  const gameShell = requiredElement("gameShell");
  const ctx = canvas.getContext("2d");
  if (!ctx) {
    throw new Error("Canvas 2D context is not available");
  }
  const ui = {
    hudFrame: requiredElement("hudFrame"),
    damageVignette: requiredElement("damageVignette"),
    hud: requiredElement("hud"),
    timeValue: requiredElement("timeValue"),
    killsValue: requiredElement("killsValue"),
    levelValue: requiredElement("levelValue"),
    scoreValue: requiredElement("scoreValue"),
    mapValue: requiredElement("mapValue"),
    hpText: requiredElement("hpText"),
    hpFill: requiredElement("hpFill"),
    shieldText: requiredElement("shieldText"),
    shieldFill: requiredElement("shieldFill"),
    xpText: requiredElement("xpText"),
    xpFill: requiredElement("xpFill"),
    activeSkillName: requiredElement("activeSkillName"),
    activeSkillText: requiredElement("activeSkillText"),
    activeSkillFill: requiredElement("activeSkillFill"),
    menuOverlay: requiredElement("menuOverlay"),
    levelOverlay: requiredElement("levelOverlay"),
    pauseOverlay: requiredElement("pauseOverlay"),
    gameOverOverlay: requiredElement("gameOverOverlay"),
    settingsOverlay: requiredElement("settingsOverlay"),
    upgradeOptions: requiredElement("upgradeOptions"),
    resultTitle: requiredElement("resultTitle"),
    resultStats: requiredElement("resultStats"),
    toast: requiredElement("toast"),
    eventLog: requiredElement("eventLog"),
    startButton: requiredElement("startButton"),
    continueButton: requiredElement("continueButton"),
    settingsButton: requiredElement("settingsButton"),
    resumeButton: requiredElement("resumeButton"),
    pauseSettingsButton: requiredElement("pauseSettingsButton"),
    quitButton: requiredElement("quitButton"),
    restartButton: requiredElement("restartButton"),
    resultMenuButton: requiredElement("resultMenuButton"),
    settingsBackButton: requiredElement("settingsBackButton"),
    volumeControl: requiredElement("volumeControl"),
    qualitySelect: requiredElement("qualitySelect"),
    shakeToggle: requiredElement("shakeToggle"),
    motionToggle: requiredElement("motionToggle"),
    autoPerfToggle: requiredElement("autoPerfToggle"),
    menuBestScore: requiredElement("menuBestScore"),
    menuBestTime: requiredElement("menuBestTime"),
    menuBestKills: requiredElement("menuBestKills")
  };

  const TAU = Math.PI * 2;
  const STORAGE_KEY = "starship-survivor-records";
  const SETTINGS_KEY = "starship-survivor-settings";
  const MAX_PARTICLES = 220;
  const MAX_FLOATING_TEXTS = 58;
  const QUALITY_PRESETS = {
    high: { dpr: 2, particleScale: 1, starDensity: 8500, shadowBlur: 1, scanOverlay: true, backgroundLines: true },
    balanced: { dpr: 1.65, particleScale: 0.72, starDensity: 11000, shadowBlur: 0.78, scanOverlay: true, backgroundLines: true },
    performance: { dpr: 1.25, particleScale: 0.48, starDensity: 15000, shadowBlur: 0.45, scanOverlay: false, backgroundLines: false }
  };
  const DEFAULT_SETTINGS = {
    volume: 55,
    quality: "balanced",
    shake: true,
    motion: true,
    autoPerf: true
  };
  const BALANCE = {
    bossSpawnTime: 240,
    enemyBaseCap: 14,
    enemyCapGrowthSeconds: 10,
    enemyMaxCap: 72,
    overloadBonusCap: 16,
    spawnBaseInterval: 1.15,
    spawnMinimumInterval: 0.28,
    spawnBatchGrowthSeconds: 70,
    spawnMaxBatch: 5,
    enemyHpGrowthSeconds: 260,
    enemyMaxSpeedBonus: 0.38,
    eliteFirstDelay: 34,
    eliteBaseInterval: 50,
    eliteMinimumInterval: 24,
    maxPlayerProjectiles: 118,
    maxEnemyProjectiles: 88,
    spawnPressureSoftCap: 0.78,
    spawnPressureHardCap: 0.92,
    spawnLowPressureBoost: 0.42,
    spawnHighPressureSlow: 1.55,
    spawnHardPressureSlow: 2.25,
    randomEventFirstDelay: 28,
    randomEventMinInterval: 26,
    randomEventMaxInterval: 46,
    mapSegmentDuration: 82
  };
  const WAVES = [
    { from: 0, weights: { hunter: 1 }, message: "追獵機群接近" },
    { from: 35, weights: { hunter: 0.78, tank: 0.22 }, message: "裝甲艦加入戰場" },
    { from: 85, weights: { hunter: 0.56, tank: 0.27, shooter: 0.17 }, message: "散射機開始火力壓制" },
    { from: 145, weights: { hunter: 0.42, tank: 0.22, shooter: 0.24, bomber: 0.12 }, message: "自爆蜂群突破防線" },
    { from: 215, weights: { hunter: 0.34, tank: 0.2, shooter: 0.28, bomber: 0.18 }, message: "虛空訊號急遽增強" },
    { from: 300, weights: { hunter: 0.28, tank: 0.2, shooter: 0.3, bomber: 0.22 }, message: "超載波次持續增強" }
  ];
  const SOUND_COOLDOWNS = {
    hit: 0.06,
    shoot: 0.025,
    boom: 0.08
  };
  const CONTROL = {
    stopRadius: 28,
    slowRadius: 190,
    followExponent: 1.5,
    targetIndicatorRadius: 14
  };
  const clamp = (value, min, max) => Math.max(min, Math.min(max, value));
  const rand = (min, max) => min + Math.random() * (max - min);
  const distance = (a, b) => Math.hypot(a.x - b.x, a.y - b.y);
  const distanceSquared = (a, b) => {
    const dx = a.x - b.x;
    const dy = a.y - b.y;
    return dx * dx + dy * dy;
  };
  const angleTo = (a, b) => Math.atan2(b.y - a.y, b.x - a.x);
  const mediaQuery = window.matchMedia("(prefers-reduced-motion: reduce)");
  const motion = {
    reduced: mediaQuery.matches,
    shakeScale: 0.35,
    shakeMax: 4.5,
    shakeDecay: 26
  };
  if (mediaQuery.addEventListener) {
    mediaQuery.addEventListener("change", event => {
      motion.reduced = event.matches;
    });
  }

  const state = {
    mode: "menu",
    previousMode: "menu",
    width: 0,
    height: 0,
    dpr: 1,
    lastTime: 0,
    elapsed: 0,
    score: 0,
    kills: 0,
    bossSpawned: false,
    bossDefeated: false,
    overload: false,
    spawnTimer: 0,
    eliteTimer: 0,
    randomEventTimer: 0,
    randomEvent: null,
    player: null,
    enemies: [],
    projectiles: [],
    enemyProjectiles: [],
    pickups: [],
    particles: [],
    floatingTexts: [],
    stars: [],
    shake: 0,
    levelPulse: 0,
    hitPulse: 0,
    toastTimer: 0,
    activeToastCooldown: 0,
    currentUpgrades: [],
    currentWaveIndex: 0,
    currentMapIndex: 0,
    mapTimer: 0,
    mapHistory: [],
    audio: null,
    soundTimers: Object.create(null),
    buffs: [],
    settingsReturnMode: "menu",
    runStarted: false,
    runEnded: false,
    cachedTarget: null,
    targetCacheTimer: 0,
    hudTimer: 0,
    backgroundCache: null,
    backgroundMapId: null,
    backgroundWidth: 0,
    backgroundHeight: 0
  };

  const input = {
    mouse: { x: 0, y: 0, active: false, down: false },
    touch: { active: false, startX: 0, startY: 0, x: 0, y: 0 }
  };

  const records = loadRecords();
  const settings = loadSettings();

  const enemyTypes = {
    hunter: { name: "追獵機", color: "#ff3b6b", hp: 18, speed: 90, radius: 14, damage: 10, xp: 5, score: 20 },
    tank: { name: "裝甲艦", color: "#ffd166", hp: 70, speed: 45, radius: 23, damage: 18, xp: 12, score: 60 },
    shooter: { name: "散射機", color: "#9d7bff", hp: 36, speed: 58, radius: 17, damage: 12, xp: 9, score: 45 },
    bomber: { name: "自爆蜂群", color: "#ff8f3d", hp: 24, speed: 118, radius: 16, damage: 26, xp: 8, score: 40 },
    wisp: { name: "星雲幽梭", color: "#48f3ff", hp: 28, speed: 104, radius: 13, damage: 11, xp: 8, score: 38 },
    burrower: { name: "碎岩鑽機", color: "#c98743", hp: 54, speed: 74, radius: 19, damage: 17, xp: 11, score: 52 },
    stormer: { name: "雷暴導體", color: "#d84cff", hp: 42, speed: 68, radius: 18, damage: 14, xp: 10, score: 50 },
    sentinel: { name: "遺跡哨兵", color: "#65ffbd", hp: 64, speed: 52, radius: 21, damage: 16, xp: 13, score: 64 },
    elite: { name: "菁英艦", color: "#38f8ff", hp: 150, speed: 62, radius: 30, damage: 22, xp: 35, score: 180 },
    boss: { name: "虛空母艦", color: "#ff3df2", hp: 1200, speed: 32, radius: 58, damage: 28, xp: 180, score: 1500 }
  };

  const pickupTypes = {
    xp: { color: "#66ffb3", radius: 5 },
    heal: { color: "#ff4b66", radius: 7 },
    shield: { color: "#48f3ff", radius: 7 },
    bomb: { color: "#ffd36a", radius: 8 },
    magnet: { color: "#d84cff", radius: 7 },
    overclock: { color: "#ffffff", radius: 7 }
  };

  const enemyVariants = {
    rich: { color: "#66ffb3", chance: 0.045, hp: 1.12, speed: 0.94, xp: 1.9, score: 1.45 },
    swift: { color: "#ffd36a", chance: 0.055, hp: 0.78, speed: 1.28, xp: 1.2, score: 1.25 }
  };

  const maps = [
    { id: "nebula", name: "星雲殘域", colors: ["#12345f", "#06111f", "#02040a"], accent: "#48f3ff", enemyWeights: { wisp: 0.18 }, starTint: "#c7f7ff" },
    { id: "asteroid", name: "碎岩環帶", colors: ["#3f2915", "#120c08", "#020202"], accent: "#ffd36a", enemyWeights: { burrower: 0.18 }, starTint: "#ffe2a3" },
    { id: "storm", name: "離子風暴", colors: ["#28145c", "#09071c", "#01020b"], accent: "#d84cff", enemyWeights: { stormer: 0.18 }, starTint: "#e2c7ff" },
    { id: "ruins", name: "機械遺跡", colors: ["#183b2f", "#071410", "#010706"], accent: "#65ffbd", enemyWeights: { sentinel: 0.18 }, starTint: "#baffdf" }
  ];

  const randomEvents = [
    {
      id: "xpComet",
      text: "經驗彗星掠過：晶體雨散落",
      variant: "success",
      weight: () => 1.2,
      trigger: () => {
        for (let i = 0; i < 4; i++) dropPickup("xp", rand(80, state.width - 80), rand(90, state.height - 90), 18 + Math.floor(state.elapsed / 45), 2);
      }
    },
    {
      id: "eliteSignal",
      text: "菁英訊號偏移：小隊突入",
      variant: "warning",
      weight: context => context.pressure > 0.82 ? 0.35 : 0.9,
      trigger: () => {
        const count = state.elapsed > 180 ? 2 : 1;
        for (let i = 0; i < count; i++) spawnEnemy(Math.random() < 0.5 ? "shooter" : "tank");
      }
    },
    {
      id: "supplyDrop",
      text: "補給艙解鎖：戰術物資投放",
      variant: "success",
      weight: context => context.hpRatio < 0.55 || context.shieldRatio < 0.35 ? 1.25 : 0.65,
      trigger: () => {
        dropPickup(Math.random() < 0.5 ? "heal" : "shield", rand(90, state.width - 90), rand(90, state.height - 90), 1, 1);
      }
    },
    {
      id: "crystalBloom",
      text: "晶體綻放：多點經驗回收",
      variant: "success",
      weight: () => 0.82,
      trigger: () => {
        for (let i = 0; i < 6; i++) dropPickup("xp", rand(70, state.width - 70), rand(80, state.height - 80), 10 + Math.floor(state.elapsed / 70), 1);
      }
    },
    {
      id: "unstableCore",
      text: "不穩定核心出現：可觸發爆裂",
      variant: "warning",
      weight: context => context.pressure > 0.72 ? 0.95 : 0.55,
      trigger: () => dropPickup("bomb", rand(90, state.width - 90), rand(90, state.height - 90), 2, 1)
    },
    {
      id: "magnetPulse",
      text: "磁場脈衝：回收效率提升",
      variant: "info",
      weight: () => 0.68,
      trigger: () => dropPickup("magnet", rand(90, state.width - 90), rand(90, state.height - 90), 1, 1)
    },
    {
      id: "overclockWindow",
      text: "超頻窗口：武裝核心升溫",
      variant: "success",
      weight: context => context.bossActive ? 0.85 : 0.52,
      trigger: () => dropPickup("overclock", rand(90, state.width - 90), rand(90, state.height - 90), 1, 1)
    },
    {
      id: "voidTurbulence",
      text: "虛空亂流：敵群路徑偏移",
      variant: "info",
      weight: context => context.pressure > 0.7 ? 0.8 : 0.48,
      trigger: () => {
        state.enemies.forEach(enemy => {
          if (enemy.type !== "boss") {
            enemy.x = clamp(enemy.x + rand(-42, 42), 20, state.width - 20);
            enemy.y = clamp(enemy.y + rand(-42, 42), 20, state.height - 20);
          }
        });
        if (state.player) createRing(state.player.x, state.player.y, 130, "#d84cff");
      }
    }
  ];

  const activeSkills = [
    {
      id: "voidLance",
      name: "虛空長矛",
      category: "主動技能",
      cooldown: level => Math.max(5.8, 9.5 - level * 0.8),
      desc: level => `左鍵發射穿透長矛，對路徑敵人造成高額傷害，目前等級 ${level}/4。`
    },
    {
      id: "gravityWell",
      name: "重力井",
      category: "主動技能",
      cooldown: level => Math.max(7.5, 12 - level * 0.9),
      desc: level => `左鍵在鼠標位置生成牽引力場並持續傷害，目前等級 ${level}/4。`
    },
    {
      id: "phaseBlink",
      name: "相位閃爍",
      category: "主動技能",
      cooldown: level => Math.max(4.8, 8.5 - level * 0.7),
      desc: level => `左鍵向鼠標方向短距離閃爍並釋放衝擊波，目前等級 ${level}/4。`
    },
    {
      id: "ionStorm",
      name: "離子風暴",
      category: "主動技能",
      cooldown: level => Math.max(8.5, 13.5 - level),
      desc: level => `左鍵呼叫多道離子雷擊打擊附近敵人，目前等級 ${level}/4。`
    }
  ];

  const skills = [
    { id: "pulse", name: "脈衝炮強化", category: "攻擊", rarity: "common", tags: ["attack", "weapon"], weight: 1.1, max: 6, desc: level => `脈衝炮傷害與射速提升，目前等級 ${level}/6。`, apply: p => { p.pulseLevel++; p.damageMult += 0.12; p.fireRateMult += 0.08; } },
    { id: "split", name: "分裂雷射", category: "攻擊", rarity: "common", tags: ["attack", "weapon"], weight: 1, max: 5, desc: level => `增加散射彈幕與穿透火力，目前等級 ${level}/5。`, apply: p => { p.splitLevel++; p.damageMult += 0.05; } },
    { id: "missile", name: "等離子飛彈", category: "攻擊", rarity: "rare", tags: ["attack", "weapon"], weight: 0.86, max: 5, desc: level => `啟用或強化追蹤飛彈，目前等級 ${level}/5。`, apply: p => { p.missileLevel++; } },
    { id: "nova", name: "星核爆裂", category: "攻擊", rarity: "rare", tags: ["attack", "trigger"], weight: 0.78, max: 4, desc: level => `擊殺時機率引爆星核，目前等級 ${level}/4。`, apply: p => { p.novaLevel++; } },
    { id: "crit", name: "暴擊校準", category: "攻擊", rarity: "common", tags: ["attack"], weight: 0.94, max: 5, desc: level => `提高暴擊率與暴擊傷害，目前等級 ${level}/5。`, apply: p => { p.crit += 0.08; p.critDamage += 0.12; } },
    { id: "shield", name: "護盾擴容", category: "防禦", rarity: "common", tags: ["defense"], weight: 1, max: 5, desc: level => `提升最大護盾與回復速度，目前等級 ${level}/5。`, apply: p => { p.shieldLevel++; p.maxShield += 18; p.shieldRegen += 1.4; p.shield = p.maxShield; } },
    { id: "repair", name: "奈米修復", category: "防禦", rarity: "common", tags: ["defense"], weight: 0.9, max: 4, desc: level => `持續修復艦體，目前等級 ${level}/4。`, apply: p => { p.repairLevel++; p.hp = Math.min(p.maxHp, p.hp + 25); } },
    { id: "phase", name: "相位閃避", category: "防禦", rarity: "rare", tags: ["defense", "mobility"], weight: 0.72, max: 4, desc: level => `提高閃避率並延長受擊保護，目前等級 ${level}/4。`, apply: p => { p.dodge += 0.07; p.invulnBonus += 0.08; } },
    { id: "engine", name: "引擎超頻", category: "機動", rarity: "common", tags: ["mobility"], weight: 0.92, max: 5, desc: level => `提高移動速度與操控感，目前等級 ${level}/5。`, apply: p => { p.speed += 22; } },
    { id: "magnet", name: "磁力回收", category: "機動", rarity: "common", tags: ["pickup"], weight: 0.9, max: 5, desc: level => `擴大經驗晶體吸附範圍，目前等級 ${level}/5。`, apply: p => { p.pickupRange += 38; } },
    { id: "drone", name: "環繞無人機", category: "特殊", rarity: "rare", tags: ["attack", "special"], weight: 0.76, max: 5, desc: level => `增加環繞火力與接觸傷害，目前等級 ${level}/5。`, apply: p => { p.droneLevel++; } },
    { id: "emp", name: "電磁脈衝", category: "特殊", rarity: "rare", tags: ["attack", "special"], weight: 0.72, max: 5, desc: level => `週期性釋放範圍傷害，目前等級 ${level}/5。`, apply: p => { p.empLevel++; p.empCooldown = Math.max(2.2, p.empCooldown - 0.18); } },
    { id: "siphonShield", name: "虹吸護盾", category: "Build", rarity: "rare", tags: ["defense", "trigger"], weight: 0.7, max: 4, desc: level => `擊殺回復少量護盾，目前等級 ${level}/4。`, apply: p => { p.siphonLevel++; } },
    { id: "pickupBurst", name: "拾取爆裂", category: "Build", rarity: "rare", tags: ["pickup", "attack"], weight: 0.68, max: 4, desc: level => `連續拾取後觸發小範圍爆裂，目前等級 ${level}/4。`, apply: p => { p.pickupBurstLevel++; } },
    { id: "closeCombat", name: "近距離殲滅", category: "Build", rarity: "common", tags: ["attack"], weight: 0.82, max: 4, desc: level => `對近距離敵人造成額外傷害，目前等級 ${level}/4。`, apply: p => { p.closeCombatLevel++; } },
    { id: "lowHpOverdrive", name: "臨界火力", category: "Build", rarity: "epic", tags: ["attack", "defense"], weight: 0.46, max: 3, desc: level => `低血量時提高傷害與射速，目前等級 ${level}/3。`, apply: p => { p.lowHpOverdriveLevel++; } },
    { id: "activeBattery", name: "主動電池", category: "Build", rarity: "rare", tags: ["active", "trigger"], weight: 0.72, max: 4, desc: level => `擊殺有機率縮短主動技能冷卻，目前等級 ${level}/4。`, apply: p => { p.activeBatteryLevel++; } },
    { id: "volatileRounds", name: "不穩定彈藥", category: "Build", rarity: "epic", tags: ["attack", "trigger"], weight: 0.42, max: 3, desc: level => `子彈命中有機率造成小爆裂，目前等級 ${level}/3。`, apply: p => { p.volatileRoundsLevel++; } },
    { id: "railWeapon", name: "軌道長釘炮", category: "主武器", rarity: "rare", tags: ["attack", "weapon"], weight: 0.72, max: 4, desc: level => `並行發射高速穿透長釘，目前等級 ${level}/4。`, apply: p => { p.primaryWeapons.rail++; } },
    { id: "arcWeapon", name: "鏈式電弧", category: "主武器", rarity: "rare", tags: ["attack", "weapon"], weight: 0.68, max: 4, desc: level => `並行釋放跳躍電弧，目前等級 ${level}/4。`, apply: p => { p.primaryWeapons.arc++; } },
    { id: "flakWeapon", name: "綠焰霰彈", category: "主武器", rarity: "common", tags: ["attack", "weapon"], weight: 0.78, max: 4, desc: level => `並行發射近距離霰彈，目前等級 ${level}/4。`, apply: p => { p.primaryWeapons.flak++; } }
  ];

  function normalizeRecords(value) {
    return {
      score: Number.isFinite(value?.score) ? value.score : 0,
      time: Number.isFinite(value?.time) ? value.time : 0,
      kills: Number.isFinite(value?.kills) ? value.kills : 0,
      level: Number.isFinite(value?.level) ? value.level : 1
    };
  }

  function loadRecords() {
    try {
      return normalizeRecords(JSON.parse(localStorage.getItem(STORAGE_KEY)));
    } catch {
      return normalizeRecords();
    }
  }

  function normalizeSettings(value) {
    return {
      volume: clamp(Number.isFinite(value?.volume) ? value.volume : DEFAULT_SETTINGS.volume, 0, 100),
      quality: QUALITY_PRESETS[value?.quality] ? value.quality : DEFAULT_SETTINGS.quality,
      shake: typeof value?.shake === "boolean" ? value.shake : DEFAULT_SETTINGS.shake,
      motion: typeof value?.motion === "boolean" ? value.motion : DEFAULT_SETTINGS.motion,
      autoPerf: typeof value?.autoPerf === "boolean" ? value.autoPerf : DEFAULT_SETTINGS.autoPerf
    };
  }

  function loadSettings() {
    try {
      return normalizeSettings(JSON.parse(localStorage.getItem(SETTINGS_KEY)));
    } catch {
      return normalizeSettings();
    }
  }

  function saveSettings() {
    try {
      localStorage.setItem(SETTINGS_KEY, JSON.stringify(settings));
    } catch {
      showToast("設定儲存失敗，本次仍會套用", 1.8, "warning");
    }
  }

  function getQualityPreset() {
    return QUALITY_PRESETS[settings.quality] || QUALITY_PRESETS.balanced;
  }

  function syncSettingsUi() {
    ui.volumeControl.value = Math.round(settings.volume).toString();
    ui.qualitySelect.value = settings.quality;
    ui.shakeToggle.checked = settings.shake;
    ui.motionToggle.checked = settings.motion;
    ui.autoPerfToggle.checked = settings.autoPerf;
  }

  function applySettings({ resizeCanvas = false } = {}) {
    const reducedBySystem = mediaQuery.matches;
    const pressureReduced = settings.autoPerf && (state.enemies.length > BALANCE.enemyMaxCap * 0.72 || state.projectiles.length + state.enemyProjectiles.length > BALANCE.maxPlayerProjectiles + BALANCE.maxEnemyProjectiles * 0.65);
    motion.reduced = reducedBySystem || !settings.motion || settings.quality === "performance" || pressureReduced;
    motion.shakeScale = settings.shake ? 0.35 : 0;
    motion.shakeMax = settings.shake ? 4.5 : 0;
    gameShell.classList.toggle("motion-muted", motion.reduced);
    if (resizeCanvas) resize();
  }

  function updateMenuState() {
    ui.menuBestScore.textContent = Math.floor(records.score).toString();
    ui.menuBestTime.textContent = formatTime(records.time);
    ui.menuBestKills.textContent = Math.floor(records.kills).toString();
    ui.continueButton.disabled = !canContinueGame();
  }

  function canContinueGame() {
    return Boolean(state.runStarted && !state.runEnded && state.player);
  }

  function saveRecords() {
    try {
      const p = state.player;
      records.score = Math.max(records.score, state.score);
      records.time = Math.max(records.time, state.elapsed);
      records.kills = Math.max(records.kills, state.kills);
      records.level = Math.max(records.level, p ? p.level : 1);
      localStorage.setItem(STORAGE_KEY, JSON.stringify(records));
    } catch {
      showToast("紀錄儲存失敗，但本局可繼續遊玩");
    }
  }

  function resize() {
    state.dpr = Math.min(window.devicePixelRatio || 1, getQualityPreset().dpr);
    state.width = window.innerWidth;
    state.height = window.innerHeight;
    canvas.width = Math.floor(state.width * state.dpr);
    canvas.height = Math.floor(state.height * state.dpr);
    canvas.style.width = `${state.width}px`;
    canvas.style.height = `${state.height}px`;
    ctx.setTransform(state.dpr, 0, 0, state.dpr, 0, 0);
    invalidateBackgroundCache();
    if (!state.player) return;
    state.player.x = clamp(state.player.x, 40, state.width - 40);
    state.player.y = clamp(state.player.y, 40, state.height - 40);
    createStars();
  }

  function createStars() {
    const count = Math.floor((state.width * state.height) / getQualityPreset().starDensity);
    state.stars = Array.from({ length: count }, () => ({
      x: Math.random() * state.width,
      y: Math.random() * state.height,
      size: rand(0.6, 2.2),
      speed: rand(4, 22),
      alpha: rand(0.25, 0.9)
    }));
  }

  function createPlayer() {
    return {
      x: state.width / 2,
      y: state.height / 2,
      vx: 0,
      vy: 0,
      radius: 17,
      angle: -Math.PI / 2,
      hp: 120,
      maxHp: 120,
      shield: 70,
      maxShield: 70,
      shieldRegen: 5,
      speed: 230,
      damageMult: 1,
      fireRateMult: 1,
      crit: 0.06,
      critDamage: 1.8,
      dodge: 0,
      pickupRange: 115,
      level: 1,
      xp: 0,
      xpToNext: 24,
      invuln: 0,
      invulnBonus: 0,
      fireTimer: 0,
      missileTimer: 0,
      activeSkillId: null,
      activeSkillLevel: 0,
      activeCooldown: 0,
      activeCooldownMax: 0,
      activeCharges: 0,
      activeMaxCharges: 1,
      activeSkillChoicesSeen: false,
      primaryWeapons: { pulse: 1, rail: 0, arc: 0, flak: 0 },
      railTimer: 0,
      arcTimer: 0,
      flakTimer: 0,
      lastTargetX: state.width / 2,
      lastTargetY: state.height / 2,
      pulseLevel: 1,
      splitLevel: 0,
      missileLevel: 0,
      novaLevel: 0,
      shieldLevel: 0,
      repairLevel: 0,
      droneLevel: 0,
      empLevel: 0,
      empTimer: 0,
      empCooldown: 5.5,
      siphonLevel: 0,
      pickupBurstLevel: 0,
      pickupBurstCounter: 0,
      closeCombatLevel: 0,
      lowHpOverdriveLevel: 0,
      activeBatteryLevel: 0,
      volatileRoundsLevel: 0
    };
  }

  function resetInput() {
    input.mouse.active = false;
    input.mouse.down = false;
    input.touch.active = false;
  }

  function resetGame() {
    resetInput();
    state.elapsed = 0;
    state.score = 0;
    state.kills = 0;
    state.bossSpawned = false;
    state.bossDefeated = false;
    state.overload = false;
    state.spawnTimer = 0;
    state.eliteTimer = BALANCE.eliteFirstDelay;
    state.randomEventTimer = BALANCE.randomEventFirstDelay;
    state.randomEvent = null;
    ui.eventLog.replaceChildren();
    state.player = createPlayer();
    state.enemies = [];
    state.projectiles = [];
    state.enemyProjectiles = [];
    state.pickups = [];
    state.particles = [];
    state.floatingTexts = [];
    state.shake = 0;
    state.levelPulse = 0;
    state.hitPulse = 0;
    state.activeToastCooldown = 0;
    state.currentUpgrades = [];
    state.currentWaveIndex = 0;
    state.currentMapIndex = Math.floor(Math.random() * maps.length);
    state.mapTimer = BALANCE.mapSegmentDuration;
    state.mapHistory = [state.currentMapIndex];
    state.buffs = [];
    state.cachedTarget = null;
    state.targetCacheTimer = 0;
    state.hudTimer = 0;
    state.runStarted = true;
    state.runEnded = false;
    invalidateBackgroundCache();
  }

  function startGame() {
    initAudio();
    resetGame();
    setMode("playing");
    updateMenuState();
    showToast("星艦啟動：突破封鎖線", 2.1, "success");
  }

  function continueGame() {
    if (!canContinueGame()) return;
    initAudio();
    setMode("playing");
    updateHud();
    showToast("繼續作戰：戰術系統恢復", 1.6, "success");
  }

  function returnToMenu() {
    resetInput();
    setMode("menu");
    updateMenuState();
  }

  function openSettings(returnMode = state.mode) {
    state.settingsReturnMode = returnMode === "settings" ? "menu" : returnMode;
    syncSettingsUi();
    setMode("settings");
  }

  function closeSettings() {
    setMode(state.settingsReturnMode || "menu");
    updateMenuState();
  }

  function setMode(mode) {
    state.previousMode = state.mode;
    state.mode = mode;
    gameShell.classList.remove("mode-menu", "mode-playing", "mode-level-up", "mode-paused", "mode-game-over", "mode-settings");
    gameShell.classList.add(`mode-${mode.replace(/[A-Z]/g, match => `-${match.toLowerCase()}`)}`);
    ui.menuOverlay.classList.toggle("hidden", mode !== "menu");
    ui.menuOverlay.classList.toggle("overlay-open", mode === "menu");
    ui.hud.classList.toggle("hidden", mode === "menu");
    ui.levelOverlay.classList.toggle("hidden", mode !== "levelUp");
    ui.pauseOverlay.classList.toggle("hidden", mode !== "paused");
    ui.gameOverOverlay.classList.toggle("hidden", mode !== "gameOver");
    ui.settingsOverlay.classList.toggle("hidden", mode !== "settings");
    ui.settingsOverlay.classList.toggle("overlay-open", mode === "settings");
    updateMenuState();
  }

  function initAudio() {
    if (state.audio) return;
    const AudioContext = window.AudioContext || window.webkitAudioContext;
    if (!AudioContext) return;
    state.audio = new AudioContext();
  }

  function playSound(type) {
    const audio = state.audio;
    if (!audio) return;
    const now = audio.currentTime;
    const cooldown = SOUND_COOLDOWNS[type] || 0;
    if (cooldown > 0 && state.soundTimers[type] && now < state.soundTimers[type]) return;
    if (cooldown > 0) state.soundTimers[type] = now + cooldown;
    const oscillator = audio.createOscillator();
    const gain = audio.createGain();
    const masterVolume = settings.volume / 100;
    const soundSpec = {
      shoot: [620, 0.035, 0.035, "square"],
      hit: [180, 0.05, 0.04, "sawtooth"],
      boom: [90, 0.14, 0.08, "triangle"],
      level: [740, 0.18, 0.08, "sine"],
      hurt: [120, 0.12, 0.09, "sawtooth"],
      boss: [55, 0.36, 0.12, "triangle"]
    }[type] || [300, 0.05, 0.04, "sine"];
    oscillator.type = soundSpec[3];
    oscillator.frequency.setValueAtTime(soundSpec[0], now);
    oscillator.frequency.exponentialRampToValueAtTime(Math.max(30, soundSpec[0] * 0.45), now + soundSpec[1]);
    gain.gain.setValueAtTime(soundSpec[2] * masterVolume, now);
    gain.gain.exponentialRampToValueAtTime(0.0001, now + soundSpec[1]);
    oscillator.connect(gain).connect(audio.destination);
    oscillator.start(now);
    oscillator.stop(now + soundSpec[1]);
  }

  function showToast(text, duration = 2.1, variant = "info") {
    if (state.mode === "playing") {
      addEventMessage(text, variant);
      return;
    }
    ui.toast.textContent = text;
    ui.toast.dataset.variant = variant;
    ui.toast.classList.remove("hidden");
    state.toastTimer = duration;
  }

  function addEventMessage(text, variant = "info") {
    const item = document.createElement("div");
    item.className = "event-log-item";
    item.dataset.variant = variant;
    item.textContent = text;
    ui.eventLog.prepend(item);
    while (ui.eventLog.children.length > 4) ui.eventLog.lastElementChild.remove();
    window.setTimeout(() => item.remove(), 3600);
  }

  function formatTime(seconds) {
    const m = Math.floor(seconds / 60).toString().padStart(2, "0");
    const s = Math.floor(seconds % 60).toString().padStart(2, "0");
    return `${m}:${s}`;
  }

  function updateHud() {
    const p = state.player;
    if (!p) return;
    ui.timeValue.textContent = formatTime(state.elapsed);
    ui.killsValue.textContent = state.kills.toString();
    ui.levelValue.textContent = p.level.toString();
    ui.scoreValue.textContent = Math.floor(state.score).toString();
    ui.mapValue.textContent = getCurrentMap().name;
    ui.hpText.textContent = `${Math.ceil(p.hp)} / ${p.maxHp}`;
    ui.shieldText.textContent = `${Math.ceil(p.shield)} / ${p.maxShield}`;
    ui.xpText.textContent = `${Math.floor(p.xp)} / ${p.xpToNext}`;
    ui.hpFill.style.width = `${clamp((p.hp / p.maxHp) * 100, 0, 100)}%`;
    ui.shieldFill.style.width = `${clamp((p.shield / p.maxShield) * 100, 0, 100)}%`;
    ui.xpFill.style.width = `${clamp((p.xp / p.xpToNext) * 100, 0, 100)}%`;
    updateActiveSkillHud(p);
    updateUiState();
  }

  function updateActiveSkillHud(p) {
    const skill = getActiveSkill(p.activeSkillId);
    if (!skill) {
      ui.activeSkillName.textContent = "主動技能未同步";
      ui.activeSkillText.textContent = "升級獲取";
      ui.activeSkillFill.style.width = "0%";
      return;
    }
    ui.activeSkillName.textContent = `${skill.name} Lv.${p.activeSkillLevel}`;
    if (p.activeCharges > 0) {
      ui.activeSkillText.textContent = "左鍵就緒";
      ui.activeSkillFill.style.width = "100%";
      return;
    }
    const progress = p.activeCooldownMax > 0 ? 1 - p.activeCooldown / p.activeCooldownMax : 0;
    ui.activeSkillText.textContent = `${Math.ceil(p.activeCooldown)}s`;
    ui.activeSkillFill.style.width = `${clamp(progress * 100, 0, 100)}%`;
  }

  function updateUiState() {
    const p = state.player;
    const bossActive = state.enemies.some(enemy => enemy.type === "boss");
    gameShell.classList.toggle("is-critical", Boolean(p && p.hp / p.maxHp < 0.3));
    gameShell.classList.toggle("is-boss-alert", bossActive);
    gameShell.classList.toggle("is-shield-down", Boolean(p && p.shield <= 0));
    gameShell.classList.toggle("is-active-ready", Boolean(p && p.activeSkillId && p.activeCharges > 0));
    gameShell.classList.toggle("is-active-cooling", Boolean(p && p.activeSkillId && p.activeCharges <= 0));
  }

  function getMoveVector() {
    const p = state.player;
    if (!p) return { x: 0, y: 0 };
    const target = input.mouse.active ? input.mouse : input.touch.active ? input.touch : { x: p.lastTargetX, y: p.lastTargetY };
    const dx = target.x - p.x;
    const dy = target.y - p.y;
    const dist = Math.hypot(dx, dy);
    if (dist <= CONTROL.stopRadius) return { x: 0, y: 0 };
    p.lastTargetX = target.x;
    p.lastTargetY = target.y;
    const normalized = clamp((dist - CONTROL.stopRadius) / (CONTROL.slowRadius - CONTROL.stopRadius), 0, 1);
    const eased = Math.pow(normalized, CONTROL.followExponent);
    return { x: (dx / dist) * eased, y: (dy / dist) * eased };
  }

  function update(dt) {
    if (!state.player) return;
    state.elapsed += dt;
    state.spawnTimer -= dt;
    state.eliteTimer -= dt;
    state.randomEventTimer -= dt;
    state.mapTimer -= dt;
    state.shake = Math.max(0, state.shake - dt * motion.shakeDecay);
    state.levelPulse = Math.max(0, state.levelPulse - dt * 1.8);
    state.hitPulse = Math.max(0, state.hitPulse - dt * 2.8);
    state.activeToastCooldown = Math.max(0, state.activeToastCooldown - dt);
    if (settings.autoPerf) applySettings();
    updatePlayer(dt);
    updateTargetCache(dt);
    updateWeapons(dt);
    updateEnemies(dt);
    updateProjectiles(dt);
    updatePickups(dt);
    updateBuffs(dt);
    updateParticles(dt);
    updateWaveDirector();
    updateMapDirector();
    updateRandomEvent();
    updateSpawning(dt);
    updateProgression(dt);
    state.hudTimer -= dt;
    if (state.hudTimer <= 0) {
      updateHud();
      state.hudTimer = 0.1;
    }
  }

  function updatePlayer(dt) {
    const p = state.player;
    const move = getMoveVector();
    p.vx = move.x * p.speed;
    p.vy = move.y * p.speed;
    p.x = clamp(p.x + p.vx * dt, 26, state.width - 26);
    p.y = clamp(p.y + p.vy * dt, 26, state.height - 26);
    const target = nearestEnemy(p) || input.mouse || { x: p.x + 1, y: p.y };
    p.angle = angleTo(p, target);
    p.invuln = Math.max(0, p.invuln - dt);
    p.fireTimer -= dt;
    p.missileTimer -= dt;
    p.empTimer -= dt;
    p.railTimer -= dt;
    p.arcTimer -= dt;
    p.flakTimer -= dt;
    if (p.activeCooldown > 0) p.activeCooldown = Math.max(0, p.activeCooldown - dt);
    if (p.activeSkillId && p.activeCharges < p.activeMaxCharges && p.activeCooldown <= 0) {
      p.activeCharges = p.activeMaxCharges;
    }
    p.shield = Math.min(p.maxShield, p.shield + p.shieldRegen * dt);
    if (p.repairLevel > 0) p.hp = Math.min(p.maxHp, p.hp + p.repairLevel * 1.1 * dt);
    if (p.empLevel > 0 && p.empTimer <= 0) triggerEmp();
  }

  function updateTargetCache(dt) {
    state.targetCacheTimer -= dt;
    if (state.targetCacheTimer > 0 && state.cachedTarget && state.cachedTarget.hp > 0) return;
    state.cachedTarget = nearestEnemy(state.player);
    state.targetCacheTimer = 0.08;
  }

  function getAimTarget() {
    return state.cachedTarget || input.mouse;
  }

  function updateWeapons(dt) {
    const p = state.player;
    const target = getAimTarget();
    if (target && p.fireTimer <= 0) {
      firePulse(target);
      const fireRateBonus = getBuffValue("fireRateBonus") + (p.lowHpOverdriveLevel > 0 && p.hp / p.maxHp < 0.36 ? p.lowHpOverdriveLevel * 0.08 : 0);
      p.fireTimer = Math.max(0.07, 0.26 / (p.fireRateMult + fireRateBonus) - p.pulseLevel * 0.012);
    }
    if (target && p.primaryWeapons.rail > 0 && p.railTimer <= 0) {
      fireRail(target);
      p.railTimer = Math.max(0.42, 1.28 - p.primaryWeapons.rail * 0.12);
    }
    if (target && p.primaryWeapons.arc > 0 && p.arcTimer <= 0) {
      fireArc(target);
      p.arcTimer = Math.max(0.28, 0.86 - p.primaryWeapons.arc * 0.08);
    }
    if (target && p.primaryWeapons.flak > 0 && p.flakTimer <= 0) {
      fireFlak(target);
      p.flakTimer = Math.max(0.55, 1.08 - p.primaryWeapons.flak * 0.09);
    }
    if (p.missileLevel > 0 && p.missileTimer <= 0) {
      fireMissile();
      p.missileTimer = Math.max(0.75, 2.2 - p.missileLevel * 0.22);
    }
    if (p.droneLevel > 0) damageWithDrones(dt);
  }

  function firePulse(target) {
    const p = state.player;
    const baseAngle = angleTo(p, target);
    const count = 1 + Math.min(4, p.splitLevel);
    const spread = p.splitLevel > 0 ? 0.16 + p.splitLevel * 0.035 : 0;
    for (let i = 0; i < count; i++) {
      const offset = count === 1 ? 0 : (i - (count - 1) / 2) * spread;
      spawnProjectile({
        x: p.x + Math.cos(baseAngle + offset) * 20,
        y: p.y + Math.sin(baseAngle + offset) * 20,
        vx: Math.cos(baseAngle + offset) * 620,
        vy: Math.sin(baseAngle + offset) * 620,
        radius: 4.2,
        damage: calculateDamage(12 + p.pulseLevel * 3),
        life: 1.35,
        pierce: Math.floor(p.splitLevel / 2),
        color: "#38f8ff",
        type: "pulse"
      });
    }
    playSound("shoot");
  }

  function fireRail(target) {
    const p = state.player;
    const a = angleTo(p, target);
    spawnProjectile({
      x: p.x + Math.cos(a) * 24,
      y: p.y + Math.sin(a) * 24,
      vx: Math.cos(a) * 900,
      vy: Math.sin(a) * 900,
      radius: 3.2 + p.primaryWeapons.rail * 0.35,
      damage: calculateDamage(24 + p.primaryWeapons.rail * 9),
      life: 0.82,
      pierce: 1 + Math.floor(p.primaryWeapons.rail / 2),
      color: "#ffd36a",
      type: "rail"
    });
  }

  function fireArc(target) {
    const p = state.player;
    const first = state.cachedTarget || target;
    if (!first) return;
    const damage = calculateDamage(10 + p.primaryWeapons.arc * 4);
    let current = first;
    const chained = new Set();
    const jumps = 1 + p.primaryWeapons.arc;
    for (let i = 0; i < jumps && current; i++) {
      chained.add(current);
      damageEnemy(current, damage.amount * (1 - i * 0.12), damage.crit);
      if (!motion.reduced) createRing(current.x, current.y, 18 + i * 3, "#d84cff");
      const maxChainDistance = 145 * 145;
      current = state.enemies.find(enemy => !chained.has(enemy) && distanceSquared(enemy, current) < maxChainDistance);
    }
  }

  function fireFlak(target) {
    const p = state.player;
    const base = angleTo(p, target);
    const count = 3 + Math.min(3, p.primaryWeapons.flak);
    for (let i = 0; i < count; i++) {
      const offset = (i - (count - 1) / 2) * 0.18;
      spawnProjectile({
        x: p.x + Math.cos(base + offset) * 18,
        y: p.y + Math.sin(base + offset) * 18,
        vx: Math.cos(base + offset) * 520,
        vy: Math.sin(base + offset) * 520,
        radius: 3.8,
        damage: calculateDamage(7 + p.primaryWeapons.flak * 3),
        life: 0.75,
        pierce: 0,
        color: "#65ffbd",
        type: "flak"
      });
    }
  }

  function fireMissile() {
    const p = state.player;
    const target = state.cachedTarget;
    const angle = target ? angleTo(p, target) : p.angle;
    spawnProjectile({
      x: p.x,
      y: p.y,
      vx: Math.cos(angle) * 250,
      vy: Math.sin(angle) * 250,
      radius: 7,
      damage: calculateDamage(34 + p.missileLevel * 12),
      life: 3.5,
      pierce: 0,
      color: "#ff3df2",
      type: "missile",
      turn: 4.6 + p.missileLevel * 0.6
    });
  }

  function calculateDamage(base) {
    const p = state.player;
    const lowHpBonus = p.lowHpOverdriveLevel > 0 && p.hp / p.maxHp < 0.36 ? p.lowHpOverdriveLevel * 0.12 : 0;
    const crit = Math.random() < p.crit;
    return { amount: base * (p.damageMult + getBuffValue("damageBonus") + lowHpBonus) * (crit ? p.critDamage : 1), crit };
  }

  function spawnProjectile(projectile) {
    state.projectiles.push(projectile);
    if (state.projectiles.length > BALANCE.maxPlayerProjectiles) state.projectiles.shift();
  }

  function triggerEmp() {
    const p = state.player;
    const radius = 120 + p.empLevel * 34;
    const damage = calculateDamage(24 + p.empLevel * 12);
    state.enemies.forEach(enemy => {
      if (distance(p, enemy) < radius + enemy.radius) damageEnemy(enemy, damage.amount, damage.crit);
    });
    createRing(p.x, p.y, radius, "#38f8ff");
    p.empTimer = p.empCooldown;
    playSound("boom");
  }

  function damageWithDrones(dt) {
    const p = state.player;
    const drones = Math.min(6, p.droneLevel + 1);
    const orbit = 52 + p.droneLevel * 8;
    for (let i = 0; i < drones; i++) {
      const a = state.elapsed * (2.2 + p.droneLevel * 0.15) + i * TAU / drones;
      const drone = { x: p.x + Math.cos(a) * orbit, y: p.y + Math.sin(a) * orbit };
      state.enemies.forEach(enemy => {
        if (distance(drone, enemy) < enemy.radius + 10) damageEnemy(enemy, (10 + p.droneLevel * 4) * dt, false);
      });
    }
  }

  function updateEnemies(dt) {
    const p = state.player;
    state.enemies.forEach(enemy => {
      enemy.flash = Math.max(0, enemy.flash - dt);
      enemy.shootTimer -= dt;
      const dx = p.x - enemy.x;
      const dy = p.y - enemy.y;
      const dist = Math.hypot(dx, dy) || 1;
      const difficulty = 1 + state.elapsed / 240 + (state.overload ? 0.8 : 0);
      if (enemy.type === "shooter" && dist < 360) {
        enemy.x -= (dx / dist) * enemy.speed * 0.3 * dt;
        enemy.y -= (dy / dist) * enemy.speed * 0.3 * dt;
      } else if (enemy.type === "wisp") {
        const side = Math.sin(state.elapsed * 4 + enemy.x * 0.01) * enemy.speed * 0.55;
        enemy.x += (dx / dist) * enemy.speed * dt + (-dy / dist) * side * dt;
        enemy.y += (dy / dist) * enemy.speed * dt + (dx / dist) * side * dt;
      } else if (enemy.type === "burrower") {
        const dash = Math.sin(state.elapsed * 2.2 + enemy.y * 0.02) > 0.72 ? 1.9 : 0.7;
        enemy.x += (dx / dist) * enemy.speed * dash * dt;
        enemy.y += (dy / dist) * enemy.speed * dash * dt;
      } else if (enemy.type === "sentinel" && dist < 280) {
        enemy.x -= (dx / dist) * enemy.speed * 0.18 * dt;
        enemy.y -= (dy / dist) * enemy.speed * 0.18 * dt;
      } else {
        enemy.x += (dx / dist) * enemy.speed * dt;
        enemy.y += (dy / dist) * enemy.speed * dt;
      }
      separateEnemy(enemy, dt);
      if ((enemy.type === "shooter" || enemy.type === "elite" || enemy.type === "boss" || enemy.type === "stormer" || enemy.type === "sentinel") && enemy.shootTimer <= 0) {
        fireEnemyProjectile(enemy);
        enemy.shootTimer = enemy.type === "boss" ? Math.max(0.55, 1.2 - (1 - enemy.hp / enemy.maxHp) * 0.55) : rand(1.3, 2.8) / difficulty;
      }
      if (enemy.type === "boss" && enemy.summonTimer !== undefined) {
        enemy.summonTimer -= dt;
        if (enemy.summonTimer <= 0) {
          for (let i = 0; i < 4; i++) spawnEnemy(Math.random() < 0.5 ? "hunter" : "bomber", enemy.x + rand(-80, 80), enemy.y + rand(-80, 80));
          enemy.summonTimer = 8;
        }
      }
      if (enemy.type === "bomber" && dist < 28 + enemy.radius) {
        createExplosion(enemy.x, enemy.y, 85, 34);
        enemy.hp = 0;
      }
      if (dist < enemy.radius + p.radius) {
        damagePlayer(enemy.damage * dt * 2.6, { invulnerability: 0.08, minimumDamage: enemy.damage * 0.18 });
      }
    });
    state.enemies = state.enemies.filter(enemy => {
      if (enemy.hp > 0) return true;
      killEnemy(enemy);
      return false;
    });
  }

  function separateEnemy(enemy, dt) {
    let pushX = 0;
    let pushY = 0;
    let checks = 0;
    for (const other of state.enemies) {
      if (other === enemy || checks > 10) continue;
      const minDistance = enemy.radius + other.radius;
      const dx = enemy.x - other.x;
      const dy = enemy.y - other.y;
      const dist = Math.hypot(dx, dy) || 1;
      if (dist >= minDistance || dist <= 0) continue;
      const force = (minDistance - dist) / minDistance;
      pushX += (dx / dist) * force;
      pushY += (dy / dist) * force;
      checks++;
    }
    enemy.x += pushX * 90 * dt;
    enemy.y += pushY * 90 * dt;
  }

  function updateProjectiles(dt) {
    state.projectiles.forEach(projectile => {
      projectile.life -= dt;
      if (projectile.type === "missile") {
        const target = state.cachedTarget || nearestEnemy(projectile);
        if (target) {
          const desired = angleTo(projectile, target);
          const current = Math.atan2(projectile.vy, projectile.vx);
          const diff = Math.atan2(Math.sin(desired - current), Math.cos(desired - current));
          const next = current + clamp(diff, -projectile.turn * dt, projectile.turn * dt);
          const speed = Math.hypot(projectile.vx, projectile.vy);
          projectile.vx = Math.cos(next) * speed;
          projectile.vy = Math.sin(next) * speed;
        }
      }
      projectile.x += projectile.vx * dt;
      projectile.y += projectile.vy * dt;
      for (const enemy of state.enemies) {
        if (projectile.life <= 0) break;
        if (distanceSquared(projectile, enemy) < (projectile.radius + enemy.radius) * (projectile.radius + enemy.radius)) {
          damageEnemy(enemy, projectile.damage.amount, projectile.damage.crit);
          if (state.player.volatileRoundsLevel > 0 && Math.random() < 0.035 + state.player.volatileRoundsLevel * 0.025 && !motion.reduced && state.particles.length < MAX_PARTICLES * 0.75) {
            createExplosion(enemy.x, enemy.y, 38 + state.player.volatileRoundsLevel * 8, 10 + state.player.volatileRoundsLevel * 5);
          }
          projectile.pierce--;
          if (projectile.type === "missile") {
            createExplosion(projectile.x, projectile.y, 58 + state.player.missileLevel * 8, projectile.damage.amount * 0.45);
            projectile.life = 0;
            break;
          }
          if (projectile.pierce < 0) projectile.life = 0;
        }
      }
    });
    state.enemyProjectiles.forEach(projectile => {
      projectile.life -= dt;
      projectile.x += projectile.vx * dt;
      projectile.y += projectile.vy * dt;
      if (distanceSquared(projectile, state.player) < (projectile.radius + state.player.radius) * (projectile.radius + state.player.radius)) {
        damagePlayer(projectile.damage, { invulnerability: 0.32 });
        projectile.life = 0;
      }
    });
    state.projectiles = state.projectiles.filter(p => p.life > 0 && p.x > -80 && p.y > -80 && p.x < state.width + 80 && p.y < state.height + 80);
    state.enemyProjectiles = state.enemyProjectiles.filter(p => p.life > 0 && p.x > -80 && p.y > -80 && p.x < state.width + 80 && p.y < state.height + 80);
  }

  function fireEnemyProjectile(enemy) {
    const p = state.player;
    const count = enemy.type === "boss" ? 9 : enemy.type === "elite" ? 3 : enemy.type === "sentinel" ? 2 : 1;
    const base = angleTo(enemy, p);
    for (let i = 0; i < count; i++) {
      const spread = count === 1 ? 0 : (i - (count - 1) / 2) * 0.18;
      const a = base + spread;
      state.enemyProjectiles.push({
        x: enemy.x,
        y: enemy.y,
        vx: Math.cos(a) * (enemy.type === "boss" ? 230 : enemy.type === "stormer" ? 260 : 190),
        vy: Math.sin(a) * (enemy.type === "boss" ? 230 : enemy.type === "stormer" ? 260 : 190),
        radius: enemy.type === "boss" ? 7 : enemy.type === "stormer" ? 4 : 5,
        damage: enemy.type === "boss" ? 14 : enemy.type === "stormer" ? 8 : 10,
        life: 4,
        color: enemy.color
      });
      if (state.enemyProjectiles.length > BALANCE.maxEnemyProjectiles) state.enemyProjectiles.shift();
    }
  }

  function updatePickups(dt) {
    const p = state.player;
    const pickupRange = p.pickupRange + getBuffValue("pickupBonus");
    state.pickups.forEach(pickup => {
      const dist = distance(pickup, p);
      if (dist < pickupRange) {
        const a = angleTo(pickup, p);
        const speed = 140 + (1 - dist / pickupRange) * 520;
        pickup.vx += Math.cos(a) * speed * dt;
        pickup.vy += Math.sin(a) * speed * dt;
      }
      pickup.x += pickup.vx * dt;
      pickup.y += pickup.vy * dt;
      pickup.vx *= 0.96;
      pickup.vy *= 0.96;
      pickup.life -= dt;
      if (dist < p.radius + pickup.radius) {
        collectPickup(pickup);
        pickup.life = 0;
      }
    });
    state.pickups = state.pickups.filter(p => p.life > 0);
  }

  function addBuff(id, duration, data = {}) {
    const existing = state.buffs.find(buff => buff.id === id);
    if (existing) {
      existing.duration = Math.max(existing.duration, duration);
      existing.data = { ...existing.data, ...data };
    } else {
      state.buffs.push({ id, duration, data });
    }
    addEventMessage(getBuffLabel(id), "success");
  }

  function getBuffLabel(id) {
    const labels = {
      magnetRush: "磁力奔流啟動",
      overclock: "武裝超頻啟動",
      dangerReward: "高危收益啟動"
    };
    return labels[id] || "臨時增益啟動";
  }

  function updateBuffs(dt) {
    state.buffs.forEach(buff => { buff.duration -= dt; });
    state.buffs = state.buffs.filter(buff => buff.duration > 0);
  }

  function getBuffValue(key) {
    return state.buffs.reduce((sum, buff) => sum + (buff.data[key] || 0), 0);
  }

  function updateParticles(dt) {
    state.particles.forEach(p => {
      p.life -= dt;
      p.x += p.vx * dt;
      p.y += p.vy * dt;
      p.vx *= 0.98;
      p.vy *= 0.98;
      p.radius += (p.grow || 0) * dt;
    });
    state.floatingTexts.forEach(t => {
      t.life -= dt;
      t.y -= 34 * dt;
      t.alpha = clamp(t.life / t.maxLife, 0, 1);
    });
    state.particles = state.particles.filter(p => p.life > 0);
    state.floatingTexts = state.floatingTexts.filter(t => t.life > 0);
  }

  function updateWaveDirector() {
    const nextIndex = WAVES.findIndex((wave, index) => index > state.currentWaveIndex && state.elapsed >= wave.from);
    if (nextIndex === -1) return;
    state.currentWaveIndex = nextIndex;
    showToast(WAVES[nextIndex].message, 2.5, "warning");
  }

  function updateMapDirector() {
    if (state.mapTimer > 0) return;
    const pool = maps.map((_, index) => index).filter(index => index !== state.currentMapIndex);
    const nextIndex = pool[Math.floor(Math.random() * pool.length)] ?? 0;
    state.currentMapIndex = nextIndex;
    state.mapTimer = BALANCE.mapSegmentDuration + rand(-12, 16);
    state.mapHistory.push(nextIndex);
    if (state.mapHistory.length > 6) state.mapHistory.shift();
    const map = getCurrentMap();
    createStars();
    invalidateBackgroundCache();
    addEventMessage(`航道切入：${map.name}`, "info");
    state.levelPulse = 1;
  }

  function getCurrentMap() {
    return maps[state.currentMapIndex] || maps[0];
  }

  function updateRandomEvent() {
    if (state.randomEventTimer > 0 || state.elapsed < BALANCE.randomEventFirstDelay) return;
    const context = getRandomEventContext();
    const candidates = randomEvents.filter(event => !event.condition || event.condition(context));
    const eventId = selectWeighted(Object.fromEntries(candidates.map(event => [event.id, Math.max(0.01, event.weight(context))])));
    const event = candidates.find(item => item.id === eventId);
    triggerRandomEvent(event, context);
    state.randomEventTimer = rand(BALANCE.randomEventMinInterval, BALANCE.randomEventMaxInterval);
  }

  function getRandomEventContext() {
    const p = state.player;
    const maxEnemies = getEnemyCap();
    return {
      pressure: getSpawnPressure(maxEnemies),
      hpRatio: p ? p.hp / p.maxHp : 1,
      shieldRatio: p ? p.shield / p.maxShield : 1,
      bossActive: state.enemies.some(enemy => enemy.type === "boss"),
      overload: state.overload
    };
  }

  function triggerRandomEvent(event, context) {
    const p = state.player;
    if (!event || !p) return;
    state.randomEvent = event.id;
    addEventMessage(event.text, event.variant);
    event.trigger(context);
  }

  function updateSpawning() {
    const difficulty = getDifficultyScale();
    const maxEnemies = getEnemyCap();
    const pressure = getSpawnPressure(maxEnemies);
    if (state.spawnTimer <= 0 && state.enemies.length < maxEnemies) {
      const remainingSlots = maxEnemies - state.enemies.length;
      const pressureBatchCap = pressure >= BALANCE.spawnPressureHardCap ? 1 : BALANCE.spawnMaxBatch;
      const batch = Math.min(remainingSlots, pressureBatchCap, 1 + Math.floor(state.elapsed / BALANCE.spawnBatchGrowthSeconds));
      for (let i = 0; i < batch; i++) spawnEnemy(selectEnemyType());
      const intervalMultiplier = getSpawnIntervalMultiplier(pressure);
      state.spawnTimer = Math.max(BALANCE.spawnMinimumInterval, BALANCE.spawnBaseInterval / difficulty) * intervalMultiplier;
    }
    if (state.eliteTimer <= 0) {
      spawnEnemy("elite");
      showToast("菁英艦進入戰場", 2.1, "warning");
      state.eliteTimer = Math.max(BALANCE.eliteMinimumInterval, BALANCE.eliteBaseInterval - state.elapsed / 14);
    }
    if (!state.bossSpawned && state.elapsed >= BALANCE.bossSpawnTime) {
      spawnEnemy("boss");
      state.bossSpawned = true;
      state.shake = Math.max(state.shake, 4.2);
      showToast("警告：虛空母艦登場", 3, "danger");
      playSound("boss");
    }
  }

  function getDifficultyScale() {
    return 1 + state.elapsed / 115 + (state.overload ? 0.85 : 0);
  }

  function getSpawnPressure(maxEnemies) {
    return maxEnemies > 0 ? state.enemies.length / maxEnemies : 0;
  }

  function getSpawnIntervalMultiplier(pressure) {
    if (pressure >= BALANCE.spawnPressureHardCap) return BALANCE.spawnHardPressureSlow;
    if (pressure >= BALANCE.spawnPressureSoftCap) return BALANCE.spawnHighPressureSlow;
    if (pressure <= BALANCE.spawnLowPressureBoost) return 0.9;
    return 1;
  }

  function getEnemyCap() {
    const qualityCap = settings.quality === "performance" ? 0.82 : settings.quality === "balanced" ? 0.92 : 1;
    return Math.min(
      Math.floor(BALANCE.enemyMaxCap * qualityCap),
      BALANCE.enemyBaseCap + Math.floor(state.elapsed / BALANCE.enemyCapGrowthSeconds) + (state.overload ? BALANCE.overloadBonusCap : 0)
    );
  }

  function getCurrentWave() {
    return WAVES[state.currentWaveIndex] || WAVES[0];
  }

  function selectWeighted(weights) {
    const entries = Object.entries(weights);
    const total = entries.reduce((sum, [, weight]) => sum + weight, 0);
    let roll = Math.random() * total;
    for (const [type, weight] of entries) {
      roll -= weight;
      if (roll <= 0) return type;
    }
    return entries[entries.length - 1][0];
  }

  function selectEnemyType() {
    const wave = getCurrentWave();
    const map = getCurrentMap();
    return selectWeighted({ ...wave.weights, ...map.enemyWeights });
  }

  function spawnEnemy(type, x, y) {
    const spec = enemyTypes[type];
    const pos = x === undefined ? spawnPoint() : { x, y };
    const difficulty = 1 + state.elapsed / BALANCE.enemyHpGrowthSeconds + (state.overload ? 0.65 : 0);
    const bossScale = type === "boss" ? 0.95 + Math.min(0.45, state.elapsed / 900) : 1;
    const enemy = {
      type,
      name: spec.name,
      x: pos.x,
      y: pos.y,
      radius: spec.radius,
      color: spec.color,
      hp: spec.hp * difficulty * bossScale,
      maxHp: spec.hp * difficulty * bossScale,
      speed: spec.speed * (1 + Math.min(BALANCE.enemyMaxSpeedBonus, state.elapsed / 620)),
      damage: spec.damage,
      xp: spec.xp,
      score: spec.score,
      flash: 0,
      shootTimer: rand(0.4, 2.2),
      summonTimer: type === "boss" ? 6 : undefined
    };
    const variantId = rollEnemyVariant(type);
    if (variantId) applyEnemyVariant(enemy, variantId);
    state.enemies.push(enemy);
  }

  function rollEnemyVariant(type) {
    if (type === "boss" || type === "elite") return null;
    const pressure = getSpawnPressure(getEnemyCap());
    if (pressure > 0.86) return Math.random() < 0.025 ? "rich" : null;
    for (const [id, variant] of Object.entries(enemyVariants)) {
      if (Math.random() < variant.chance) return id;
    }
    return null;
  }

  function applyEnemyVariant(enemy, variantId) {
    const variant = enemyVariants[variantId];
    enemy.variant = variantId;
    enemy.maxHp *= variant.hp;
    enemy.hp *= variant.hp;
    enemy.speed *= variant.speed;
    enemy.xp *= variant.xp;
    enemy.score *= variant.score;
    enemy.variantColor = variant.color;
  }

  function spawnPoint() {
    const side = Math.floor(Math.random() * 4);
    const margin = 80;
    if (side === 0) return { x: rand(-margin, state.width + margin), y: -margin };
    if (side === 1) return { x: state.width + margin, y: rand(-margin, state.height + margin) };
    if (side === 2) return { x: rand(-margin, state.width + margin), y: state.height + margin };
    return { x: -margin, y: rand(-margin, state.height + margin) };
  }

  function damageEnemy(enemy, amount, crit) {
    const p = state.player;
    const closeBonus = p?.closeCombatLevel > 0 && distance(p, enemy) < 170 ? 1 + p.closeCombatLevel * 0.1 : 1;
    enemy.hp -= amount * closeBonus;
    enemy.flash = 0.08;
    addFloatingText(enemy.x, enemy.y - enemy.radius, Math.ceil(amount * closeBonus).toString(), crit ? "#ffd166" : "#e8fbff");
    for (let i = 0; i < 2; i++) addParticle(enemy.x, enemy.y, enemy.color, rand(20, 90));
    playSound("hit");
  }

  function killEnemy(enemy) {
    if (enemy._dead) return;
    enemy._dead = true;
    state.kills++;
    state.score += enemy.score;
    if (state.player.siphonLevel > 0) state.player.shield = Math.min(state.player.maxShield, state.player.shield + 2.5 + state.player.siphonLevel * 2.5);
    if (state.player.activeBatteryLevel > 0 && state.player.activeSkillId && Math.random() < 0.12 + state.player.activeBatteryLevel * 0.04) state.player.activeCooldown = Math.max(0, state.player.activeCooldown - (0.9 + state.player.activeBatteryLevel * 0.35));
    dropXp(enemy.x, enemy.y, enemy.xp, enemy.type === "boss" ? 12 : enemy.type === "elite" ? 5 : 1);
    createExplosion(enemy.x, enemy.y, enemy.radius * 2.4, enemy.type === "boss" ? 60 : 0, true);
    if (state.player.novaLevel > 0 && Math.random() < 0.18 + state.player.novaLevel * 0.08) {
      createExplosion(enemy.x, enemy.y, 70 + state.player.novaLevel * 20, 24 + state.player.novaLevel * 12);
    }
    if (enemy.type === "boss") {
      state.bossDefeated = true;
      state.overload = true;
      state.score += 3000;
      showToast("虛空母艦已摧毀：超載波次啟動", 3.4, "success");
      addXp(160);
    }
    playSound("boom");
  }

  function createExplosion(x, y, radius, damage = 0, visualOnly = false) {
    state.shake = Math.max(state.shake, settings.shake ? Math.min(5.2, radius / 18) : 0);
    createRing(x, y, radius, "#ff3df2");
    const particleCount = motion.reduced ? Math.min(12, radius / 4) : Math.min(42, radius / 2);
    for (let i = 0; i < particleCount; i++) addParticle(x, y, i % 2 ? "#38f8ff" : "#ff3df2", rand(70, 260));
    if (!visualOnly && damage > 0) {
      state.enemies.forEach(enemy => {
        if (distance({ x, y }, enemy) < radius + enemy.radius) damageEnemy(enemy, damage, false);
      });
      if (distance({ x, y }, state.player) < radius + state.player.radius) damagePlayer(damage * 0.4, { invulnerability: 0.28 });
    }
  }

  function createRing(x, y, radius, color) {
    const limit = Math.max(40, Math.floor(MAX_PARTICLES * getQualityPreset().particleScale));
    if (state.particles.length >= limit) state.particles.shift();
    state.particles.push({ x, y, vx: 0, vy: 0, radius: 8, maxRadius: radius, life: 0.42, maxLife: 0.42, color, type: "ring", grow: radius * 2.6 });
  }

  function addParticle(x, y, color, speed) {
    const limit = Math.max(40, Math.floor(MAX_PARTICLES * getQualityPreset().particleScale));
    if (state.particles.length >= limit) state.particles.shift();
    const a = Math.random() * TAU;
    state.particles.push({
      x,
      y,
      vx: Math.cos(a) * speed,
      vy: Math.sin(a) * speed,
      radius: rand(1.4, 4.2),
      life: rand(0.28, 0.72),
      maxLife: 0.72,
      color,
      type: "spark",
      grow: -1.4
    });
  }

  function addFloatingText(x, y, text, color) {
    if (state.floatingTexts.length >= MAX_FLOATING_TEXTS) state.floatingTexts.shift();
    state.floatingTexts.push({ x, y, text, color, life: 0.72, maxLife: 0.72, alpha: 1 });
  }

  function dropPickup(type, x, y, value = 1, count = 1) {
    const config = pickupTypes[type] || pickupTypes.xp;
    for (let i = 0; i < count; i++) {
      const a = Math.random() * TAU;
      state.pickups.push({
        type,
        x: x + Math.cos(a) * rand(0, 18),
        y: y + Math.sin(a) * rand(0, 18),
        vx: Math.cos(a) * rand(20, 130),
        vy: Math.sin(a) * rand(20, 130),
        radius: config.radius,
        value: Math.max(1, Math.round(value / count)),
        life: 30,
        color: config.color
      });
    }
  }

  function dropXp(x, y, value, count) {
    dropPickup("xp", x, y, value, count);
  }

  function collectPickup(pickup) {
    const p = state.player;
    const type = pickup.type || "xp";
    if (type === "xp") addXp(pickup.value);
    if (type === "heal") {
      p.hp = Math.min(p.maxHp, p.hp + 24 + pickup.value * 8);
      addFloatingText(p.x, p.y - 26, "修復", "#ff4b66");
    }
    if (type === "shield") {
      p.shield = Math.min(p.maxShield, p.shield + 28 + pickup.value * 8);
      addFloatingText(p.x, p.y - 26, "護盾", "#48f3ff");
    }
    if (type === "bomb") {
      addFloatingText(p.x, p.y - 26, "爆裂核心", "#ffd36a");
      createExplosion(p.x, p.y, 120 + pickup.value * 12, 42 + pickup.value * 10);
    }
    if (type === "magnet") {
      addFloatingText(p.x, p.y - 26, "磁力", "#d84cff");
      addBuff("magnetRush", 10, { pickupBonus: 180 });
    }
    if (type === "overclock") {
      addFloatingText(p.x, p.y - 26, "超頻", "#ffffff");
      addBuff("overclock", 9, { damageBonus: 0.22, fireRateBonus: 0.18 });
    }
    if (p.pickupBurstLevel > 0) {
      p.pickupBurstCounter++;
      if (p.pickupBurstCounter >= Math.max(4, 8 - p.pickupBurstLevel)) {
        p.pickupBurstCounter = 0;
        createExplosion(p.x, p.y, 58 + p.pickupBurstLevel * 12, 16 + p.pickupBurstLevel * 8);
      }
    }
  }

  function rollActiveSkillChoices(count) {
    const pool = [...activeSkills];
    const chosen = [];
    while (chosen.length < count && pool.length) {
      const index = Math.floor(Math.random() * pool.length);
      chosen.push(pool.splice(index, 1)[0]);
    }
    return chosen;
  }

  function getActiveSkill(id) {
    return activeSkills.find(skill => skill.id === id);
  }

  function setActiveSkill(skill) {
    const p = state.player;
    p.activeSkillId = skill.id;
    p.activeSkillLevel = 1;
    p.activeCooldownMax = skill.cooldown(1);
    p.activeCooldown = 0;
    p.activeCharges = 1;
    p.activeMaxCharges = 1;
    p.activeSkillChoicesSeen = true;
  }

  function upgradeActiveSkill() {
    const p = state.player;
    p.activeSkillLevel = Math.min(4, p.activeSkillLevel + 1);
    const skill = getActiveSkill(p.activeSkillId);
    p.activeCooldownMax = skill.cooldown(p.activeSkillLevel);
    p.activeCooldown = Math.min(p.activeCooldown, p.activeCooldownMax);
    p.activeCharges = Math.max(p.activeCharges, 1);
  }

  function useActiveSkill() {
    const p = state.player;
    if (!p || state.mode !== "playing" || !p.activeSkillId) return;
    if (p.activeCharges <= 0 || p.activeCooldown > 0) {
      if (state.activeToastCooldown <= 0) {
        showToast("主動技能尚未充能", 0.9, "warning");
        state.activeToastCooldown = 0.8;
      }
      return;
    }
    const skill = getActiveSkill(p.activeSkillId);
    const target = input.mouse.active ? input.mouse : nearestEnemy(p) || { x: p.x + Math.cos(p.angle) * 120, y: p.y + Math.sin(p.angle) * 120 };
    if (skill.id === "voidLance") castVoidLance(target);
    if (skill.id === "gravityWell") castGravityWell(target);
    if (skill.id === "phaseBlink") castPhaseBlink(target);
    if (skill.id === "ionStorm") castIonStorm(target);
    p.activeCharges = 0;
    p.activeCooldownMax = skill.cooldown(p.activeSkillLevel);
    p.activeCooldown = p.activeCooldownMax;
    showToast(`${skill.name} 已釋放`, 1.2, "success");
    playSound("level");
  }

  function castVoidLance(target) {
    const p = state.player;
    const a = angleTo(p, target);
    const length = 760;
    const width = 24 + p.activeSkillLevel * 7;
    const damage = (76 + p.activeSkillLevel * 34) * p.damageMult;
    const end = { x: p.x + Math.cos(a) * length, y: p.y + Math.sin(a) * length };
    state.enemies.forEach(enemy => {
      const hit = distanceToSegment(enemy, p, end) < enemy.radius + width;
      if (hit) damageEnemy(enemy, damage, true);
    });
    state.particles.push({ x: p.x, y: p.y, vx: Math.cos(a) * length, vy: Math.sin(a) * length, radius: width, life: 0.18, maxLife: 0.18, color: "#48f3ff", type: "beam" });
    state.levelPulse = 1;
  }

  function castGravityWell(target) {
    const p = state.player;
    const radius = 150 + p.activeSkillLevel * 28;
    const damage = (42 + p.activeSkillLevel * 22) * p.damageMult;
    state.enemies.forEach(enemy => {
      const d = distance(enemy, target);
      if (d < radius + enemy.radius) {
        const pull = clamp((radius - d) / radius, 0.2, 1);
        enemy.x += (target.x - enemy.x) * 0.22 * pull;
        enemy.y += (target.y - enemy.y) * 0.22 * pull;
        damageEnemy(enemy, damage * pull, false);
      }
    });
    createRing(target.x, target.y, radius, "#d84cff");
    state.levelPulse = 1;
  }

  function castPhaseBlink(target) {
    const p = state.player;
    const a = angleTo(p, target);
    const range = 150 + p.activeSkillLevel * 24;
    p.x = clamp(p.x + Math.cos(a) * range, 26, state.width - 26);
    p.y = clamp(p.y + Math.sin(a) * range, 26, state.height - 26);
    p.invuln = 0.45 + p.activeSkillLevel * 0.08;
    createExplosion(p.x, p.y, 86 + p.activeSkillLevel * 22, 34 + p.activeSkillLevel * 18);
    state.levelPulse = 1;
  }

  function castIonStorm() {
    const p = state.player;
    const strikes = 5 + p.activeSkillLevel * 2;
    const damage = (36 + p.activeSkillLevel * 16) * p.damageMult;
    const targets = [...state.enemies].sort((a, b) => distance(p, a) - distance(p, b)).slice(0, strikes);
    targets.forEach(enemy => {
      damageEnemy(enemy, damage, Math.random() < 0.35);
      createRing(enemy.x, enemy.y, 34 + p.activeSkillLevel * 6, "#ffd36a");
    });
    state.levelPulse = 1;
  }

  function distanceToSegment(point, start, end) {
    const dx = end.x - start.x;
    const dy = end.y - start.y;
    const lengthSq = dx * dx + dy * dy || 1;
    const t = clamp(((point.x - start.x) * dx + (point.y - start.y) * dy) / lengthSq, 0, 1);
    const x = start.x + dx * t;
    const y = start.y + dy * t;
    return Math.hypot(point.x - x, point.y - y);
  }

  function addXp(amount) {
    const p = state.player;
    p.xp += amount;
    state.score += amount * 4;
    checkLevelUp();
  }

  function checkLevelUp() {
    const p = state.player;
    if (!p || state.mode !== "playing" || p.xp < p.xpToNext) return;
    p.xp -= p.xpToNext;
    p.level++;
    p.xpToNext = Math.floor(p.xpToNext * 1.22 + 8);
    openLevelUp();
  }

  function updateProgression(dt) {
    state.score += dt * (state.overload ? 6 : 3);
  }

  function openLevelUp() {
    state.currentUpgrades = rollUpgrades();
    ui.upgradeOptions.replaceChildren();
    state.currentUpgrades.forEach(skill => {
      const button = document.createElement("button");
      const category = document.createElement("span");
      const name = document.createElement("strong");
      const description = document.createElement("p");
      const current = getSkillLevel(skill.id);
      button.className = "upgrade-card";
      button.type = "button";
      button.dataset.rarity = skill.rarity || "common";
      category.textContent = skill.category;
      name.textContent = skill.name;
      description.textContent = skill.desc(current);
      button.append(category, name, description);
      button.addEventListener("click", () => selectUpgrade(skill));
      ui.upgradeOptions.appendChild(button);
    });
    setMode("levelUp");
    playSound("level");
  }

  function rollUpgrades() {
    const p = state.player;
    if (!p.activeSkillId && !p.activeSkillChoicesSeen) {
      p.activeSkillChoicesSeen = true;
      return rollActiveSkillChoices(3).map(skill => ({
        id: `active-${skill.id}`,
        name: skill.name,
        category: skill.category,
        max: 1,
        desc: () => `${skill.desc(1)} 一局只能同步一個主動技能。`,
        apply: () => setActiveSkill(skill)
      }));
    }
    const available = skills.filter(skill => getSkillLevel(skill.id) < skill.max);
    if (p.activeSkillId && p.activeSkillLevel < 4) {
      const active = getActiveSkill(p.activeSkillId);
      available.unshift({
        id: `active-upgrade-${active.id}`,
        name: `${active.name} 升級`,
        category: "主動強化",
        max: 4,
        desc: () => `${active.desc(p.activeSkillLevel)} 升級後降低冷卻並提高效果。`,
        apply: () => upgradeActiveSkill()
      });
    }
    const pool = [...available];
    const chosen = rollWeightedUpgrades(pool, 3);
    if (!chosen.length) {
      chosen.push({ id: "heal", name: "緊急修復", category: "補給", max: 999, desc: () => "恢復 40 艦體並獲得 500 分。", apply: p => { p.hp = Math.min(p.maxHp, p.hp + 40); state.score += 500; } });
    }
    return chosen;
  }

  function getUpgradeWeight(skill) {
    const p = state.player;
    let weight = skill.weight ?? 1;
    if (skill.tags?.includes("defense") && p.hp / p.maxHp < 0.45) weight *= 1.45;
    if (skill.tags?.includes("attack") && p.level <= 4) weight *= 1.2;
    if (skill.tags?.includes("pickup") && p.pickupRange > 180) weight *= 1.18;
    if (skill.tags?.includes("active") && p.activeSkillId) weight *= 1.18;
    if (skill.rarity === "rare") weight *= 0.82;
    if (skill.rarity === "epic") weight *= 0.55;
    return weight;
  }

  function rollWeightedUpgrades(pool, count) {
    const chosen = [];
    const candidates = [...pool];
    while (chosen.length < count && candidates.length) {
      const weights = Object.fromEntries(candidates.map((skill, index) => [index, getUpgradeWeight(skill)]));
      const index = Number(selectWeighted(weights));
      chosen.push(candidates.splice(index, 1)[0]);
    }
    return chosen;
  }

  function getSkillLevel(id) {
    const p = state.player;
    const map = {
      pulse: p.pulseLevel,
      split: p.splitLevel,
      missile: p.missileLevel,
      nova: p.novaLevel,
      crit: Math.round((p.crit - 0.06) / 0.08),
      shield: p.shieldLevel,
      repair: p.repairLevel,
      phase: Math.round(p.dodge / 0.07),
      engine: Math.round((p.speed - 230) / 22),
      magnet: Math.round((p.pickupRange - 115) / 38),
      drone: p.droneLevel,
      emp: p.empLevel,
      siphonShield: p.siphonLevel,
      pickupBurst: p.pickupBurstLevel,
      closeCombat: p.closeCombatLevel,
      lowHpOverdrive: p.lowHpOverdriveLevel,
      activeBattery: p.activeBatteryLevel,
      volatileRounds: p.volatileRoundsLevel,
      railWeapon: p.primaryWeapons.rail,
      arcWeapon: p.primaryWeapons.arc,
      flakWeapon: p.primaryWeapons.flak
    };
    return map[id] || 0;
  }

  function selectUpgrade(skill) {
    skill.apply(state.player);
    showToast(`${skill.name} 已同步`, 2.1, "success");
    state.levelPulse = 1;
    setMode("playing");
    updateHud();
    checkLevelUp();
  }

  function damagePlayer(amount, options = {}) {
    const p = state.player;
    if (p.invuln > 0) return;
    if (Math.random() < p.dodge) {
      addFloatingText(p.x, p.y - 28, "閃避", "#66ffb3");
      p.invuln = Math.min(0.12, options.invulnerability ?? 0.16);
      return;
    }
    const finalAmount = Math.max(amount, options.minimumDamage ?? 0);
    let remaining = finalAmount;
    const shieldHit = Math.min(p.shield, remaining);
    p.shield -= shieldHit;
    remaining -= shieldHit;
    if (remaining > 0) p.hp -= remaining;
    p.invuln = options.invulnerability ?? (0.55 + p.invulnBonus);
    state.shake = settings.shake ? Math.max(state.shake, motion.reduced ? 0.8 : 2.2) : 0;
    state.hitPulse = 1;
    addFloatingText(p.x, p.y - 30, `-${Math.ceil(finalAmount)}`, remaining > 0 ? "#ff3b6b" : "#38f8ff");
    updateHud();
    playSound("hurt");
    if (p.hp <= 0) endGame();
  }

  function appendResultStat(label, value) {
    const item = document.createElement("div");
    const labelElement = document.createElement("span");
    const valueElement = document.createElement("strong");
    labelElement.textContent = label;
    valueElement.textContent = value;
    item.append(labelElement, valueElement);
    ui.resultStats.appendChild(item);
  }

  function endGame() {
    saveRecords();
    state.runEnded = true;
    updateMenuState();
    setMode("gameOver");
    const p = state.player;
    ui.resultTitle.textContent = state.bossDefeated ? "突破封鎖後失聯" : "艦體失效";
    ui.resultStats.replaceChildren();
    [
      ["本局時間", formatTime(state.elapsed)],
      ["本局擊殺", state.kills],
      ["本局等級", p.level],
      ["本局分數", Math.floor(state.score)],
      ["最高分", records.score],
      ["最長時間", formatTime(records.time)],
      ["最高擊殺", records.kills],
      ["最高等級", records.level]
    ].forEach(([label, value]) => appendResultStat(label, value));
  }

  function nearestEnemy(origin) {
    let best = null;
    let bestDist = Infinity;
    state.enemies.forEach(enemy => {
      const d = distanceSquared(origin, enemy);
      if (d < bestDist) {
        bestDist = d;
        best = enemy;
      }
    });
    return best;
  }

  function render() {
    ctx.save();
    ctx.clearRect(0, 0, state.width, state.height);
    if (state.shake > 0 && settings.shake) {
      const shake = motion.reduced ? Math.min(1, state.shake * 0.12) : Math.min(motion.shakeMax, state.shake * motion.shakeScale);
      const t = state.elapsed * 52;
      ctx.translate(Math.sin(t) * shake, Math.cos(t * 1.37) * shake * 0.72);
    }
    drawBackground();
    if (state.player) {
      drawPickups();
      drawProjectiles();
      drawEnemyProjectiles();
      drawEnemies();
      drawPlayer();
      drawMouseTarget();
      drawActiveSkillRangeHint();
      drawParticles();
      drawFloatingTexts();
      drawLevelUpPulse();
      drawBossAlert();
      drawBossBar();
      drawScanOverlay();
    }
    ctx.restore();
  }

  function invalidateBackgroundCache() {
    state.backgroundCache = null;
    state.backgroundMapId = null;
    state.backgroundWidth = 0;
    state.backgroundHeight = 0;
  }

  function drawBackground() {
    const map = getCurrentMap();
    const quality = getQualityPreset();
    if (!state.backgroundCache || state.backgroundMapId !== map.id || state.backgroundWidth !== state.width || state.backgroundHeight !== state.height) {
      state.backgroundCache = document.createElement("canvas");
      state.backgroundCache.width = Math.max(1, Math.floor(state.width));
      state.backgroundCache.height = Math.max(1, Math.floor(state.height));
      state.backgroundMapId = map.id;
      state.backgroundWidth = state.width;
      state.backgroundHeight = state.height;
      const bg = state.backgroundCache.getContext("2d");
      const gradient = bg.createRadialGradient(state.width * 0.5, state.height * 0.45, 40, state.width * 0.5, state.height * 0.5, Math.max(state.width, state.height));
      gradient.addColorStop(0, map.colors[0]);
      gradient.addColorStop(0.45, map.colors[1]);
      gradient.addColorStop(1, map.colors[2]);
      bg.fillStyle = gradient;
      bg.fillRect(0, 0, state.width, state.height);
      if (quality.backgroundLines) {
        bg.globalAlpha = 0.08;
        bg.strokeStyle = map.accent;
        bg.lineWidth = 1;
        for (let x = -120; x < state.width + 120; x += 90) {
          bg.beginPath();
          bg.moveTo(x, 0);
          bg.lineTo(x + 120, state.height);
          bg.stroke();
        }
        bg.globalAlpha = 1;
      }
    }
    ctx.drawImage(state.backgroundCache, 0, 0);
    state.stars.forEach(star => {
      star.y += star.speed * 0.0016;
      if (star.y > state.height) star.y = 0;
      ctx.globalAlpha = star.alpha;
      ctx.fillStyle = map.starTint;
      ctx.beginPath();
      ctx.arc(star.x, star.y, star.size, 0, TAU);
      ctx.fill();
    });
    ctx.globalAlpha = 1;
  }

  function drawMouseTarget() {
    if (state.mode !== "playing" || !state.player || !input.mouse.active) return;
    const p = state.player;
    const dist = distance(p, input.mouse);
    const readyAlpha = dist <= CONTROL.stopRadius ? 0.16 : 0.42;
    const pulse = motion.reduced ? 0 : Math.sin(state.elapsed * 5) * 2;
    const radius = CONTROL.targetIndicatorRadius + pulse;
    ctx.save();
    ctx.globalAlpha = readyAlpha;
    ctx.strokeStyle = "#48f3ff";
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.arc(input.mouse.x, input.mouse.y, radius, 0, TAU);
    ctx.stroke();
    ctx.beginPath();
    ctx.moveTo(input.mouse.x - radius - 7, input.mouse.y);
    ctx.lineTo(input.mouse.x - radius + 2, input.mouse.y);
    ctx.moveTo(input.mouse.x + radius - 2, input.mouse.y);
    ctx.lineTo(input.mouse.x + radius + 7, input.mouse.y);
    ctx.moveTo(input.mouse.x, input.mouse.y - radius - 7);
    ctx.lineTo(input.mouse.x, input.mouse.y - radius + 2);
    ctx.moveTo(input.mouse.x, input.mouse.y + radius - 2);
    ctx.lineTo(input.mouse.x, input.mouse.y + radius + 7);
    ctx.stroke();
    ctx.restore();
  }

  function drawActiveSkillRangeHint() {
    const p = state.player;
    if (!p || !p.activeSkillId || p.activeCharges <= 0 || !input.mouse.active) return;
    const skill = getActiveSkill(p.activeSkillId);
    const pulse = motion.reduced ? 0 : Math.sin(state.elapsed * 4) * 3;
    ctx.save();
    ctx.globalAlpha = 0.28;
    ctx.strokeStyle = "#ffd36a";
    ctx.lineWidth = 1.5;
    if (skill.id === "voidLance") {
      const a = angleTo(p, input.mouse);
      ctx.beginPath();
      ctx.moveTo(p.x, p.y);
      ctx.lineTo(p.x + Math.cos(a) * 360, p.y + Math.sin(a) * 360);
      ctx.stroke();
    }
    if (skill.id === "gravityWell") {
      ctx.beginPath();
      ctx.arc(input.mouse.x, input.mouse.y, 150 + p.activeSkillLevel * 28 + pulse, 0, TAU);
      ctx.stroke();
    }
    if (skill.id === "phaseBlink") {
      const a = angleTo(p, input.mouse);
      const range = 150 + p.activeSkillLevel * 24;
      const x = clamp(p.x + Math.cos(a) * range, 26, state.width - 26);
      const y = clamp(p.y + Math.sin(a) * range, 26, state.height - 26);
      ctx.beginPath();
      ctx.moveTo(p.x, p.y);
      ctx.lineTo(x, y);
      ctx.stroke();
      ctx.beginPath();
      ctx.arc(x, y, 26 + pulse, 0, TAU);
      ctx.stroke();
    }
    if (skill.id === "ionStorm") {
      ctx.beginPath();
      ctx.arc(p.x, p.y, 260 + pulse, 0, TAU);
      ctx.stroke();
    }
    ctx.restore();
  }

  function drawPlayer() {
    const p = state.player;
    if (p.invuln > 0 && Math.floor(p.invuln * 18) % 2 === 0) ctx.globalAlpha = 0.55;
    ctx.save();
    ctx.translate(p.x, p.y);
    ctx.rotate(p.angle);
    ctx.shadowColor = "#38f8ff";
    ctx.shadowBlur = 18 * getQualityPreset().shadowBlur;
    ctx.fillStyle = "#dffcff";
    ctx.beginPath();
    ctx.moveTo(24, 0);
    ctx.lineTo(-16, -13);
    ctx.lineTo(-8, 0);
    ctx.lineTo(-16, 13);
    ctx.closePath();
    ctx.fill();
    ctx.fillStyle = "#38f8ff";
    ctx.beginPath();
    ctx.moveTo(-16, -8);
    ctx.lineTo(-30 - Math.random() * 10, 0);
    ctx.lineTo(-16, 8);
    ctx.fill();
    ctx.restore();
    ctx.globalAlpha = 1;
    if (p.droneLevel > 0) drawDrones();
    ctx.strokeStyle = "rgba(56, 248, 255, 0.24)";
    ctx.beginPath();
    ctx.arc(p.x, p.y, p.pickupRange, 0, TAU);
    ctx.stroke();
  }

  function drawDrones() {
    const p = state.player;
    const drones = Math.min(6, p.droneLevel + 1);
    const orbit = 52 + p.droneLevel * 8;
    ctx.strokeStyle = "rgba(255, 61, 242, 0.18)";
    ctx.beginPath();
    ctx.arc(p.x, p.y, orbit, 0, TAU);
    ctx.stroke();
    for (let i = 0; i < drones; i++) {
      const a = state.elapsed * (2.2 + p.droneLevel * 0.15) + i * TAU / drones;
      const x = p.x + Math.cos(a) * orbit;
      const y = p.y + Math.sin(a) * orbit;
      ctx.shadowColor = "#ff3df2";
      ctx.shadowBlur = 14;
      ctx.fillStyle = "#ff3df2";
      ctx.beginPath();
      ctx.arc(x, y, 7, 0, TAU);
      ctx.fill();
      ctx.shadowBlur = 0;
    }
  }

  function drawEnemies() {
    const quality = getQualityPreset();
    state.enemies.forEach(enemy => {
      ctx.save();
      ctx.translate(enemy.x, enemy.y);
      ctx.rotate(state.elapsed * (enemy.type === "boss" ? 0.25 : 1));
      ctx.shadowColor = enemy.color;
      ctx.shadowBlur = (enemy.type === "boss" ? 28 : 16) * quality.shadowBlur;
      ctx.fillStyle = enemy.flash > 0 ? "#ffffff" : enemy.color;
      ctx.strokeStyle = "rgba(255,255,255,0.75)";
      ctx.lineWidth = enemy.type === "elite" || enemy.type === "boss" ? 3 : 1.4;
      const sides = enemy.type === "tank" || enemy.type === "sentinel" ? 6 : enemy.type === "boss" ? 8 : enemy.type === "burrower" ? 5 : enemy.type === "stormer" ? 4 : 3;
      ctx.beginPath();
      for (let i = 0; i < sides; i++) {
        const a = i * TAU / sides;
        const r = enemy.radius * (i % 2 && enemy.type !== "tank" ? 0.72 : 1);
        const x = Math.cos(a) * r;
        const y = Math.sin(a) * r;
        if (i === 0) ctx.moveTo(x, y); else ctx.lineTo(x, y);
      }
      ctx.closePath();
      ctx.fill();
      ctx.stroke();
      ctx.restore();
      if (enemy.type === "elite" || enemy.type === "boss") {
        ctx.strokeStyle = enemy.color;
        ctx.globalAlpha = 0.35 + Math.sin(state.elapsed * 5) * 0.12;
        ctx.beginPath();
        ctx.arc(enemy.x, enemy.y, enemy.radius + 10, 0, TAU);
        ctx.stroke();
        ctx.globalAlpha = 1;
      }
      if (enemy.variantColor) {
        ctx.strokeStyle = enemy.variantColor;
        ctx.globalAlpha = 0.58;
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.arc(enemy.x, enemy.y, enemy.radius + 5, 0, TAU);
        ctx.stroke();
        ctx.globalAlpha = 1;
      }
    });
    ctx.shadowBlur = 0;
  }

  function drawProjectiles() {
    const quality = getQualityPreset();
    state.projectiles.forEach(p => {
      ctx.shadowColor = p.color;
      ctx.shadowBlur = 18 * quality.shadowBlur;
      ctx.fillStyle = p.color;
      ctx.beginPath();
      ctx.arc(p.x, p.y, p.radius, 0, TAU);
      ctx.fill();
    });
    ctx.shadowBlur = 0;
  }

  function drawEnemyProjectiles() {
    const quality = getQualityPreset();
    state.enemyProjectiles.forEach(p => {
      ctx.shadowColor = p.color;
      ctx.shadowBlur = 14 * quality.shadowBlur;
      ctx.fillStyle = p.color;
      ctx.beginPath();
      ctx.arc(p.x, p.y, p.radius, 0, TAU);
      ctx.fill();
    });
    ctx.shadowBlur = 0;
  }

  function drawPickups() {
    const quality = getQualityPreset();
    state.pickups.forEach(p => {
      ctx.shadowColor = p.color;
      ctx.shadowBlur = 14 * quality.shadowBlur;
      ctx.fillStyle = p.color;
      ctx.beginPath();
      ctx.moveTo(p.x, p.y - 7);
      ctx.lineTo(p.x + 6, p.y);
      ctx.lineTo(p.x, p.y + 7);
      ctx.lineTo(p.x - 6, p.y);
      ctx.closePath();
      ctx.fill();
    });
    ctx.shadowBlur = 0;
  }

  function drawParticles() {
    const quality = getQualityPreset();
    state.particles.forEach(p => {
      const alpha = clamp(p.life / (p.maxLife || 0.72), 0, 1);
      ctx.globalAlpha = alpha;
      ctx.strokeStyle = p.color;
      ctx.fillStyle = p.color;
      ctx.shadowColor = p.color;
      ctx.shadowBlur = 16 * quality.shadowBlur;
      if (p.type === "ring") {
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.radius, 0, TAU);
        ctx.stroke();
      } else {
        ctx.beginPath();
        ctx.arc(p.x, p.y, Math.max(0.5, p.radius), 0, TAU);
        ctx.fill();
      }
    });
    ctx.globalAlpha = 1;
    ctx.shadowBlur = 0;
  }

  function drawFloatingTexts() {
    ctx.font = "700 13px system-ui, sans-serif";
    ctx.textAlign = "center";
    state.floatingTexts.forEach(t => {
      ctx.globalAlpha = t.alpha;
      ctx.fillStyle = t.color;
      ctx.fillText(t.text, t.x, t.y);
    });
    ctx.globalAlpha = 1;
  }

  function drawLevelUpPulse() {
    if (state.levelPulse <= 0 || !state.player) return;
    const p = state.player;
    const alpha = clamp(state.levelPulse, 0, 1);
    ctx.save();
    ctx.globalAlpha = alpha * 0.55;
    ctx.strokeStyle = "#66ffb3";
    ctx.shadowColor = "#66ffb3";
    ctx.shadowBlur = 24;
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.arc(p.x, p.y, 34 + (1 - alpha) * 160, 0, TAU);
    ctx.stroke();
    ctx.restore();
  }

  function drawBossAlert() {
    if (motion.reduced || !state.enemies.some(enemy => enemy.type === "boss")) return;
    ctx.save();
    ctx.globalAlpha = 0.18 + Math.sin(state.elapsed * 7) * 0.06;
    ctx.strokeStyle = "#ff3df2";
    ctx.lineWidth = 6;
    ctx.strokeRect(8, 8, state.width - 16, state.height - 16);
    ctx.restore();
  }

  function drawScanOverlay() {
    if (motion.reduced || !getQualityPreset().scanOverlay) return;
    ctx.save();
    ctx.globalAlpha = 0.07;
    ctx.fillStyle = "#38f8ff";
    const gap = 18;
    const offset = (state.elapsed * 32) % gap;
    for (let y = -gap + offset; y < state.height; y += gap) {
      ctx.fillRect(0, y, state.width, 1);
    }
    ctx.restore();
  }

  function drawBossBar() {
    const boss = state.enemies.find(e => e.type === "boss");
    if (!boss) return;
    const w = Math.min(620, state.width * 0.72);
    const x = (state.width - w) / 2;
    const y = 76;
    ctx.fillStyle = "rgba(0,0,0,0.42)";
    ctx.fillRect(x, y, w, 12);
    ctx.fillStyle = "#ff3df2";
    ctx.shadowColor = "#ff3df2";
    ctx.shadowBlur = 18;
    ctx.fillRect(x, y, w * clamp(boss.hp / boss.maxHp, 0, 1), 12);
    ctx.shadowBlur = 0;
    ctx.fillStyle = "#f3fbff";
    ctx.font = "700 12px system-ui, sans-serif";
    ctx.textAlign = "center";
    ctx.fillText("虛空母艦", state.width / 2, y - 10);
  }

  function loop(time) {
    const dt = Math.min(0.025, (time - state.lastTime) / 1000 || 0);
    state.lastTime = time;
    if (state.mode === "playing") update(dt);
    if (state.toastTimer > 0) {
      state.toastTimer -= dt;
      if (state.toastTimer <= 0) ui.toast.classList.add("hidden");
    }
    render();
    requestAnimationFrame(loop);
  }

  function togglePause() {
    if (state.mode === "playing") setMode("paused");
    else if (state.mode === "paused") setMode("playing");
  }

  window.addEventListener("resize", resize);
  window.addEventListener("keydown", event => {
    if ((event.code === "KeyP" || event.code === "Escape") && (state.mode === "playing" || state.mode === "paused")) togglePause();
    else if (event.code === "Escape" && state.mode === "settings") closeSettings();
    else if (event.code === "KeyO" && (state.mode === "menu" || state.mode === "paused")) openSettings(state.mode);
  });
  canvas.addEventListener("pointermove", event => {
    const rect = canvas.getBoundingClientRect();
    const x = event.clientX - rect.left;
    const y = event.clientY - rect.top;
    input.mouse.x += (x - input.mouse.x) * 0.68;
    input.mouse.y += (y - input.mouse.y) * 0.68;
    input.mouse.active = event.pointerType !== "touch";
    if (event.pointerType === "touch" && input.touch.active) {
      input.touch.x = x;
      input.touch.y = y;
    }
  });
  canvas.addEventListener("pointerdown", event => {
    canvas.setPointerCapture(event.pointerId);
    const rect = canvas.getBoundingClientRect();
    const x = event.clientX - rect.left;
    const y = event.clientY - rect.top;
    if (event.pointerType === "touch") {
      input.touch.active = true;
      input.touch.startX = x;
      input.touch.startY = y;
      input.touch.x = x;
      input.touch.y = y;
      input.mouse.active = false;
    } else {
      input.mouse.active = true;
      input.mouse.down = true;
      input.mouse.x = x;
      input.mouse.y = y;
      if (state.player) {
        state.player.lastTargetX = x;
        state.player.lastTargetY = y;
      }
      if (state.mode === "playing") useActiveSkill();
    }
  });
  canvas.addEventListener("pointerup", event => {
    if (event.pointerType === "touch") input.touch.active = false;
    if (event.pointerType !== "touch") input.mouse.down = false;
    if (canvas.hasPointerCapture(event.pointerId)) canvas.releasePointerCapture(event.pointerId);
  });
  canvas.addEventListener("pointercancel", event => {
    if (event.pointerType === "touch") input.touch.active = false;
    if (event.pointerType !== "touch") input.mouse.down = false;
    if (canvas.hasPointerCapture(event.pointerId)) canvas.releasePointerCapture(event.pointerId);
  });
  canvas.addEventListener("pointerleave", event => {
    if (event.pointerType !== "touch") {
      input.mouse.active = false;
      input.mouse.down = false;
    }
  });
  ui.startButton.addEventListener("click", startGame);
  ui.continueButton.addEventListener("click", continueGame);
  ui.settingsButton.addEventListener("click", () => openSettings("menu"));
  ui.resumeButton.addEventListener("click", () => setMode("playing"));
  ui.pauseSettingsButton.addEventListener("click", () => openSettings("paused"));
  ui.quitButton.addEventListener("click", returnToMenu);
  ui.restartButton.addEventListener("click", startGame);
  ui.resultMenuButton.addEventListener("click", returnToMenu);
  ui.settingsBackButton.addEventListener("click", closeSettings);
  ui.volumeControl.addEventListener("input", () => {
    settings.volume = Number(ui.volumeControl.value);
    saveSettings();
  });
  ui.qualitySelect.addEventListener("change", () => {
    settings.quality = ui.qualitySelect.value;
    saveSettings();
    applySettings({ resizeCanvas: true });
    invalidateBackgroundCache();
    createStars();
  });
  ui.shakeToggle.addEventListener("change", () => {
    settings.shake = ui.shakeToggle.checked;
    saveSettings();
    applySettings();
  });
  ui.motionToggle.addEventListener("change", () => {
    settings.motion = ui.motionToggle.checked;
    saveSettings();
    applySettings();
  });
  ui.autoPerfToggle.addEventListener("change", () => {
    settings.autoPerf = ui.autoPerfToggle.checked;
    saveSettings();
    applySettings();
  });

  syncSettingsUi();
  applySettings();
  resize();
  createStars();
  updateMenuState();
  requestAnimationFrame(loop);
})();
