// ════════════════════════════════════════
//  🐹 뚜별 햄스터 키우기 - 메인 게임 로직
// ════════════════════════════════════════

// ── 비용 설정
const COSTS = {
  feed:     10,
  clean:    10,
  medicine: 20,
};

// ── 상태 텍스트 / 이미지 매핑
const STATE_INFO = {
  happy:  { msg: "😊 뚜스터가 행복해요!",      img: "images/happy.png"  },
  normal: { msg: "😐 뚜스터 상태 보통이에요.",  img: "images/normal.png" },
  sad:    { msg: "😢 뚜스터가 슬퍼해요...",     img: "images/sad.png"    },
  dirty:  { msg: "🤢 뚜스터가 더러워요...",     img: "images/dirty.png"  },
  hungry: { msg: "🍽️ 뚜스터가 배고파요...",    img: "images/hungry.png" },
  sick:   { msg: "🤒 뚜스터가 아파요!",         img: "images/sick.png"   },
};

// ── 기본 상태
const DEFAULT_STATE = {
  name:             "뚜스터",
  age:              0,
  stage:            "아기 🍼",
  cleanliness:      100,
  happiness:        100,
  hunger:           100,
  health:           100,
  cash:             30,
  lastSaved:        Date.now(),
  // 출석
  lastAttendDate:   "",
  attendStreak:     0,
  totalAttendDays:  0,
  // 업적용 통계
  totalFeed:        0,
  totalClean:       0,
  totalMedicine:    0,
  totalGameWins:    0,
  totalCashEarned:  30,
  unlockedAch:      [],
};

// ── 전역 상태
let hamster      = {};
let currentImg   = "";
let actionMsgTimer = null;

// ════════════════════════════════════════
//  로컬스토리지 저장 / 불러오기
// ════════════════════════════════════════

const SAVE_KEY = "tubyul_hamster_v1";

function saveGame() {
  hamster.lastSaved = Date.now();
  localStorage.setItem(SAVE_KEY, JSON.stringify(hamster));
}

