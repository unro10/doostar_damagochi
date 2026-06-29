// ============================
// 🐹 뚜별 햄스터 키우기
// ============================

// ── 햄스터 상태 객체
const hamster = {
  name: "뚜스터",
  age: 0,             // tick 단위
  stage: "아기 🍼",

  cleanliness: 100,   // 청결도
  happiness: 100,     // 행복도
  hunger: 100,        // 포만감
  health: 100,        // 건강도
};

// ── 상태 텍스트 / 이미지 매핑
const STATE_INFO = {
  happy:  { msg: "😊 뚜스터가 행복해요!",       img: "images/happy.png"  },
  normal: { msg: "😐 뚜스터 상태 보통이에요.",   img: "images/normal.png" },
  sad:    { msg: "😢 뚜스터가 슬퍼해요...",      img: "images/sad.png"    },
  dirty:  { msg: "🤢 뚜스터가 더러워요...",      img: "images/dirty.png"  },
  hungry: { msg: "🍽️ 뚜스터가 배고파요...",     img: "images/hungry.png" },
  sick:   { msg: "🤒 뚜스터가 아파요!",          img: "images/sick.png"   },
};

let currentState = "";   // 현재 표시 중인 상태 (이미지 중복 변경 방지)
let actionMsgTimer = null;

// ============================
// 유틸
// ============================

