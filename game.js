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