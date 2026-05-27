const API_URL =
  "https://api.coingecko.com/api/v3/simple/price?ids=dogecoin&vs_currencies=usd&include_24hr_change=true&include_last_updated_at=true";

const REFRESH_MS = 20_000;
const STORAGE_KEY = "dogeMissionCinematic";
const LOG_MAX = 14;

const MILESTONES = [
  { threshold: 0.20, key: "nose", title: "Nose cone / fairing found", shortTitle: "Nose cone / fairing", description: "Doge uncovers the rocket nose cone while digging through junkyard piles.", label: "Nose cone / fairing found", icon: "🔺", part: "nose" },
  { threshold: 0.30, key: "tanks", title: "Propellant tanks found", shortTitle: "Propellant tanks", description: "After trading treats for scrap, Doge scores the propellant tanks.", label: "Propellant tanks found", icon: "🛢️", part: "tanks" },
  { threshold: 0.40, key: "engines", title: "Rocket engines found", shortTitle: "Rocket engines", description: "Doge trades bones and finds rocket engines buried in the piles.", label: "Rocket engines found", icon: "🔥", part: "engines" },
  { threshold: 0.50, key: "fuel", title: "Fuel system / feed lines found", shortTitle: "Fuel system / feed lines", description: "Doge barters for the fuel system and feed lines to connect the build.", label: "Fuel system / feed lines found", icon: "🧪", part: "fuel" },
  { threshold: 0.60, key: "body", title: "Structural frame / body found", shortTitle: "Structural frame / body", description: "The main structural frame is hauled out of the junk heaps.", label: "Structural frame / body found", icon: "🧱", part: "body" },
  { threshold: 0.70, key: "guidance", title: "Guidance, navigation, and control system found", shortTitle: "Guidance / navigation / control", description: "Doge finds the brains of the rocket: guidance, navigation, and control.", label: "Guidance, navigation, and control found", icon: "🛰️", part: "guidance" },
  { threshold: 0.80, key: "separation", title: "Stage separation system found", shortTitle: "Stage separation system", description: "One more trade later, Doge discovers the stage separation system.", label: "Stage separation system found", icon: "🔩", part: "separation" },
  { threshold: 0.90, key: "suit", title: "Astronaut suit found", shortTitle: "Astronaut suit", description: "At SPACE X, cartoon Elon Musk gives Doge the astronaut suit.", label: "Astronaut suit found at SPACE X", icon: "🧑‍🚀", part: "suit" },
  { threshold: 1.00, key: "moon", title: "Lands on moon", shortTitle: "Moon landing", description: "Mission complete. Doge lands on the moon at $1.00.", label: "Lands on the moon", icon: "🌕", part: "moon" }
];

const DEMO_PRICES = [0.12, 0.20, 0.30, 0.40, 0.50, 0.60, 0.70, 0.80, 0.90, 1.00];

const MOON_SEQUENCE_STEPS = [
  {
    key: "approach",
    title: "Final approach",
    copy: "The rocket aligns with the landing site and begins its descent corridor.",
    sceneTitle: "Moon landing — final approach",
    sceneDescription: "Doge begins the last descent to the lunar surface as the rocket lines up for landing."
  },
  {
    key: "hover",
    title: "Hover check",
    copy: "The rocket hovers above the surface while Doge steadies the landing.",
    sceneTitle: "Moon landing — hover",
    sceneDescription: "The rocket pauses in a controlled hover while Doge checks the landing position."
  },
  {
    key: "touchdown",
    title: "Touchdown",
    copy: "The landing legs settle into the moon dust and the surface plume blooms outward.",
    sceneTitle: "Moon landing — touchdown",
    sceneDescription: "The rocket settles onto the moon and kicks up lunar dust in a dramatic touchdown."
  },
  {
    key: "flag",
    title: "Flag plant",
    copy: "Doge steps out in the astronaut suit and plants the DOGE TO THE MOON flag.",
    sceneTitle: "Moon landing — flag plant",
    sceneDescription: "Mission complete: Doge steps onto the moon and plants the flag to finish the story."
  }
];

