// src/i18n.ts — Korean / English string table for the Starfall fork.
//
// Design:
//   - Two flat dicts (EN baseline + KO overlay). The fork is en-only upstream;
//     ko is filled in by the Korean fork. Keys are camelCase or dot.case.
//   - `t(key)` returns the current language, falling back to EN, then to the
//     key itself (so missing translations surface loudly in the UI).
//   - `setLanguage(lang)` swaps the active dict at runtime; called once from
//     main.ts before any UI mounts.
//   - Ship class `name` keys map to {@link src/core/registry.ts} entries so the
//     registry stays a plain object literal but its labels pass through here.
//   - `applyStatic(root)` walks the DOM looking for `data-i18n` attributes and
//     fills their textContent. Used by the boot/menu pages where text lives in
//     the HTML directly rather than in TypeScript literals.

// Ship name display keys — registry ship names are kept in English as
// gameplay identifiers, but the HUD labels them in the current language.
// Lookup is by the canonical registry `name` string.
const SHIP_NAME_KEY: Readonly<Record<string, string>> = {
  'Probe Scout': 'shipScout',
  'Talon Interceptor': 'shipInterceptor',
  'Lance Bomber': 'shipBomber',
  'Hammer Corvette': 'shipAssaultCorvette',
  'Quiver Corvette': 'shipMissileCorvette',
  'Lumen Ion Frigate': 'shipIonFrigate',
  'Bulwark Frigate': 'shipAssaultFrigate',
  'Aegis Destroyer': 'shipDestroyer',
  'Sovereign Cruiser': 'shipHeavyCruiser',
  'Ladle Collector': 'shipCollector',
  'Crucible Refinery': 'shipRefinery',
  'Anvil Carrier': 'shipCarrier',
  'Starfall Mothership': 'shipMothership',
};

/** Human-readable display name for a registry ship name, in the active language. */
export function shipDisplayName(registryName: string): string {
  const key = SHIP_NAME_KEY[registryName];
  if (key) return t(key);
  return registryName;
}

/**
 * Korean / English string table for the Starfall fork.
 *
 * Design:
 *   - Two flat dicts (EN baseline + KO overlay). The fork is en-only upstream;
 *     ko is filled in by the Korean fork. Keys are dot.case, never nested.
 *   - `t(key)` returns the current language, falling back to EN, then to the
 *     key itself (so missing translations surface loudly in the UI).
 *   - `setLanguage(lang)` swaps the active dict at runtime; called once from
 *     main.ts before any UI mounts.
 *   - Ship class `name` keys map to {@link src/core/registry.ts} entries so the
 *     registry stays a plain object literal but its labels pass through here.
 *   - `applyStatic(root)` walks the DOM looking for `data-i18n` attributes and
 *     fills their textContent. Used by the boot/menu pages where text lives in
 *     the HTML directly rather than in TypeScript literals.
 */

export type Lang = 'en' | 'ko';

// Active locale. We store it on globalThis rather than as a plain
// `let` so esbuild's minifier cannot inline `current` as the default
// `'en'` value at every t() call site. With a plain `let` the minifier
// saw no write to `current` reaching the entry module, so it pinned
// every lookup to the English dict at compile time. Reading through
// `globalThis.__currentLang` forces a runtime indirection that the
// minifier has to keep.
let current: Lang = (globalThis as unknown as { __currentLang?: Lang }).__currentLang ?? 'en';
let koDict: Record<string, string> = (globalThis as unknown as { __koDict?: Record<string, string> }).__koDict ?? {};
let enDict: Record<string, string> = (globalThis as unknown as { __enDict?: Record<string, string> }).__enDict ?? {};

export function setLanguage(lang: Lang): void {
  current = lang;
  (globalThis as unknown as { __currentLang: Lang }).__currentLang = lang;
}

export function getLanguage(): Lang {
  return current;
}

