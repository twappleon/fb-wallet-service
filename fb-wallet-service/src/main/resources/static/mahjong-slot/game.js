const rankNames = ["", "一", "二", "三", "四", "五", "六", "七", "八", "九"];
const suitPayMultipliers = {
  wan: [0, 0, 5, 18, 60],
  tong: [0, 0, 5, 16, 55],
  tiao: [0, 0, 5, 16, 55]
};
const fourCopies = (tile) => Array.from({ length: 4 }, () => tile.id);
const suitSymbols = [
  ...Array.from({ length: 9 }, (_, index) => {
    const rank = index + 1;
    return {
      id: `wan${rank}`,
      tile: "萬",
      rank,
      name: `${rankNames[rank]}萬`,
      color: "red",
      art: "wan",
      pays: suitPayMultipliers.wan
    };
  }),
  ...Array.from({ length: 9 }, (_, index) => {
    const rank = index + 1;
    return {
      id: `tong${rank}`,
      tile: "筒",
      rank,
      name: `${rankNames[rank]}筒`,
      color: "green",
      art: "tong",
      pays: suitPayMultipliers.tong
    };
  }),
  ...Array.from({ length: 9 }, (_, index) => {
    const rank = index + 1;
    return {
      id: `tiao${rank}`,
      tile: "條",
      rank,
      name: `${rankNames[rank]}條`,
      color: "green",
      art: "tiao",
      pays: suitPayMultipliers.tiao
    };
  })
];

const honorSymbols = [
  { id: "dong", tile: "東", name: "東風", color: "", pays: [0, 0, 5, 15, 45] },
  { id: "nan", tile: "南", name: "南風", color: "", pays: [0, 0, 5, 15, 45] },
  { id: "xi", tile: "西", name: "西風", color: "", pays: [0, 0, 5, 15, 45] },
  { id: "bei", tile: "北", name: "北風", color: "", pays: [0, 0, 5, 15, 45] },
  { id: "zhong", tile: "中", name: "紅中", color: "red", pays: [0, 0, 10, 35, 100] },
  { id: "fa", tile: "發", name: "發財", color: "green", scatter: true, pays: [0, 0, 3, 12, 40] },
  { id: "bai", tile: "白", name: "白板", color: "", art: "bai", pays: [0, 0, 9, 30, 90] }
];

const flowerSymbols = [
  { id: "spring", tile: "春", name: "春", color: "gold", art: "flower", flowerType: "season", flowerArt: "spring", wild: true, pays: [0, 0, 0, 0, 0] },
  { id: "summer", tile: "夏", name: "夏", color: "gold", art: "flower", flowerType: "season", flowerArt: "summer", wild: true, pays: [0, 0, 0, 0, 0] },
  { id: "autumn", tile: "秋", name: "秋", color: "gold", art: "flower", flowerType: "season", flowerArt: "autumn", wild: true, pays: [0, 0, 0, 0, 0] },
  { id: "winter", tile: "冬", name: "冬", color: "gold", art: "flower", flowerType: "season", flowerArt: "winter", wild: true, pays: [0, 0, 0, 0, 0] },
  { id: "plum", tile: "梅", name: "梅", color: "gold", art: "flower", flowerType: "gentleman", flowerArt: "plum", wild: true, pays: [0, 0, 0, 0, 0] },
  { id: "orchid", tile: "蘭", name: "蘭", color: "gold", art: "flower", flowerType: "gentleman", flowerArt: "orchid", wild: true, pays: [0, 0, 0, 0, 0] },
  { id: "bambooFlower", tile: "竹", name: "竹", color: "gold", art: "flower", flowerType: "gentleman", flowerArt: "bamboo-flower", wild: true, pays: [0, 0, 0, 0, 0] },
  { id: "chrysanthemum", tile: "菊", name: "菊", color: "gold", art: "flower", flowerType: "gentleman", flowerArt: "chrysanthemum", wild: true, pays: [0, 0, 0, 0, 0] }
];

const symbols = [
  ...suitSymbols,
  ...honorSymbols,
  ...flowerSymbols
];

