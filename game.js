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
    xpFill: requiredElement("xpFill"),
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
    languageSelect: requiredElement("languageSelect"),
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
  const MAX_PARTICLES = 180;
  const MAX_FLOATING_TEXTS = 34;
  const QUALITY_PRESETS = {
    high: { dpr: 1.75, particleScale: 0.82, starDensity: 10500, shadowBlur: 0.82, scanOverlay: true, backgroundLines: true },
    balanced: { dpr: 1.4, particleScale: 0.56, starDensity: 14500, shadowBlur: 0.52, scanOverlay: true, backgroundLines: true },
    performance: { dpr: 1.05, particleScale: 0.3, starDensity: 21000, shadowBlur: 0.25, scanOverlay: false, backgroundLines: false }
  };
  const LANGUAGES = ["en", "zh-CN", "zh-TW", "ja"];
  const LANGUAGE_META = {
    en: { htmlLang: "en", title: "Starship Survivor", canvasLabel: "Starship Survivor game screen" },
    "zh-CN": { htmlLang: "zh-Hans", title: "星舰幸存者", canvasLabel: "星舰幸存者游戏画面" },
    "zh-TW": { htmlLang: "zh-Hant", title: "星艦倖存者", canvasLabel: "星艦倖存者遊戲畫面" },
    ja: { htmlLang: "ja", title: "スターシップ・サバイバー", canvasLabel: "スターシップ・サバイバーのゲーム画面" }
  };
  const I18N = {
    en: {
      "menu.eyebrow": "NEON VOID SURVIVAL", "menu.title": "Starship Survivor",
      "menu.controlMove": "Move by following the pointer", "menu.controlAim": "Auto aim, auto fire", "menu.controlSkill": "Left click triggers active skill", "menu.controlPause": "P / Esc to pause", "menu.controlSettings": "O opens settings", "menu.controlReturn": "Return to menu keeps the current run",
      "menu.start": "New Game", "menu.continue": "Continue", "menu.settings": "Game Settings", "records.bestScore": "Best Score", "records.bestTime": "Longest Survival", "records.bestKills": "Most Kills",
      "level.eyebrow": "SYSTEM UPGRADE", "level.title": "Choose One Upgrade", "pause.eyebrow": "PAUSED", "pause.title": "Battle Paused", "pause.hint": "Press P or Esc to return. Press O to open settings quickly.", "pause.resume": "Resume Battle",
      "result.eyebrow": "MISSION REPORT", "result.restart": "Deploy Again", "settings.eyebrow": "GAME SETTINGS", "settings.title": "Game Settings", "settings.tutorial": "Tutorial", "settings.language": "Language", "settings.volume": "Sound Volume", "settings.quality": "Graphics Quality", "settings.qualityHigh": "High", "settings.qualityBalanced": "Balanced", "settings.qualityPerformance": "Performance", "settings.shake": "Screen Shake", "settings.motion": "Dynamic Scan Effects", "settings.autoPerf": "Auto Reduce Effects", "common.back": "Back", "common.backToMenu": "Back to Menu",
      "hud.time": "Time", "hud.kills": "Kills", "hud.level": "Level", "hud.score": "Score", "hud.map": "Sector", "hud.hp": "Hull", "hud.shield": "Shield", "hud.xp": "Sync XP", "hud.activeNone": "Active skill offline", "hud.activeAcquire": "Upgrade to acquire", "hud.activeReady": "Left click ready",
      "result.titleBoss": "Lost after the Breakthrough", "result.titleDefault": "Hull Failure", "result.time": "Run Time", "result.kills": "Run Kills", "result.level": "Run Level", "result.score": "Run Score", "result.bestScore": "Best Score", "result.bestTime": "Best Time", "result.bestKills": "Best Kills", "result.bestLevel": "Best Level",
      "toast.saveSettingsFailed": "Settings could not be saved, but they are applied now.", "toast.saveRecordsFailed": "Records could not be saved, but this run can continue.", "toast.start": "Starship launched: break the blockade", "toast.continue": "Battle resumed: tactical systems restored"
    },
    "zh-CN": {
      "menu.eyebrow": "霓虹虚空生存", "menu.title": "星舰幸存者",
      "menu.controlMove": "鼠标指针牵引移动", "menu.controlAim": "自动瞄准，自动射击", "menu.controlSkill": "左键触发主动技能", "menu.controlPause": "P / Esc 暂停", "menu.controlSettings": "O 打开游戏设置", "menu.controlReturn": "返回主菜单可保留战局",
      "menu.start": "开始新游戏", "menu.continue": "继续游戏", "menu.settings": "游戏设置", "records.bestScore": "最高分", "records.bestTime": "最长生存", "records.bestKills": "最高击杀",
      "level.eyebrow": "系统升级", "level.title": "选择一项强化", "pause.eyebrow": "已暂停", "pause.title": "战场暂停", "pause.hint": "按 P 或 Esc 返回战斗，按 O 可快速打开设置。", "pause.resume": "恢复作战",
      "result.eyebrow": "任务报告", "result.restart": "重新出击", "settings.eyebrow": "游戏设置", "settings.title": "游戏设置", "settings.tutorial": "游戏教程", "settings.language": "语言", "settings.volume": "音效音量", "settings.quality": "画质模式", "settings.qualityHigh": "高画质", "settings.qualityBalanced": "平衡", "settings.qualityPerformance": "性能优先", "settings.shake": "画面震动", "settings.motion": "动态扫描效果", "settings.autoPerf": "自动降低特效压力", "common.back": "返回", "common.backToMenu": "返回主菜单",
      "hud.time": "时间", "hud.kills": "击杀", "hud.level": "等级", "hud.score": "分数", "hud.map": "星域", "hud.hp": "舰体", "hud.shield": "护盾", "hud.xp": "同步经验", "hud.activeNone": "主动技能未同步", "hud.activeAcquire": "升级获取", "hud.activeReady": "左键就绪",
      "result.titleBoss": "突破封锁后失联", "result.titleDefault": "舰体失效", "result.time": "本局时间", "result.kills": "本局击杀", "result.level": "本局等级", "result.score": "本局分数", "result.bestScore": "最高分", "result.bestTime": "最长时间", "result.bestKills": "最高击杀", "result.bestLevel": "最高等级",
      "toast.saveSettingsFailed": "设置保存失败，本次仍会套用", "toast.saveRecordsFailed": "纪录保存失败，但本局可继续游玩", "toast.start": "星舰启动：突破封锁线", "toast.continue": "继续作战：战术系统恢复"
    },
    "zh-TW": {
      "menu.eyebrow": "NEON VOID SURVIVAL", "menu.title": "星艦倖存者",
      "menu.controlMove": "鼠標指針牽引移動", "menu.controlAim": "自動瞄準，自動射擊", "menu.controlSkill": "左鍵觸發主動技能", "menu.controlPause": "P / Esc 暫停", "menu.controlSettings": "O 開啟遊戲設置", "menu.controlReturn": "返回主選單可保留戰局",
      "menu.start": "開始新遊戲", "menu.continue": "繼續遊戲", "menu.settings": "遊戲設置", "records.bestScore": "最高分", "records.bestTime": "最長生存", "records.bestKills": "最高擊殺",
      "level.eyebrow": "SYSTEM UPGRADE", "level.title": "選擇一項強化", "pause.eyebrow": "PAUSED", "pause.title": "戰場暫停", "pause.hint": "按 P 或 Esc 返回戰鬥，按 O 可快速開啟設置。", "pause.resume": "恢復作戰",
      "result.eyebrow": "MISSION REPORT", "result.restart": "重新出擊", "settings.eyebrow": "GAME SETTINGS", "settings.title": "遊戲設置", "settings.tutorial": "遊戲教程", "settings.language": "語言", "settings.volume": "音效音量", "settings.quality": "畫質模式", "settings.qualityHigh": "高畫質", "settings.qualityBalanced": "平衡", "settings.qualityPerformance": "性能優先", "settings.shake": "畫面震動", "settings.motion": "動態掃描效果", "settings.autoPerf": "自動降低特效壓力", "common.back": "返回", "common.backToMenu": "返回主選單",
      "hud.time": "時間", "hud.kills": "擊殺", "hud.level": "等級", "hud.score": "分數", "hud.map": "星域", "hud.hp": "艦體", "hud.shield": "護盾", "hud.xp": "同步經驗", "hud.activeNone": "主動技能未同步", "hud.activeAcquire": "升級獲取", "hud.activeReady": "左鍵就緒",
      "result.titleBoss": "突破封鎖後失聯", "result.titleDefault": "艦體失效", "result.time": "本局時間", "result.kills": "本局擊殺", "result.level": "本局等級", "result.score": "本局分數", "result.bestScore": "最高分", "result.bestTime": "最長時間", "result.bestKills": "最高擊殺", "result.bestLevel": "最高等級",
      "toast.saveSettingsFailed": "設定儲存失敗，本次仍會套用", "toast.saveRecordsFailed": "紀錄儲存失敗，但本局可繼續遊玩", "toast.start": "星艦啟動：突破封鎖線", "toast.continue": "繼續作戰：戰術系統恢復"
    },
    ja: {
      "menu.eyebrow": "ネオン虚空サバイバル", "menu.title": "スターシップ・サバイバー",
      "menu.controlMove": "ポインターに追従して移動", "menu.controlAim": "自動照準・自動射撃", "menu.controlSkill": "左クリックでアクティブスキル", "menu.controlPause": "P / Esc で一時停止", "menu.controlSettings": "O で設定を開く", "menu.controlReturn": "メニューに戻っても現在の出撃を保持",
      "menu.start": "新規ゲーム", "menu.continue": "続きから", "menu.settings": "ゲーム設定", "records.bestScore": "最高スコア", "records.bestTime": "最長生存", "records.bestKills": "最多撃破",
      "level.eyebrow": "システム強化", "level.title": "強化を1つ選択", "pause.eyebrow": "一時停止", "pause.title": "戦闘停止中", "pause.hint": "P または Esc で戦闘に戻る。O で設定をすぐ開けます。", "pause.resume": "戦闘再開",
      "result.eyebrow": "ミッション報告", "result.restart": "再出撃", "settings.eyebrow": "ゲーム設定", "settings.title": "ゲーム設定", "settings.tutorial": "チュートリアル", "settings.language": "言語", "settings.volume": "効果音音量", "settings.quality": "画質モード", "settings.qualityHigh": "高画質", "settings.qualityBalanced": "バランス", "settings.qualityPerformance": "パフォーマンス", "settings.shake": "画面揺れ", "settings.motion": "動的スキャン効果", "settings.autoPerf": "負荷時に演出を自動低減", "common.back": "戻る", "common.backToMenu": "メニューへ戻る",
      "hud.time": "時間", "hud.kills": "撃破", "hud.level": "レベル", "hud.score": "スコア", "hud.map": "宙域", "hud.hp": "船体", "hud.shield": "シールド", "hud.xp": "同期経験", "hud.activeNone": "アクティブ未同期", "hud.activeAcquire": "強化で取得", "hud.activeReady": "左クリック準備完了",
      "result.titleBoss": "突破後に通信途絶", "result.titleDefault": "船体機能停止", "result.time": "出撃時間", "result.kills": "撃破数", "result.level": "到達レベル", "result.score": "スコア", "result.bestScore": "最高スコア", "result.bestTime": "最長時間", "result.bestKills": "最多撃破", "result.bestLevel": "最高レベル",
      "toast.saveSettingsFailed": "設定を保存できませんでしたが、今回は適用されます", "toast.saveRecordsFailed": "記録を保存できませんでしたが、この出撃は続行できます", "toast.start": "スターシップ起動：封鎖線を突破", "toast.continue": "戦闘再開：戦術システム復旧"
    }
  };
  const I18N_DYNAMIC = {
    en: {
      "cat.attack": "Attack", "cat.defense": "Defense", "cat.mobility": "Mobility", "cat.special": "Special", "cat.build": "Build", "cat.primary": "Primary Weapon", "cat.active": "Active Skill", "cat.activeUpgrade": "Active Upgrade", "cat.supply": "Supply",
      "common.levelShort": "Lv.", "common.maxed": "MAX", "skill.progressLabel": "Upgrade progress", "skill.onceActive": "Only one active skill can be synchronized per run.", "skill.activeUpgradeDesc": "Upgrading lowers cooldown and strengthens the effect.", "skill.synced": "{name} synchronized", "skill.released": "{name} released", "skill.notCharged": "Active skill not charged yet", "skill.heal.name": "Emergency Repair", "skill.heal.desc": "Restore 40 hull and gain 500 score.",
      "map.nebula": "Nebula Remnant", "map.asteroid": "Asteroid Ring", "map.storm": "Ion Storm", "map.ruins": "Machine Ruins", "map.enter": "Route entered: {name}",
      "enemy.hunter": "Hunter", "enemy.tank": "Armored Frigate", "enemy.shooter": "Scatter Drone", "enemy.bomber": "Bomber Swarm", "enemy.wisp": "Nebula Wisp", "enemy.burrower": "Rock Drill", "enemy.stormer": "Storm Conductor", "enemy.sentinel": "Ruin Sentinel", "enemy.elite": "Elite Ship", "enemy.boss": "Void Carrier",
      "wave.0": "Hunter swarm approaching", "wave.1": "Armored frigates entering battle", "wave.2": "Scatter drones suppressing fire", "wave.3": "Bomber swarm breached the line", "wave.4": "Void signal rising sharply", "wave.5": "Overload wave intensifying",
      "event.xpComet": "XP comet passing: crystal rain scattered", "event.eliteSignal": "Elite signal shifted: squad incoming", "event.supplyDrop": "Supply pod unlocked: tactical resources deployed", "event.crystalBloom": "Crystal bloom: multi-point XP recovery", "event.unstableCore": "Unstable core detected: detonation possible", "event.magnetPulse": "Magnetic pulse: recovery efficiency boosted", "event.overclockWindow": "Overclock window: weapon core heating", "event.voidTurbulence": "Void turbulence: enemy paths shifted",
      "toast.elite": "Elite ship entering battle", "toast.boss": "Warning: Void Carrier deployed", "toast.bossDefeated": "Void Carrier destroyed: overload waves activated",
      "pickup.heal": "Repair", "pickup.shield": "Shield", "pickup.bomb": "Blast Core", "pickup.magnet": "Magnet", "pickup.overclock": "Overclock", "floating.dodge": "Dodge", "buff.magnetRush": "Magnetic rush active", "buff.overclock": "Weapon overclock active", "buff.dangerReward": "High-risk yield active", "buff.default": "Temporary boost active",
      "active.voidLance.name": "Void Lance", "active.voidLance.desc": "Left click fires a piercing lance for heavy path damage.", "active.gravityWell.name": "Gravity Well", "active.gravityWell.desc": "Left click creates a pulling field at the pointer and deals sustained damage.", "active.phaseBlink.name": "Phase Blink", "active.phaseBlink.desc": "Left click blinks toward the pointer and releases a shockwave.", "active.ionStorm.name": "Ion Storm", "active.ionStorm.desc": "Left click calls multiple ion strikes against nearby enemies.",
      "skill.pulse.name": "Pulse Cannon Upgrade", "skill.pulse.desc": "Increases pulse cannon damage and fire rate.", "skill.split.name": "Split Laser", "skill.split.desc": "Adds scatter barrage and piercing firepower.", "skill.missile.name": "Plasma Missile", "skill.missile.desc": "Unlocks or upgrades tracking missiles.", "skill.nova.name": "Starcore Burst", "skill.nova.desc": "Kills may detonate a starcore blast.", "skill.crit.name": "Critical Calibration", "skill.crit.desc": "Raises critical chance and critical damage.", "skill.shield.name": "Shield Expansion", "skill.shield.desc": "Increases max shield and regeneration.", "skill.repair.name": "Nano Repair", "skill.repair.desc": "Continuously repairs hull.", "skill.phase.name": "Phase Evasion", "skill.phase.desc": "Increases dodge and extends hit protection.", "skill.engine.name": "Engine Overclock", "skill.engine.desc": "Increases movement speed and handling.", "skill.magnet.name": "Magnetic Recovery", "skill.magnet.desc": "Expands XP crystal attraction range.", "skill.drone.name": "Orbital Drone", "skill.drone.desc": "Adds orbital firepower and contact damage.", "skill.emp.name": "EMP Pulse", "skill.emp.desc": "Periodically releases area damage.", "skill.siphonShield.name": "Siphon Shield", "skill.siphonShield.desc": "Kills restore a small amount of shield.", "skill.pickupBurst.name": "Pickup Burst", "skill.pickupBurst.desc": "Consecutive pickups trigger a small area burst.", "skill.closeCombat.name": "Close-Range Eradication", "skill.closeCombat.desc": "Deals bonus damage to nearby enemies.", "skill.lowHpOverdrive.name": "Critical Firepower", "skill.lowHpOverdrive.desc": "Low hull increases damage and fire rate.", "skill.activeBattery.name": "Active Battery", "skill.activeBattery.desc": "Kills may shorten active skill cooldown.", "skill.volatileRounds.name": "Volatile Rounds", "skill.volatileRounds.desc": "Bullet hits may create small explosions.", "skill.railWeapon.name": "Rail Spike Cannon", "skill.railWeapon.desc": "Fires parallel high-speed piercing spikes.", "skill.arcWeapon.name": "Chain Arc", "skill.arcWeapon.desc": "Releases parallel jumping arcs.", "skill.flakWeapon.name": "Greenflame Flak", "skill.flakWeapon.desc": "Fires parallel close-range flak."
    },
    "zh-CN": {
      "cat.attack": "攻击", "cat.defense": "防御", "cat.mobility": "机动", "cat.special": "特殊", "cat.build": "Build", "cat.primary": "主武器", "cat.active": "主动技能", "cat.activeUpgrade": "主动强化", "cat.supply": "补给",
      "common.levelShort": "Lv.", "skill.onceActive": "一局只能同步一个主动技能。", "skill.activeUpgradeDesc": "升级后降低冷却并提高效果。", "skill.synced": "{name} 已同步", "skill.released": "{name} 已释放", "skill.notCharged": "主动技能尚未充能", "skill.heal.name": "紧急修复", "skill.heal.desc": "恢复 40 舰体并获得 500 分。",
      "map.nebula": "星云残域", "map.asteroid": "碎岩环带", "map.storm": "离子风暴", "map.ruins": "机械遗迹", "map.enter": "航道切入：{name}",
      "enemy.hunter": "追猎机", "enemy.tank": "装甲舰", "enemy.shooter": "散射机", "enemy.bomber": "自爆蜂群", "enemy.wisp": "星云幽梭", "enemy.burrower": "碎岩钻机", "enemy.stormer": "雷暴导体", "enemy.sentinel": "遗迹哨兵", "enemy.elite": "精英舰", "enemy.boss": "虚空母舰",
      "wave.0": "追猎机群接近", "wave.1": "装甲舰加入战场", "wave.2": "散射机开始火力压制", "wave.3": "自爆蜂群突破防线", "wave.4": "虚空信号急剧增强", "wave.5": "超载波次持续增强",
      "event.xpComet": "经验彗星掠过：晶体雨散落", "event.eliteSignal": "精英信号偏移：小队突入", "event.supplyDrop": "补给舱解锁：战术物资投放", "event.crystalBloom": "晶体绽放：多点经验回收", "event.unstableCore": "不稳定核心出现：可触发爆裂", "event.magnetPulse": "磁场脉冲：回收效率提升", "event.overclockWindow": "超频窗口：武装核心升温", "event.voidTurbulence": "虚空乱流：敌群路径偏移",
      "toast.elite": "精英舰进入战场", "toast.boss": "警告：虚空母舰登场", "toast.bossDefeated": "虚空母舰已摧毁：超载波次启动",
      "pickup.heal": "修复", "pickup.shield": "护盾", "pickup.bomb": "爆裂核心", "pickup.magnet": "磁力", "pickup.overclock": "超频", "floating.dodge": "闪避", "buff.magnetRush": "磁力奔流启动", "buff.overclock": "武装超频启动", "buff.dangerReward": "高危收益启动", "buff.default": "临时增益启动",
      "active.voidLance.name": "虚空长矛", "active.voidLance.desc": "左键发射穿透长矛，对路径敌人造成高额伤害。", "active.gravityWell.name": "重力井", "active.gravityWell.desc": "左键在鼠标位置生成牵引力场并持续伤害。", "active.phaseBlink.name": "相位闪烁", "active.phaseBlink.desc": "左键向鼠标方向短距离闪烁并释放冲击波。", "active.ionStorm.name": "离子风暴", "active.ionStorm.desc": "左键呼叫多道离子雷击打击附近敌人。"
    },
    "zh-TW": {
      "cat.attack": "攻擊", "cat.defense": "防禦", "cat.mobility": "機動", "cat.special": "特殊", "cat.build": "Build", "cat.primary": "主武器", "cat.active": "主動技能", "cat.activeUpgrade": "主動強化", "cat.supply": "補給",
      "common.levelShort": "Lv.", "skill.onceActive": "一局只能同步一個主動技能。", "skill.activeUpgradeDesc": "升級後降低冷卻並提高效果。", "skill.synced": "{name} 已同步", "skill.released": "{name} 已釋放", "skill.notCharged": "主動技能尚未充能", "skill.heal.name": "緊急修復", "skill.heal.desc": "恢復 40 艦體並獲得 500 分。",
      "map.nebula": "星雲殘域", "map.asteroid": "碎岩環帶", "map.storm": "離子風暴", "map.ruins": "機械遺跡", "map.enter": "航道切入：{name}",
      "enemy.hunter": "追獵機", "enemy.tank": "裝甲艦", "enemy.shooter": "散射機", "enemy.bomber": "自爆蜂群", "enemy.wisp": "星雲幽梭", "enemy.burrower": "碎岩鑽機", "enemy.stormer": "雷暴導體", "enemy.sentinel": "遺跡哨兵", "enemy.elite": "菁英艦", "enemy.boss": "虛空母艦",
      "wave.0": "追獵機群接近", "wave.1": "裝甲艦加入戰場", "wave.2": "散射機開始火力壓制", "wave.3": "自爆蜂群突破防線", "wave.4": "虛空訊號急遽增強", "wave.5": "超載波次持續增強",
      "event.xpComet": "經驗彗星掠過：晶體雨散落", "event.eliteSignal": "菁英訊號偏移：小隊突入", "event.supplyDrop": "補給艙解鎖：戰術物資投放", "event.crystalBloom": "晶體綻放：多點經驗回收", "event.unstableCore": "不穩定核心出現：可觸發爆裂", "event.magnetPulse": "磁場脈衝：回收效率提升", "event.overclockWindow": "超頻窗口：武裝核心升溫", "event.voidTurbulence": "虛空亂流：敵群路徑偏移",
      "toast.elite": "菁英艦進入戰場", "toast.boss": "警告：虛空母艦登場", "toast.bossDefeated": "虛空母艦已摧毀：超載波次啟動",
      "pickup.heal": "修復", "pickup.shield": "護盾", "pickup.bomb": "爆裂核心", "pickup.magnet": "磁力", "pickup.overclock": "超頻", "floating.dodge": "閃避", "buff.magnetRush": "磁力奔流啟動", "buff.overclock": "武裝超頻啟動", "buff.dangerReward": "高危收益啟動", "buff.default": "臨時增益啟動",
      "active.voidLance.name": "虛空長矛", "active.voidLance.desc": "左鍵發射穿透長矛，對路徑敵人造成高額傷害。", "active.gravityWell.name": "重力井", "active.gravityWell.desc": "左鍵在鼠標位置生成牽引力場並持續傷害。", "active.phaseBlink.name": "相位閃爍", "active.phaseBlink.desc": "左鍵向鼠標方向短距離閃爍並釋放衝擊波。", "active.ionStorm.name": "離子風暴", "active.ionStorm.desc": "左鍵呼叫多道離子雷擊打擊附近敵人。"
    },
    ja: {
      "cat.attack": "攻撃", "cat.defense": "防御", "cat.mobility": "機動", "cat.special": "特殊", "cat.build": "ビルド", "cat.primary": "主武器", "cat.active": "アクティブ", "cat.activeUpgrade": "アクティブ強化", "cat.supply": "補給",
      "common.levelShort": "Lv.", "common.maxed": "MAX", "skill.progressLabel": "強化進行度", "skill.onceActive": "1回の出撃で同期できるアクティブスキルは1つだけです。", "skill.activeUpgradeDesc": "強化するとクールダウンが短縮され、効果が上昇します。", "skill.synced": "{name} を同期しました", "skill.released": "{name} を発動", "skill.notCharged": "アクティブスキルはまだチャージ中", "skill.heal.name": "緊急修理", "skill.heal.desc": "船体を40回復し、500スコアを獲得。",
      "map.nebula": "星雲残域", "map.asteroid": "砕岩リング", "map.storm": "イオン嵐", "map.ruins": "機械遺跡", "map.enter": "航路突入：{name}",
      "enemy.hunter": "ハンター", "enemy.tank": "装甲艦", "enemy.shooter": "散射機", "enemy.bomber": "自爆群", "enemy.wisp": "星雲ウィスプ", "enemy.burrower": "砕岩ドリル", "enemy.stormer": "雷暴導体", "enemy.sentinel": "遺跡センチネル", "enemy.elite": "エリート艦", "enemy.boss": "虚空母艦",
      "wave.0": "ハンター群接近", "wave.1": "装甲艦が戦場に参加", "wave.2": "散射機が制圧射撃開始", "wave.3": "自爆群が防衛線を突破", "wave.4": "虚空信号が急上昇", "wave.5": "オーバーロード波が強化中",
      "event.xpComet": "経験彗星通過：結晶雨が散布", "event.eliteSignal": "エリート信号偏移：小隊突入", "event.supplyDrop": "補給ポッド解放：戦術物資投下", "event.crystalBloom": "結晶開花：多点経験回収", "event.unstableCore": "不安定コア出現：爆裂可能", "event.magnetPulse": "磁場パルス：回収効率上昇", "event.overclockWindow": "オーバークロック窓：武装コア加熱", "event.voidTurbulence": "虚空乱流：敵群経路変化",
      "toast.elite": "エリート艦が戦場に進入", "toast.boss": "警告：虚空母艦出現", "toast.bossDefeated": "虚空母艦撃破：オーバーロード波起動",
      "pickup.heal": "修理", "pickup.shield": "シールド", "pickup.bomb": "爆裂コア", "pickup.magnet": "磁力", "pickup.overclock": "オーバークロック", "floating.dodge": "回避", "buff.magnetRush": "磁力奔流起動", "buff.overclock": "武装オーバークロック起動", "buff.dangerReward": "高危険報酬起動", "buff.default": "一時強化起動",
      "active.voidLance.name": "虚空ランス", "active.voidLance.desc": "左クリックで貫通ランスを放ち、経路上の敵に大ダメージ。", "active.gravityWell.name": "重力井戸", "active.gravityWell.desc": "左クリックでポインター位置に牽引フィールドを生成し継続ダメージ。", "active.phaseBlink.name": "位相ブリンク", "active.phaseBlink.desc": "左クリックでポインター方向へ短距離ブリンクし衝撃波を放つ。", "active.ionStorm.name": "イオン嵐", "active.ionStorm.desc": "左クリックで複数のイオン雷撃を呼び、周囲の敵を攻撃。"
    }
  };
  Object.keys(I18N_DYNAMIC).forEach(language => Object.assign(I18N[language], I18N_DYNAMIC[language]));
  Object.assign(I18N["zh-TW"], {
    "skill.pulse.name": "脈衝炮強化", "skill.pulse.desc": "脈衝炮傷害與射速提升。", "skill.split.name": "分裂雷射", "skill.split.desc": "增加散射彈幕與穿透火力。", "skill.missile.name": "等離子飛彈", "skill.missile.desc": "啟用或強化追蹤飛彈。", "skill.nova.name": "星核爆裂", "skill.nova.desc": "擊殺時機率引爆星核。", "skill.crit.name": "暴擊校準", "skill.crit.desc": "提高暴擊率與暴擊傷害。", "skill.shield.name": "護盾擴容", "skill.shield.desc": "提升最大護盾與回復速度。", "skill.repair.name": "奈米修復", "skill.repair.desc": "持續修復艦體。", "skill.phase.name": "相位閃避", "skill.phase.desc": "提高閃避率並延長受擊保護。", "skill.engine.name": "引擎超頻", "skill.engine.desc": "提高移動速度與操控感。", "skill.magnet.name": "磁力回收", "skill.magnet.desc": "擴大經驗晶體吸附範圍。", "skill.drone.name": "環繞無人機", "skill.drone.desc": "增加環繞火力與接觸傷害。", "skill.emp.name": "電磁脈衝", "skill.emp.desc": "週期性釋放範圍傷害。", "skill.siphonShield.name": "虹吸護盾", "skill.siphonShield.desc": "擊殺回復少量護盾。", "skill.pickupBurst.name": "拾取爆裂", "skill.pickupBurst.desc": "連續拾取後觸發小範圍爆裂。", "skill.closeCombat.name": "近距離殲滅", "skill.closeCombat.desc": "對近距離敵人造成額外傷害。", "skill.lowHpOverdrive.name": "臨界火力", "skill.lowHpOverdrive.desc": "低血量時提高傷害與射速。", "skill.activeBattery.name": "主動電池", "skill.activeBattery.desc": "擊殺有機率縮短主動技能冷卻。", "skill.volatileRounds.name": "不穩定彈藥", "skill.volatileRounds.desc": "子彈命中有機率造成小爆裂。", "skill.railWeapon.name": "軌道長釘炮", "skill.railWeapon.desc": "並行發射高速穿透長釘。", "skill.arcWeapon.name": "鏈式電弧", "skill.arcWeapon.desc": "並行釋放跳躍電弧。", "skill.flakWeapon.name": "綠焰霰彈", "skill.flakWeapon.desc": "並行發射近距離霰彈。"
  });
  Object.assign(I18N["zh-CN"], {
    "skill.pulse.name": "脉冲炮强化", "skill.pulse.desc": "脉冲炮伤害与射速提升。", "skill.split.name": "分裂激光", "skill.split.desc": "增加散射弹幕与穿透火力。", "skill.missile.name": "等离子飞弹", "skill.missile.desc": "启用或强化追踪飞弹。", "skill.nova.name": "星核爆裂", "skill.nova.desc": "击杀时概率引爆星核。", "skill.crit.name": "暴击校准", "skill.crit.desc": "提高暴击率与暴击伤害。", "skill.shield.name": "护盾扩容", "skill.shield.desc": "提升最大护盾与回复速度。", "skill.repair.name": "纳米修复", "skill.repair.desc": "持续修复舰体。", "skill.phase.name": "相位闪避", "skill.phase.desc": "提高闪避率并延长受击保护。", "skill.engine.name": "引擎超频", "skill.engine.desc": "提高移动速度与操控感。", "skill.magnet.name": "磁力回收", "skill.magnet.desc": "扩大经验晶体吸附范围。", "skill.drone.name": "环绕无人机", "skill.drone.desc": "增加环绕火力与接触伤害。", "skill.emp.name": "电磁脉冲", "skill.emp.desc": "周期性释放范围伤害。", "skill.siphonShield.name": "虹吸护盾", "skill.siphonShield.desc": "击杀回复少量护盾。", "skill.pickupBurst.name": "拾取爆裂", "skill.pickupBurst.desc": "连续拾取后触发小范围爆裂。", "skill.closeCombat.name": "近距离歼灭", "skill.closeCombat.desc": "对近距离敌人造成额外伤害。", "skill.lowHpOverdrive.name": "临界火力", "skill.lowHpOverdrive.desc": "低血量时提高伤害与射速。", "skill.activeBattery.name": "主动电池", "skill.activeBattery.desc": "击杀有概率缩短主动技能冷却。", "skill.volatileRounds.name": "不稳定弹药", "skill.volatileRounds.desc": "子弹命中有概率造成小爆裂。", "skill.railWeapon.name": "轨道长钉炮", "skill.railWeapon.desc": "并行发射高速穿透长钉。", "skill.arcWeapon.name": "链式电弧", "skill.arcWeapon.desc": "并行释放跳跃电弧。", "skill.flakWeapon.name": "绿焰霰弹", "skill.flakWeapon.desc": "并行发射近距离霰弹。"
  });
  Object.assign(I18N.ja, {
    "skill.pulse.name": "パルス砲強化", "skill.pulse.desc": "パルス砲のダメージと連射速度を上昇。", "skill.split.name": "分裂レーザー", "skill.split.desc": "散射弾幕と貫通火力を追加。", "skill.missile.name": "プラズマミサイル", "skill.missile.desc": "追尾ミサイルを解放または強化。", "skill.nova.name": "星核爆裂", "skill.nova.desc": "撃破時に星核爆発が発生することがある。", "skill.crit.name": "クリティカル調整", "skill.crit.desc": "クリティカル率とダメージを上昇。", "skill.shield.name": "シールド拡張", "skill.shield.desc": "最大シールドと回復速度を上昇。", "skill.repair.name": "ナノ修復", "skill.repair.desc": "船体を継続修復。", "skill.phase.name": "位相回避", "skill.phase.desc": "回避率を上げ、被弾保護を延長。", "skill.engine.name": "エンジン過負荷", "skill.engine.desc": "移動速度と操作性を上昇。", "skill.magnet.name": "磁力回収", "skill.magnet.desc": "経験結晶の吸引範囲を拡大。", "skill.drone.name": "周回ドローン", "skill.drone.desc": "周回火力と接触ダメージを追加。", "skill.emp.name": "電磁パルス", "skill.emp.desc": "周期的に範囲ダメージを放つ。", "skill.siphonShield.name": "サイフォンシールド", "skill.siphonShield.desc": "撃破時に少量のシールドを回復。", "skill.pickupBurst.name": "回収バースト", "skill.pickupBurst.desc": "連続回収で小範囲爆発を発動。", "skill.closeCombat.name": "近距離殲滅", "skill.closeCombat.desc": "近距離の敵に追加ダメージ。", "skill.lowHpOverdrive.name": "臨界火力", "skill.lowHpOverdrive.desc": "船体低下時にダメージと連射速度上昇。", "skill.activeBattery.name": "アクティブ電池", "skill.activeBattery.desc": "撃破時にアクティブスキルの冷却を短縮することがある。", "skill.volatileRounds.name": "不安定弾薬", "skill.volatileRounds.desc": "弾丸命中時に小爆発が発生することがある。", "skill.railWeapon.name": "レールスパイク砲", "skill.railWeapon.desc": "高速貫通スパイクを並行発射。", "skill.arcWeapon.name": "連鎖電弧", "skill.arcWeapon.desc": "跳躍する電弧を並行放出。", "skill.flakWeapon.name": "緑炎散弾", "skill.flakWeapon.desc": "近距離散弾を並行発射。"
  });
  const DEFAULT_SETTINGS = {
    volume: 55,
    quality: "balanced",
    language: "zh-CN",
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
    { from: 0, weights: { hunter: 1 }, messageKey: "wave.0" },
    { from: 35, weights: { hunter: 0.78, tank: 0.22 }, messageKey: "wave.1" },
    { from: 85, weights: { hunter: 0.56, tank: 0.27, shooter: 0.17 }, messageKey: "wave.2" },
    { from: 145, weights: { hunter: 0.42, tank: 0.22, shooter: 0.24, bomber: 0.12 }, messageKey: "wave.3" },
    { from: 215, weights: { hunter: 0.34, tank: 0.2, shooter: 0.28, bomber: 0.18 }, messageKey: "wave.4" },
    { from: 300, weights: { hunter: 0.28, tank: 0.2, shooter: 0.3, bomber: 0.22 }, messageKey: "wave.5" }
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
    backgroundHeight: 0,
    mapTransitionPulse: 0
  };

  const input = {
    mouse: { x: 0, y: 0, active: false, down: false },
    touch: { active: false, startX: 0, startY: 0, x: 0, y: 0 }
  };

  const records = loadRecords();
  const settings = loadSettings();

  const artPalette = {
    playerHull: "#e9fdff",
    playerTrim: "#48f3ff",
    playerCore: "#ffd36a",
    playerDanger: "#ff4b66",
    friendlyPulse: "#38f8ff",
    friendlyRail: "#ffd36a",
    friendlyFlak: "#65ffbd",
    friendlyMissile: "#ff3df2",
    xpCrystal: "#66ffb3",
    shield: "#48f3ff",
    enemyDanger: "#ff315f",
    boss: "#ff2dff",
    void: "#d84cff"
  };

  const enemyTypes = {
    hunter: { nameKey: "enemy.hunter", color: "#ff3b6b", hp: 18, speed: 90, radius: 14, damage: 10, xp: 5, score: 20 },
    tank: { nameKey: "enemy.tank", color: "#ffd166", hp: 70, speed: 45, radius: 23, damage: 18, xp: 12, score: 60 },
    shooter: { nameKey: "enemy.shooter", color: "#9d7bff", hp: 36, speed: 58, radius: 17, damage: 12, xp: 9, score: 45 },
    bomber: { nameKey: "enemy.bomber", color: "#ff8f3d", hp: 24, speed: 118, radius: 16, damage: 26, xp: 8, score: 40 },
    wisp: { nameKey: "enemy.wisp", color: "#48f3ff", hp: 28, speed: 104, radius: 13, damage: 11, xp: 8, score: 38 },
    burrower: { nameKey: "enemy.burrower", color: "#c98743", hp: 54, speed: 74, radius: 19, damage: 17, xp: 11, score: 52 },
    stormer: { nameKey: "enemy.stormer", color: "#d84cff", hp: 42, speed: 68, radius: 18, damage: 14, xp: 10, score: 50 },
    sentinel: { nameKey: "enemy.sentinel", color: "#65ffbd", hp: 64, speed: 52, radius: 21, damage: 16, xp: 13, score: 64 },
    elite: { nameKey: "enemy.elite", color: "#38f8ff", hp: 150, speed: 62, radius: 30, damage: 22, xp: 35, score: 180 },
    boss: { nameKey: "enemy.boss", color: "#ff3df2", hp: 1200, speed: 32, radius: 58, damage: 28, xp: 180, score: 1500 }
  };

  const pickupTypes = {
    xp: { color: artPalette.xpCrystal, radius: 5 },
    heal: { color: "#ff4b66", radius: 7 },
    shield: { color: artPalette.shield, radius: 7 },
    bomb: { color: "#ffd36a", radius: 8 },
    magnet: { color: artPalette.void, radius: 7 },
    overclock: { color: "#ffffff", radius: 7 }
  };
  const enemyProjectileTypes = {
    normal: { color: artPalette.enemyDanger, core: "#fff0f4", warning: "rgba(255, 49, 95, 0.28)" },
    storm: { color: "#ff9d2e", core: "#fff2c7", warning: "rgba(255, 157, 46, 0.3)" },
    boss: { color: artPalette.boss, core: "#ffe5ff", warning: "rgba(255, 45, 255, 0.3)" }
  };

  const enemyVariants = {
    rich: { color: "#66ffb3", chance: 0.045, hp: 1.12, speed: 0.94, xp: 1.9, score: 1.45 },
    swift: { color: "#ffd36a", chance: 0.055, hp: 0.78, speed: 1.28, xp: 1.2, score: 1.25 }
  };

  const maps = [
    { id: "nebula", nameKey: "map.nebula", colors: ["#173d71", "#071626", "#01040b"], accent: "#48f3ff", secondaryAccent: "#8defff", fog: "rgba(72, 243, 255, 0.16)", dust: "rgba(199, 247, 255, 0.18)", debrisColor: "rgba(141, 239, 255, 0.2)", glyphColor: "rgba(72, 243, 255, 0.16)", pattern: "nebula", enemyWeights: { wisp: 0.18 }, starTint: "#c7f7ff" },
    { id: "asteroid", nameKey: "map.asteroid", colors: ["#4a2e15", "#150d08", "#020202"], accent: "#ffd36a", secondaryAccent: "#c98743", fog: "rgba(255, 161, 82, 0.13)", dust: "rgba(255, 211, 106, 0.2)", debrisColor: "rgba(201, 135, 67, 0.32)", glyphColor: "rgba(255, 211, 106, 0.16)", pattern: "asteroid", enemyWeights: { burrower: 0.18 }, starTint: "#ffe2a3" },
    { id: "storm", nameKey: "map.storm", colors: ["#33186f", "#0d0920", "#01020b"], accent: "#d84cff", secondaryAccent: "#ff9d2e", fog: "rgba(216, 76, 255, 0.16)", dust: "rgba(226, 199, 255, 0.18)", debrisColor: "rgba(255, 157, 46, 0.22)", glyphColor: "rgba(216, 76, 255, 0.2)", pattern: "storm", enemyWeights: { stormer: 0.18 }, starTint: "#e2c7ff" },
    { id: "ruins", nameKey: "map.ruins", colors: ["#1d4738", "#081813", "#010706"], accent: "#65ffbd", secondaryAccent: "#48f3ff", fog: "rgba(101, 255, 189, 0.12)", dust: "rgba(186, 255, 223, 0.16)", debrisColor: "rgba(72, 243, 255, 0.18)", glyphColor: "rgba(101, 255, 189, 0.2)", pattern: "ruins", enemyWeights: { sentinel: 0.18 }, starTint: "#baffdf" }
  ];

  const randomEvents = [
    {
      id: "xpComet",
      textKey: "event.xpComet",
      variant: "success",
      weight: () => 1.2,
      trigger: () => {
        for (let i = 0; i < 4; i++) dropPickup("xp", rand(80, state.width - 80), rand(90, state.height - 90), 18 + Math.floor(state.elapsed / 45), 2);
      }
    },
    {
      id: "eliteSignal",
      textKey: "event.eliteSignal",
      variant: "warning",
      weight: context => context.pressure > 0.82 ? 0.35 : 0.9,
      trigger: () => {
        const count = state.elapsed > 180 ? 2 : 1;
        for (let i = 0; i < count; i++) spawnEnemy(Math.random() < 0.5 ? "shooter" : "tank");
      }
    },
    {
      id: "supplyDrop",
      textKey: "event.supplyDrop",
      variant: "success",
      weight: context => context.hpRatio < 0.55 || context.shieldRatio < 0.35 ? 1.25 : 0.65,
      trigger: () => {
        dropPickup(Math.random() < 0.5 ? "heal" : "shield", rand(90, state.width - 90), rand(90, state.height - 90), 1, 1);
      }
    },
    {
      id: "crystalBloom",
      textKey: "event.crystalBloom",
      variant: "success",
      weight: () => 0.82,
      trigger: () => {
        for (let i = 0; i < 6; i++) dropPickup("xp", rand(70, state.width - 70), rand(80, state.height - 80), 10 + Math.floor(state.elapsed / 70), 1);
      }
    },
    {
      id: "unstableCore",
      textKey: "event.unstableCore",
      variant: "warning",
      weight: context => context.pressure > 0.72 ? 0.95 : 0.55,
      trigger: () => dropPickup("bomb", rand(90, state.width - 90), rand(90, state.height - 90), 2, 1)
    },
    {
      id: "magnetPulse",
      textKey: "event.magnetPulse",
      variant: "info",
      weight: () => 0.68,
      trigger: () => dropPickup("magnet", rand(90, state.width - 90), rand(90, state.height - 90), 1, 1)
    },
    {
      id: "overclockWindow",
      textKey: "event.overclockWindow",
      variant: "success",
      weight: context => context.bossActive ? 0.85 : 0.52,
      trigger: () => dropPickup("overclock", rand(90, state.width - 90), rand(90, state.height - 90), 1, 1)
    },
    {
      id: "voidTurbulence",
      textKey: "event.voidTurbulence",
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
      nameKey: "active.voidLance.name",
      categoryKey: "cat.active",
      cooldown: level => Math.max(5.8, 9.5 - level * 0.8),
      descKey: "active.voidLance.desc"
    },
    {
      id: "gravityWell",
      nameKey: "active.gravityWell.name",
      categoryKey: "cat.active",
      cooldown: level => Math.max(7.5, 12 - level * 0.9),
      descKey: "active.gravityWell.desc"
    },
    {
      id: "phaseBlink",
      nameKey: "active.phaseBlink.name",
      categoryKey: "cat.active",
      cooldown: level => Math.max(4.8, 8.5 - level * 0.7),
      descKey: "active.phaseBlink.desc"
    },
    {
      id: "ionStorm",
      nameKey: "active.ionStorm.name",
      categoryKey: "cat.active",
      cooldown: level => Math.max(8.5, 13.5 - level),
      descKey: "active.ionStorm.desc"
    }
  ];

  const skills = [
    { id: "pulse", categoryKey: "cat.attack", rarity: "common", tags: ["attack", "weapon"], weight: 1.1, max: 6, apply: p => { p.pulseLevel++; p.damageMult += 0.12; p.fireRateMult += 0.08; } },
    { id: "split", categoryKey: "cat.attack", rarity: "common", tags: ["attack", "weapon"], weight: 1, max: 5, apply: p => { p.splitLevel++; p.damageMult += 0.05; } },
    { id: "missile", categoryKey: "cat.attack", rarity: "rare", tags: ["attack", "weapon"], weight: 0.86, max: 5, apply: p => { p.missileLevel++; } },
    { id: "nova", categoryKey: "cat.attack", rarity: "rare", tags: ["attack", "trigger"], weight: 0.78, max: 4, apply: p => { p.novaLevel++; } },
    { id: "crit", categoryKey: "cat.attack", rarity: "common", tags: ["attack"], weight: 0.94, max: 5, apply: p => { p.crit += 0.08; p.critDamage += 0.12; } },
    { id: "shield", categoryKey: "cat.defense", rarity: "common", tags: ["defense"], weight: 1, max: 5, apply: p => { p.shieldLevel++; p.maxShield += 18; p.shieldRegen += 1.4; p.shield = p.maxShield; } },
    { id: "repair", categoryKey: "cat.defense", rarity: "common", tags: ["defense"], weight: 0.9, max: 4, apply: p => { p.repairLevel++; p.hp = Math.min(p.maxHp, p.hp + 25); } },
    { id: "phase", categoryKey: "cat.defense", rarity: "rare", tags: ["defense", "mobility"], weight: 0.72, max: 4, apply: p => { p.dodge += 0.07; p.invulnBonus += 0.08; } },
    { id: "engine", categoryKey: "cat.mobility", rarity: "common", tags: ["mobility"], weight: 0.92, max: 5, apply: p => { p.speed += 22; } },
    { id: "magnet", categoryKey: "cat.mobility", rarity: "common", tags: ["pickup"], weight: 0.9, max: 5, apply: p => { p.pickupRange += 38; } },
    { id: "drone", categoryKey: "cat.special", rarity: "rare", tags: ["attack", "special"], weight: 0.76, max: 5, apply: p => { p.droneLevel++; } },
    { id: "emp", categoryKey: "cat.special", rarity: "rare", tags: ["attack", "special"], weight: 0.72, max: 5, apply: p => { p.empLevel++; p.empCooldown = Math.max(2.2, p.empCooldown - 0.18); } },
    { id: "siphonShield", categoryKey: "cat.build", rarity: "rare", tags: ["defense", "trigger"], weight: 0.7, max: 4, apply: p => { p.siphonLevel++; } },
    { id: "pickupBurst", categoryKey: "cat.build", rarity: "rare", tags: ["pickup", "attack"], weight: 0.68, max: 4, apply: p => { p.pickupBurstLevel++; } },
    { id: "closeCombat", categoryKey: "cat.build", rarity: "common", tags: ["attack"], weight: 0.82, max: 4, apply: p => { p.closeCombatLevel++; } },
    { id: "lowHpOverdrive", categoryKey: "cat.build", rarity: "epic", tags: ["attack", "defense"], weight: 0.46, max: 3, apply: p => { p.lowHpOverdriveLevel++; } },
    { id: "activeBattery", categoryKey: "cat.build", rarity: "rare", tags: ["active", "trigger"], weight: 0.72, max: 4, apply: p => { p.activeBatteryLevel++; } },
    { id: "volatileRounds", categoryKey: "cat.build", rarity: "epic", tags: ["attack", "trigger"], weight: 0.42, max: 3, apply: p => { p.volatileRoundsLevel++; } },
    { id: "railWeapon", categoryKey: "cat.primary", rarity: "rare", tags: ["attack", "weapon"], weight: 0.72, max: 4, apply: p => { p.primaryWeapons.rail++; } },
    { id: "arcWeapon", categoryKey: "cat.primary", rarity: "rare", tags: ["attack", "weapon"], weight: 0.68, max: 4, apply: p => { p.primaryWeapons.arc++; } },
    { id: "flakWeapon", categoryKey: "cat.primary", rarity: "common", tags: ["attack", "weapon"], weight: 0.78, max: 4, apply: p => { p.primaryWeapons.flak++; } }
  ];

  function normalizeRecords(value) {
    value = value || {};
    return {
      score: Number.isFinite(value.score) ? value.score : 0,
      time: Number.isFinite(value.time) ? value.time : 0,
      kills: Number.isFinite(value.kills) ? value.kills : 0,
      level: Number.isFinite(value.level) ? value.level : 1
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
    value = value || {};
    return {
      volume: clamp(Number.isFinite(value.volume) ? value.volume : DEFAULT_SETTINGS.volume, 0, 100),
      quality: QUALITY_PRESETS[value.quality] ? value.quality : DEFAULT_SETTINGS.quality,
      language: LANGUAGES.includes(value.language) ? value.language : DEFAULT_SETTINGS.language,
      shake: typeof value.shake === "boolean" ? value.shake : DEFAULT_SETTINGS.shake,
      motion: typeof value.motion === "boolean" ? value.motion : DEFAULT_SETTINGS.motion,
      autoPerf: typeof value.autoPerf === "boolean" ? value.autoPerf : DEFAULT_SETTINGS.autoPerf
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
      showToast(t("toast.saveSettingsFailed"), 1.8, "warning");
    }
  }

  function getQualityPreset() {
    return QUALITY_PRESETS[settings.quality] || QUALITY_PRESETS.balanced;
  }

  function t(key, replacements) {
    const bundle = I18N[settings.language] || I18N[DEFAULT_SETTINGS.language];
    let text = bundle[key] || I18N[DEFAULT_SETTINGS.language][key] || key;
    if (replacements) {
      Object.keys(replacements).forEach(name => {
        text = text.replaceAll(`{${name}}`, replacements[name]);
      });
    }
    return text;
  }

  function getActiveSkillName(skill) {
    return skill ? t(skill.nameKey || `active.${skill.id}.name`) : "";
  }

  function getActiveSkillDescription(skill, level) {
    return skill ? t(skill.descKey || `active.${skill.id}.desc`, { level }) : "";
  }

  function getSkillName(skill) {
    return t(skill.nameKey || `skill.${skill.id}.name`);
  }

  function getSkillCategory(skill) {
    return t(skill.categoryKey || "cat.build");
  }

  function getSkillDescription(skill, level) {
    if (skill.desc) return skill.desc(level);
    return t(skill.descKey || `skill.${skill.id}.desc`, { level });
  }

  function getMapName(map = getCurrentMap()) {
    return t(map.nameKey || `map.${map.id}`);
  }

  function applyLanguage() {
    const meta = LANGUAGE_META[settings.language] || LANGUAGE_META[DEFAULT_SETTINGS.language];
    document.documentElement.lang = meta.htmlLang;
    document.title = meta.title;
    canvas.setAttribute("aria-label", meta.canvasLabel);
    document.querySelectorAll("[data-i18n]").forEach(element => {
      element.textContent = t(element.dataset.i18n);
    });
    document.querySelector(".brand-mark").textContent = t("menu.title");
    updateHudLabels();
    updateMenuState();
    if (state.player) updateHud();
  }

  function updateHudLabels() {
    document.querySelector(".stat-line span:nth-child(1)").firstChild.textContent = `${t("hud.time")} `;
    document.querySelector(".stat-line span:nth-child(2)").firstChild.textContent = `${t("hud.kills")} `;
    document.querySelector(".stat-line span:nth-child(3)").firstChild.textContent = `${t("hud.level")} `;
    document.querySelector(".stat-line span:nth-child(4)").firstChild.textContent = `${t("hud.score")} `;
    document.querySelector(".stat-line span:nth-child(5)").firstChild.textContent = `${t("hud.map")} `;
  }

  function syncSettingsUi() {
    ui.languageSelect.value = settings.language;
    ui.volumeControl.value = Math.round(settings.volume).toString();
    ui.qualitySelect.value = settings.quality;
    ui.shakeToggle.checked = settings.shake;
    ui.motionToggle.checked = settings.motion;
    ui.autoPerfToggle.checked = settings.autoPerf;
  }

  function applySettings({ resizeCanvas = false } = {}) {
    const reducedBySystem = mediaQuery.matches;
    const pressureReduced = settings.autoPerf && (state.enemies.length > BALANCE.enemyMaxCap * 0.72 || state.projectiles.length + state.enemyProjectiles.length > (BALANCE.maxPlayerProjectiles + BALANCE.maxEnemyProjectiles) * 0.65);
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
      showToast(t("toast.saveRecordsFailed"));
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
      alpha: rand(0.25, 0.9),
      layer: rand(0.4, 1.4),
      twinkle: rand(0, TAU),
      drift: rand(-4, 4)
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
    state.mapTransitionPulse = 0;
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
    showToast(t("toast.start"), 2.1, "success");
  }

  function continueGame() {
    if (!canContinueGame()) return;
    initAudio();
    setMode("playing");
    updateHud();
    showToast(t("toast.continue"), 1.6, "success");
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
    ui.mapValue.textContent = getMapName();
    ui.xpFill.style.width = `${clamp((p.xp / p.xpToNext) * 100, 0, 100)}%`;
    updateUiState();
  }

  function getActiveSkillChargeState(p) {
    if (!p || !p.activeSkillId) return { ready: false, priming: false, intensity: 0 };
    normalizeActiveSkillState(p);
    const ready = p.activeCharges > 0 && p.activeCooldown <= 0;
    if (ready) return { ready: true, priming: false, intensity: 1 };
    const remaining = Math.max(0, p.activeCooldown);
    if (remaining > 3) return { ready: false, priming: false, intensity: 0 };
    const intensity = clamp(1 - Math.floor(Math.ceil(remaining)) / 3 + 1 / 3, 0.34, 1);
    return { ready: false, priming: true, intensity };
  }

  function updateUiState() {
    const p = state.player;
    const bossActive = state.enemies.some(enemy => enemy.type === "boss");
    const charge = getActiveSkillChargeState(p);
    gameShell.classList.toggle("is-critical", Boolean(p && p.hp / p.maxHp < 0.3));
    gameShell.classList.toggle("is-boss-alert", bossActive);
    gameShell.classList.toggle("is-shield-down", Boolean(p && p.shield <= 0));
    gameShell.classList.toggle("is-active-ready", charge.ready);
    gameShell.classList.toggle("is-active-priming", charge.priming);
    gameShell.style.setProperty("--active-edge-opacity", (0.18 + charge.intensity * 0.58).toFixed(2));
    gameShell.style.setProperty("--active-edge-size", `${Math.round(24 + charge.intensity * 40)}px`);
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
    state.levelPulse = Math.max(0, state.levelPulse - dt * 1.5);
    state.hitPulse = Math.max(0, state.hitPulse - dt * 2.6);
    state.mapTransitionPulse = Math.max(0, state.mapTransitionPulse - dt * 0.8);
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
    normalizeActiveSkillState(p);
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
      const origin = current;
      chained.add(current);
      damageEnemy(current, damage.amount * (1 - i * 0.12), damage.crit);
      if (!motion.reduced && !isPerfStressed()) createRing(current.x, current.y, 18 + i * 3, "#d84cff");
      const maxChainDistance = 145 * 145;
      const chainLimit = isPerfStressed() ? Math.min(18, state.enemies.length) : state.enemies.length;
      current = null;
      for (let j = 0; j < chainLimit; j++) {
        const enemy = state.enemies[j];
        if (!chained.has(enemy) && distanceSquared(enemy, origin) < maxChainDistance) {
          current = enemy;
          break;
        }
      }
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
      enemy._sepTick = (enemy._sepTick || 0) + 1;
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
      if (!isPerfStressed() || enemy._sepTick % 2 === 0) separateEnemy(enemy, dt);
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
    const maxChecks = isPerfStressed() ? 5 : 10;
    const start = state.enemies.length > 1 ? Math.floor(((enemy.x * 13 + enemy.y * 7) % state.enemies.length + state.enemies.length) % state.enemies.length) : 0;
    const length = state.enemies.length;
    for (let i = 0; i < length && checks <= maxChecks; i++) {
      const other = state.enemies[(start + i) % length];
      if (other === enemy) continue;
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
    const activeEnemies = state.enemies.filter(enemy => enemy.x > -90 && enemy.y > -90 && enemy.x < state.width + 90 && enemy.y < state.height + 90);
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
      for (const enemy of activeEnemies) {
        if (projectile.life <= 0) break;
        const hitRange = projectile.radius + enemy.radius;
        if (Math.abs(projectile.x - enemy.x) > hitRange || Math.abs(projectile.y - enemy.y) > hitRange) continue;
        if (distanceSquared(projectile, enemy) < hitRange * hitRange) {
          damageEnemy(enemy, projectile.damage.amount, projectile.damage.crit);
          if (state.player.volatileRoundsLevel > 0 && Math.random() < 0.025 + state.player.volatileRoundsLevel * 0.018 && !isPerfStressed() && state.particles.length < getParticleLimit() * 0.75) {
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
    const projectileStyle = enemy.type === "boss" ? enemyProjectileTypes.boss : enemy.type === "stormer" || enemy.type === "sentinel" ? enemyProjectileTypes.storm : enemyProjectileTypes.normal;
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
        color: projectileStyle.color,
        coreColor: projectileStyle.core,
        warningColor: projectileStyle.warning
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
    showToast(t(WAVES[nextIndex].messageKey), 2.5, "warning");
  }

  function updateMapDirector() {
    if (state.mapTimer > 0) return;
    const pool = maps.map((_, index) => index).filter(index => index !== state.currentMapIndex);
    const nextIndex = pool[Math.floor(Math.random() * pool.length)];
    state.currentMapIndex = Number.isFinite(nextIndex) ? nextIndex : 0;
    state.mapTimer = BALANCE.mapSegmentDuration + rand(-12, 16);
    state.mapHistory.push(nextIndex);
    if (state.mapHistory.length > 6) state.mapHistory.shift();
    const map = getCurrentMap();
    createStars();
    invalidateBackgroundCache();
    addEventMessage(t("map.enter", { name: getMapName(map) }), "info");
    state.levelPulse = 1;
    state.mapTransitionPulse = 1;
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
    addEventMessage(t(event.textKey), event.variant);
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
      showToast(t("toast.elite"), 2.1, "warning");
      state.eliteTimer = Math.max(BALANCE.eliteMinimumInterval, BALANCE.eliteBaseInterval - state.elapsed / 14);
    }
    if (!state.bossSpawned && state.elapsed >= BALANCE.bossSpawnTime) {
      spawnEnemy("boss");
      state.bossSpawned = true;
      state.shake = Math.max(state.shake, 4.2);
      showToast(t("toast.boss"), 3, "danger");
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
      name: t(spec.nameKey),
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
    const closeBonus = p && p.closeCombatLevel > 0 && distance(p, enemy) < 170 ? 1 + p.closeCombatLevel * 0.1 : 1;
    enemy.hp -= amount * closeBonus;
    enemy.flash = 0.08;
    if (!isPerfStressed() || crit || amount > 20) addFloatingText(enemy.x, enemy.y - enemy.radius, Math.ceil(amount * closeBonus).toString(), crit ? "#ffd166" : "#e8fbff");
    if (!isPerfStressed()) for (let i = 0; i < 2; i++) addParticle(enemy.x, enemy.y, enemy.color, rand(20, 90));
    playSound("hit");
  }

  function killEnemy(enemy) {
    if (enemy._dead) return;
    enemy._dead = true;
    state.kills++;
    state.score += enemy.score;
    if (state.player.siphonLevel > 0) state.player.shield = Math.min(state.player.maxShield, state.player.shield + 2.5 + state.player.siphonLevel * 2.5);
    if (state.player.activeBatteryLevel > 0 && state.player.activeSkillId && Math.random() < 0.12 + state.player.activeBatteryLevel * 0.04) {
      state.player.activeCooldown = Math.max(0, state.player.activeCooldown - (0.9 + state.player.activeBatteryLevel * 0.35));
      normalizeActiveSkillState(state.player);
    }
    dropXp(enemy.x, enemy.y, enemy.xp, enemy.type === "boss" ? 12 : enemy.type === "elite" ? 5 : 1);
    createExplosion(enemy.x, enemy.y, enemy.radius * 2.4, enemy.type === "boss" ? 60 : 0, true);
    if (state.player.novaLevel > 0 && Math.random() < 0.18 + state.player.novaLevel * 0.08) {
      createExplosion(enemy.x, enemy.y, 70 + state.player.novaLevel * 20, 24 + state.player.novaLevel * 12);
    }
    if (enemy.type === "boss") {
      state.bossDefeated = true;
      state.overload = true;
      state.score += 3000;
      showToast(t("toast.bossDefeated"), 3.4, "success");
      addXp(160);
    }
    playSound("boom");
  }

  function createExplosion(x, y, radius, damage = 0, visualOnly = false) {
    state.shake = Math.max(state.shake, settings.shake ? Math.min(5.2, radius / 18) : 0);
    createRing(x, y, radius, artPalette.boss);
    if (!isPerfStressed()) createRing(x, y, radius * 0.58, artPalette.friendlyPulse);
    const particleBudget = getParticleLimit();
    const pressureScale = getPerfLoad() > 0.9 ? 0.42 : getPerfLoad() > 0.72 ? 0.62 : 1;
    const particleCount = Math.floor((motion.reduced ? Math.min(8, radius / 5) : Math.min(28, radius / 2.6)) * pressureScale);
    if (state.particles.length < particleBudget) {
      for (let i = 0; i < particleCount; i++) addParticle(x, y, i % 2 ? "#38f8ff" : "#ff3df2", rand(70, 230));
    }
    if (!visualOnly && damage > 0) {
      state.enemies.forEach(enemy => {
        if (distance({ x, y }, enemy) < radius + enemy.radius) damageEnemy(enemy, damage, false);
      });
      if (distance({ x, y }, state.player) < radius + state.player.radius) damagePlayer(damage * 0.4, { invulnerability: 0.28 });
    }
  }

  function createRing(x, y, radius, color) {
    const limit = getParticleLimit();
    if (state.particles.length >= limit) state.particles.shift();
    const life = isPerfStressed() ? 0.28 : 0.42;
    state.particles.push({ x, y, vx: 0, vy: 0, radius: 8, maxRadius: radius, life, maxLife: life, color, type: "ring", grow: radius * (isPerfStressed() ? 3.2 : 2.6) });
  }

  function addParticle(x, y, color, speed, life = 0.72, radius = 0) {
    const limit = getParticleLimit();
    if (state.particles.length >= limit) return;
    const a = Math.random() * TAU;
    const maxLife = isPerfStressed() ? Math.min(life, 0.42) : life;
    state.particles.push({
      x,
      y,
      vx: Math.cos(a) * speed,
      vy: Math.sin(a) * speed,
      radius: radius || rand(1.2, isPerfStressed() ? 2.8 : 4.2),
      life: rand(0.22, maxLife),
      maxLife,
      color,
      type: "spark",
      grow: -1.4
    });
  }

  function addFloatingText(x, y, text, color) {
    if (isPerfStressed() && state.floatingTexts.length > 14 && Math.random() < 0.65) return;
    if (state.floatingTexts.length >= MAX_FLOATING_TEXTS) state.floatingTexts.shift();
    state.floatingTexts.push({ x, y, text, color, life: 0.58, maxLife: 0.58, alpha: 1 });
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
      addFloatingText(p.x, p.y - 26, t("pickup.shield"), "#48f3ff");
    }
    if (type === "bomb") {
      addFloatingText(p.x, p.y - 26, "爆裂核心", "#ffd36a");
      createExplosion(p.x, p.y, 120 + pickup.value * 12, 42 + pickup.value * 10);
    }
    if (type === "magnet") {
      addFloatingText(p.x, p.y - 26, t("pickup.magnet"), "#d84cff");
      addBuff("magnetRush", 10, { pickupBonus: 180 });
    }
    if (type === "overclock") {
      addFloatingText(p.x, p.y - 26, t("pickup.overclock"), "#ffffff");
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

  function normalizeActiveSkillState(p) {
    if (!p || !p.activeSkillId) return;
    if (p.activeCooldown <= 0) {
      p.activeCooldown = 0;
      if (p.activeCharges < 1) p.activeCharges = p.activeMaxCharges;
    } else if (p.activeCharges > 0) {
      p.activeCharges = 0;
    }
  }

  function isActiveSkillReady(p) {
    normalizeActiveSkillState(p);
    return Boolean(p && p.activeSkillId && p.activeCharges > 0 && p.activeCooldown <= 0);
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
    p.activeCooldown = isActiveSkillReady(p) ? 0 : Math.min(p.activeCooldown, p.activeCooldownMax);
    normalizeActiveSkillState(p);
  }

  function useActiveSkill() {
    const p = state.player;
    if (!p || state.mode !== "playing" || !p.activeSkillId) return;
    normalizeActiveSkillState(p);
    if (!isActiveSkillReady(p)) {
      if (state.activeToastCooldown <= 0) {
        showToast(t("skill.notCharged"), 0.9, "warning");
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
    normalizeActiveSkillState(p);
    updateHud();
    showToast(t("skill.released", { name: getActiveSkillName(skill) }), 1.2, "success");
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
    state.particles.push({ x: p.x, y: p.y, vx: Math.cos(a) * length, vy: Math.sin(a) * length, radius: width, life: 0.22, maxLife: 0.22, color: artPalette.friendlyPulse, type: "beam" });
    createRing(p.x, p.y, 42 + p.activeSkillLevel * 8, artPalette.friendlyPulse);
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
    createRing(target.x, target.y, radius, artPalette.void);
    createRing(target.x, target.y, radius * 0.42, "#8d5cff");
    if (!motion.reduced) {
      for (let i = 0; i < 8; i++) {
        const a = i * TAU / 8 + state.elapsed;
        state.particles.push({ x: target.x + Math.cos(a) * radius * 0.35, y: target.y + Math.sin(a) * radius * 0.35, vx: -Math.cos(a) * 90, vy: -Math.sin(a) * 90, radius: 2.4, life: 0.5, maxLife: 0.5, color: artPalette.void, type: "spark", grow: -1.2 });
      }
    }
    state.levelPulse = 1;
  }

  function castPhaseBlink(target) {
    const p = state.player;
    const a = angleTo(p, target);
    const range = 150 + p.activeSkillLevel * 24;
    const from = { x: p.x, y: p.y };
    p.x = clamp(p.x + Math.cos(a) * range, 26, state.width - 26);
    p.y = clamp(p.y + Math.sin(a) * range, 26, state.height - 26);
    p.invuln = 0.45 + p.activeSkillLevel * 0.08;
    createRing(from.x, from.y, 46 + p.activeSkillLevel * 12, artPalette.void);
    createExplosion(p.x, p.y, 86 + p.activeSkillLevel * 22, 34 + p.activeSkillLevel * 18);
    state.levelPulse = 1;
  }

  function castIonStorm() {
    const p = state.player;
    const strikes = 5 + p.activeSkillLevel * 2;
    const damage = (36 + p.activeSkillLevel * 16) * p.damageMult;
    const targets = [...state.enemies].sort((a, b) => distance(p, a) - distance(p, b)).slice(0, strikes);
    createRing(p.x, p.y, 150 + p.activeSkillLevel * 24, artPalette.playerCore);
    createRing(p.x, p.y, 88 + p.activeSkillLevel * 16, artPalette.friendlyPulse);
    if (targets.length === 0) {
      const bolts = motion.reduced ? 4 : Math.min(10, strikes + 2);
      for (let i = 0; i < bolts; i++) {
        const a = i * TAU / bolts + state.elapsed;
        const x = p.x + Math.cos(a) * (76 + p.activeSkillLevel * 16);
        const y = p.y + Math.sin(a) * (76 + p.activeSkillLevel * 16);
        state.particles.push({ x, y: y - 120, vx: 0, vy: 170, radius: 3.5 + p.activeSkillLevel, life: 0.24, maxLife: 0.24, color: artPalette.playerCore, type: "beam" });
        addParticle(x, y, artPalette.playerCore, 16, 0.45, 2.8);
      }
      state.levelPulse = 1;
      return;
    }
    targets.forEach(enemy => {
      damageEnemy(enemy, damage, Math.random() < 0.35);
      createRing(enemy.x, enemy.y, 34 + p.activeSkillLevel * 6, artPalette.playerCore);
      state.particles.push({ x: enemy.x, y: enemy.y - 140, vx: 0, vy: 160, radius: 4 + p.activeSkillLevel, life: 0.22, maxLife: 0.22, color: artPalette.playerCore, type: "beam" });
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
      const current = getUpgradeCurrentLevel(skill);
      button.className = "upgrade-card";
      button.type = "button";
      button.dataset.rarity = skill.rarity || "common";
      category.textContent = getSkillCategory(skill);
      name.textContent = getSkillName(skill);
      description.textContent = getSkillDescription(skill, current);
      button.append(category, name, createSkillProgress(skill, current), description);
      button.addEventListener("click", () => selectUpgrade(skill));
      ui.upgradeOptions.appendChild(button);
    });
    setMode("levelUp");
    playSound("level");
  }

  function getUpgradeCurrentLevel(skill) {
    if (skill.sourceActiveId) return state.player.activeSkillLevel;
    if (skill.id && skill.id.startsWith("active-")) return 0;
    return getSkillLevel(skill.id);
  }

  function createSkillProgress(skill, current) {
    const max = skill.max || 1;
    const progress = document.createElement("div");
    const track = document.createElement("div");
    const fill = document.createElement("i");
    const label = document.createElement("em");
    const nextLevel = Math.min(current + 1, max);
    progress.className = "skill-progress";
    progress.setAttribute("aria-label", t("skill.progressLabel"));
    progress.style.setProperty("--skill-progress", `${Math.round((current / max) * 100)}%`);
    progress.style.setProperty("--segments", max);
    track.className = "skill-progress-track";
    fill.className = "skill-progress-fill";
    label.className = "skill-progress-label";
    label.textContent = current >= max ? t("common.maxed") : `${t("common.levelShort")}${nextLevel}`;
    track.appendChild(fill);
    for (let i = 0; i < max; i++) {
      const pip = document.createElement("b");
      if (i < current) pip.className = "is-filled";
      if (i === current && current < max) pip.className = "is-next";
      track.appendChild(pip);
    }
    progress.append(track, label);
    return progress;
  }

  function rollUpgrades() {
    const p = state.player;
    if (!p.activeSkillId && !p.activeSkillChoicesSeen) {
      p.activeSkillChoicesSeen = true;
      return rollActiveSkillChoices(3).map(skill => ({
        id: `active-${skill.id}`,
        nameKey: skill.nameKey,
        categoryKey: skill.categoryKey,
        max: 1,
        descKey: skill.descKey,
        desc: () => `${getActiveSkillDescription(skill, 1)} ${t("skill.onceActive")}`,
        apply: () => setActiveSkill(skill)
      }));
    }
    const available = skills.filter(skill => getSkillLevel(skill.id) < skill.max);
    if (p.activeSkillId && p.activeSkillLevel < 4) {
      const active = getActiveSkill(p.activeSkillId);
      available.unshift({
        id: `active-upgrade-${active.id}`,
        sourceActiveId: active.id,
        nameKey: active.nameKey,
        categoryKey: "cat.activeUpgrade",
        max: 4,
        desc: () => `${getActiveSkillDescription(active, p.activeSkillLevel)} ${t("skill.activeUpgradeDesc")}`,
        apply: () => upgradeActiveSkill()
      });
    }
    const pool = [...available];
    const chosen = rollWeightedUpgrades(pool, 3);
    if (!chosen.length) {
      chosen.push({ id: "heal", nameKey: "skill.heal.name", categoryKey: "cat.supply", max: 999, desc: () => t("skill.heal.desc"), apply: p => { p.hp = Math.min(p.maxHp, p.hp + 40); state.score += 500; } });
    }
    return chosen;
  }

  function getUpgradeWeight(skill) {
    const p = state.player;
    let weight = typeof skill.weight === "number" ? skill.weight : 1;
    const tags = skill.tags || [];
    if (tags.includes("defense") && p.hp / p.maxHp < 0.45) weight *= 1.45;
    if (tags.includes("attack") && p.level <= 4) weight *= 1.2;
    if (tags.includes("pickup") && p.pickupRange > 180) weight *= 1.18;
    if (tags.includes("active") && p.activeSkillId) weight *= 1.18;
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
    showToast(t("skill.synced", { name: getSkillName(skill) }), 2.1, "success");
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
      p.invuln = Math.min(0.12, typeof options.invulnerability === "number" ? options.invulnerability : 0.16);
      return;
    }
    const finalAmount = Math.max(amount, typeof options.minimumDamage === "number" ? options.minimumDamage : 0);
    let remaining = finalAmount;
    const shieldHit = Math.min(p.shield, remaining);
    p.shield -= shieldHit;
    remaining -= shieldHit;
    if (remaining > 0) p.hp -= remaining;
    p.invuln = typeof options.invulnerability === "number" ? options.invulnerability : 0.55 + p.invulnBonus;
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
    ui.resultTitle.textContent = state.bossDefeated ? t("result.titleBoss") : t("result.titleDefault");
    ui.resultStats.replaceChildren();
    [
      [t("result.time"), formatTime(state.elapsed)],
      [t("result.kills"), state.kills],
      [t("result.level"), p.level],
      [t("result.score"), Math.floor(state.score)],
      [t("result.bestScore"), records.score],
      [t("result.bestTime"), formatTime(records.time)],
      [t("result.bestKills"), records.kills],
      [t("result.bestLevel"), records.level]
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
      drawPlayerVitalArc();
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

  function getPerfLoad() {
    const enemyLoad = state.enemies.length / BALANCE.enemyMaxCap;
    const projectileLoad = (state.projectiles.length + state.enemyProjectiles.length) / (BALANCE.maxPlayerProjectiles + BALANCE.maxEnemyProjectiles);
    const particleLoad = state.particles.length / MAX_PARTICLES;
    return clamp(Math.max(enemyLoad, projectileLoad, particleLoad), 0, 1.4);
  }

  function isPerfStressed() {
    return motion.reduced || getPerfLoad() > 0.72;
  }

  function getParticleLimit() {
    const base = Math.floor(MAX_PARTICLES * getQualityPreset().particleScale);
    const pressureScale = getPerfLoad() > 0.9 ? 0.58 : getPerfLoad() > 0.72 ? 0.74 : 1;
    return Math.max(28, Math.floor(base * pressureScale));
  }

  function getVisibleEnemyCount() {
    return state.enemies.reduce((sum, enemy) => sum + (enemy.x > -80 && enemy.y > -80 && enemy.x < state.width + 80 && enemy.y < state.height + 80 ? 1 : 0), 0);
  }

  function setGlow(color, blur) {
    ctx.shadowColor = color;
    ctx.shadowBlur = blur * getQualityPreset().shadowBlur;
  }

  function drawDiamond(x, y, rx, ry = rx) {
    ctx.beginPath();
    ctx.moveTo(x, y - ry);
    ctx.lineTo(x + rx, y);
    ctx.lineTo(x, y + ry);
    ctx.lineTo(x - rx, y);
    ctx.closePath();
  }

  function drawRadialPolygon(sides, radius, innerScale = 1, phase = 0) {
    ctx.beginPath();
    for (let i = 0; i < sides; i++) {
      const a = phase + i * TAU / sides;
      const r = i % 2 ? radius * innerScale : radius;
      const x = Math.cos(a) * r;
      const y = Math.sin(a) * r;
      if (i === 0) ctx.moveTo(x, y); else ctx.lineTo(x, y);
    }
    ctx.closePath();
  }

  function invalidateBackgroundCache() {
    state.backgroundCache = null;
    state.backgroundMapId = null;
    state.backgroundWidth = 0;
    state.backgroundHeight = 0;
  }

  function drawBackgroundPattern(bg, map, quality) {
    const cx = state.width * 0.5;
    const cy = state.height * 0.5;
    bg.save();
    if (map.pattern === "nebula") {
      for (let i = 0; i < 9; i++) {
        const x = state.width * (0.12 + (i % 3) * 0.36) + rand(-40, 40);
        const y = state.height * (0.18 + Math.floor(i / 3) * 0.28) + rand(-30, 30);
        const r = Math.max(state.width, state.height) * rand(0.12, 0.22);
        const g = bg.createRadialGradient(x, y, 0, x, y, r);
        g.addColorStop(0, map.fog);
        g.addColorStop(0.55, "rgba(72, 243, 255, 0.035)");
        g.addColorStop(1, "transparent");
        bg.fillStyle = g;
        bg.fillRect(x - r, y - r, r * 2, r * 2);
      }
    }
    if (map.pattern === "asteroid") {
      bg.fillStyle = map.debrisColor;
      for (let i = 0; i < 34; i++) {
        const x = rand(-80, state.width + 80);
        const y = rand(-40, state.height + 40);
        const size = rand(8, 28);
        bg.save();
        bg.translate(x, y);
        bg.rotate(rand(-0.7, 0.7));
        bg.beginPath();
        bg.moveTo(size, 0);
        bg.lineTo(size * 0.25, size * 0.8);
        bg.lineTo(-size * 0.9, size * 0.25);
        bg.lineTo(-size * 0.45, -size * 0.7);
        bg.closePath();
        bg.fill();
        bg.restore();
      }
    }
    if (map.pattern === "storm") {
      bg.strokeStyle = map.glyphColor;
      bg.lineWidth = 2;
      for (let i = 0; i < 12; i++) {
        const y = state.height * (i / 11) + rand(-30, 30);
        bg.beginPath();
        bg.moveTo(-60, y);
        for (let x = 0; x < state.width + 120; x += 90) bg.lineTo(x, y + Math.sin(i + x * 0.02) * 28 + rand(-12, 12));
        bg.stroke();
      }
    }
    if (map.pattern === "ruins") {
      bg.strokeStyle = map.glyphColor;
      bg.lineWidth = 1;
      for (let x = 32; x < state.width; x += 96) {
        for (let y = 40; y < state.height; y += 86) {
          if (Math.random() < 0.45) continue;
          bg.strokeRect(x, y, 38, 22);
          bg.beginPath();
          bg.moveTo(x + 38, y + 11);
          bg.lineTo(x + 70, y + 11);
          bg.stroke();
        }
      }
    }
    if (quality.backgroundLines) {
      bg.globalAlpha = 0.11;
      bg.strokeStyle = map.accent;
      bg.lineWidth = 1;
      for (let x = -140; x < state.width + 140; x += 92) {
        bg.beginPath();
        bg.moveTo(x, 0);
        bg.lineTo(x + 130, state.height);
        bg.stroke();
      }
      bg.globalAlpha = 0.08;
      bg.strokeStyle = map.secondaryAccent || map.accent;
      bg.beginPath();
      bg.arc(cx, cy, Math.min(state.width, state.height) * 0.38, 0, TAU);
      bg.stroke();
    }
    bg.restore();
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
      drawBackgroundPattern(bg, map, quality);
    }
    ctx.drawImage(state.backgroundCache, 0, 0);
    if (!motion.reduced && settings.quality !== "performance" && !isPerfStressed()) {
      ctx.save();
      ctx.globalAlpha = 0.08;
      ctx.strokeStyle = map.secondaryAccent || map.accent;
      ctx.lineWidth = 1;
      const drift = (state.elapsed * 18) % 160;
      for (let x = -160 + drift; x < state.width + 160; x += 160) {
        ctx.beginPath();
        ctx.moveTo(x, 0);
        ctx.lineTo(x - 90, state.height);
        ctx.stroke();
      }
      ctx.restore();
    }
    const visibleEnemies = getVisibleEnemyCount();
    const stressed = isPerfStressed();
    state.stars.forEach((star, index) => {
      if ((stressed || visibleEnemies > 46) && index % 2 === 1) return;
      star.y += star.speed * 0.0016 * star.layer;
      star.x += star.drift * 0.0012;
      if (star.y > state.height) star.y = 0;
      if (star.x < 0) star.x = state.width;
      if (star.x > state.width) star.x = 0;
      ctx.globalAlpha = star.alpha * (motion.reduced ? 1 : 0.72 + Math.sin(state.elapsed * 2.2 + star.twinkle) * 0.28);
      ctx.fillStyle = map.starTint;
      ctx.beginPath();
      ctx.arc(star.x, star.y, star.size * star.layer, 0, TAU);
      ctx.fill();
    });
    if (state.mapTransitionPulse > 0) {
      const alpha = clamp(state.mapTransitionPulse, 0, 1);
      ctx.save();
      ctx.globalAlpha = alpha * 0.2;
      ctx.strokeStyle = map.accent;
      ctx.lineWidth = 2;
      const gap = 34 + (1 - alpha) * 50;
      for (let x = -gap; x < state.width + gap; x += gap) {
        ctx.beginPath();
        ctx.moveTo(x, 0);
        ctx.lineTo(x + state.height * 0.32, state.height);
        ctx.stroke();
      }
      ctx.restore();
    }
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
    const speedRatio = clamp(Math.hypot(p.vx, p.vy) / p.speed, 0, 1.4);
    const shieldRatio = clamp(p.shield / p.maxShield, 0, 1);
    const hpRatio = clamp(p.hp / p.maxHp, 0, 1);
    const activeCharge = getActiveSkillChargeState(p);
    const flame = 18 + speedRatio * 24 + (motion.reduced ? 0 : Math.sin(state.elapsed * 18) * 4);
    ctx.save();
    ctx.translate(p.x, p.y);
    ctx.rotate(p.angle);
    setGlow(activeCharge.ready ? "#ff5c66" : artPalette.playerTrim, activeCharge.ready ? 24 : 18);
    ctx.fillStyle = activeCharge.ready ? "rgba(255, 92, 102, 0.78)" : artPalette.playerHull;
    ctx.strokeStyle = activeCharge.ready ? "rgba(255, 164, 150, 0.82)" : "rgba(72, 243, 255, 0.8)";
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    ctx.moveTo(28, 0);
    ctx.lineTo(-10, -15);
    ctx.lineTo(-20, -7);
    ctx.lineTo(-10, 0);
    ctx.lineTo(-20, 7);
    ctx.lineTo(-10, 15);
    ctx.closePath();
    ctx.fill();
    ctx.stroke();
    ctx.globalAlpha = 0.7;
    ctx.fillStyle = "rgba(72, 243, 255, 0.42)";
    ctx.beginPath();
    ctx.moveTo(-3, -12);
    ctx.lineTo(-25, -25);
    ctx.lineTo(-16, -5);
    ctx.closePath();
    ctx.fill();
    ctx.beginPath();
    ctx.moveTo(-3, 12);
    ctx.lineTo(-25, 25);
    ctx.lineTo(-16, 5);
    ctx.closePath();
    ctx.fill();
    ctx.globalAlpha = 1;
    const coreReady = p.activeSkillId && p.activeCharges > 0;
    setGlow(coreReady ? artPalette.playerCore : artPalette.playerTrim, coreReady ? 24 : 12);
    ctx.fillStyle = coreReady ? artPalette.playerCore : artPalette.playerTrim;
    ctx.beginPath();
    ctx.arc(3, 0, coreReady ? 4.6 : 3.4, 0, TAU);
    ctx.fill();
    ctx.shadowColor = artPalette.playerTrim;
    ctx.shadowBlur = 20 * getQualityPreset().shadowBlur;
    const flameGradient = ctx.createLinearGradient(-16, 0, -20 - flame, 0);
    flameGradient.addColorStop(0, "rgba(72, 243, 255, 0.9)");
    flameGradient.addColorStop(0.48, "rgba(255, 211, 106, 0.72)");
    flameGradient.addColorStop(1, "rgba(216, 76, 255, 0)");
    ctx.fillStyle = flameGradient;
    ctx.beginPath();
    ctx.moveTo(-16, -7);
    ctx.lineTo(-20 - flame, 0);
    ctx.lineTo(-16, 7);
    ctx.closePath();
    ctx.fill();
    if (hpRatio < 0.35) {
      ctx.strokeStyle = `rgba(255, 75, 102, ${0.35 + Math.sin(state.elapsed * 16) * 0.18})`;
      ctx.lineWidth = 1.4;
      ctx.beginPath();
      ctx.moveTo(-5, -9);
      ctx.lineTo(8, -2);
      ctx.moveTo(-12, 6);
      ctx.lineTo(9, 4);
      ctx.stroke();
    }
    ctx.restore();
    ctx.globalAlpha = 1;
    if (shieldRatio > 0.02) {
      ctx.save();
      ctx.strokeStyle = `rgba(72, 243, 255, ${0.18 + shieldRatio * 0.32})`;
      setGlow(artPalette.shield, 12);
      ctx.lineWidth = 2;
      for (let i = 0; i < 3; i++) {
        const start = -Math.PI / 2 + i * TAU / 3;
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.radius + 14, start, start + TAU / 3 * shieldRatio * 0.78);
        ctx.stroke();
      }
      ctx.restore();
    }
    if (p.droneLevel > 0) drawDrones();
    ctx.strokeStyle = "rgba(72, 243, 255, 0.18)";
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.arc(p.x, p.y, p.pickupRange, 0, TAU);
    ctx.stroke();
    ctx.shadowBlur = 0;
  }

  function drawPlayerVitalArc() {
    const p = state.player;
    if (!p) return;
    const hpRatio = clamp(p.hp / p.maxHp, 0, 1);
    const shieldRatio = p.maxShield > 0 ? clamp(p.shield / p.maxShield, 0, 1) : 0;
    const cx = p.x;
    const cy = p.y;
    const radius = p.radius + 24;
    const shieldRadius = radius + 7;
    const start = -Math.PI * 0.5;
    const end = Math.PI * 0.5;
    ctx.save();
    ctx.lineCap = "round";
    ctx.globalAlpha = 0.38;
    ctx.strokeStyle = "rgba(255, 255, 255, 0.09)";
    ctx.lineWidth = 8;
    ctx.beginPath();
    ctx.arc(cx, cy, radius, start, end);
    ctx.stroke();
    ctx.globalAlpha = 0.66;
    ctx.strokeStyle = "rgba(255, 54, 91, 0.68)";
    ctx.lineWidth = 6;
    setGlow("#ff365b", hpRatio < 0.3 ? 18 : 10);
    ctx.beginPath();
    ctx.arc(cx, cy, radius, start, start + (end - start) * hpRatio);
    ctx.stroke();
    if (p.shield > 0) {
      ctx.globalAlpha = 0.56;
      ctx.strokeStyle = "rgba(255, 255, 255, 0.7)";
      ctx.lineWidth = 3.4;
      setGlow("#ffffff", 12 + shieldRatio * 10);
      ctx.beginPath();
      ctx.arc(cx, cy, shieldRadius, start, start + (end - start) * shieldRatio);
      ctx.stroke();
    }
    ctx.restore();
    ctx.globalAlpha = 1;
    ctx.shadowBlur = 0;
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

  function drawEnemyShape(enemy) {
    const r = enemy.radius;
    if (enemy.type === "hunter") {
      drawRadialPolygon(8, r, 0.64, Math.PI / 8);
    } else if (enemy.type === "tank") {
      drawRadialPolygon(6, r, 0.92, Math.PI / 6);
    } else if (enemy.type === "shooter") {
      drawRadialPolygon(8, r, 0.78, Math.PI / 8);
    } else if (enemy.type === "bomber") {
      drawRadialPolygon(10, r, 0.54, state.elapsed * 1.8);
    } else if (enemy.type === "wisp") {
      drawRadialPolygon(12, r, 0.48, state.elapsed * 0.9);
    } else if (enemy.type === "burrower") {
      drawRadialPolygon(10, r, 0.6, state.elapsed * 1.2);
    } else if (enemy.type === "stormer") {
      drawDiamond(0, 0, r * 1.02, r * 1.02);
    } else if (enemy.type === "sentinel") {
      drawRadialPolygon(6, r, 0.74, state.elapsed * 0.6);
    } else if (enemy.type === "boss") {
      drawRadialPolygon(16, r, 0.76, state.elapsed * 0.08);
    } else {
      drawRadialPolygon(6, r, 0.72, Math.PI / 6);
    }
  }

  function drawEnemyDetails(enemy) {
    const r = enemy.radius;
    ctx.shadowBlur = 0;
    ctx.strokeStyle = "rgba(255,255,255,0.38)";
    ctx.lineWidth = 1;
    if (enemy.type === "shooter") {
      ctx.beginPath();
      ctx.arc(0, 0, r * 0.42, 0, TAU);
      ctx.stroke();
      for (let i = 0; i < 4; i++) {
        const a = i * Math.PI / 2;
        ctx.beginPath();
        ctx.moveTo(Math.cos(a) * r * 0.2, Math.sin(a) * r * 0.2);
        ctx.lineTo(Math.cos(a) * r * 0.82, Math.sin(a) * r * 0.82);
        ctx.stroke();
      }
    } else if (enemy.type === "stormer") {
      ctx.strokeStyle = "rgba(255,255,255,0.55)";
      for (let i = -1; i <= 1; i += 2) {
        ctx.beginPath();
        ctx.moveTo(-r * 0.38, i * r * 0.18);
        ctx.lineTo(r * 0.22, i * -r * 0.32);
        ctx.lineTo(r * 0.55, i * r * 0.18);
        ctx.stroke();
      }
    } else if (enemy.type === "sentinel") {
      ctx.fillStyle = "rgba(1, 7, 10, 0.72)";
      ctx.beginPath();
      ctx.arc(0, 0, r * 0.34, 0, TAU);
      ctx.fill();
      ctx.fillStyle = enemy.color;
      ctx.fillRect(-r * 0.4, -1.5, r * 0.8, 3);
    } else if (enemy.type === "boss") {
      ctx.strokeStyle = "rgba(255,255,255,0.32)";
      ctx.beginPath();
      ctx.arc(0, 0, r * 0.58, 0, TAU);
      ctx.stroke();
      ctx.fillStyle = "rgba(255,255,255,0.9)";
      for (let i = 0; i < 6; i++) {
        const a = i * TAU / 6;
        ctx.beginPath();
        ctx.arc(Math.cos(a) * r * 0.62, Math.sin(a) * r * 0.62, 3, 0, TAU);
        ctx.fill();
      }
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
      drawEnemyShape(enemy);
      ctx.fill();
      ctx.stroke();
      drawEnemyDetails(enemy);
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
    const stressed = isPerfStressed();
    state.projectiles.forEach(p => {
      const angle = Math.atan2(p.vy, p.vx);
      ctx.save();
      ctx.translate(p.x, p.y);
      ctx.rotate(angle);
      ctx.shadowColor = p.color;
      ctx.shadowBlur = stressed ? 0 : 18 * quality.shadowBlur;
      ctx.fillStyle = p.color;
      if (p.type === "rail") {
        ctx.fillRect(-p.radius * 2.8, -p.radius * 0.65, p.radius * 5.6, p.radius * 1.3);
        ctx.globalAlpha = 0.35;
        ctx.fillRect(-p.radius * 8, -0.7, p.radius * 7, 1.4);
      } else if (p.type === "flak") {
        drawDiamond(0, 0, p.radius * 1.3, p.radius * 0.85);
        ctx.fill();
      } else if (p.type === "missile") {
        ctx.beginPath();
        ctx.moveTo(p.radius * 1.7, 0);
        ctx.lineTo(-p.radius, -p.radius * 0.8);
        ctx.lineTo(-p.radius * 0.55, 0);
        ctx.lineTo(-p.radius, p.radius * 0.8);
        ctx.closePath();
        ctx.fill();
        ctx.globalAlpha = 0.45;
        ctx.fillStyle = artPalette.playerCore;
        ctx.beginPath();
        ctx.moveTo(-p.radius * 0.8, -p.radius * 0.45);
        ctx.lineTo(-p.radius * 2.5, 0);
        ctx.lineTo(-p.radius * 0.8, p.radius * 0.45);
        ctx.fill();
      } else {
        ctx.beginPath();
        ctx.arc(0, 0, p.radius, 0, TAU);
        ctx.fill();
        ctx.globalAlpha = 0.35;
        ctx.beginPath();
        ctx.arc(0, 0, p.radius * 2.1, 0, TAU);
        ctx.strokeStyle = p.color;
        ctx.stroke();
      }
      ctx.restore();
    });
    ctx.globalAlpha = 1;
    ctx.shadowBlur = 0;
  }

  function drawEnemyProjectiles() {
    const quality = getQualityPreset();
    const stressed = isPerfStressed();
    state.enemyProjectiles.forEach(p => {
      const angle = Math.atan2(p.vy, p.vx);
      ctx.save();
      ctx.translate(p.x, p.y);
      ctx.rotate(angle);
      ctx.shadowColor = p.color;
      ctx.shadowBlur = stressed ? 0 : 18 * quality.shadowBlur;
      ctx.fillStyle = p.warningColor || "rgba(255, 49, 95, 0.28)";
      ctx.beginPath();
      ctx.ellipse(0, 0, p.radius * 2.1, p.radius * 1.25, 0, 0, TAU);
      ctx.fill();
      ctx.fillStyle = p.color;
      ctx.beginPath();
      ctx.moveTo(p.radius * 1.9, 0);
      ctx.lineTo(-p.radius * 1.2, -p.radius * 1.15);
      ctx.lineTo(-p.radius * 0.55, 0);
      ctx.lineTo(-p.radius * 1.2, p.radius * 1.15);
      ctx.closePath();
      ctx.fill();
      ctx.shadowBlur = 0;
      ctx.fillStyle = p.coreColor || "#fff0f4";
      ctx.beginPath();
      ctx.arc(p.radius * 0.28, 0, Math.max(1.6, p.radius * 0.38), 0, TAU);
      ctx.fill();
      ctx.restore();
    });
    ctx.shadowBlur = 0;
  }

  function drawPickupSymbol(p, pulse) {
    const pickupType = pickupTypes[p.type];
    const r = pickupType ? pickupType.radius : 7;
    if (p.type === "xp") {
      drawDiamond(p.x, p.y, 6 + pulse * 0.4, 9 + pulse);
      ctx.fill();
      ctx.shadowBlur = 0;
      ctx.strokeStyle = "rgba(255, 255, 255, 0.72)";
      ctx.lineWidth = 1.2;
      drawDiamond(p.x, p.y, 8 + pulse * 0.5, 11 + pulse);
      ctx.stroke();
    } else if (p.type === "heal") {
      ctx.fillRect(p.x - 2.2, p.y - r, 4.4, r * 2);
      ctx.fillRect(p.x - r, p.y - 2.2, r * 2, 4.4);
    } else if (p.type === "shield") {
      ctx.beginPath();
      for (let i = 0; i < 6; i++) {
        const a = -Math.PI / 2 + i * TAU / 6;
        const x = p.x + Math.cos(a) * (r + 2 + pulse * 0.35);
        const y = p.y + Math.sin(a) * (r + 2 + pulse * 0.35);
        if (i === 0) ctx.moveTo(x, y); else ctx.lineTo(x, y);
      }
      ctx.closePath();
      ctx.strokeStyle = p.color;
      ctx.lineWidth = 2;
      ctx.stroke();
      ctx.beginPath();
      ctx.arc(p.x, p.y, r * 0.35, 0, TAU);
      ctx.fill();
    } else if (p.type === "bomb") {
      ctx.beginPath();
      ctx.arc(p.x, p.y, r + pulse * 0.3, 0, TAU);
      ctx.fill();
      ctx.strokeStyle = "rgba(255, 75, 102, 0.82)";
      ctx.lineWidth = 1.4;
      ctx.beginPath();
      ctx.arc(p.x, p.y, r + 5 + pulse, 0, TAU);
      ctx.stroke();
    } else if (p.type === "magnet") {
      ctx.lineWidth = 2.4;
      ctx.strokeStyle = p.color;
      ctx.beginPath();
      ctx.arc(p.x - 4, p.y, r, Math.PI * 0.5, Math.PI * 1.5);
      ctx.arc(p.x + 4, p.y, r, Math.PI * 1.5, Math.PI * 0.5);
      ctx.stroke();
    } else if (p.type === "overclock") {
      ctx.beginPath();
      ctx.moveTo(p.x + 1, p.y - r - 3);
      ctx.lineTo(p.x - 5, p.y + 1);
      ctx.lineTo(p.x + 1, p.y + 1);
      ctx.lineTo(p.x - 1, p.y + r + 4);
      ctx.lineTo(p.x + 7, p.y - 2);
      ctx.lineTo(p.x + 1, p.y - 2);
      ctx.closePath();
      ctx.fill();
    } else {
      drawDiamond(p.x, p.y, r, r);
      ctx.fill();
    }
  }

  function drawPickups() {
    const quality = getQualityPreset();
    const stressed = isPerfStressed();
    state.pickups.forEach(p => {
      const pulse = motion.reduced || stressed ? 0 : Math.sin(state.elapsed * 6 + p.x * 0.02) * 1.2;
      ctx.shadowColor = p.color;
      ctx.shadowBlur = stressed ? 0 : 14 * quality.shadowBlur;
      ctx.fillStyle = p.color;
      drawPickupSymbol(p, pulse);
    });
    ctx.shadowBlur = 0;
  }

  function drawParticles() {
    const quality = getQualityPreset();
    const stressed = isPerfStressed();
    state.particles.forEach(p => {
      const alpha = clamp(p.life / (p.maxLife || 0.72), 0, 1);
      ctx.globalAlpha = alpha;
      ctx.strokeStyle = p.color;
      ctx.fillStyle = p.color;
      ctx.shadowColor = p.color;
      ctx.shadowBlur = stressed ? 0 : 16 * quality.shadowBlur;
      if (p.type === "ring") {
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.radius, 0, TAU);
        ctx.stroke();
      } else if (p.type === "beam") {
        const a = Math.atan2(p.vy, p.vx);
        const len = Math.hypot(p.vx, p.vy);
        ctx.save();
        ctx.translate(p.x, p.y);
        ctx.rotate(a);
        ctx.globalAlpha = alpha * 0.34;
        ctx.lineWidth = Math.max(2, p.radius * 1.4);
        ctx.beginPath();
        ctx.moveTo(0, 0);
        ctx.lineTo(len, 0);
        ctx.stroke();
        ctx.globalAlpha = alpha;
        ctx.lineWidth = Math.max(1, p.radius * 0.32);
        ctx.strokeStyle = "#ffffff";
        ctx.beginPath();
        ctx.moveTo(0, 0);
        ctx.lineTo(len, 0);
        ctx.stroke();
        ctx.restore();
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
    ctx.strokeStyle = artPalette.xpCrystal;
    ctx.shadowColor = artPalette.xpCrystal;
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
    ctx.strokeStyle = artPalette.boss;
    ctx.lineWidth = 6;
    ctx.strokeRect(8, 8, state.width - 16, state.height - 16);
    ctx.globalAlpha *= 0.8;
    ctx.lineWidth = 1.5;
    const notch = 42;
    [[22, 22, 1, 1], [state.width - 22, 22, -1, 1], [22, state.height - 22, 1, -1], [state.width - 22, state.height - 22, -1, -1]].forEach(([x, y, sx, sy]) => {
      ctx.beginPath();
      ctx.moveTo(x, y + sy * notch);
      ctx.lineTo(x, y);
      ctx.lineTo(x + sx * notch, y);
      ctx.stroke();
    });
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
    ctx.fillText(t("enemy.boss"), state.width / 2, y - 10);
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
  ui.languageSelect.addEventListener("change", () => {
    settings.language = ui.languageSelect.value;
    saveSettings();
    applyLanguage();
  });
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
  applyLanguage();
  applySettings();
  resize();
  createStars();
  updateMenuState();
  requestAnimationFrame(loop);
})();