export function t(key: string): string {
  // All dispatch is funneled through a single globalThis function. This
  // is the only call site esbuild's minifier is unable to inline: the
  // resolver is a closure assigned at runtime by main.ts (after the
  // bundle has been built), and main.ts assigns it before any t() call
  // runs. The function captures both the active dict and the language
  // and returns the right string. Because the resolver is dynamic
  // (assigned post-bundle), the static minifier has to leave t()'s
  // body intact.
  const resolver = (globalThis as unknown as { __tResolver?: (k: string) => string }).__tResolver;
  if (resolver !== undefined) {
    const v = resolver(key);
    if (v !== undefined) return v;
  }
  // Fallback: inline path used only if the resolver wasn't installed
  // (which would mean the bundle was built but main.ts didn't run).
  const lang = (globalThis as unknown as { __currentLang?: Lang }).__currentLang ?? 'en';
  const k = lang === 'ko'
    ? ((globalThis as unknown as { __koDict?: Record<string, string> }).__koDict)
    : ((globalThis as unknown as { __enDict?: Record<string, string> }).__enDict);
  if (k === undefined) return key;
  const v = (k as Record<string, string>)[key];
  return v ?? key;
}

/**
 * Walk a root element and replace textContent for any descendant that has
 * `data-i18n="<key>"`. Useful for the boot screen / noscript fallback / any
 * static HTML where we don't want to chase every node by hand.
 */
export function applyStatic(root: ParentNode = document): void {
  const nodes = root.querySelectorAll<HTMLElement>('[data-i18n]');
  nodes.forEach((el) => {
    const key = el.getAttribute('data-i18n');
    if (!key) return;
    el.textContent = t(key);
  });
  // Title attributes too — `data-i18n-title` for hover/aria hints.
  const tips = root.querySelectorAll<HTMLElement>('[data-i18n-title]');
  tips.forEach((el) => {
    const key = el.getAttribute('data-i18n-title');
    if (!key) return;
    el.setAttribute('title', t(key));
    el.setAttribute('aria-label', t(key));
  });
}