const strip = [
  ...suitSymbols.flatMap(fourCopies),
  ...honorSymbols.flatMap(fourCopies),
  ...flowerSymbols.map((tile) => tile.id)
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
  autoRemaining: 0,
  autoMenuOpen: false,
  autoTimer: null,
  atmosphereTimer: null,
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
  autoLabel: document.querySelector("#autoLabel"),
  autoCount: document.querySelector("#autoCount"),
  autoControl: document.querySelector(".auto-control"),
  autoSpinPanel: document.querySelector("#autoSpinPanel"),
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
  winEffects: document.querySelector("#winEffects"),
  coinLayer: document.querySelector("#coinLayer"),
  sparkLayer: document.querySelector("#sparkLayer"),
  bigWinCallout: document.querySelector("#bigWinCallout"),
  bigWinTitle: document.querySelector("#bigWinTitle"),
  bigWinAmount: document.querySelector("#bigWinAmount"),
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
  },
  playAt(frequency, startAt, duration = 0.08, type = "sine", gain = 0.05) {
    if (!state.sound) return;
    this.context ||= new AudioContext();
    const oscillator = this.context.createOscillator();
    const volume = this.context.createGain();
    oscillator.type = type;
    oscillator.frequency.setValueAtTime(frequency, startAt);
    volume.gain.setValueAtTime(gain, startAt);
    volume.gain.exponentialRampToValueAtTime(0.001, startAt + duration);
    oscillator.connect(volume);
    volume.connect(this.context.destination);
    oscillator.start(startAt);
    oscillator.stop(startAt + duration);
  },
  sweep(startFrequency, endFrequency, duration = 0.28, type = "sawtooth", gain = 0.024) {
    if (!state.sound) return;
    this.context ||= new AudioContext();
    const now = this.context.currentTime;
    const oscillator = this.context.createOscillator();
    const volume = this.context.createGain();
    oscillator.type = type;
    oscillator.frequency.setValueAtTime(startFrequency, now);
    oscillator.frequency.exponentialRampToValueAtTime(endFrequency, now + duration);
    volume.gain.setValueAtTime(gain, now);
    volume.gain.exponentialRampToValueAtTime(0.001, now + duration);
    oscillator.connect(volume);
    volume.connect(this.context.destination);
    oscillator.start(now);
    oscillator.stop(now + duration);
  },
  chord(notes, duration = 0.18, type = "triangle", gain = 0.026, delay = 0) {
    if (!state.sound) return;
    this.context ||= new AudioContext();
    const startAt = this.context.currentTime + delay;
    notes.forEach((note, index) => this.playAt(note, startAt + index * 0.018, duration, type, gain));
  },
  spinStart() {
    this.sweep(150, 620, state.turbo ? 0.16 : 0.34, "sawtooth", 0.018);
    this.chord([196, 247, 294], 0.12, "square", 0.012, 0.03);
  },
  reelStop(index) {
    const base = 260 + index * 38;
    this.play(base, 0.045, "triangle", 0.032);
    this.play(base / 2, 0.055, "square", 0.012);
  },
  winFanfare(multiplier = 1, scatterCount = 0) {
    const strong = multiplier >= 25 || scatterCount >= 4;
    const notes = strong ? [523, 659, 784, 1047] : [440, 554, 659];
    this.chord(notes, strong ? 0.28 : 0.2, "triangle", strong ? 0.038 : 0.028);
    window.setTimeout(() => this.chord(notes.map((note) => note * 1.5), 0.24, "sine", strong ? 0.026 : 0.018), 160);
    if (strong) window.setTimeout(() => this.sweep(720, 1640, 0.42, "triangle", 0.022), 330);
  },
  loseThud() {
    this.sweep(180, 95, 0.18, "sawtooth", 0.018);
    this.play(120, 0.08, "square", 0.012);
  },
  coinDrop(count = 8, interval = 58) {
    if (!state.sound) return;
    const notes = [988, 1175, 1319, 1480, 1760];
    for (let index = 0; index < count; index += 1) {
      window.setTimeout(() => {
        const note = notes[index % notes.length] + Math.random() * 34;
        this.play(note, 0.045, "triangle", 0.035);
        this.play(note / 2, 0.05, "square", 0.012);
      }, index * interval);
    }
  }
};

function symbolById(id) {
  return symbols.find((symbol) => symbol.id === id);
}

function weightedPick() {
  const index = Math.floor(Math.random() * strip.length);
  return symbolById(strip[index]);
}