function loadGame() {
  const raw = localStorage.getItem(SAVE_KEY);
  if (!raw) {
    hamster = { ...DEFAULT_STATE };
    return;
  }
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
  hamster.age        += t;
  hamster.stage       = getStage(hamster.age);
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

function getStage(age) {
  if (age < 50)  return "아기 🍼";
  if (age < 150) return "청소년 🌱";
  if (age < 300) return "어른 🌟";
  return "노인 👴";
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

// 오늘 날짜 "YYYY-MM-DD" 문자열
function getTodayStr() {
  const d   = new Date();
  const y   = d.getFullYear();
  const m   = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
}

function getYesterdayStr() {
  const d = new Date();
  d.setDate(d.getDate() - 1);
  const y   = d.getFullYear();
  const m   = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
}

// ════════════════════════════════════════
//  캐시 관련
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
  document.getElementById("cash-display").textContent = hamster.cash;
}

function showCashPop(text) {
  const el  = document.createElement("div");
  el.className   = "cash-pop";
  el.textContent = text;

  const bar  = document.querySelector(".cash-bar");
  const rect = bar.getBoundingClientRect();
  el.style.left = `${rect.right - 60}px`;
  el.style.top  = `${rect.top}px`;

  document.body.appendChild(el);
  setTimeout(() => el.remove(), 1200);
}

// ════════════════════════════════════════
//  📅 출석 보상 시스템
// ════════════════════════════════════════

const ATTEND_REWARDS = [
  { day: 1, cash: 10, bonus: "",            label: "첫째 날"   },
  { day: 2, cash: 15, bonus: "",            label: "둘째 날"   },
  { day: 3, cash: 20, bonus: "",            label: "셋째 날"   },
  { day: 4, cash: 25, bonus: "",            label: "넷째 날"   },
  { day: 5, cash: 30, bonus: "행복+10",     label: "다섯째 날" },
  { day: 6, cash: 35, bonus: "",            label: "여섯째 날" },
  { day: 7, cash: 50, bonus: "모든스탯+10", label: "🎉 7일 연속!" },
];

function getRewardInfo(streak) {
  const idx = Math.min(streak - 1, ATTEND_REWARDS.length - 1);
  return ATTEND_REWARDS[idx];
}

function checkAttendance() {
  const today    = getTodayStr();
  const lastDate = hamster.lastAttendDate || "";

  if (lastDate === today) return;

  const yesterday = getYesterdayStr();
  if (lastDate === yesterday) {
    hamster.attendStreak += 1;
  } else {
    hamster.attendStreak = 1;
  }

  if (hamster.attendStreak > 7) hamster.attendStreak = 1;

  hamster.lastAttendDate  = today;
  hamster.totalAttendDays = (hamster.totalAttendDays || 0) + 1;

  const reward = getRewardInfo(hamster.attendStreak);
  hamster.cash           += reward.cash;
  hamster.totalCashEarned = (hamster.totalCashEarned || 0) + reward.cash;

  if (reward.bonus === "행복+10") {
    hamster.happiness = clamp(hamster.happiness + 10);
  }
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
  overlay.id    = "attend-overlay";

  const card = document.createElement("div");
  card.id    = "attend-card";

  const title = document.createElement("h2");
  title.id          = "attend-title";
  title.textContent = "📅 출석 보상!";

  const streakEl = document.createElement("p");
  streakEl.id          = "attend-streak";
  streakEl.textContent = `🔥 ${hamster.attendStreak}일 연속 출석!`;

  // 달력 그리드 (7칸)
  const grid = document.createElement("div");
  grid.id = "attend-grid";

  for (let i = 1; i <= 7; i++) {
    const cell = document.createElement("div");
    cell.className = "attend-cell";

    const r = getRewardInfo(i);

    if (i < hamster.attendStreak) {
      cell.classList.add("done");
    } else if (i === hamster.attendStreak) {
      cell.classList.add("today");
    } else {
      cell.classList.add("future");
    }

    const dayLabel = document.createElement("div");
    dayLabel.className   = "attend-day";
    dayLabel.textContent = `Day ${i}`;

    const cashLabel = document.createElement("div");
    cashLabel.className   = "attend-cash";
    cashLabel.textContent = `+${r.cash}C`;

    const bonusLabel = document.createElement("div");
    bonusLabel.className   = "attend-bonus";
    bonusLabel.textContent = r.bonus || "";

    cell.append(dayLabel, cashLabel, bonusLabel);
    grid.appendChild(cell);
  }

  // 오늘 보상 요약
  const summary = document.createElement("div");
  summary.id = "attend-summary";

  const sumCash = document.createElement("p");
  sumCash.textContent = `💰 +${reward.cash}C 획득!`;

  const sumBonus = document.createElement("p");
  sumBonus.textContent   = reward.bonus ? `🎁 보너스: ${reward.bonus}` : "";
  sumBonus.style.display = reward.bonus ? "block" : "none";

  summary.append(sumCash, sumBonus);

  const closeBtn = document.createElement("button");
  closeBtn.id          = "attend-close-btn";
  closeBtn.textContent = "✅ 받기";
  closeBtn.onclick     = () => {
    overlay.remove();
    updateCashDisplay();
    refreshUI();
    showCashPop(`+${reward.cash}C`);
    // 출석 후 업적 체크
    checkAchievements();
  };

  card.append(title, streakEl, grid, summary, closeBtn);
  overlay.appendChild(card);
  document.body.appendChild(overlay);
}

// ════════════════════════════════════════
//  스탯 감소 (게임 루프)
// ════════════════════════════════════════

function updateStats() {
  hamster.age   += 1;
  hamster.stage  = getStage(hamster.age);

  hamster.cleanliness = clamp(hamster.cleanliness - randInt(2, 5));
  hamster.happiness   = clamp(hamster.happiness   - randInt(1, 4));
  hamster.hunger      = clamp(hamster.hunger      - randInt(3, 6));

  let penalty = 0;
  if (hamster.cleanliness < 30) penalty += 3;
  if (hamster.happiness   < 30) penalty += 2;
  if (hamster.hunger      < 30) penalty += 5;

  hamster.health = clamp(hamster.health - (randInt(1, 3) + penalty));

  saveGame();
}

// ════════════════════════════════════════
//  UI 갱신
// ════════════════════════════════════════

function updateBar(key, value) {
  const fill = document.getElementById(`bar-${key}`);
  const val  = document.getElementById(`val-${key}`);

  fill.style.width = `${value}%`;
  val.textContent  = `${value}%`;

  fill.classList.remove("good", "normal", "bad");
  if (value >= 70)      fill.classList.add("good");
  else if (value >= 40) fill.classList.add("normal");
  else                  fill.classList.add("bad");
}

function updateImage(state) {
  if (state === currentImg) return;
  currentImg = state;

  const imgEl = document.getElementById("hamster-img");
  imgEl.style.opacity   = "0";
  imgEl.style.transform = "scale(0.9)";

  setTimeout(() => {
    imgEl.src             = STATE_INFO[state].img;
    imgEl.style.opacity   = "1";
    imgEl.style.transform = "scale(1)";
  }, 300);

  document.getElementById("state-msg").textContent = STATE_INFO[state].msg;
}

function getWarnings() {
  const w = [];
  const { cleanliness, happiness, hunger, health } = hamster;

  if (cleanliness <= 20)      w.push("🚨 너무 더러워요! 씻겨주세요!");
  else if (cleanliness <= 40) w.push("⚠️ 조금 더럽네요...");
  if (happiness <= 20)        w.push("🚨 너무 슬퍼해요! 놀아주세요!");
  else if (happiness <= 40)   w.push("⚠️ 심심해하네요...");
  if (hunger <= 20)           w.push("🚨 너무 배고파요! 밥 주세요!");
  else if (hunger <= 40)      w.push("⚠️ 배고파 보여요...");
  if (health <= 20)           w.push("🚨 많이 아파요! 약을 주세요!");
  else if (health <= 40)      w.push("⚠️ 건강이 안 좋아요...");

  return w.join("\n");
}

function refreshUI() {
  const minutes = Math.floor(hamster.age / 6);
  document.getElementById("stage-label").textContent =
    `이름: ${hamster.name} | 단계: ${hamster.stage} | ⏰ ${minutes}분 경과`;

  updateBar("cleanliness", hamster.cleanliness);
  updateBar("happiness",   hamster.happiness);
  updateBar("hunger",      hamster.hunger);
  updateBar("health",      hamster.health);

  updateImage(getCurrentState());
  updateCashDisplay();

  document.getElementById("warn-msg").textContent = getWarnings();
}

// ════════════════════════════════════════
//  액션 메시지
// ════════════════════════════════════════

function showActionMsg(msg) {
  const el = document.getElementById("action-msg");
  el.classList.remove("hidden");
  el.textContent = msg;

  if (actionMsgTimer) clearTimeout(actionMsgTimer);
  actionMsgTimer = setTimeout(() => {
    el.classList.add("hidden");
    setTimeout(() => {
      el.textContent = "";
      el.classList.remove("hidden");
    }, 500);
  }, 2500);
}

function bounceHamster() {
  const box = document.querySelector(".hamster-box");
  box.classList.remove("bouncing");
  void box.offsetWidth;
  box.classList.add("bouncing");
  setTimeout(() => box.classList.remove("bouncing"), 1600);
}

// ════════════════════════════════════════
//  버튼 액션 (캐시 필요)
// ════════════════════════════════════════

function actionFeed() {
  if (!spendCash(COSTS.feed)) {
    showActionMsg(`💰 캐시가 부족해요! (필요: ${COSTS.feed}C)`);
    return;
  }
  if (hamster.hunger >= 90) {
    addCash(COSTS.feed);
    showActionMsg("배가 불러요! 너무 많이 먹이면 안 돼요! 🐹");
    return;
  }
  hamster.hunger    = clamp(hamster.hunger    + randInt(25, 35));
  hamster.happiness = clamp(hamster.happiness + randInt(5,  10));
  recordFeed();
  showActionMsg(`냠냠냠~ 맛있게 먹고 있어요! 🥕 (-${COSTS.feed}C)`);
  bounceHamster();
  refreshUI();
  saveGame();
}

function actionClean() {
  if (!spendCash(COSTS.clean)) {
    showActionMsg(`💰 캐시가 부족해요! (필요: ${COSTS.clean}C)`);
    return;
  }
  hamster.cleanliness = clamp(hamster.cleanliness + randInt(30, 45));
  hamster.happiness   = clamp(hamster.happiness   + randInt(5,  15));
  hamster.health      = clamp(hamster.health      + randInt(3,   8));
  recordClean();
  showActionMsg(`깨끗하게 씻겨줬어요! 상쾌해~ 🛁 (-${COSTS.clean}C)`);
  bounceHamster();
  refreshUI();
  saveGame();
}

function actionMedicine() {
  if (!spendCash(COSTS.medicine)) {
    showActionMsg(`💰 캐시가 부족해요! (필요: ${COSTS.medicine}C)`);
    return;
  }
  if (hamster.health >= 90) {
    addCash(COSTS.medicine);
    showActionMsg("뚜스터가 건강해요! 약은 필요 없어요~ 💊");
    return;
  }
  hamster.health    = clamp(hamster.health    + randInt(20, 35));
  hamster.happiness = clamp(hamster.happiness - randInt(5,  10));
  recordMedicine();
  showActionMsg(`약을 먹였어요! 으... 써... 🤒 (-${COSTS.medicine}C)`);
  bounceHamster();
  refreshUI();
  saveGame();
}

// ════════════════════════════════════════
//  미니게임 화면 열기 / 닫기
// ════════════════════════════════════════

function openMinigame() {
  document.getElementById("minigame-screen").classList.remove("hidden");
  document.getElementById("mg-select").classList.remove("hidden");
  document.getElementById("mg-play").classList.add("hidden");
}

function closeMinigame() {
  document.getElementById("minigame-screen").classList.add("hidden");
  refreshUI();
}

// ════════════════════════════════════════
//  🚀 초기화
// ════════════════════════════════════════

loadGame();
refreshUI();
checkAttendance();
checkAchievements();

setInterval(() => {
  updateStats();
  refreshUI();
  checkAchievements();
}, 10000);

setInterval(saveGame, 30000);
// ════════════════════════════════════════
//  🗂️ 메인 탭 전환
// ════════════════════════════════════════

function switchTab(tabId) {
  // 모든 섹션 숨기기
  document.querySelectorAll(".tab-section").forEach(sec => {
    sec.classList.remove("active");
  });

  // 모든 탭 버튼 비활성화
  document.querySelectorAll(".main-tab").forEach(btn => {
    btn.classList.remove("active");
  });

  // 선택한 섹션 보이기
  document.getElementById(tabId).classList.add("active");

  // 선택한 탭 버튼 활성화
  document.querySelector(`.main-tab[data-tab="${tabId}"]`).classList.add("active");

  // 업적 탭으로 전환할 때 렌더링
  if (tabId === "tab-achievement") {
    renderAchievementPage();
  }
}
