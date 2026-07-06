const symbols = [
  { id: "wan", tile: "萬", name: "萬子", color: "red", pays: [0, 0, 8, 25, 80] },
  { id: "tong", tile: "筒", name: "筒子", color: "green", pays: [0, 0, 7, 20, 70] },
  { id: "suo", tile: "索", name: "索子", color: "green", pays: [0, 0, 6, 18, 60] },
  { id: "dong", tile: "東", name: "東風", color: "", pays: [0, 0, 5, 15, 45] },
  { id: "nan", tile: "南", name: "南風", color: "", pays: [0, 0, 5, 15, 45] },
  { id: "zhong", tile: "中", name: "紅中", color: "red", pays: [0, 0, 10, 35, 100] },
  { id: "fa", tile: "發", name: "發財", color: "green", scatter: true, pays: [0, 0, 3, 12, 40] },
  { id: "wild", tile: "花", name: "花牌 Wild", color: "gold", wild: true, pays: [0, 0, 0, 0, 0] }
];

const strip = [
  "wan", "tong", "suo", "dong", "nan", "zhong", "fa",
  "wan", "tong", "suo", "dong", "nan", "zhong",
  "wild", "wan", "tong", "suo", "fa", "dong", "nan"
];

const lines = [
  [1, 1, 1, 1, 1],
  [0, 0, 0, 0, 0],
  [2, 2, 2, 2, 2],
  [0, 1, 2, 1, 0],
  [2, 1, 0, 1, 2],
  [0, 0, 1, 2, 2],
  [2, 2, 1, 0, 0],
  [1, 0, 0, 0, 1],
  [1, 2, 2, 2, 1]
];

const state = {
  balance: 5000,
  bet: 50,
  lastWin: 0,
  jackpots: {
    grand: 88888,
    major: 18880,
    minor: 3880,
    mini: 888
  },
  round: 0,
  bestWin: 0,
  freeSpins: 0,
  spinning: false,
  auto: false,
  turbo: false,
  sound: true,
  grid: []
};

const els = {
  reels: document.querySelector("#reels"),
  balance: document.querySelector("#balance"),
  winMeter: document.querySelector("#winMeter"),
  betInput: document.querySelector("#betInput"),
  betDown: document.querySelector("#betDown"),
  betUp: document.querySelector("#betUp"),
  maxBetButton: document.querySelector("#maxBetButton"),
  turboButton: document.querySelector("#turboButton"),
  spinButton: document.querySelector("#spinButton"),
  autoButton: document.querySelector("#autoButton"),
  roundCount: document.querySelector("#roundCount"),
  grandJackpot: document.querySelector("#grandJackpot"),
  majorJackpot: document.querySelector("#majorJackpot"),
  minorJackpot: document.querySelector("#minorJackpot"),
  miniJackpot: document.querySelector("#miniJackpot"),
  freeSpins: document.querySelector("#freeSpins"),
  statusText: document.querySelector("#statusText"),
  winBanner: document.querySelector("#winBanner"),
  winTitle: document.querySelector("#winTitle"),
  winAmount: document.querySelector("#winAmount"),
  payList: document.querySelector("#payList"),
  rulesToggle: document.querySelector("#rulesToggle"),
  paytable: document.querySelector("#paytable"),
  closeRules: document.querySelector("#closeRules"),
  soundToggle: document.querySelector("#soundToggle"),
  soundIcon: document.querySelector("#soundIcon"),
  winCanvas: document.querySelector("#winCanvas")
};

const audio = {
  context: null,
  play(frequency, duration = 0.08, type = "sine", gain = 0.05) {
    if (!state.sound) return;
    this.context ||= new AudioContext();
    const oscillator = this.context.createOscillator();
    const volume = this.context.createGain();
    oscillator.type = type;
    oscillator.frequency.value = frequency;
    volume.gain.value = gain;
    oscillator.connect(volume);
    volume.connect(this.context.destination);
    oscillator.start();
    oscillator.stop(this.context.currentTime + duration);
  }
};