function layoutPositions(rank) {
  const patterns = {
    1: [5],
    2: [1, 9],
    3: [1, 5, 9],
    4: [1, 3, 7, 9],
    5: [1, 3, 5, 7, 9],
    6: [1, 3, 4, 6, 7, 9],
    7: [1, 2, 3, 4, 6, 7, 9],
    8: [1, 2, 3, 4, 6, 7, 8, 9],
    9: [1, 2, 3, 4, 5, 6, 7, 8, 9]
  };
  return patterns[rank] || patterns[5];
}

function renderRankMarks(rank, className) {
  return layoutPositions(rank)
    .map((position, index) => `<i class="p${position} ${className}-${index % 2 === 0 ? "primary" : "accent"}"></i>`)
    .join("");
}

function svgCircle(cx, cy, radius, color, inner = "#fffdf6") {
  return `
    <g class="pip-circle">
      <circle cx="${cx}" cy="${cy}" r="${radius}" fill="${inner}" stroke="${color}" stroke-width="5" />
      <circle cx="${cx}" cy="${cy}" r="${Math.max(3, radius * 0.34)}" fill="${color}" />
      <circle cx="${cx}" cy="${cy}" r="${Math.max(7, radius * 0.62)}" fill="none" stroke="${color}" stroke-width="2" opacity="0.8" />
    </g>
  `;
}

function renderCircleTile(rank) {
  const colors = {
    red: "#c51f37",
    green: "#00856b",
    blue: "#2369b1"
  };
  const layouts = {
    1: [{ x: 50, y: 60, r: 24, c: colors.green, inner: "#fff8e8" }],
    2: [{ x: 35, y: 38, r: 13, c: colors.green }, { x: 65, y: 82, r: 13, c: colors.blue }],
    3: [{ x: 32, y: 34, r: 12, c: colors.green }, { x: 50, y: 60, r: 12, c: colors.red }, { x: 68, y: 86, r: 12, c: colors.blue }],
    4: [{ x: 34, y: 35, r: 12, c: colors.blue }, { x: 66, y: 35, r: 12, c: colors.green }, { x: 34, y: 85, r: 12, c: colors.green }, { x: 66, y: 85, r: 12, c: colors.blue }],
    5: [{ x: 34, y: 35, r: 11, c: colors.blue }, { x: 66, y: 35, r: 11, c: colors.green }, { x: 50, y: 60, r: 11, c: colors.red }, { x: 34, y: 85, r: 11, c: colors.green }, { x: 66, y: 85, r: 11, c: colors.blue }],
    6: [{ x: 34, y: 30, r: 10, c: colors.green }, { x: 66, y: 30, r: 10, c: colors.green }, { x: 34, y: 56, r: 10, c: colors.red }, { x: 66, y: 56, r: 10, c: colors.red }, { x: 34, y: 84, r: 10, c: colors.red }, { x: 66, y: 84, r: 10, c: colors.red }],
    7: [{ x: 31, y: 27, r: 9, c: colors.green }, { x: 50, y: 42, r: 9, c: colors.green }, { x: 69, y: 57, r: 9, c: colors.green }, { x: 31, y: 70, r: 9, c: colors.red }, { x: 50, y: 84, r: 9, c: colors.red }, { x: 69, y: 98, r: 9, c: colors.red }, { x: 31, y: 98, r: 9, c: colors.red }],
    8: [{ x: 34, y: 24, r: 9, c: colors.blue }, { x: 66, y: 24, r: 9, c: colors.blue }, { x: 34, y: 48, r: 9, c: colors.green }, { x: 66, y: 48, r: 9, c: colors.green }, { x: 34, y: 72, r: 9, c: colors.blue }, { x: 66, y: 72, r: 9, c: colors.blue }, { x: 34, y: 96, r: 9, c: colors.green }, { x: 66, y: 96, r: 9, c: colors.green }],
    9: [{ x: 30, y: 28, r: 8, c: colors.green }, { x: 50, y: 28, r: 8, c: colors.green }, { x: 70, y: 28, r: 8, c: colors.green }, { x: 30, y: 60, r: 8, c: colors.red }, { x: 50, y: 60, r: 8, c: colors.red }, { x: 70, y: 60, r: 8, c: colors.red }, { x: 30, y: 92, r: 8, c: colors.blue }, { x: 50, y: 92, r: 8, c: colors.blue }, { x: 70, y: 92, r: 8, c: colors.blue }]
  };
  return `
    <svg class="tile-svg circle-svg" viewBox="0 0 100 120" aria-hidden="true">
      ${layouts[rank].map((pip) => svgCircle(pip.x, pip.y, pip.r, pip.c, pip.inner)).join("")}
    </svg>
  `;
}

