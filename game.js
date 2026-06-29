// ════════════════════════════════════════
//  🐹 뚜별 햄스터 키우기 - 메인 게임 로직
// ════════════════════════════════════════

const COSTS = {
  feed:     10,
  clean:    10,
  medicine: 20,
};

const STATE_INFO = {
  happy:  { msg: "😊 뚜스터가 행복해요!",      img: "images/happy.png"  },
  normal: { msg: "😐 뚜스터 상태 보통이에요.",  img: "images/normal.png" },
  sad:    { msg: "😢 뚜스터가 슬퍼해요...",     img: "images/sad.png"    },
  dirty:  { msg: "🤢 뚜스터가 더러워요...",     img: "images/dirty.png"  },
  hungry: { msg: "🍽️ 뚜스터가 배고파요...",    img: "images/hungry.png" },
  sick:   { msg: "🤒 뚜스터가 아파요!",         img: "images/sick.png"   },
};

const DEFAULT_STATE = {
  name:            "뚜스터",
  stage:           "아기 🍼",
  cleanliness:     100,
  happiness:       100,
  hunger:          100,
  health:          100,
  cash:            30,
  lastSaved:       Date.now(),
  lastAttendDate:  "",
  attendStreak:    0,
  totalAttendDays: 0,
  totalFeed:       0,
  totalClean:      0,
  totalMedicine:   0,
  totalGameWins:   0,
  totalCashEarned: 30,
  unlockedAch:     [],
};

let hamster        = {};
let currentImg     = "";
let actionMsgTimer = null;

// ════════════════════════════════════════
//  저장 / 불러오기
// ════════════════════════════════════════

const SAVE_KEY = "tubyul_hamster_v2";

function saveGame() {
  hamster.lastSaved = Date.now();
  localStorage.setItem(SAVE_KEY, JSON.stringify(hamster));
}

function loadGame() {
  const raw = localStorage.getItem(SAVE_KEY);
  if (!raw) { hamster = { ...DEFAULT_STATE }; return; }
  try {
    const saved = JSON.parse(raw);
    hamster = { ...DEFAULT_STATE, ...saved };
    const elapsed = Math.floor((Date.now() - hamster.lastSaved) / 10000);
    if (elapsed > 0) applyOfflineDecay(elapsed);
  } catch {
    hamster = { ...DEFAULT_STATE };
  }
}

function applyOfflineDecay(ticks) {
  const t = Math.min(ticks, 360);
  hamster.cleanliness = clamp(hamster.cleanliness - randInt(2, 4) * t);
  hamster.happiness   = clamp(hamster.happiness   - randInt(1, 3) * t);
  hamster.hunger      = clamp(hamster.hunger      - randInt(3, 5) * t);
  hamster.health      = clamp(hamster.health      - randInt(1, 2) * t);
}

// ════════════════════════════════════════
//  유틸
// ════════════════════════════════════════