function symbolById(id) {
  return symbols.find((symbol) => symbol.id === id);
}

function weightedPick() {
  const index = Math.floor(Math.random() * strip.length);
  return symbolById(strip[index]);
}

function createTile(symbol, reelIndex, rowIndex) {
  const tile = document.createElement("div");
  tile.className = `tile ${symbol.color} ${symbol.wild ? "wild" : ""} ${symbol.scatter ? "scatter" : ""}`;
  tile.dataset.id = symbol.id;
  tile.dataset.reel = reelIndex;
  tile.dataset.row = rowIndex;
  tile.innerHTML = `<span>${symbol.tile}</span>`;
  return tile;
}

function renderPaytable() {
  els.payList.innerHTML = symbols
    .filter((symbol) => !symbol.wild)
    .map((symbol) => {
      const type = symbol.scatter ? "Scatter" : "連線";
      return `
        <div class="pay-row">
          <div class="pay-symbol">${symbol.tile}</div>
          <div>
            <strong>${symbol.name}</strong>
            <span>${type} 3/4/5：${symbol.pays[2]}x / ${symbol.pays[3]}x / ${symbol.pays[4]}x</span>
          </div>
        </div>
      `;
    })
    .join("");
}

function initialGrid() {
  state.grid = Array.from({ length: 5 }, () => Array.from({ length: 3 }, weightedPick));
}

function renderGrid() {
  els.reels.innerHTML = "";
  state.grid.forEach((reelSymbols, reelIndex) => {
    const reel = document.createElement("div");
    reel.className = "reel";
    reelSymbols.forEach((symbol, rowIndex) => reel.append(createTile(symbol, reelIndex, rowIndex)));
    els.reels.append(reel);
  });
}

function updateStats() {
  els.balance.textContent = state.balance.toLocaleString("zh-Hant");
  els.winMeter.textContent = state.lastWin.toLocaleString("zh-Hant");
  els.roundCount.textContent = String(state.round);
  els.grandJackpot.textContent = Math.floor(state.jackpots.grand).toLocaleString("zh-Hant");
  els.majorJackpot.textContent = Math.floor(state.jackpots.major).toLocaleString("zh-Hant");
  els.minorJackpot.textContent = Math.floor(state.jackpots.minor).toLocaleString("zh-Hant");
  els.miniJackpot.textContent = Math.floor(state.jackpots.mini).toLocaleString("zh-Hant");
  els.betInput.value = state.bet;
  els.autoButton.classList.toggle("active", state.auto);
  els.turboButton.classList.toggle("active", state.turbo);
  els.soundIcon.textContent = state.sound ? "♪" : "×";
}

function setControls(disabled) {
  els.spinButton.disabled = disabled;
  els.betDown.disabled = disabled || state.freeSpins > 0;
  els.betUp.disabled = disabled || state.freeSpins > 0;
  els.maxBetButton.disabled = disabled || state.freeSpins > 0;
  els.betInput.disabled = disabled || state.freeSpins > 0;
}

function clearWins() {
  document.querySelectorAll(".tile.win").forEach((tile) => tile.classList.remove("win"));
  const ctx = els.winCanvas.getContext("2d");
  ctx.clearRect(0, 0, els.winCanvas.width, els.winCanvas.height);
}

function randomizeGrid() {
  state.grid = Array.from({ length: 5 }, () => Array.from({ length: 3 }, weightedPick));
}

function updateJackpots() {
  const contribution = state.bet * 0.018;
  state.jackpots.grand += contribution;
  state.jackpots.major += contribution * 0.42;
  state.jackpots.minor += contribution * 0.18;
  state.jackpots.mini += contribution * 0.06;
}