function bambooStick(x, y, height = 34, color = "#0f7a55", rotate = 0) {
  return `
    <g transform="translate(${x} ${y}) rotate(${rotate})">
      <rect x="-5" y="${-height / 2}" width="10" height="${height}" rx="5" fill="${color}" />
      <path d="M-5 ${-height * 0.18} H5 M-5 ${height * 0.18} H5" stroke="#f7fff9" stroke-width="2" />
      <path d="M-2 ${-height * 0.44} C2 ${-height * 0.22} 2 ${height * 0.22} -2 ${height * 0.44}" stroke="rgba(255,255,255,0.42)" stroke-width="1.5" fill="none" />
    </g>
  `;
}

function renderOneBamboo() {
  return `
    <svg class="tile-svg bamboo-svg bird-svg" viewBox="0 0 100 120" aria-hidden="true">
      <path d="M18 68 C24 34 44 18 72 18 C62 30 58 44 62 62 C48 54 33 58 18 68Z" fill="#0f7a55" />
      <path d="M16 70 C38 62 56 60 78 88 C54 86 31 82 16 70Z" fill="#168d62" />
      <path d="M28 68 C38 50 52 43 70 43 C62 54 61 68 68 82 C51 75 40 70 28 68Z" fill="#c51f37" />
      <circle cx="71" cy="33" r="14" fill="#10906a" />
      <circle cx="76" cy="31" r="2.6" fill="#14100d" />
      <path d="M83 36 L96 42 L82 47Z" fill="#c51f37" />
      <path d="M48 88 L43 101 M59 90 L62 102" stroke="#815000" stroke-width="4" stroke-linecap="round" />
    </svg>
  `;
}

function renderBambooTile(rank) {
  if (rank === 1) return renderOneBamboo();
  const layouts = {
    2: [[39, 42, 36, "#0f7a55", -18], [61, 78, 36, "#c51f37", 18]],
    3: [[35, 35, 32, "#0f7a55", -16], [50, 60, 34, "#c51f37", 0], [65, 85, 32, "#0f7a55", 16]],
    4: [[35, 34, 30, "#0f7a55", -14], [65, 34, 30, "#c51f37", 14], [35, 86, 30, "#c51f37", 14], [65, 86, 30, "#0f7a55", -14]],
    5: [[35, 32, 28, "#0f7a55", -12], [65, 32, 28, "#c51f37", 12], [50, 60, 30, "#0f7a55", 0], [35, 88, 28, "#c51f37", 12], [65, 88, 28, "#0f7a55", -12]],
    6: [[35, 28, 26, "#0f7a55", -10], [65, 28, 26, "#0f7a55", 10], [35, 60, 26, "#c51f37", -10], [65, 60, 26, "#c51f37", 10], [35, 92, 26, "#0f7a55", -10], [65, 92, 26, "#0f7a55", 10]],
    7: [[30, 26, 23, "#0f7a55", -10], [50, 26, 23, "#0f7a55", 0], [70, 26, 23, "#0f7a55", 10], [38, 58, 24, "#c51f37", -8], [62, 58, 24, "#c51f37", 8], [38, 92, 24, "#0f7a55", -8], [62, 92, 24, "#0f7a55", 8]],
    8: [[35, 24, 22, "#0f7a55", -8], [65, 24, 22, "#0f7a55", 8], [35, 48, 22, "#c51f37", -8], [65, 48, 22, "#c51f37", 8], [35, 72, 22, "#0f7a55", -8], [65, 72, 22, "#0f7a55", 8], [35, 96, 22, "#c51f37", -8], [65, 96, 22, "#c51f37", 8]],
    9: [[28, 28, 21, "#0f7a55", -8], [50, 28, 21, "#0f7a55", 0], [72, 28, 21, "#0f7a55", 8], [28, 60, 21, "#c51f37", -8], [50, 60, 21, "#c51f37", 0], [72, 60, 21, "#c51f37", 8], [28, 92, 21, "#0f7a55", -8], [50, 92, 21, "#0f7a55", 0], [72, 92, 21, "#0f7a55", 8]]
  };
  return `
    <svg class="tile-svg bamboo-svg" viewBox="0 0 100 120" aria-hidden="true">
      ${layouts[rank].map(([x, y, height, color, rotate]) => bambooStick(x, y, height, color, rotate)).join("")}
    </svg>
  `;
}

