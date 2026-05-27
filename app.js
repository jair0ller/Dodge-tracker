const API_URL =
  "https://api.coingecko.com/api/v3/simple/price?ids=dogecoin&vs_currencies=usd&include_24hr_change=true&include_last_updated_at=true";

const REFRESH_MS = 20_000;
const STORAGE_KEY = "dogeSurpriseMissionPublic";

// Tentative DOGE-1 launch countdown target. Update this if your launch source changes.
const LAUNCH_TARGET_UTC = "2026-09-13T00:00:00Z";

const MILESTONES = [
  { threshold: 0.20, key: "nose", icon: "🔺" },
  { threshold: 0.30, key: "tanks", icon: "🛢️" },
  { threshold: 0.40, key: "engines", icon: "🔥" },
  { threshold: 0.50, key: "fuel", icon: "🧪" },
  { threshold: 0.60, key: "body", icon: "🧱" },
  { threshold: 0.70, key: "guidance", icon: "🛰️" },
  { threshold: 0.80, key: "separation", icon: "🔩" },
  { threshold: 0.90, key: "suit", icon: "🧑‍🚀" },
  { threshold: 1.00, key: "moon", icon: "🌕" }
];

const MOON_SEQUENCE_STEPS = [
  { key: "approach" },
  { key: "hover" },
  { key: "touchdown" },
  { key: "flag" }
];

const els = {
  price: document.querySelector("#price"),
  visitorCount: document.querySelector("#visitorCount"),
  launchCountdown: document.querySelector("#launchCountdown"),
  scene: document.querySelector("#scene"),
  foundPart: document.querySelector("#foundPart"),
  partToken: document.querySelector("#partToken"),
  statusText: document.querySelector("#statusText"),
  lastUpdated: document.querySelector("#lastUpdated"),
  coinBadge: document.querySelector("#coinBadge"),
  previewCoin: document.querySelector("#previewCoin")
};

const state = {
  previousPrice: Number(localStorage.getItem(`${STORAGE_KEY}:lastPrice`)) || null,
  moonStepIndex: 0,
  moonSequenceInterval: null,
  lastStageMode: null
};

function formatPrice(value) {
  if (!Number.isFinite(value)) return "$—";
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    minimumFractionDigits: value < 1 ? 3 : 2,
    maximumFractionDigits: value < 1 ? 4 : 2
  }).format(value);
}

function formatInteger(value) {
  const number = Number(value);
  if (!Number.isFinite(number)) return "—";
  return new Intl.NumberFormat("en-US").format(number);
}

function restartClass(el, className) {
  if (!el) return;
  el.classList.remove(className);
  void el.offsetWidth;
  el.classList.add(className);
}

function getStage(price) {
  if (price >= 1.0) return { mode: "moon", milestone: MILESTONES.find(item => item.key === "moon") };
  if (price >= 0.9) return { mode: "spacex", milestone: MILESTONES.find(item => item.key === "suit") };

  let highest = null;
  for (const item of MILESTONES) {
    if (item.threshold < 0.9 && price >= item.threshold) highest = item;
  }

  return { mode: "search", milestone: highest };
}

function updateAssembly(price) {
  const thresholds = {
    nose: 0.2,
    tanks: 0.3,
    engines: 0.4,
    fuel: 0.5,
    body: 0.6,
    guidance: 0.7,
    separation: 0.8
  };

  const parts = {
    nose: document.querySelectorAll('[data-part="nose"]'),
    tanks: document.querySelectorAll('[data-part="tanks"]'),
    engines: document.querySelectorAll('[data-part="engines"]'),
    fuel: document.querySelectorAll('[data-part="fuel"]'),
    body: document.querySelectorAll('[data-part="body"]'),
    guidance: document.querySelectorAll('[data-part="guidance"]'),
    separation: document.querySelectorAll('[data-part="separation"]')
  };

  Object.entries(parts).forEach(([key, nodes]) => {
    const active = price >= thresholds[key];
    nodes.forEach(node => node.classList.toggle("found", active));
  });

  if (els.scene) els.scene.dataset.suit = price >= 0.9 ? "true" : "false";
}

function applyMoonSequenceStep(index) {
  state.moonStepIndex = index;
  const step = MOON_SEQUENCE_STEPS[index] || MOON_SEQUENCE_STEPS[0];
  if (els.scene) els.scene.dataset.landingStep = step.key;
}

function startMoonSequence(reset = false) {
  if (reset) {
    stopMoonSequence();
    applyMoonSequenceStep(0);
  }

  if (state.moonSequenceInterval) return;

  state.moonSequenceInterval = window.setInterval(() => {
    state.moonStepIndex = (state.moonStepIndex + 1) % MOON_SEQUENCE_STEPS.length;
    applyMoonSequenceStep(state.moonStepIndex);
  }, 1900);
}

function stopMoonSequence() {
  if (state.moonSequenceInterval) {
    window.clearInterval(state.moonSequenceInterval);
    state.moonSequenceInterval = null;
  }
  state.moonStepIndex = 0;
  if (els.scene) els.scene.dataset.landingStep = "approach";
}

