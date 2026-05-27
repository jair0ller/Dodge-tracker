const DOGE_PRICE_API = "https://api.coingecko.com/api/v3/simple/price?ids=dogecoin&vs_currencies=usd&include_24hr_change=true&include_last_updated_at=true";

const milestones = [
  {
    price: 0.20,
    key: "020",
    title: "Doge finds the red rocket nose cone",
    description: "At $0.20, Doge discovers the first piece of the DOGE-1 rocket: a bright red nose cone.",
    mission: "Nose cone secured"
  },
  {
    price: 0.30,
    key: "030",
    title: "Doge finds a propellant tank",
    description: "At $0.30, Doge joyfully comes across a propellant tank in a junk yard.",
    mission: "Propellant tank found"
  },
  {
    price: 0.40,
    key: "040",
    title: "Doge trades a dinosaur bone for engines",
    description: "At $0.40, Doge trades his prized dinosaur bone to the frog museum owner for rocket engines.",
    mission: "Engines acquired"
  },
  {
    price: 0.50,
    key: "050",
    title: "Doge buys the fuel system",
    description: "At $0.50, Doge buys the fuel system and feed lines from a Chihuahua using a fire hydrant pee rights voucher.",
    mission: "Fuel system ready"
  },
  {
    price: 0.60,
    key: "060",
    title: "Doge wins the rocket body at auction",
    description: "At $0.60, Doge buys the rocket ship body at auction for a bag full of treats.",
    mission: "Rocket body purchased"
  },
  {
    price: 0.70,
    key: "070",
    title: "Navigation system crash landing",
    description: "At $0.70, Doge is startled when the guidance/navigation system falls in front of him at the park.",
    mission: "Guidance system recovered"
  },
  {
    price: 0.80,
    key: "080",
    title: "Doge goes all in",
    description: "At $0.80, Doge gambles his house and wins the stage separation system.",
    mission: "Stage separation won"
  },
  {
    price: 0.90,
    key: "090",
    title: "Doge receives the DOGE-1 space suit",
    description: "At $0.90, Doge receives an honorary DOGE-1 space suit in a celebratory award moment.",
    mission: "DOGE-1 suit awarded"
  }
];

const els = {
  price: document.getElementById("priceDisplay"),
  timestamp: document.getElementById("priceTimestamp"),
  mission: document.getElementById("missionDisplay"),
  missionSubtext: document.getElementById("missionSubtext"),
  progressFill: document.getElementById("progressFill"),
  progressDoge: document.getElementById("progressDoge"),
  progressPercent: document.getElementById("progressPercent"),
  progressTrack: document.querySelector(".progress-track"),
  currentScale: document.getElementById("currentScale"),
  scene: document.getElementById("scene"),
  badge: document.getElementById("milestoneBadge"),
  sceneTitle: document.getElementById("sceneTitle"),
  sceneDescription: document.getElementById("sceneDescription"),
  wagCount: document.getElementById("wagCount"),
  previewButtons: document.getElementById("previewButtons"),
  liveModeButton: document.getElementById("liveModeButton")
};

let liveMode = true;
let latestLivePrice = null;
let currentSceneKey = "waiting";

function money(value) {
  if (!Number.isFinite(value)) return "—";
  return `$${value.toLocaleString("en-US", { minimumFractionDigits: 4, maximumFractionDigits: 6 })}`;
}

function chooseMilestone(price) {
  return [...milestones].reverse().find((item) => price >= item.price) || null;
}

function updateProgress(price) {
  const safePrice = Math.max(0, Math.min(price || 0, 1));
  const percent = Math.round(safePrice * 1000) / 10;
  els.progressFill.style.width = `${Math.min(percent, 100)}%`;
  els.progressDoge.style.left = `${Math.min(percent, 100)}%`;
  els.progressPercent.textContent = `${percent.toFixed(1)}%`;
  els.progressTrack.setAttribute("aria-valuenow", String(Math.min(percent, 100)));
  els.currentScale.textContent = money(price || 0);
}