function renderTileFace(symbol, compact = false) {
  if (symbol.art === "wan") {
    return `
      <span class="tile-art wan-art ${compact ? "compact" : ""}" aria-label="${symbol.name}">
        <span class="wan-rank">${rankNames[symbol.rank] || "五"}</span>
        <span class="wan-mark">萬</span>
      </span>
    `;
  }
  if (symbol.art === "tong") {
    return `
      <span class="tile-art svg-tile-art dot-art rank-${symbol.rank} ${compact ? "compact" : ""}" aria-label="${symbol.name}">
        ${renderCircleTile(symbol.rank)}
      </span>
    `;
  }
  if (symbol.art === "tiao") {
    return `
      <span class="tile-art svg-tile-art bamboo-art rank-${symbol.rank} ${compact ? "compact" : ""}" aria-label="${symbol.name}">
        ${renderBambooTile(symbol.rank)}
      </span>
    `;
  }
  if (symbol.art === "flower") {
    return `
      <span class="tile-art flower-art ${symbol.flowerType} flower-${symbol.flowerArt} ${compact ? "compact" : ""}" aria-label="${symbol.name}">
        <span class="flower-caption">${symbol.tile}</span>
        <i class="flower-stem"></i>
        <i class="flower-leaf leaf-left"></i>
        <i class="flower-leaf leaf-right"></i>
        <i class="flower-bloom bloom-one"></i>
        <i class="flower-bloom bloom-two"></i>
        <i class="flower-bloom bloom-three"></i>
      </span>
    `;
  }
  if (symbol.art === "bai") {
    return `
      <span class="tile-art bai-art ${compact ? "compact" : ""}" aria-label="${symbol.name}">
        <i></i>
      </span>
    `;
  }
  return `<span>${symbol.tile}</span>`;
}

function createTile(symbol, reelIndex, rowIndex) {
  const tile = document.createElement("div");
  tile.className = `tile ${symbol.color} ${symbol.art ? "graphic" : ""} ${symbol.wild ? "wild" : ""} ${symbol.scatter ? "scatter" : ""} ${symbol.flowerType ? "flower-tile" : ""}`;
  tile.dataset.id = symbol.id;
  tile.dataset.reel = reelIndex;
  tile.dataset.row = rowIndex;
  tile.innerHTML = renderTileFace(symbol);
  return tile;
}

function renderResultReel(reelIndex) {
  const reel = document.createElement("div");
  reel.className = "reel";
  state.grid[reelIndex].forEach((symbol, rowIndex) => reel.append(createTile(symbol, reelIndex, rowIndex)));
  return reel;
}

function renderSpinningReel(reelIndex) {
  const reel = document.createElement("div");
  reel.className = "reel spinning";
  const stripEl = document.createElement("div");
  stripEl.className = "reel-strip";
  stripEl.style.setProperty("--spin-speed", `${state.turbo ? 360 : 520}ms`);
  Array.from({ length: 18 }, () => weightedPick()).forEach((symbol, index) => {
    stripEl.append(createTile(symbol, reelIndex, index % 3));
  });
  reel.append(stripEl);
  return reel;
}

