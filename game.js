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
  name:        "뚜스터",
  age:         0,
  stage:       "아기 🍼",
  cleanliness: 100,
  happiness:   100,
  hunger:      100,
  health:      100,
  cash:        30,       // 시작 캐시
  lastSaved:   Date.now(),
};

// ── 전역 상태
let hamster    = {};
let currentImg = "";
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

    // ── 오프라인 경과 시간 처리
    const elapsed = Math.floor((Date.now() - hamster.lastSaved) / 10000); // 10초 단위
    if (elapsed > 0) {
      applyOfflineDecay(elapsed);
    }
  } catch {
    hamster = { ...DEFAULT_STATE };
  }
}

/** 오프라인 중 스탯 감소 */
function applyOfflineDecay(ticks) {
  const maxTicks = 360; // 최대 1시간치
  const t = Math.min(ticks, maxTicks);

  hamster.cleanliness = clamp(hamster.cleanliness - randInt(2,4) * t);
  hamster.happiness   = clamp(hamster.happiness   - randInt(1,3) * t);
  hamster.hunger      = clamp(hamster.hunger      - randInt(3,5) * t);
  hamster.health      = clamp(hamster.health      - randInt(1,2) * t);
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
  const minVal = Math.min(cleanliness, happiness, hunger, health);

  if (health      <= 0)  return "sick";
  if (hunger      <= 30) return "hungry";
  if (cleanliness <= 30) return "dirty";
  if (happiness   <= 30) return "sad";
  if (minVal      <= 50) return "normal";
  return "happy";
}

// ════════════════════════════════════════
//  캐시 관련
// ════════════════════════════════════════

/** 캐시 추가 (미니게임 보상 등) */
function addCash(amount) {
  hamster.cash += amount;
  updateCashDisplay();
  showCashPop(`+${amount}C`);
  saveGame();
}

/** 캐시 차감. 성공 시 true 반환 */
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

/** 캐시 획득 팝업 애니메이션 */
function showCashPop(text) {
  const el = document.createElement("div");
  el.className   = "cash-pop";
  el.textContent = text;

  const bar = document.querySelector(".cash-bar");
  const rect = bar.getBoundingClientRect();
  el.style.left = `${rect.right - 60}px`;
  el.style.top  = `${rect.top}px`;

  document.body.appendChild(el);
  setTimeout(() => el.remove(), 1200);
}

// ════════════════════════════════════════
//  스탯 감소 (게임 루프)
// ════════════════════════════════════════

function updateStats() {
  hamster.age  += 1;
  hamster.stage = getStage(hamster.age);

  hamster.cleanliness = clamp(hamster.cleanliness - randInt(2,5));
  hamster.happiness   = clamp(hamster.happiness   - randInt(1,4));
  hamster.hunger      = clamp(hamster.hunger      - randInt(3,6));

  let penalty = 0;
  if (hamster.cleanliness < 30) penalty += 3;
  if (hamster.happiness   < 30) penalty += 2;
  if (hamster.hunger      < 30) penalty += 5;

  hamster.health = clamp(hamster.health - (randInt(1,3) + penalty));

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

  fill.classList.remove("good","normal","bad");
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
    // 환불
    addCash(COSTS.feed);
    showActionMsg("배가 불러요! 너무 많이 먹이면 안 돼요! 🐹");
    return;
  }
  hamster.hunger    = clamp(hamster.hunger    + randInt(25,35));
  hamster.happiness = clamp(hamster.happiness + randInt(5,10));
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
  hamster.cleanliness = clamp(hamster.cleanliness + randInt(30,45));
  hamster.happiness   = clamp(hamster.happiness   + randInt(5,15));
  hamster.health      = clamp(hamster.health      + randInt(3,8));
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
  hamster.health    = clamp(hamster.health    + randInt(20,35));
  hamster.happiness = clamp(hamster.happiness - randInt(5,10));
  showActionMsg(`약을 먹였어요! 으... 써... 🤒 (-${COSTS.medicine}C)`);
  bounceHamster();
  refreshUI();
  saveGame();
}

// ════════════════════════════════════════
//  미니게임 화면 열기/닫기
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
//  게임 루프
// ════════════════════════════════════════

// 초기화
loadGame();
refreshUI();

// 10초마다 스탯 감소
setInterval(() => {
  updateStats();
  refreshUI();
}, 10000);

// 30초마다 자동 저장
setInterval(saveGame, 30000);