const state = {
  previousPrice: null,
  unlockedKeys: [],
  log: [],
  soundEnabled: true,
  liveMode: true,
  refreshTimer: null,
  toastTimer: null,
  audioContext: null,
  moonSequenceInterval: null,
  moonStepIndex: 0,
  currentMoonStep: "approach",
  lastStageMode: null
};

const saved = JSON.parse(localStorage.getItem(STORAGE_KEY) || "{}");
state.previousPrice = Number(saved.previousPrice) || null;
state.unlockedKeys = Array.isArray(saved.unlockedKeys) ? saved.unlockedKeys : [];
state.log = Array.isArray(saved.log) ? saved.log : [];
state.soundEnabled = saved.soundEnabled !== false;

const els = {
  price: document.querySelector("#price"),
  instantChange: document.querySelector("#instantChange"),
  dayChange: document.querySelector("#dayChange"),
  lastUpdated: document.querySelector("#lastUpdated"),
  statusDot: document.querySelector("#statusDot"),
  statusText: document.querySelector("#statusText"),
  nextTarget: document.querySelector("#nextTarget"),
  progressFill: document.querySelector("#progressFill"),
  progressLabel: document.querySelector("#progressLabel"),
  coinBadge: document.querySelector("#coinBadge"),
  previewCoin: document.querySelector("#previewCoin"),
  refreshBtn: document.querySelector("#refreshBtn"),
  liveModeBtn: document.querySelector("#liveModeBtn"),
  soundToggleBtn: document.querySelector("#soundToggleBtn"),
  demoPoints: document.querySelector("#demoPoints"),
  milestonesList: document.querySelector("#milestonesList"),
  milestoneItemTemplate: document.querySelector("#milestoneItemTemplate"),
  missionLog: document.querySelector("#missionLog"),
  logItemTemplate: document.querySelector("#logItemTemplate"),
  clearLogBtn: document.querySelector("#clearLogBtn"),
  scene: document.querySelector("#scene"),
  sceneTitle: document.querySelector("#sceneTitle"),
  sceneDescription: document.querySelector("#sceneDescription"),
  currentStateTitle: document.querySelector("#currentStateTitle"),
  currentStateCopy: document.querySelector("#currentStateCopy"),
  foundItemLabel: document.querySelector("#foundItemLabel"),
  foundItemCopy: document.querySelector("#foundItemCopy"),
  partToken: document.querySelector("#partToken"),
  foundPart: document.querySelector("#foundPart"),
  assemblyStatus: document.querySelector("#assemblyStatus"),
  toast: document.querySelector("#toast"),
  toastTitle: document.querySelector("#toastTitle"),
  toastText: document.querySelector("#toastText"),
  landingStepTitle: document.querySelector("#landingStepTitle"),
  landingStepCopy: document.querySelector("#landingStepCopy")
};

function saveState() {
  localStorage.setItem(STORAGE_KEY, JSON.stringify({
    previousPrice: state.previousPrice,
    unlockedKeys: state.unlockedKeys,
    log: state.log.slice(0, LOG_MAX),
    soundEnabled: state.soundEnabled
  }));
}

function formatPrice(value) {
  if (!Number.isFinite(value)) return "$—";
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    minimumFractionDigits: value < 1 ? 3 : 2,
    maximumFractionDigits: value < 1 ? 4 : 2
  }).format(value);
}
function formatPercent(value) {
  if (!Number.isFinite(value)) return "—";
  return `${value > 0 ? "+" : ""}${value.toFixed(2)}%`;
}
function formatDelta(value) {
  if (!Number.isFinite(value)) return "—";
  return `${value > 0 ? "+" : ""}${formatPrice(value)}`;
}