function updateMission(price, milestone) {
  if (price >= 1) {
    els.mission.textContent = "Launch ready 🚀";
    els.missionSubtext.textContent = "DOGE has reached the $1 launch goal";
    return;
  }
  if (milestone) {
    const index = milestones.findIndex((item) => item.key === milestone.key) + 1;
    els.mission.textContent = `${index}/8 parts`;
    els.missionSubtext.textContent = milestone.mission;
  } else {
    els.mission.textContent = "0/8 parts";
    els.missionSubtext.textContent = "First milestone unlocks at $0.20";
  }
}

function setScene(price, forcedMilestone = null) {
  const milestone = forcedMilestone || chooseMilestone(price);
  const nextKey = milestone ? milestone.key : "waiting";

  if (nextKey !== currentSceneKey) {
    els.scene.className = `scene scene-${nextKey}`;
    currentSceneKey = nextKey;
  }

  if (milestone) {
    els.badge.textContent = `$${milestone.price.toFixed(2)} milestone`;
    els.sceneTitle.textContent = milestone.title;
    els.sceneDescription.textContent = milestone.description;
  } else {
    els.badge.textContent = "Mission standby";
    els.sceneTitle.textContent = "Doge is waiting for the first rocket part";
    els.sceneDescription.textContent = "When DOGE reaches $0.20, the rocket assembly story begins.";
  }

  updateMission(price, milestone);
}

async function fetchDogePrice() {
  try {
    const response = await fetch(DOGE_PRICE_API, { cache: "no-store" });
    if (!response.ok) throw new Error(`Price API returned ${response.status}`);
    const data = await response.json();
    const price = data?.dogecoin?.usd;
    if (!Number.isFinite(price)) throw new Error("Price was missing from response");

    latestLivePrice = price;
    els.price.textContent = money(price);
    const updatedAt = data?.dogecoin?.last_updated_at ? new Date(data.dogecoin.last_updated_at * 1000) : new Date();
    els.timestamp.textContent = `Updated ${updatedAt.toLocaleTimeString([], { hour: "numeric", minute: "2-digit" })}`;
    updateProgress(price);
    if (liveMode) setScene(price);
  } catch (error) {
    console.warn(error);
    els.price.textContent = "Price unavailable";
    els.timestamp.textContent = "Using preview mode until the price API responds";
    if (latestLivePrice === null) {
      updateProgress(0);
      setScene(0);
    }
  }
}

function buildPreviewButtons() {
  milestones.forEach((milestone) => {
    const button = document.createElement("button");
    button.type = "button";
    button.textContent = `$${milestone.price.toFixed(2)}`;
    button.addEventListener("click", () => {
      liveMode = false;
      els.price.textContent = `${money(milestone.price)} preview`;
      els.timestamp.textContent = "Preview mode";
      updateProgress(milestone.price);
      setScene(milestone.price, milestone);
    });
    els.previewButtons.appendChild(button);
  });
}

els.liveModeButton.addEventListener("click", () => {
  liveMode = true;
  if (latestLivePrice !== null) {
    els.price.textContent = money(latestLivePrice);
    updateProgress(latestLivePrice);
    setScene(latestLivePrice);
  }
  fetchDogePrice();
});

function localWagCountFallback() {
  const key = "doge1-local-wag-count";
  const current = Number(localStorage.getItem(key) || "0") + 1;
  localStorage.setItem(key, String(current));
  els.wagCount.textContent = current.toLocaleString();
}

async function updateWagCount() {
  // Uses CountAPI for a public, no-backend visitor count on static hosting.
  // If that service is unavailable, the site falls back to a local browser count.
  try {
    const namespace = encodeURIComponent(window.location.hostname || "doge1-local-preview");
    const response = await fetch(`https://api.countapi.xyz/hit/${namespace}/wag-count`);
    if (!response.ok) throw new Error("counter unavailable");
    const data = await response.json();
    els.wagCount.textContent = Number(data.value || 0).toLocaleString();
  } catch (error) {
    localWagCountFallback();
  }
}

buildPreviewButtons();
fetchDogePrice();
updateWagCount();
setInterval(fetchDogePrice, 30000);