// ────────────────────────────────────────────────────────────────
// English baseline — mirrors the original upstream copy verbatim
// wherever possible, so toggling languages stays a faithful "original
// view" rather than a re-translation.
// ────────────────────────────────────────────────────────────────
const EN: Record<string, string> = {
  // Boot screen
  bootEyebrow: 'e01.ai experiment',
  bootMark: 'STARFALL',
  bootTagline: 'Universe-scale fleet command',
  bootTribute: 'in tribute to Homeworld',
  bootStatus: 'initialising',

  // HUD top bar
  resourceUnits: 'Resource Units',
  fleetSupply: 'Fleet Supply',
  fleet: 'Fleet',
  ops: 'Ops',
  elapsed: 'Elapsed',
  opsNominal: 'NOMINAL',

  // Ship class short tags (registry)
  shipScout: 'Probe Scout',
  shipInterceptor: 'Talon Interceptor',
  shipBomber: 'Lance Bomber',
  shipAssaultCorvette: 'Hammer Corvette',
  shipMissileCorvette: 'Quiver Corvette',
  shipIonFrigate: 'Lumen Ion Frigate',
  shipAssaultFrigate: 'Bulwark Frigate',
  shipDestroyer: 'Aegis Destroyer',
  shipHeavyCruiser: 'Sovereign Cruiser',
  shipCollector: 'Ladle Collector',
  shipRefinery: 'Crucible Refinery',
  shipCarrier: 'Anvil Carrier',
  shipMothership: 'Starfall Mothership',

  // Build menu categories (used as headings)
  buildCategoryAll: 'ALL HULLS',
  buildCategoryFighters: 'FIGHTERS',
  buildCategoryCorvettes: 'CORVETTES',
  buildCategoryFrigates: 'FRIGATES',
  buildCategoryCapitals: 'CAPITALS',
  buildCategorySupercaps: 'SUPERCAPS',
  buildCategoryUtility: 'UTILITY',
  buildCategorySupport: 'SUPPORT',
  buildCategoryCollection: 'RESOURCE COLLECTION',

  // Research tree
  researchStrikecraft: 'Strike Craft Doctrine',
  researchRefining: 'Mobile Refining',
  researchCapships: 'Capital Ship Frames',
  researchGuidance: 'Guided Ordnance',
  researchPlating: 'Composite Plating',
  researchDestroyers: 'Destroyer Programme',
  researchShields: 'Deflector Lattice',
  researchCruisers: 'Sovereign Programme',
  researchDrives: 'Ion Drive Tuning',

  // Build panel
  production: 'PRODUCTION',
  buildQueue: 'BUILD QUEUE',
  research: 'RESEARCH',
  rally: 'RALLY',
  setRally: 'SET',
  clearRally: 'CLEAR',
  clickToCancel: 'CLICK TO CANCEL',
  noProducer: 'NO PRODUCTION FACILITY',
  lineIdle: 'LINE IDLE',
  noFacility: 'NO FACILITY',
  holdAtHangar: 'HOLD AT HANGAR',
  noActiveProject: 'NO ACTIVE PROJECT',
  rallyCleared: 'RALLY POINT CLEARED',
  cancelOrderTitle: 'Cancel this order',
  setRallyTitle: 'Arm rally placement, then click a point in space',
  clearRallyTitle: 'Clear the rally point — new hulls hold at the hangar',
  productionPanelTitle: 'Production (select a carrier or mothership, or click to pin)',
  collapsePanelTitle: 'Collapse production panel',

  // Build blockers
  locked: 'LOCKED',
  lockedRequires: 'LOCKED · REQUIRES',
  insufficientResources: 'INSUFFICIENT RESOURCES',
  supplyCapReached: 'SUPPLY CAP REACHED',
  buildQueueFull: 'BUILD QUEUE FULL',

  // Cannot-build notices
  cannotStartResearch: 'Cannot start research',
  noProductionFacility: 'No production facility',
  mothershipLost: 'Mothership lost',
  cannotBuildShort: 'Cannot build — resources, supply or tech',

  // HUD commands
  cmdMoveLabel: 'Move',
  cmdAttackLabel: 'Attack',
  cmdStopLabel: 'Stop',
  cmdHarvestLabel: 'Harvest',
  cmdDockLabel: 'Dock',
  cmdMoveTitle: 'Move',
  cmdAttackTitle: 'Attack',
  cmdStopTitle: 'Stop',
  cmdHarvestTitle: 'Harvest',
  cmdDockTitle: 'Dock',
  cmdMoveBody: 'Fly the selection to a point. Hold and drag vertically at the cursor to set altitude before releasing.',
  cmdAttackBody: 'Force-fire a target, or attack-move to a point and engage anything hostile on the way.',
  cmdStopBody: 'Cancel every queued order and hold station. Stance still governs whether they return fire.',
  cmdHarvestBody: 'Send collectors to the nearest worked resource field and cycle cargo automatically.',
  cmdDockBody: 'Return to the nearest carrier or mothership to repair, rearm and refuel.',

  // Formations
  formationHeader: 'Formation',
  formationDelta: 'Delta',
  formationBroad: 'Broad',
  formationWall: 'Wall',
  formationSphere: 'Sphere',
  formationClaw: 'Claw',
  formationLine: 'Line',
  formationDeltaBody: 'Tight arrowhead. Best transit speed, poor spread against splash.',
  formationBroadBody: 'Wide echelon. Every hull keeps a clean firing arc forward.',
  formationWallBody: 'Flat line abreast. Maximum broadside, minimum depth.',
  formationSphereBody: 'Shell around the centre of mass. Escort posture for capitals.',
  formationClawBody: 'Split pincer. Splits fire across two approach vectors.',
  formationLineBody: 'Column astern. Narrow profile through contested space.',

  // Stances
  stanceHeader: 'Stance',
  stanceAggressive: 'Aggressive',
  stanceNeutral: 'Neutral',
  stancePassive: 'Passive',
  stanceEvasive: 'Evasive',
  stanceAggressiveBody: 'Break formation to chase anything in sensor range.',
  stanceNeutralBody: 'Hold the order, engage whatever comes inside weapons range.',
  stancePassiveBody: 'Return fire only. Never breaks off to pursue.',
  stanceEvasiveBody: 'Do not fire. Run from contact and rejoin the fleet.',

  // Selection inspector
  selection: 'Selection',
  hull: 'Hull',
  shield: 'Shield',

  // Band overlay hints
  bandAttackMove: 'ATTACK-MOVE — click a destination',
  bandMove: 'MOVE — click a destination, drag vertically for altitude',
  bandGuard: 'GUARD — click a friendly hull',

  // Fleet bar
  fleetIdle: 'IDLE',

  // Tactical sensor overlay banner
  sensorsManager: 'SENSORS MANAGER',

  // Menu
  menuAria: 'Menu',
  menuTitle: 'STARFALL',
  menuTabControls: 'Controls',
  menuTabCredits: 'Credits',
  menuTabAudio: 'Audio',
  menuCloseTitle: 'Close (Esc)',
  menuFooter: 'Mike Luan · @mikeluan123 · e01.ai experiment  ·  F1 or Esc to close',
  menuHeaderMadeBy: 'Made by',
  menuHeaderSfx: 'Sound effects',
  menuHeaderMusicCalm: 'Music — calm',
  menuHeaderMusicCombat: 'Music — combat',
  menuHeaderWrittenBy: 'Written by',
  menuModelName: 'Claude Opus 5',
  menuPromptLink: 'The prompt',
  menuHeaderBuiltWith: 'Built with',
  menuAudioMaster: 'Master',
  menuAudioEffects: 'Effects',
  menuAudioMusic: 'Music',
  menuAudioBody: 'The score streams from disk; effects are recorded transients layered for impact. Tracks come from OpenGameArt contributors (CC0).',
  menuMadeByBody: 'In tribute to HOMEWORLD (Relic Entertainment, 1999) — the game that decided a fleet should be a shape in three dimensions, that a wake should tell you which way a contact is breaking, and that silence and a horizon line are worth more than any amount of noise. Starfall is an independent homage and uses none of its art, audio, code or trademarks.',

  // Controls help (menu → 조작 탭)
  ctrlGroupSelecting: 'Selecting',
  ctrlGroupOrdering: 'Ordering',
  ctrlGroupCamera: 'Camera',
  ctrlLeftClick: 'select a ship',
  ctrlLeftDrag: 'band select',
  ctrlDoubleClick: 'select every visible ship of that class',
  ctrlEsc: 'cancel an armed order, else clear the selection',
  ctrlRightClick: 'context order — attack, dock, guard, harvest or move',
  ctrlZXCV: 'stance — aggressive, neutral, passive, evasive',
  ctrlMiddleDrag: 'pan',
  ctrlRightDragSideways: 'orbit (cancels the pending order)',
  ctrlWheel: 'zoom',

  // Notice messages (in-game alerts)
  noticeMoveConfirmed: 'MOVE ORDER CONFIRMED',
  noticeAttacking: 'ATTACKING',
  noticeHarvesting: 'HARVESTING',
  noticeAttackMove: 'ATTACK MOVE',
  noticeHoldingPosition: 'HOLDING POSITION',

  // Research descriptions (registry RESEARCH.desc)
  researchDescStrikecraft: 'Unlocks bomber wings and assault corvettes.',
  researchDescRefining: 'Unlocks the Crucible refinery. Collectors dock closer to the field.',
  researchDescCapships: 'Unlocks ion and assault frigates.',
  researchDescGuidance: 'Unlocks missile corvettes. +12% weapon damage fleet-wide.',
  researchDescPlating: '+20% armour on every hull.',
  researchDescDestroyers: 'Unlocks the Aegis destroyer and Anvil carrier.',
  researchDescShields: '+30% shield capacity fleet-wide.',
  researchDescCruisers: 'Unlocks the Sovereign heavy cruiser.',
  researchDescDrives: '+15% speed on every hull.',

  // SFX pack uses (core/samples.ts)
  sfxPackUseSciFi: 'lasers, explosions, force fields, metal impacts',
  sfxPackUseImpact: 'heavy plate and metal strikes',
  sfxPackUseInterface: 'clicks, confirmations, alerts',

  // HUD ops alert suffixes (hud.ts)
  opsUnderFire: 'UNDER FIRE',
  opsCollectorIdle: 'COLLECTOR IDLE',
  opsInBuild: 'IN BUILD',

  // Units suffix (selection inspector)
  unitSingular: 'unit',
  unitPlural: 'units',

  // Formation names (controls.ts FORMATION_NAMES + notice interpolation)
  formationNameNone: 'NONE',
  formationNameDelta: 'DELTA',
  formationNameBroad: 'BROAD',
  formationNameWall: 'WALL',
  formationNameSphere: 'SPHERE',
  formationNameClaw: 'CLAW',
  formationNameLine: 'LINE',
  formationNameAuto: 'AUTO',

  // Extra in-game notices (controls.ts + build.ts + sim/economy.ts)
  noticeRallySelectDestination: 'RALLY: select a destination',
  noticeFormationAuto: 'FORMATION: AUTO',
  noticeFormationFmt: 'FORMATION:',
  noticeGroupSet: 'GROUP %n SET (%c)',
  noticeNoResourcesInRange: 'NO RESOURCES IN RANGE',
  noticeNoDockingBayAvailable: 'NO DOCKING BAY AVAILABLE',
  noticeDocking: 'DOCKING',
  noticeFleetUnderAttack: 'Fleet under attack',
  noticeResourceFieldExhausted: 'Resource field exhausted',
  noticeFleetSupportCapacityReached: 'Fleet support capacity reached',
  noticeResearchComplete: 'Research complete',
  noticeResearchCompleteFmt: '%s: research complete',

  // Extra CONTROL_HELP rows (Left/Right labels stay English; actions Korean)
  ctrlShiftCtrlClick: 'add to / toggle in the selection',
  ctrlTabShiftTab: 'cycle subgroup by class',
  ctrlCtrlA: 'select all',
  ctrlCtrlGroup: 'assign / recall control group (recall twice to centre)',
  ctrlFleetBar: 'select a whole class; double click to frame it',
  ctrlRightDragUpDown: 'move disc: set the destination ALTITUDE',
  ctrlShiftAnyOrder: 'queue it instead of replacing',
  ctrlAMG: 'arm attack-move / move / guard, then click',
  ctrlS: 'stop',
  ctrlD: 'dock',
  ctrlH: 'harvest',
  ctrlAltFormation: 'formation — none, delta, broad, wall, sphere, claw, line, auto',
  ctrlHoldSpaceDrag: 'CAMERA ONLY — left pans, right orbits, no orders fire',
  ctrlAltLeftDrag: 'orbit',
  ctrlArrowsW: 'pan',
  ctrlQE: 'yaw',
  ctrlHoldASD: 'pan (a TAP is the command instead)',
  ctrlSpaceTap: 'centre on the selection',
  ctrlFShiftF: 'frame and follow the selection / cinematic chase',

  // economy.ts 자체 notice() 영문 잔재 4건
  noticeShipCancelled: '%s cancelled',
  noticeInsufficientResources: 'Insufficient resources for %s',
  noticeResearchStarted: '%s: research started',
  noticeShipReady: '%s ready',
};