function setStatus(kind, text) {
  els.statusDot.className = `status-dot ${kind}`;
  els.statusText.textContent = text;
}
function setMoveClass(el, move) {
  el.classList.remove("up-text", "down-text");
  if (move === "up") el.classList.add("up-text");
  if (move === "down") el.classList.add("down-text");
}
function restartClass(el, className) {
  el.classList.remove(className);
  void el.offsetWidth;
  el.classList.add(className);
}

function ensureAudio() {
  if (!state.audioContext) {
    const AudioContext = window.AudioContext || window.webkitAudioContext;
    if (!AudioContext) return null;
    state.audioContext = new AudioContext();
  }
  return state.audioContext;
}
function playTone(freq = 440, duration = 0.08, type = "sine", volume = 0.03) {
  if (!state.soundEnabled) return;
  const ctx = ensureAudio();
  if (!ctx) return;
  const osc = ctx.createOscillator();
  const gain = ctx.createGain();
  osc.type = type;
  osc.frequency.value = freq;
  gain.gain.value = volume;
  osc.connect(gain);
  gain.connect(ctx.destination);
  osc.start();
  osc.stop(ctx.currentTime + duration);
  gain.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + duration);
}
function playMilestoneSound() {
  playTone(660, 0.08, "triangle", 0.04);
  setTimeout(() => playTone(880, 0.11, "triangle", 0.04), 70);
  setTimeout(() => playTone(1100, 0.14, "triangle", 0.04), 150);
}
function playMoonSound() {
  playTone(440, 0.08, "triangle", 0.05);
  setTimeout(() => playTone(523.25, 0.08, "triangle", 0.05), 90);
  setTimeout(() => playTone(659.25, 0.10, "triangle", 0.05), 180);
  setTimeout(() => playTone(783.99, 0.12, "triangle", 0.05), 270);
  setTimeout(() => playTone(1046.5, 0.18, "triangle", 0.05), 360);
}

function showToast(title, text) {
  els.toastTitle.textContent = title;
  els.toastText.textContent = text;
  els.toast.classList.add("show");
  clearTimeout(state.toastTimer);
  state.toastTimer = setTimeout(() => els.toast.classList.remove("show"), 2600);
}
function addLog(title, desc) {
  const item = {
    time: new Date().toLocaleTimeString([], { hour: "numeric", minute: "2-digit", second: "2-digit" }),
    title, desc
  };
  state.log = [item, ...state.log].slice(0, LOG_MAX);
  saveState();
  renderLog();
}
function renderLog() {
  els.missionLog.innerHTML = "";
  if (state.log.length === 0) {
    const li = document.createElement("li");
    li.className = "log-item";
    li.textContent = "No mission events yet.";
    els.missionLog.appendChild(li);
    return;
  }
  for (const item of state.log) {
    const node = els.logItemTemplate.content.cloneNode(true);
    node.querySelector(".log-time").textContent = item.time;
    node.querySelector(".log-title").textContent = item.title;
    node.querySelector(".log-desc").textContent = item.desc;
    els.missionLog.appendChild(node);
  }
}

function getStage(price) {
  if (price >= 1.0) {
    return { mode: "moon", milestone: MILESTONES.find(item => item.key === "moon") };
  }
  if (price >= 0.9) {
    return { mode: "spacex", milestone: MILESTONES.find(item => item.key === "suit") };
  }
  let highest = null;
  for (const item of MILESTONES) {
    if (item.threshold < 0.9 && price >= item.threshold) highest = item;
  }
  return { mode: "search", milestone: highest };
}
function getNextTarget(price) {
  return MILESTONES.find(item => price < item.threshold) || null;
}

function updateProgress(price) {
  const clamped = Math.max(0, Math.min(1, price));
  const pct = clamped * 100;
  els.progressFill.style.width = `${pct}%`;
  els.progressLabel.textContent = `${Math.round(pct)}%`;
  const next = getNextTarget(price);
  els.nextTarget.textContent = next ? `Next target: ${formatPrice(next.threshold)} — ${next.shortTitle}` : "Next target: Mission complete";
}