/** 정수 랜덤 (min 이상 max 이하) */
function randInt(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

/** 값을 0~100 사이로 클램프 */
function clamp(val) {
  return Math.max(0, Math.min(100, val));
}

// ============================
// 상태 계산
// ============================

/** 현재 가장 심각한 상태 문자열 반환 */
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

/** 나이(tick) → 성장 단계 */
function getStage(age) {
  if (age < 50)  return "아기 🍼";
  if (age < 150) return "청소년 🌱";
  if (age < 300) return "어른 🌟";
  return "노인 👴";
}

// ============================
// 스탯 감소 (게임 루프)
// ============================

function updateStats() {
  // 10초마다 1 tick
  hamster.age += 1;
  hamster.stage = getStage(hamster.age);

  hamster.cleanliness = clamp(hamster.cleanliness - randInt(2, 5));
  hamster.happiness   = clamp(hamster.happiness   - randInt(1, 4));
  hamster.hunger      = clamp(hamster.hunger      - randInt(3, 6));

  // 건강: 다른 스탯이 낮을수록 추가 패널티
  let penalty = 0;
  if (hamster.cleanliness < 30) penalty += 3;
  if (hamster.happiness   < 30) penalty += 2;
  if (hamster.hunger      < 30) penalty += 5;

  hamster.health = clamp(hamster.health - (randInt(1, 3) + penalty));
}

// ============================
// UI 갱신
// ============================

/** 상태바 1개 업데이트 */
function updateBar(key, value) {
  const fill = document.getElementById(`bar-${key}`);
  const val  = document.getElementById(`val-${key}`);

  fill.style.width = `${value}%`;
  val.textContent  = `${value}%`;

  // 색상 클래스
  fill.classList.remove("good", "normal", "bad");
  if (value >= 70)      fill.classList.add("good");
  else if (value >= 40) fill.classList.add("normal");
  else                  fill.classList.add("bad");
}

/** 햄스터 이미지 교체 */
function updateImage(state) {
  if (state === currentState) return;
  currentState = state;

  const imgEl = document.getElementById("hamster-img");
  const info  = STATE_INFO[state];

  // 페이드 아웃 → 이미지 교체 → 페이드 인
  imgEl.style.opacity = "0";
  imgEl.style.transform = "scale(0.9)";

  setTimeout(() => {
    imgEl.src = info.img;
    imgEl.style.opacity = "1";
    imgEl.style.transform = "scale(1)";
  }, 300);

  document.getElementById("state-msg").textContent = info.msg;
}

/** 경고 메시지 생성 */
function getWarnings() {
  const warnings = [];
  const { cleanliness, happiness, hunger, health } = hamster;

  if (cleanliness <= 20)      warnings.push("🚨 너무 더러워요! 씻겨주세요!");
  else if (cleanliness <= 40) warnings.push("⚠️ 조금 더럽네요...");

  if (happiness <= 20)        warnings.push("🚨 너무 슬퍼해요! 놀아주세요!");
  else if (happiness <= 40)   warnings.push("⚠️ 심심해하네요...");

  if (hunger <= 20)           warnings.push("🚨 너무 배고파요! 밥 주세요!");
  else if (hunger <= 40)      warnings.push("⚠️ 배고파 보여요...");

  if (health <= 20)           warnings.push("🚨 많이 아파요! 약을 주세요!");
  else if (health <= 40)      warnings.push("⚠️ 건강이 안 좋아요...");

  return warnings.join("\n");
}

/** 전체 UI 갱신 */
function refreshUI() {
  // 단계 라벨
  const minutes = Math.floor(hamster.age / 6);
  document.getElementById("stage-label").textContent =
    `이름: ${hamster.name} | 단계: ${hamster.stage} | ⏰ ${minutes}분 경과`;

  // 상태바
  updateBar("cleanliness", hamster.cleanliness);
  updateBar("happiness",   hamster.happiness);
  updateBar("hunger",      hamster.hunger);
  updateBar("health",      hamster.health);

  // 이미지
  updateImage(getCurrentState());

  // 경고
  document.getElementById("warn-msg").textContent = getWarnings();
}

// ============================
// 액션 메시지 표시
// ============================

function showActionMsg(msg) {
  const el = document.getElementById("action-msg");
  el.classList.remove("hidden");
  el.textContent = msg;

  // 이전 타이머 취소
  if (actionMsgTimer) clearTimeout(actionMsgTimer);

  // 2.5초 후 페이드 아웃
  actionMsgTimer = setTimeout(() => {
    el.classList.add("hidden");
    actionMsgTimer = setTimeout(() => {
      el.textContent = "";
      el.classList.remove("hidden");
    }, 500);
  }, 2500);
}

/** 버튼 누를 때 햄스터 박스 통통 튀기기 */
function bounceHamster() {
  const box = document.querySelector(".hamster-box");
  box.classList.remove("bouncing");
  // reflow 강제 → 애니메이션 재시작
  void box.offsetWidth;
  box.classList.add("bouncing");
  setTimeout(() => box.classList.remove("bouncing"), 1600);
}

// ============================
// 버튼 액션
// ============================

function actionFeed() {
  if (hamster.hunger >= 90) {
    showActionMsg("배가 불러요! 너무 많이 먹이면 안 돼요! 🐹");
    return;
  }
  hamster.hunger    = clamp(hamster.hunger    + randInt(25, 35));
  hamster.happiness = clamp(hamster.happiness + randInt(5, 10));
  showActionMsg("냠냠냠~ 맛있게 먹고 있어요! 🥕");
  bounceHamster();
  refreshUI();
}

function actionClean() {
  hamster.cleanliness = clamp(hamster.cleanliness + randInt(30, 45));
  hamster.happiness   = clamp(hamster.happiness   + randInt(5, 15));
  hamster.health      = clamp(hamster.health      + randInt(3, 8));
  showActionMsg("깨끗하게 씻겨줬어요! 상쾌해~ 🛁");
  bounceHamster();
  refreshUI();
}

function actionPlay() {
  hamster.happiness = clamp(hamster.happiness + randInt(25, 35));
  hamster.hunger    = clamp(hamster.hunger    - randInt(5, 10));
  hamster.health    = clamp(hamster.health    + randInt(3, 8));
  showActionMsg("뚜스터와 신나게 놀았어요! 🎮");
  bounceHamster();
  refreshUI();
}

function actionMedicine() {
  if (hamster.health >= 90) {
    showActionMsg("뚜스터가 건강해요! 약은 필요 없어요~ 💊");
    return;
  }
  hamster.health    = clamp(hamster.health    + randInt(20, 35));
  hamster.happiness = clamp(hamster.happiness - randInt(5, 10));
  showActionMsg("약을 먹였어요! 으... 써... 🤒");
  bounceHamster();
  refreshUI();
}

// ============================
// 게임 루프 시작
// ============================

// 초기 UI
refreshUI();

// 10초마다 스탯 감소
setInterval(() => {
  updateStats();
  refreshUI();
}, 10000);