function renderPaytable() {
  els.payList.innerHTML = symbols
    .map((symbol) => {
      const type = symbol.wild ? "台灣花牌 Wild" : symbol.scatter ? "Scatter" : "連線";
      const payText = symbol.wild
        ? "春夏秋冬、梅蘭竹菊可替代普通牌"
        : `${type} 3/4/5：${symbol.pays[2]}x / ${symbol.pays[3]}x / ${symbol.pays[4]}x`;
      return `
        <div class="pay-row">
          <div class="pay-symbol ${symbol.art ? "graphic" : ""}">${renderTileFace(symbol, true)}</div>
          <div>
            <strong>${symbol.name}</strong>
            <span>${payText}</span>
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
  state.grid.forEach((_, reelIndex) => els.reels.append(renderResultReel(reelIndex)));
}

function replaceReel(reelIndex, reelElement) {
  const current = els.reels.children[reelIndex];
  if (current) current.replaceWith(reelElement);
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
  els.autoControl.classList.toggle("open", state.autoMenuOpen);
  els.autoButton.setAttribute("aria-expanded", String(state.autoMenuOpen));
  els.autoLabel.textContent = state.auto ? "STOP" : "AUTO";
  els.autoCount.textContent = state.auto
    ? state.autoRemaining === Infinity ? "∞" : String(state.autoRemaining)
    : "選擇";
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
  document.querySelector(".machine")?.classList.remove("celebrating", "mega-celebrating");
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
  ctx.lineWidth = 7;
  ctx.lineCap = "round";
  ctx.shadowBlur = 16;

  wins.slice(0, 5).forEach((win, index) => {
    ctx.strokeStyle = ["#f3c35a", "#00d6a3", "#cf263f", "#ffffff", "#83b7ff"][index % 5];
    ctx.shadowColor = ctx.strokeStyle;
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
  window.setTimeout(() => els.winBanner.classList.remove("show"), 4600);
}

function clearAtmosphere() {
  if (state.atmosphereTimer) {
    window.clearTimeout(state.atmosphereTimer);
    state.atmosphereTimer = null;
  }
  els.coinLayer.innerHTML = "";
  els.sparkLayer.innerHTML = "";
  els.winEffects.classList.remove("burst");
  els.bigWinCallout.classList.remove("show");
}

function triggerAtmosphere(totalWin, scatterCount = 0) {
  clearAtmosphere();
  const multiplier = totalWin / state.bet;
  const tier = scatterCount >= 4 || multiplier >= 60
    ? "MEGA WIN"
    : multiplier >= 25
      ? "BIG WIN"
      : multiplier >= 8
        ? "NICE WIN"
        : "WIN";
  const coinCount = tier === "MEGA WIN" ? 42 : tier === "BIG WIN" ? 28 : tier === "NICE WIN" ? 16 : 8;
  const sparkCount = tier === "MEGA WIN" ? 34 : tier === "BIG WIN" ? 24 : 14;
  const coinSoundCount = tier === "MEGA WIN" ? 70 : tier === "BIG WIN" ? 54 : tier === "NICE WIN" ? 36 : 20;
  const coinSoundInterval = tier === "MEGA WIN" ? 64 : tier === "BIG WIN" ? 70 : 82;
  const effectDuration = tier === "MEGA WIN" ? 7600 : tier === "BIG WIN" ? 6500 : tier === "NICE WIN" ? 5200 : 4200;
  const calloutDuration = tier === "MEGA WIN" ? 7.1 : tier === "BIG WIN" ? 6.1 : 4.9;
  const machine = document.querySelector(".machine");

  els.winEffects.classList.remove("burst");
  void els.winEffects.offsetWidth;
  els.winEffects.classList.add("burst");
  machine?.classList.add(tier === "MEGA WIN" || tier === "BIG WIN" ? "mega-celebrating" : "celebrating");
  audio.coinDrop(coinSoundCount, coinSoundInterval);

  if (tier !== "WIN") {
    els.bigWinTitle.textContent = tier;
    els.bigWinAmount.textContent = `+${totalWin.toLocaleString("zh-Hant")}`;
    els.bigWinCallout.style.setProperty("--callout-duration", `${calloutDuration}s`);
    els.bigWinCallout.classList.remove("show");
    void els.bigWinCallout.offsetWidth;
    els.bigWinCallout.classList.add("show");
  }

  for (let index = 0; index < coinCount; index += 1) {
    const coin = document.createElement("span");
    coin.className = "coin";
    coin.style.setProperty("--x", `${Math.round(Math.random() * 100)}%`);
    coin.style.setProperty("--size", `${18 + Math.round(Math.random() * 16)}px`);
    coin.style.setProperty("--delay", `${Math.random() * (effectDuration / 1700)}s`);
    coin.style.setProperty("--duration", `${2.9 + Math.random() * (effectDuration / 1800)}s`);
    coin.style.setProperty("--drift", `${Math.round((Math.random() - 0.5) * 180)}px`);
    coin.style.setProperty("--rotate", `${Math.round(360 + Math.random() * 820)}deg`);
    els.coinLayer.append(coin);
  }

  for (let index = 0; index < sparkCount; index += 1) {
    const spark = document.createElement("span");
    spark.className = "spark";
    spark.style.setProperty("--x", `${18 + Math.round(Math.random() * 64)}%`);
    spark.style.setProperty("--y", `${22 + Math.round(Math.random() * 36)}%`);
    spark.style.setProperty("--size", `${5 + Math.round(Math.random() * 9)}px`);
    spark.style.setProperty("--delay", `${Math.random() * 1.15}s`);
    spark.style.setProperty("--duration", `${1.65 + Math.random() * 1.1}s`);
    spark.style.setProperty("--dx", `${Math.round((Math.random() - 0.5) * 220)}px`);
    spark.style.setProperty("--dy", `${Math.round((Math.random() - 0.5) * 160)}px`);
    els.sparkLayer.append(spark);
  }

  state.atmosphereTimer = window.setTimeout(() => {
    state.atmosphereTimer = null;
    clearAtmosphere();
    machine?.classList.remove("celebrating", "mega-celebrating");
  }, effectDuration);
}

function stopAuto(message) {
  if (state.autoTimer) {
    window.clearTimeout(state.autoTimer);
    state.autoTimer = null;
  }
  state.auto = false;
  state.autoRemaining = 0;
  state.autoMenuOpen = false;
  if (message) els.statusText.textContent = message;
  updateStats();
}

function startAuto(spins) {
  if (state.spinning) return;
  state.auto = true;
  state.autoRemaining = spins;
  state.autoMenuOpen = false;
  if (state.autoTimer) {
    window.clearTimeout(state.autoTimer);
    state.autoTimer = null;
  }
  els.statusText.textContent = spins === Infinity
    ? "自動旋轉啟動：無限模式。"
    : `自動旋轉啟動：剩餘 ${spins} 次。`;
  updateStats();
  spin();
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
    stopAuto();
    return;
  }

  state.spinning = true;
  state.lastWin = 0;
  clearWins();
  clearAtmosphere();
  setControls(true);
  els.statusText.textContent = state.turbo ? "Turbo 啟動，快速開獎..." : "轉軸加速，聽牌準備...";
  audio.spinStart();

  const isFreeSpin = state.freeSpins > 0;
  if (isFreeSpin) {
    state.freeSpins -= 1;
  } else {
    state.balance -= state.bet;
    updateJackpots();
  }
  state.round += 1;
  updateStats();

  for (let reel = 0; reel < 5; reel += 1) {
    replaceReel(reel, renderSpinningReel(reel));
  }

  const baseDelay = state.turbo ? 340 : 680;
  const staggerDelay = state.turbo ? 135 : 250;

  for (let reel = 0; reel < 5; reel += 1) {
    await wait(reel === 0 ? baseDelay : staggerDelay);
    state.grid[reel] = Array.from({ length: 3 }, weightedPick);
    const resultReel = renderResultReel(reel);
    resultReel.classList.add("settled");
    replaceReel(reel, resultReel);
    audio.reelStop(reel);
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
    triggerAtmosphere(totalWin, scatter.count);
    audio.winFanfare(totalWin / state.bet, scatter.count);
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
    audio.loseThud();
  }

  state.spinning = false;

  if (state.auto && !isFreeSpin && state.autoRemaining !== Infinity) {
    state.autoRemaining = Math.max(0, state.autoRemaining - 1);
  }

  updateStats();
  setControls(false);

  if (state.auto && state.autoRemaining === 0 && state.freeSpins === 0) {
    stopAuto("自動旋轉已完成。");
  } else if (state.auto && (state.balance >= state.bet || state.freeSpins > 0)) {
    state.autoTimer = window.setTimeout(() => {
      state.autoTimer = null;
      if (state.auto) spin();
    }, state.turbo ? 380 : 900);
  } else if (state.auto) {
    stopAuto("自動旋轉停止：餘額不足。");
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
    if (state.auto) {
      stopAuto("自動旋轉已停止。");
      return;
    }
    if (state.spinning) return;
    state.autoMenuOpen = !state.autoMenuOpen;
    updateStats();
  });
  els.autoSpinPanel.querySelectorAll("[data-auto-spins]").forEach((button) => {
    button.addEventListener("click", () => {
      const value = button.dataset.autoSpins;
      startAuto(value === "infinite" ? Infinity : Number(value));
    });
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