function updateAssembly(price) {
  const thresholds = { nose: 0.2, tanks: 0.3, engines: 0.4, fuel: 0.5, body: 0.6, guidance: 0.7, separation: 0.8 };
  const parts = {
    nose: document.querySelectorAll('[data-part="nose"]'),
    tanks: document.querySelectorAll('[data-part="tanks"]'),
    engines: document.querySelectorAll('[data-part="engines"]'),
    fuel: document.querySelectorAll('[data-part="fuel"]'),
    body: document.querySelectorAll('[data-part="body"]'),
    guidance: document.querySelectorAll('[data-part="guidance"]'),
    separation: document.querySelectorAll('[data-part="separation"]')
  };
  let foundCount = 0;
  Object.entries(parts).forEach(([key, nodes]) => {
    const active = price >= thresholds[key];
    if (active) foundCount += 1;
    nodes.forEach(node => node.classList.toggle("found", active));
  });
  els.scene.dataset.suit = price >= 0.9 ? "true" : "false";
  if (price >= 1.0) {
    els.assemblyStatus.textContent = "Rocket complete — Cinematic moon landing";
  } else if (price >= 0.9) {
    els.assemblyStatus.textContent = "Rocket complete — Suit acquired";
  } else {
    els.assemblyStatus.textContent = `${foundCount}/7 parts discovered`;
  }
}

function renderMilestones(price) {
  els.milestonesList.innerHTML = "";
  const current = getStage(price).milestone?.key || null;
  for (const item of MILESTONES) {
    const node = els.milestoneItemTemplate.content.cloneNode(true);
    const root = node.querySelector(".milestone-item");
    node.querySelector(".milestone-price").textContent = formatPrice(item.threshold);
    node.querySelector(".milestone-title").textContent = item.title;
    node.querySelector(".milestone-desc").textContent = item.description;
    const stateEl = node.querySelector(".milestone-state");
    let label = "Locked";
    if (price >= item.threshold) {
      root.classList.add("complete");
      label = "Unlocked";
    }
    if (current === item.key) {
      root.classList.add("current");
      label = "Current";
    }
    stateEl.textContent = label;
    els.milestonesList.appendChild(node);
  }
}


function getMoonStep(index = state.moonStepIndex) {
  return MOON_SEQUENCE_STEPS[index] || MOON_SEQUENCE_STEPS[0];
}

function applyMoonSequenceStep(index, syncSceneCopy = true) {
  state.moonStepIndex = index;
  const step = getMoonStep(index);
  state.currentMoonStep = step.key;
  els.scene.dataset.landingStep = step.key;
  if (els.landingStepTitle) els.landingStepTitle.textContent = step.title;
  if (els.landingStepCopy) els.landingStepCopy.textContent = step.copy;
  if (syncSceneCopy) {
    setSceneCopy(step.sceneTitle, step.sceneDescription);
  }
}

function startMoonSequence(reset = false) {
  if (reset) {
    if (state.moonSequenceInterval) {
      window.clearInterval(state.moonSequenceInterval);
      state.moonSequenceInterval = null;
    }
    applyMoonSequenceStep(0, true);
  }

  if (state.moonSequenceInterval) return;

  applyMoonSequenceStep(state.moonStepIndex || 0, true);
  state.moonSequenceInterval = window.setInterval(() => {
    state.moonStepIndex = (state.moonStepIndex + 1) % MOON_SEQUENCE_STEPS.length;
    applyMoonSequenceStep(state.moonStepIndex, true);
  }, 1900);
}

function stopMoonSequence() {
  if (state.moonSequenceInterval) {
    window.clearInterval(state.moonSequenceInterval);
    state.moonSequenceInterval = null;
  }
  state.moonStepIndex = 0;
  state.currentMoonStep = "approach";
  if (els.scene) els.scene.dataset.landingStep = "approach";
  if (els.landingStepTitle) els.landingStepTitle.textContent = MOON_SEQUENCE_STEPS[0].title;
  if (els.landingStepCopy) els.landingStepCopy.textContent = MOON_SEQUENCE_STEPS[0].copy;
}