function randInt(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

function clamp(val) {
  return Math.max(0, Math.min(100, val));
}

function getCurrentState() {
  const { cleanliness, happiness, hunger, health } = hamster;
  if (health      <= 0)  return "sick";
  if (hunger      <= 30) return "hungry";
  if (cleanliness <= 30) return "dirty";
  if (happiness   <= 30) return "sad";
  if (Math.min(cleanliness, happiness, hunger, health) <= 50) return "normal";
  return "happy";
}

function getTodayStr() {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,"0")}-${String(d.getDate()).padStart(2,"0")}`;
}

function getYesterdayStr() {
  const d = new Date();
  d.setDate(d.getDate() - 1);
  return `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,"0")}-${String(d.getDate()).padStart(2,"0")}`;
}

// ════════════════════════════════════════
//  캐시
// ════════════════════════════════════════

function addCash(amount) {
  hamster.cash            += amount;
  hamster.totalCashEarned  = (hamster.totalCashEarned || 0) + amount;
  updateCashDisplay();
  showCashPop(`+${amount}C`);
  saveGame();
}

function spendCash(amount) {
  if (hamster.cash < amount) return false;
  hamster.cash -= amount;
  updateCashDisplay();
  saveGame();
  return true;
}

function updateCashDisplay() {
  const el = document.getElementById("cash-display");
  if (el) el.textContent = hamster.cash;
}

function showCashPop(text) {
  const el  = document.createElement("div");
  el.className   = "cash-pop";
  el.textContent = text;
  const bar  = document.querySelector(".cash-bar");
  const rect = bar.getBoundingClientRect();
  el.style.left = `${rect.right - 70}px`;
  el.style.top  = `${rect.bottom + 4}px`;
  document.body.appendChild(el);
  setTimeout(() => el.remove(), 1200);
}

// ════════════════════════════════════════
//  출석 보상
// ════════════════════════════════════════

const ATTEND_REWARDS = [
  { day: 1, cash: 10, bonus: "",            label: "Day 1" },
  { day: 2, cash: 15, bonus: "",            label: "Day 2" },
  { day: 3, cash: 20, bonus: "",            label: "Day 3" },
  { day: 4, cash: 25, bonus: "",            label: "Day 4" },
  { day: 5, cash: 30, bonus: "행복+10",     label: "Day 5" },
  { day: 6, cash: 35, bonus: "",            label: "Day 6" },
  { day: 7, cash: 50, bonus: "모든스탯+10", label: "🎉 Day 7" },
];

function getRewardInfo(streak) {
  return ATTEND_REWARDS[Math.min(streak - 1, 6)];
}

function checkAttendance() {
  const today = getTodayStr();
  if (hamster.lastAttendDate === today) return;

  hamster.attendStreak = (hamster.lastAttendDate === getYesterdayStr())
    ? Math.min(hamster.attendStreak + 1, 7)
    : 1;

  hamster.lastAttendDate  = today;
  hamster.totalAttendDays = (hamster.totalAttendDays || 0) + 1;

  const reward = getRewardInfo(hamster.attendStreak);
  hamster.cash            += reward.cash;
  hamster.totalCashEarned  = (hamster.totalCashEarned || 0) + reward.cash;

  if (reward.bonus === "행복+10")
    hamster.happiness = clamp(hamster.happiness + 10);
  if (reward.bonus === "모든스탯+10") {
    hamster.cleanliness = clamp(hamster.cleanliness + 10);
    hamster.happiness   = clamp(hamster.happiness   + 10);
    hamster.hunger      = clamp(hamster.hunger      + 10);
    hamster.health      = clamp(hamster.health      + 10);
  }

  saveGame();
  showAttendPopup(reward);
}

function showAttendPopup(reward) {
  const overlay = document.createElement("div");
  overlay.className = "modal-overlay";

  const card = document.createElement("div");
  card.className = "modal-card attend-popup";

  card.innerHTML = `
    <div class="attend-pop-title">📅 출석 보상!</div>
    <div class="attend-pop-streak">🔥 ${hamster.attendStreak}일 연속 출석!</div>
    <div class="attend-grid" id="attend-grid-cells"></div>
    <div class="attend-pop-summary">
      <p>💰 +${reward.cash}C 획득!</p>
      ${reward.bonus ? `<p>🎁 보너스: ${reward.bonus}</p>` : ""}
    </div>
    <button class="action-btn-primary" id="attend-ok">✅ 받기</button>
  `;

  const grid = card.querySelector("#attend-grid-cells");
  for (let i = 1; i <= 7; i++) {
    const r    = getRewardInfo(i);
    const cell = document.createElement("div");
    cell.className = "attend-cell " +
      (i < hamster.attendStreak ? "done" :
       i === hamster.attendStreak ? "today" : "future");
    cell.innerHTML = `
      <div class="ac-day">Day ${i}</div>
      <div class="ac-cash">+${r.cash}C</div>
      <div class="ac-bonus">${r.bonus || ""}</div>
    `;
    grid.appendChild(cell);
  }

  card.querySelector("#attend-ok").onclick = () => {
    overlay.remove();
    updateCashDisplay();
    refreshUI();
    showCashPop(`+${reward.cash}C`);
    checkAchievements();
  };

  overlay.appendChild(card);
  document.body.appendChild(overlay);
}

// ════════════════════════════════════════
//  스탯 감소 루프
// ════════════════════════════════════════

function updateStats() {
  hamster.cleanliness = clamp(hamster.cleanliness - randInt(2, 5));
  hamster.happiness   = clamp(hamster.happiness   - randInt(1, 4));
  hamster.hunger      = clamp(hamster.hunger      - randInt(3, 6));

  let penalty = 0;
  if (hamster.cleanliness < 30) penalty += 3;
  if (hamster.happiness   < 30) penalty += 2;
  if (hamster.hunger      < 30) penalty += 5;

  hamster.health = clamp(hamster.health - (randInt(1, 3) + penalty));

  // 성장 단계 (나이 없이 스탯 평균으로 결정)
  const avg = (hamster.cleanliness + hamster.happiness +
               hamster.hunger + hamster.health) / 4;
  if      (avg >= 80) hamster.stage = "건강해요 🌟";
  else if (avg >= 60) hamster.stage = "보통이에요 😐";
  else if (avg >= 40) hamster.stage = "힘들어요 😥";
  else                hamster.stage = "위험해요 🚨";

  saveGame();
}

// ════════════════════════════════════════
//  UI 갱신
// ════════════════════════════════════════

function updateBar(key, value) {
  const fill = document.getElementById(`bar-${key}`);
  const val  = document.getElementById(`val-${key}`);
  if (!fill || !val) return;
  fill.style.width = `${value}%`;
  val.textContent  = `${value}%`;
  fill.classList.remove("good", "normal", "bad");
  if      (value >= 70) fill.classList.add("good");
  else if (value >= 40) fill.classList.add("normal");
  else                  fill.classList.add("bad");
}

function updateImage(state) {
  if (state === currentImg) return;
  currentImg = state;
  const imgEl = document.getElementById("hamster-img");
  if (!imgEl) return;
  imgEl.style.opacity   = "0";
  imgEl.style.transform = "scale(0.9)";
  setTimeout(() => {
    imgEl.src             = STATE_INFO[state].img;
    imgEl.style.opacity   = "1";
    imgEl.style.transform = "scale(1)";
  }, 300);
  const stateMsg = document.getElementById("state-msg");
  if (stateMsg) stateMsg.textContent = STATE_INFO[state].msg;
}

function getWarnings() {
  const w = [];
  const { cleanliness, happiness, hunger, health } = hamster;
  if (cleanliness <= 20)      w.push("🚨 너무 더러워요!");
  else if (cleanliness <= 40) w.push("⚠️ 조금 더럽네요");
  if (happiness   <= 20)      w.push("🚨 너무 슬퍼해요!");
  else if (happiness   <= 40) w.push("⚠️ 심심해하네요");
  if (hunger      <= 20)      w.push("🚨 배고파요!");
  else if (hunger      <= 40) w.push("⚠️ 배고파 보여요");
  if (health      <= 20)      w.push("🚨 많이 아파요!");
  else if (health      <= 40) w.push("⚠️ 건강이 안좋아요");
  return w.join("  ");
}

function refreshUI() {
  const stageLabel = document.getElementById("stage-label");
  if (stageLabel) stageLabel.textContent = hamster.stage;

  updateBar("cleanliness", hamster.cleanliness);
  updateBar("happiness",   hamster.happiness);
  updateBar("hunger",      hamster.hunger);
  updateBar("health",      hamster.health);
  updateImage(getCurrentState());
  updateCashDisplay();

  const warnMsg = document.getElementById("warn-msg");
  if (warnMsg) warnMsg.textContent = getWarnings();
}

// ════════════════════════════════════════
//  액션 메시지
// ════════════════════════════════════════

function showActionMsg(msg) {
  const el = document.getElementById("action-msg");
  if (!el) return;
  el.textContent = msg;
  el.style.opacity = "1";
  if (actionMsgTimer) clearTimeout(actionMsgTimer);
  actionMsgTimer = setTimeout(() => {
    el.style.opacity = "0";
    setTimeout(() => { el.textContent = ""; el.style.opacity = "1"; }, 500);
  }, 2500);
}

function bounceHamster() {
  const box = document.querySelector(".hamster-box");
  if (!box) return;
  box.classList.remove("bouncing");
  void box.offsetWidth;
  box.classList.add("bouncing");
  setTimeout(() => box.classList.remove("bouncing"), 1600);
}

// ════════════════════════════════════════
//  버튼 액션
// ════════════════════════════════════════

function actionFeed() {
  if (!spendCash(COSTS.feed)) {
    showActionMsg(`💰 캐시 부족! (${COSTS.feed}C 필요)`);
    return;
  }
  if (hamster.hunger >= 90) {
    addCash(COSTS.feed);
    showActionMsg("배가 불러요! 🐹");
    return;
  }
  hamster.hunger    = clamp(hamster.hunger    + randInt(25, 35));
  hamster.happiness = clamp(hamster.happiness + randInt(5,  10));
  recordFeed();
  showActionMsg(`냠냠~ 맛있어요! 🥕`);
  bounceHamster();
  refreshUI();
  saveGame();
}

function actionClean() {
  if (!spendCash(COSTS.clean)) {
    showActionMsg(`💰 캐시 부족! (${COSTS.clean}C 필요)`);
    return;
  }
  hamster.cleanliness = clamp(hamster.cleanliness + randInt(30, 45));
  hamster.happiness   = clamp(hamster.happiness   + randInt(5,  15));
  hamster.health      = clamp(hamster.health      + randInt(3,   8));
  recordClean();
  showActionMsg(`깨끗해졌어요! 🛁`);
  bounceHamster();
  refreshUI();
  saveGame();
}

function actionMedicine() {
  if (!spendCash(COSTS.medicine)) {
    showActionMsg(`💰 캐시 부족! (${COSTS.medicine}C 필요)`);
    return;
  }
  if (hamster.health >= 90) {
    addCash(COSTS.medicine);
    showActionMsg("건강해요! 약 필요없어요 💊");
    return;
  }
  hamster.health    = clamp(hamster.health    + randInt(20, 35));
  hamster.happiness = clamp(hamster.happiness - randInt(5,  10));
  recordMedicine();
  showActionMsg(`약 먹었어요! 으... 써 🤒`);
  bounceHamster();
  refreshUI();
  saveGame();
}

// ════════════════════════════════════════
//  미니게임 모달
// ════════════════════════════════════════

function openMinigameModal() {
  const modal  = document.getElementById("mg-modal");
  const select = document.getElementById("mg-select");
  const play   = document.getElementById("mg-play");
  if (!modal) return;
  select.classList.remove("hidden");
  play.classList.add("hidden");
  play.innerHTML = "";
  modal.classList.remove("hidden");
  document.body.style.overflow = "hidden";
}

function closeMinigameModal() {
  const modal = document.getElementById("mg-modal");
  if (modal) modal.classList.add("hidden");
  document.body.style.overflow = "";
  refreshUI();
}

// 모달 바깥 클릭 시 닫기
document.addEventListener("DOMContentLoaded", () => {
  const modal = document.getElementById("mg-modal");
  if (modal) {
    modal.addEventListener("click", (e) => {
      if (e.target === modal) closeMinigameModal();
    });
  }
});

// ════════════════════════════════════════
//  🚀 초기화
// ════════════════════════════════════════

loadGame();
refreshUI();
checkAttendance();

window.addEventListener("load", () => {
  checkAchievements();
});

setInterval(() => {
  updateStats();
  refreshUI();
  checkAchievements();
}, 10000);

setInterval(saveGame, 30000);