// ────────────────────────────────────────────────────────────────
// Korean — Korean-first fork. Every key MUST have a Korean entry.
// Brand / proper nouns are kept verbatim.
// ────────────────────────────────────────────────────────────────
const KO: Record<string, string> = {
  // Boot screen
  bootEyebrow: 'e01.ai 실험',
  bootMark: '스타폴',
  bootTagline: '우주 규모 함대 지휘',
  bootTribute: 'Homeworld에 헌정',
  bootStatus: '초기화 중',

  // HUD top bar
  resourceUnits: '자원',
  fleetSupply: '함대 보급',
  fleet: '함대',
  ops: '작전',
  elapsed: '경과',
  opsNominal: '정상',

  // Ship class names (codenames preserved as-is)
  shipScout: 'Probe Scout 정찰기',
  shipInterceptor: 'Talon Interceptor 요격기',
  shipBomber: 'Lance Bomber 폭격기',
  shipAssaultCorvette: 'Hammer Corvette 돌격 호위함',
  shipMissileCorvette: 'Quiver Corvette 미사일 호위함',
  shipIonFrigate: 'Lumen Ion Frigate 이온 프리깃',
  shipAssaultFrigate: 'Bulwark Frigate 방패 프리깃',
  shipDestroyer: 'Aegis Destroyer 방패 구축함',
  shipHeavyCruiser: 'Sovereign Cruiser 주권 순양함',
  shipCollector: 'Ladle Collector 수집기',
  shipRefinery: 'Crucible Refinery 정련소',
  shipCarrier: 'Anvil Carrier 모루 항공모함',
  shipMothership: 'Starfall Mothership 모선',

  // Build categories
  buildCategoryAll: '전 함종',
  buildCategoryFighters: '전투기',
  buildCategoryCorvettes: '호위함',
  buildCategoryFrigates: '프리깃',
  buildCategoryCapitals: '캐피탈',
  buildCategorySupercaps: '슈퍼캐피탈',
  buildCategoryUtility: '유틸리티',
  buildCategorySupport: '지원함',
  buildCategoryCollection: '자원 채집',

  // Research tree
  researchStrikecraft: '스트라이크 크래프트 도그마',
  researchRefining: '이동식 정련',
  researchCapships: '캐피탈 함선 골조',
  researchGuidance: '유도 무기',
  researchPlating: '복합 장갑',
  researchDestroyers: '구축함 계획',
  researchShields: '편향 격자',
  researchCruisers: '주권 함대 계획',
  researchDrives: '이온 추진 조정',

  // Build panel
  production: '생산',
  buildQueue: '생산 대기열',
  research: '연구',
  rally: '집결지',
  setRally: '설정',
  clearRally: '해제',
  clickToCancel: '클릭하여 취소',
  noProducer: '생산 시설 없음',
  lineIdle: '생산 라인 대기',
  noFacility: '시설 없음',
  holdAtHangar: '격납고 대기',
  noActiveProject: '진행 중인 연구 없음',
  rallyCleared: '집결지 해제됨',
  cancelOrderTitle: '이 주문을 취소',
  setRallyTitle: '집결지 배치를 활성화한 뒤 우주 상의 지점을 클릭',
  clearRallyTitle: '집결지 해제 — 신형 함선은 격납고에 대기',
  productionPanelTitle: '생산 (항공모함 또는 모선을 선택하거나 클릭하여 고정)',
  collapsePanelTitle: '생산 패널 접기',

  // Build blockers
  locked: '잠김',
  lockedRequires: '잠김 · 필요',
  insufficientResources: '자원 부족',
  supplyCapReached: '보급 한도 도달',
  buildQueueFull: '생산 대기열 가득 참',

  // Cannot-build notices
  cannotStartResearch: '연구를 시작할 수 없습니다',
  noProductionFacility: '생산 시설이 없습니다',
  mothershipLost: '모선 격침',
  cannotBuildShort: '생산 불가 — 자원·보급·기술 부족',

  // HUD commands
  cmdMoveLabel: '이동',
  cmdAttackLabel: '공격',
  cmdStopLabel: '정지',
  cmdHarvestLabel: '채집',
  cmdDockLabel: '귀환',
  cmdMoveTitle: '이동',
  cmdAttackTitle: '공격',
  cmdStopTitle: '정지',
  cmdHarvestTitle: '채집',
  cmdDockTitle: '귀환',
  cmdMoveBody: '선택 부대를 지정한 지점으로 이동시킵니다. 커서에서 위아래로 드래그해 고도를 정한 뒤 놓습니다.',
  cmdAttackBody: '대상을 강제 사격하거나, 지정한 지점으로 공격 이동하며 경로의 적을 교전합니다.',
  cmdStopBody: '대기 중인 모든 주문을 취소하고 현위치를 유지합니다. 스탠스에 따라 응사 여부는 달라집니다.',
  cmdHarvestBody: '선택 부대를 가장 가까운 가용 자원지에 보내 순환 채집하도록 합니다.',
  cmdDockBody: '가까운 항공모함 또는 모선으로 복귀해 수리·재무장·재급유합니다.',

  // Formations
  formationHeader: '편대',
  formationDelta: '델타',
  formationBroad: '브로드',
  formationWall: '월',
  formationSphere: '스피어',
  formationClaw: '클로',
  formationLine: '라인',
  formationDeltaBody: '촘촉한 화살촉. 기동 속도가 빠르지만 광역 피해에는 취약합니다.',
  formationBroadBody: '넓은 에스컬론. 모든 함이 전방 사격호를 확보합니다.',
  formationWallBody: '일직선 횡대. 최대한의 선회 사격, 최소한의 깊이.',
  formationSphereBody: '중심점 주위 포탄형. 캐피탈 호위 대형입니다.',
  formationClawBody: '양동이 집게. 두 방향의 접근로로 사격을 분산합니다.',
  formationLineBody: '종대로 줄지어 이동. 교전 구간을 비좁게 통과합니다.',

  // Stances
  stanceHeader: '스탠스',
  stanceAggressive: '공격적',
  stanceNeutral: '중립',
  stancePassive: '방어적',
  stanceEvasive: '회피',
  stanceAggressiveBody: '편대를 깨고 센서 범위의 모든 적을 추격합니다.',
  stanceNeutralBody: '주문을 유지하며 사거리 안의 적과 교전합니다.',
  stancePassiveBody: '응사만 합니다. 절대 추격해 이탈하지 않습니다.',
  stanceEvasiveBody: '사격하지 않습니다. 접촉을 피해 함대로 복귀합니다.',

  // Selection inspector
  selection: '선택',
  hull: '선체',
  shield: '방어막',

  // Band overlay hints
  bandAttackMove: '공격 이동 — 목적지를 클릭',
  bandMove: '이동 — 목적지를 클릭, 위아래 드래그로 고도 설정',
  bandGuard: '보호 — 아군 함선을 클릭',

  // Fleet bar
  fleetIdle: '대기',

  // Tactical sensor overlay banner
  sensorsManager: '센서 매니저',

  // Menu
  menuAria: '메뉴',
  menuTitle: '스타폴',
  menuTabControls: '조작',
  menuTabCredits: '크레딧',
  menuTabAudio: '오디오',
  menuCloseTitle: '닫기 (Esc)',
  menuFooter: 'Mike Luan · @mikeluan123 · e01.ai 실험  ·  F1 또는 Esc로 닫기',
  menuHeaderMadeBy: '제작',
  menuHeaderSfx: '효과음',
  menuHeaderMusicCalm: '음악 — 평온',
  menuHeaderMusicCombat: '음악 — 교전',
  menuHeaderWrittenBy: '집필',
  menuModelName: 'Claude Opus 5',
  menuPromptLink: '원본 프롬프트',
  menuHeaderBuiltWith: '사용 도구',
  menuAudioMaster: '마스터',
  menuAudioEffects: '효과음',
  menuAudioMusic: '음악',
  menuAudioBody: '스코어는 디스크에서 스트리밍되며, 효과음은 임팩트를 위해 레이어드된 녹음 트랜지언트입니다. 곡은 OpenGameArt 기여자의 CC0 음악입니다.',
  menuMadeByBody: 'HOMEWORLD(Relic Entertainment, 1999)에 헌정 — 함대는 3차원의 형태여야 한다는 점, 흔적은 적이 어떤 방향으로 이탈하는지 알려주어야 한다는 점, 그리고 침묵과 수평선이 그 어떤 소란보다 가치가 있다는 점을 일깨워 준 작품. Starfall은 독립적 오마주이며 그 미술·음악·코드·상표를 일절 사용하지 않습니다.',

  // Controls help
  ctrlGroupSelecting: '선택',
  ctrlGroupOrdering: '명령',
  ctrlGroupCamera: '카메라',
  ctrlLeftClick: '함선 선택',
  ctrlLeftDrag: '밴드 선택',
  ctrlDoubleClick: '보이는 같은 클래스의 함선 전부 선택',
  ctrlEsc: '보류 주문 취소, 그 외에는 선택 해제',
  ctrlRightClick: '상황 주문 — 공격·귀환·보호·채집·이동',
  ctrlZXCV: '스탠스 — 공격적·중립·방어적·회피',
  ctrlMiddleDrag: '팬',
  ctrlRightDragSideways: '궤도 (보류 주문 취소)',
  ctrlWheel: '줌',

  // Notice messages
  noticeMoveConfirmed: '이동 주문 확정',
  noticeAttacking: '공격 중',
  noticeHarvesting: '채집 중',
  noticeAttackMove: '공격 이동',
  noticeHoldingPosition: '현위치 대기',

  // Research descriptions
  researchDescStrikecraft: '폭격기 편대와 돌격 호위함을 해금합니다.',
  researchDescRefining: 'Crucible 정련소를 해금합니다. 수집기가 자원지에 더 가까이 도킹합니다.',
  researchDescCapships: '이온/돌격 프리깃을 해금합니다.',
  researchDescGuidance: '미사일 호위함을 해금합니다. 함대 전체 무기 피해 +12%.',
  researchDescPlating: '모든 함선 장갑 +20%.',
  researchDescDestroyers: 'Aegis 구축함과 Anvil 항공모함을 해금합니다.',
  researchDescShields: '함대 전체 방어막 +30%.',
  researchDescCruisers: 'Sovereign 중순양함을 해금합니다.',
  researchDescDrives: '모든 함선 속도 +15%.',

  // SFX pack uses
  sfxPackUseSciFi: '레이저, 폭발, 포스 필드, 금속 충돌',
  sfxPackUseImpact: '중장갑/금속 타격',
  sfxPackUseInterface: '클릭, 확인, 알림',

  // HUD ops alert suffixes
  opsUnderFire: '피격 중',
  opsCollectorIdle: '수집기 대기',
  opsInBuild: '건조 중',

  // Units suffix
  unitSingular: '기',
  unitPlural: '기',

  // Formation names (KO)
  formationNameNone: '없음',
  formationNameDelta: '델타',
  formationNameBroad: '브로드',
  formationNameWall: '월',
  formationNameSphere: '스피어',
  formationNameClaw: '클로',
  formationNameLine: '라인',
  formationNameAuto: '자동',

  // Extra in-game notices (KO)
  noticeRallySelectDestination: '집결지: 목적지를 선택하세요',
  noticeFormationAuto: '편대: 자동',
  noticeFormationFmt: '편대:',
  noticeGroupSet: '그룹 %n 설정 (%c)',
  noticeNoResourcesInRange: '범위 내 자원 없음',
  noticeNoDockingBayAvailable: '사용 가능한 격납고 없음',
  noticeDocking: '도킹 중',
  noticeFleetUnderAttack: '함대가 공격받고 있습니다',
  noticeResourceFieldExhausted: '자원지가 소진되었습니다',
  noticeFleetSupportCapacityReached: '함대 보급 한도 도달',
  noticeResearchComplete: '연구 완료',
  noticeResearchCompleteFmt: '%s: 연구 완료',

  // Extra CONTROL_HELP rows (KO)
  ctrlShiftCtrlClick: '선택에 추가 / 선택 토글',
  ctrlTabShiftTab: '클래스별 하위 그룹 순환',
  ctrlCtrlA: '전부 선택',
  ctrlCtrlGroup: '통제 그룹 지정 / 호출 (두 번 호출로 중앙 정렬)',
  ctrlFleetBar: '클래스 전체 선택; 더블 클릭으로 화면에 맞춤',
  ctrlRightDragUpDown: '이동 디스크: 목적지 고도 설정',
  ctrlShiftAnyOrder: '대체하지 않고 대기열에 추가',
  ctrlAMG: '공격 이동/이동/보호를 활성화한 뒤 클릭',
  ctrlS: '정지',
  ctrlD: '귀환',
  ctrlH: '채집',
  ctrlAltFormation: '편대 — 없음, 델타, 브로드, 월, 스피어, 클로, 라인, 자동',
  ctrlHoldSpaceDrag: '카메라 전용 — 좌클릭은 팬, 우클릭은 궤도, 주문 발생 안 함',
  ctrlAltLeftDrag: '궤도',
  ctrlArrowsW: '팬',
  ctrlQE: '요(yaw)',
  ctrlHoldASD: '팬 (탭하면 그 키가 명령이 됨)',
  ctrlSpaceTap: '선택 부대를 중앙으로',
  ctrlFShiftF: '선택 부대를 프레임 / 시네마틱 추적',

  // economy.ts 자체 notice() 영문 잔재 4건 (KO)
  noticeShipCancelled: '%s 취소됨',
  noticeInsufficientResources: '%s 연구에 자원 부족',
  noticeResearchStarted: '%s: 연구 시작',
  noticeShipReady: '%s 준비 완료',
};

// Late-bind the dicts and switch the active locale to Korean. The
// writes go to BOTH the module-level bindings (so direct callers
// in this file see them) and to `globalThis` (so esbuild cannot
// inline the call-site lookups). The globalThis write is what
// actually powers every t() call from other modules.
enDict = EN;
koDict = KO;
(globalThis as unknown as { __enDict: Record<string, string> }).__enDict = EN;
(globalThis as unknown as { __koDict: Record<string, string> }).__koDict = KO;
setLanguage('ko');
// Pin the runtime values onto globalThis so that any module evaluating
// after this line (i18n.ts itself re-imported, hot reload, etc.) starts
// in Korean. esbuild can't drop these because the writes are observable
// — main.ts reads them via initKorean().
(globalThis as unknown as { __i18nReady: true }).__i18nReady = true;