function setSceneCopy(title, desc) {
  els.sceneTitle.textContent = title;
  els.sceneDescription.textContent = desc;
  els.currentStateTitle.textContent = title;
  els.currentStateCopy.textContent = desc;
}

function updateScene(price) {
  const stage = getStage(price);

  if (state.lastStageMode === "moon" && stage.mode !== "moon") {
    stopMoonSequence();
  }

  els.scene.classList.remove("stage-search", "stage-spacex", "stage-moon");
  els.scene.classList.add(`stage-${stage.mode}`);

  if (stage.mode === "moon") {
    if (state.lastStageMode !== "moon") {
      startMoonSequence(true);
      addLog("Final descent sequence", "Multi-step landing sequence engaged: approach, hover, touchdown, and flag plant.");
    } else if (!state.moonSequenceInterval) {
      startMoonSequence(true);
    } else {
      applyMoonSequenceStep(state.moonStepIndex, true);
    }
    state.lastStageMode = "moon";
    return;
  }

  if (stage.mode === "spacex") {
    setSceneCopy(
      "Suit-up at SPACE X",
      "Cartoon Elon Musk presents Doge with an astronaut suit so the moon mission can begin."
    );
    state.lastStageMode = "spacex";
    return;
  }

  if (!stage.milestone) {
    setSceneCopy(
      "Searching the junkyard",
      "Below $0.15, Doge searches junkyard piles and trades bones and treats for clues about rocket parts."
    );
    els.foundItemLabel.textContent = "Searching junkyard piles…";
    els.foundItemCopy.textContent = "Doge is scouting scrap and bargaining for clues.";
    els.partToken.textContent = "⚙️";
    restartClass(els.coinBadge, "search");
    restartClass(els.previewCoin, "search");
    state.lastStageMode = "search";
    return;
  }

  setSceneCopy(stage.milestone.title, stage.milestone.description);
  els.foundItemLabel.textContent = stage.milestone.label;
  els.foundItemCopy.textContent = `Unlocked at ${formatPrice(stage.milestone.threshold)} while Doge searched junkyard piles and traded snacks for parts.`;
  els.partToken.textContent = stage.milestone.icon;
  restartClass(els.foundPart, "reveal");
  state.lastStageMode = "search";
}

function maybeUnlockMilestones(price) {
  const newlyUnlocked = MILESTONES.filter(item => price >= item.threshold && !state.unlockedKeys.includes(item.key));
  if (!newlyUnlocked.length) return;
  for (const item of newlyUnlocked) {
    state.unlockedKeys.push(item.key);
    const title = item.key === "moon" ? "Cinematic moon landing unlocked!" : `Milestone unlocked: ${item.shortTitle}`;
    const desc = item.key === "moon"
      ? "Doge has reached the moon at $1.00 with a multi-step landing sequence."
      : `${item.label} at ${formatPrice(item.threshold)}.`;
    addLog(title, desc);
    showToast(title, desc);
    if (item.key === "moon") playMoonSound(); else playMilestoneSound();
  }
  saveState();
}