function evaluateLines() {
  const wins = [];
  for (const line of lines) {
    const firstNormal = line
      .map((row, reel) => state.grid[reel][row])
      .find((symbol) => !symbol.wild && !symbol.scatter);
    if (!firstNormal) continue;

    let count = 0;
    const positions = [];
    for (let reel = 0; reel < 5; reel += 1) {
      const row = line[reel];
      const symbol = state.grid[reel][row];
      const matches = symbol.id === firstNormal.id || symbol.wild;
      if (!matches) break;
      count += 1;
      positions.push([reel, row]);
    }

    if (count >= 3) {
      const multiplier = firstNormal.pays[count - 1];
      wins.push({
        symbol: firstNormal,
        count,
        amount: multiplier * state.bet,
        positions
      });
    }
  }
  return wins;
}

function evaluateScatters() {
  const positions = [];
  state.grid.forEach((reel, reelIndex) => {
    reel.forEach((symbol, rowIndex) => {
      if (symbol.scatter) positions.push([reelIndex, rowIndex]);
    });
  });
  const count = positions.length;
  if (count < 3) return { count, amount: 0, positions };
  const amount = (count >= 5 ? 40 : count === 4 ? 12 : 3) * state.bet;
  return { count, amount, positions };
}

function markPositions(positions) {
  positions.forEach(([reel, row]) => {
    const tile = document.querySelector(`.tile[data-reel="${reel}"][data-row="${row}"]`);
    tile?.classList.add("win");
  });
}

function drawWinLines(wins) {
  const canvas = els.winCanvas;
  const rect = els.reels.getBoundingClientRect();
  canvas.width = Math.max(980, Math.floor(rect.width));
  canvas.height = Math.max(560, Math.floor(rect.height));
  const ctx = canvas.getContext("2d");
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  ctx.lineWidth = 6;
  ctx.lineCap = "round";

  wins.slice(0, 5).forEach((win, index) => {
    ctx.strokeStyle = ["#f3c35a", "#00d6a3", "#cf263f", "#ffffff", "#83b7ff"][index % 5];
    ctx.beginPath();
    win.positions.forEach(([reel, row], pointIndex) => {
      const x = ((reel + 0.5) / 5) * canvas.width;
      const y = ((row + 0.5) / 3) * canvas.height;
      if (pointIndex === 0) ctx.moveTo(x, y);
      else ctx.lineTo(x, y);
    });
    ctx.stroke();
  });
}

function showBanner(title, amount) {
  els.winTitle.textContent = title;
  els.winAmount.textContent = amount;
  els.winBanner.classList.add("show");
  window.setTimeout(() => els.winBanner.classList.remove("show"), 1600);
}

function animateWinMeter(amount) {
  const start = 0;
  const duration = state.turbo ? 260 : 720;
  const startedAt = performance.now();

  function tick(now) {
    const progress = Math.min(1, (now - startedAt) / duration);
    const eased = 1 - Math.pow(1 - progress, 3);
    state.lastWin = Math.round(start + amount * eased);
    els.winMeter.textContent = state.lastWin.toLocaleString("zh-Hant");
    if (progress < 1) window.requestAnimationFrame(tick);
  }

  window.requestAnimationFrame(tick);
}