function updateScene(price) {
  const stage = getStage(price);

  if (state.lastStageMode === "moon" && stage.mode !== "moon") {
    stopMoonSequence();
  }

  if (els.scene) {
    els.scene.classList.remove("stage-search", "stage-spacex", "stage-moon");
    els.scene.classList.add(`stage-${stage.mode}`);
  }

  if (stage.mode === "moon") {
    if (state.lastStageMode !== "moon") startMoonSequence(true);
    else if (!state.moonSequenceInterval) startMoonSequence(false);
    state.lastStageMode = "moon";
    return;
  }

  if (stage.mode === "spacex") {
    state.lastStageMode = "spacex";
    return;
  }

  if (stage.milestone) {
    if (els.partToken) els.partToken.textContent = stage.milestone.icon;
    restartClass(els.foundPart, "reveal");
  } else if (els.partToken) {
    els.partToken.textContent = "⚙️";
  }

  restartClass(els.coinBadge, "search");
  restartClass(els.previewCoin, "search");
  state.lastStageMode = "search";
}

function updatePrice(price, dayChange, lastUpdatedSeconds) {
  const delta = state.previousPrice === null ? 0 : price - state.previousPrice;
  const move = delta > 0 ? "up" : delta < 0 ? "down" : "flat";

  if (els.price) els.price.textContent = formatPrice(price);

  updateAssembly(price);
  updateScene(price);

  if (move === "up") {
    restartClass(els.coinBadge, "up");
    restartClass(els.previewCoin, "up");
  } else if (move === "down") {
    restartClass(els.coinBadge, "down");
    restartClass(els.previewCoin, "down");
  }

  state.previousPrice = price;
  localStorage.setItem(`${STORAGE_KEY}:lastPrice`, String(price));

  if (els.statusText) els.statusText.textContent = "Live";
  if (els.lastUpdated) {
    const updated = Number.isFinite(lastUpdatedSeconds)
      ? new Date(lastUpdatedSeconds * 1000)
      : new Date();
    els.lastUpdated.textContent = updated.toLocaleString();
  }
}

async function fetchDogePrice() {
  try {
    if (els.statusText) els.statusText.textContent = "Updating…";
    const response = await fetch(API_URL, {
      headers: { accept: "application/json" },
      cache: "no-store"
    });

    if (!response.ok) throw new Error(`Price API returned ${response.status}`);

    const data = await response.json();
    const doge = data?.dogecoin;
    const price = Number(doge?.usd);
    const dayChange = Number(doge?.usd_24h_change);
    const updated = Number(doge?.last_updated_at);

    if (!Number.isFinite(price)) throw new Error("Missing Dogecoin price.");

    updatePrice(price, dayChange, updated);
  } catch (error) {
    console.error(error);
    const fallback = state.previousPrice || 0.12;
    updatePrice(fallback, 0, Date.now() / 1000);
    if (els.statusText) els.statusText.textContent = "Price feed unavailable";
  }
}

function updateLaunchCountdown() {
  if (!els.launchCountdown) return;

  const target = new Date(LAUNCH_TARGET_UTC).getTime();
  let diff = target - Date.now();

  if (!Number.isFinite(target)) {
    els.launchCountdown.textContent = "TBD";
    return;
  }

  if (diff <= 0) {
    els.launchCountdown.textContent = "Launch window open";
    return;
  }

  const days = Math.floor(diff / 86_400_000);
  diff -= days * 86_400_000;
  const hours = Math.floor(diff / 3_600_000);
  diff -= hours * 3_600_000;
  const minutes = Math.floor(diff / 60_000);
  diff -= minutes * 60_000;
  const seconds = Math.floor(diff / 1000);

  els.launchCountdown.textContent = `${days}d ${hours}h ${minutes}m ${seconds}s`;
}

async function updateVisitorCount() {
  if (!els.visitorCount) return;

  const host = (window.location.hostname || "local-preview")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "_")
    .replace(/^_+|_+$/g, "");

  const key = `doge_surprise_mission_${host || "local_preview"}`;

  try {
    const response = await fetch(`https://countapi.mileshilliard.com/api/v1/hit/${encodeURIComponent(key)}`, {
      cache: "no-store"
    });

    if (!response.ok) throw new Error(`Visitor API returned ${response.status}`);

    const data = await response.json();
    els.visitorCount.textContent = formatInteger(data.value);
  } catch (error) {
    console.error(error);

    const localKey = `${STORAGE_KEY}:localVisitorCount`;
    const localCount = Number(localStorage.getItem(localKey) || "0") + 1;
    localStorage.setItem(localKey, String(localCount));

    els.visitorCount.textContent = formatInteger(localCount);
    els.visitorCount.title = "Local fallback count shown because the visitor counter API could not be reached.";
  }
}

function init() {
  updateLaunchCountdown();
  window.setInterval(updateLaunchCountdown, 1000);

  updateVisitorCount();

  fetchDogePrice();
  window.setInterval(fetchDogePrice, REFRESH_MS);
}

window.addEventListener("beforeunload", () => {
  if (state.moonSequenceInterval) window.clearInterval(state.moonSequenceInterval);
});

init();