function updatePrice(price, dayChange, lastUpdatedSeconds, source = "Live") {
  const delta = state.previousPrice === null ? 0 : price - state.previousPrice;
  const move = delta > 0 ? "up" : delta < 0 ? "down" : "flat";
  const updated = Number.isFinite(lastUpdatedSeconds) ? new Date(lastUpdatedSeconds * 1000) : new Date();

  els.price.textContent = formatPrice(price);
  els.instantChange.textContent = state.previousPrice === null ? "First check" : formatDelta(delta);
  els.dayChange.textContent = formatPercent(dayChange);
  els.lastUpdated.textContent = `Last updated: ${updated.toLocaleString()}`;

  setMoveClass(els.instantChange, move);
  setMoveClass(els.dayChange, dayChange > 0 ? "up" : dayChange < 0 ? "down" : "flat");

  els.coinBadge.classList.remove("up", "down", "search");
  els.previewCoin.classList.remove("up", "down", "search");
  if (move === "up") {
    restartClass(els.coinBadge, "up");
    restartClass(els.previewCoin, "up");
  } else if (move === "down") {
    restartClass(els.coinBadge, "down");
    restartClass(els.previewCoin, "down");
  }

  updateProgress(price);
  updateAssembly(price);
  updateScene(price);
  renderMilestones(price);
  maybeUnlockMilestones(price);

  state.previousPrice = price;
  saveState();
  if (source === "Demo") setStatus("ok", "Demo mode");
}

async function fetchDogePrice() {
  setStatus("", "Updating…");
  els.refreshBtn.disabled = true;
  try {
    const response = await fetch(API_URL, { headers: { accept: "application/json" }, cache: "no-store" });
    if (!response.ok) throw new Error(`CoinGecko returned ${response.status}`);
    const data = await response.json();
    const doge = data?.dogecoin;
    const price = Number(doge?.usd);
    const dayChange = Number(doge?.usd_24h_change);
    const updated = Number(doge?.last_updated_at);
    if (!Number.isFinite(price)) throw new Error("Missing dogecoin price in response.");
    updatePrice(price, dayChange, updated, "Live");
    setStatus("ok", "Live");
  } catch (error) {
    console.error(error);
    setStatus("error", "Could not load price");
    const fallback = state.previousPrice || 0.12;
    updatePrice(fallback, 0, Date.now() / 1000, "Fallback");
    addLog("Connection hiccup", "The live price feed could not be reached. Demo or refresh again.");
  } finally {
    els.refreshBtn.disabled = false;
  }
}

function makeDemoButtons() {
  for (const value of DEMO_PRICES) {
    const btn = document.createElement("button");
    btn.type = "button";
    btn.className = "ghost";
    btn.textContent = formatPrice(value);
    btn.addEventListener("click", () => {
      state.liveMode = false;
      els.liveModeBtn.textContent = "Return to live mode";
      updatePrice(value, value >= 1 ? 12.5 : value * 10 - 2, Date.now() / 1000, "Demo");
      addLog("Demo milestone preview", `Jumped to ${formatPrice(value)}.`);
    });
    els.demoPoints.appendChild(btn);
  }
}

function resumeLiveMode() {
  state.liveMode = true;
  els.liveModeBtn.textContent = "Live mode";
  fetchDogePrice();
}

els.refreshBtn.addEventListener("click", fetchDogePrice);
els.liveModeBtn.addEventListener("click", resumeLiveMode);
els.soundToggleBtn.addEventListener("click", () => {
  state.soundEnabled = !state.soundEnabled;
  els.soundToggleBtn.textContent = `Sound: ${state.soundEnabled ? "On" : "Off"}`;
  saveState();
  if (state.soundEnabled) playTone(660, 0.06, "triangle", 0.03);
});
els.clearLogBtn.addEventListener("click", () => {
  state.log = [];
  saveState();
  renderLog();
});

function init() {
  els.soundToggleBtn.textContent = `Sound: ${state.soundEnabled ? "On" : "Off"}`;
  makeDemoButtons();
  renderLog();
  updatePrice(state.previousPrice || 0.12, 0, Date.now() / 1000, "Init");
  addLog("Mission control ready", "Dashboard initialized and waiting for DOGE price updates.");
  fetchDogePrice();
  state.refreshTimer = window.setInterval(() => {
    if (state.liveMode) fetchDogePrice();
  }, REFRESH_MS);
}

window.addEventListener("beforeunload", () => {
  if (state.refreshTimer) window.clearInterval(state.refreshTimer);
  if (state.moonSequenceInterval) window.clearInterval(state.moonSequenceInterval);
});

init();