async function spin() {
  if (state.spinning) return;
  if (state.balance < state.bet && state.freeSpins === 0) {
    els.statusText.textContent = "餘額不足，請降低下注或重新整理重置 demo。";
    state.auto = false;
    updateStats();
    return;
  }

  state.spinning = true;
  state.lastWin = 0;
  clearWins();
  setControls(true);
  els.statusText.textContent = state.turbo ? "Turbo 啟動，快速開獎..." : "轉軸加速，聽牌準備...";
  audio.play(220, 0.08, "square", 0.035);

  const isFreeSpin = state.freeSpins > 0;
  if (isFreeSpin) {
    state.freeSpins -= 1;
  } else {
    state.balance -= state.bet;
    updateJackpots();
  }
  state.round += 1;
  updateStats();

  const reelElements = [...document.querySelectorAll(".reel")];
  reelElements.forEach((reel) => {
    reel.classList.remove("settled");
    reel.classList.add("spinning");
  });

  const baseDelay = state.turbo ? 85 : 210;
  const staggerDelay = state.turbo ? 52 : 120;

  for (let reel = 0; reel < 5; reel += 1) {
    await wait(baseDelay + reel * staggerDelay);
    state.grid[reel] = Array.from({ length: 3 }, weightedPick);
    renderGrid();
    [...document.querySelectorAll(".reel")].forEach((el, index) => {
      if (index > reel) el.classList.add("spinning");
      if (index === reel) el.classList.add("settled");
    });
    audio.play(300 + reel * 45, 0.045, "triangle", 0.035);
  }

  await wait(state.turbo ? 70 : 160);
  const lineWins = evaluateLines();
  const scatter = evaluateScatters();
  const totalWin = lineWins.reduce((sum, win) => sum + win.amount, 0) + scatter.amount;

  lineWins.forEach((win) => markPositions(win.positions));
  if (scatter.amount > 0) {
    markPositions(scatter.positions);
    state.freeSpins += scatter.count >= 5 ? 8 : scatter.count === 4 ? 5 : 3;
  }
  drawWinLines(lineWins);

  if (totalWin > 0) {
    state.balance += totalWin;
    state.bestWin = Math.max(state.bestWin, totalWin);
    animateWinMeter(totalWin);
    const bestLine = lineWins.sort((a, b) => b.amount - a.amount)[0];
    const title = scatter.amount > 0
      ? `發財 Scatter x${scatter.count}`
      : `${bestLine.symbol.name} ${bestLine.count}連`;
    showBanner(title, `+${totalWin.toLocaleString("zh-Hant")}`);
    els.statusText.textContent = scatter.amount > 0
      ? `發財入局，獲得免費旋轉。總贏分 ${totalWin.toLocaleString("zh-Hant")}。`
      : `胡牌成功，總贏分 ${totalWin.toLocaleString("zh-Hant")}。`;
    audio.play(660, 0.12, "sine", 0.055);
    await wait(80);
    audio.play(880, 0.12, "sine", 0.045);
  } else {
    state.lastWin = 0;
    els.statusText.textContent = "本局未胡，下一手可能就摸到好牌。";
    audio.play(150, 0.08, "sawtooth", 0.025);
  }

  state.spinning = false;
  updateStats();
  setControls(false);

  if (state.auto && (state.balance >= state.bet || state.freeSpins > 0)) {
    window.setTimeout(spin, state.turbo ? 380 : 900);
  } else if (state.auto) {
    state.auto = false;
    updateStats();
  }
}

function wait(ms) {
  return new Promise((resolve) => window.setTimeout(resolve, ms));
}

function changeBet(delta) {
  if (state.spinning || state.freeSpins > 0) return;
  state.bet = Math.min(500, Math.max(10, state.bet + delta));
  updateStats();
}

function bindEvents() {
  els.spinButton.addEventListener("click", spin);
  els.betDown.addEventListener("click", () => changeBet(-10));
  els.betUp.addEventListener("click", () => changeBet(10));
  els.betInput.addEventListener("change", () => {
    const value = Number(els.betInput.value || 50);
    state.bet = Math.min(500, Math.max(10, Math.round(value / 10) * 10));
    updateStats();
  });
  els.maxBetButton.addEventListener("click", () => {
    if (state.spinning || state.freeSpins > 0) return;
    state.bet = 500;
    updateStats();
  });
  els.turboButton.addEventListener("click", () => {
    state.turbo = !state.turbo;
    updateStats();
  });
  els.autoButton.addEventListener("click", () => {
    state.auto = !state.auto;
    updateStats();
    if (state.auto && !state.spinning) spin();
  });
  els.rulesToggle.addEventListener("click", () => els.paytable.classList.add("open"));
  els.closeRules.addEventListener("click", () => els.paytable.classList.remove("open"));
  els.soundToggle.addEventListener("click", () => {
    state.sound = !state.sound;
    updateStats();
  });
}

function boot() {
  renderPaytable();
  initialGrid();
  renderGrid();
  updateStats();
  bindEvents();
}

boot();
