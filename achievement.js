// ════════════════════════════════════════
//  🏆 뚜별 햄스터 - 업적 시스템
// ════════════════════════════════════════

// ── 업적 목록 정의
const ACHIEVEMENTS = [
  // ── 돌봄
  {
    id:    "feed_first",
    icon:  "🥕",
    name:  "첫 식사",
    desc:  "처음으로 밥을 줬어요!",
    cond:  (s) => s.totalFeed >= 1,
    cash:  5,
    cat:   "돌봄",
  },
  {
    id:    "feed_10",
    icon:  "🍽️",
    name:  "든든한 집사",
    desc:  "밥을 10번 줬어요.",
    cond:  (s) => s.totalFeed >= 10,
    cash:  15,
    cat:   "돌봄",
  },
  {
    id:    "feed_50",
    icon:  "👨‍🍳",
    name:  "요리사 집사",
    desc:  "밥을 50번 줬어요.",
    cond:  (s) => s.totalFeed >= 50,
    cash:  30,
    cat:   "돌봄",
  },
  {
    id:    "clean_first",
    icon:  "🛁",
    name:  "첫 목욕",
    desc:  "처음으로 씻겨줬어요!",
    cond:  (s) => s.totalClean >= 1,
    cash:  5,
    cat:   "돌봄",
  },
  {
    id:    "clean_10",
    icon:  "🧼",
    name:  "깔끔쟁이",
    desc:  "씻기기를 10번 했어요.",
    cond:  (s) => s.totalClean >= 10,
    cash:  15,
    cat:   "돌봄",
  },
  {
    id:    "medicine_first",
    icon:  "💊",
    name:  "첫 투약",
    desc:  "처음으로 약을 먹였어요!",
    cond:  (s) => s.totalMedicine >= 1,
    cash:  5,
    cat:   "돌봄",
  },
  {
    id:    "medicine_10",
    icon:  "🏥",
    name:  "헌신적인 간호사",
    desc:  "약을 10번 먹였어요.",
    cond:  (s) => s.totalMedicine >= 10,
    cash:  20,
    cat:   "돌봄",
  },
  {
    id:    "all_max",
    icon:  "💯",
    name:  "완벽한 집사",
    desc:  "모든 스탯을 동시에 90 이상 유지했어요!",
    cond:  (s) =>
      s.cleanliness >= 90 &&
      s.happiness   >= 90 &&
      s.hunger      >= 90 &&
      s.health      >= 90,
    cash:  50,
    cat:   "돌봄",
  },

  // ── 성장
  {
    id:    "stage_teen",
    icon:  "🌱",
    name:  "청소년이 됐어요",
    desc:  "뚜스터가 청소년으로 성장했어요!",
    cond:  (s) => s.age >= 50,
    cash:  20,
    cat:   "성장",
  },
  {
    id:    "stage_adult",
    icon:  "🌟",
    name:  "어른이 됐어요",
    desc:  "뚜스터가 어른으로 성장했어요!",
    cond:  (s) => s.age >= 150,
    cash:  30,
    cat:   "성장",
  },
  {
    id:    "stage_elder",
    icon:  "👴",
    name:  "노년의 지혜",
    desc:  "뚜스터가 노인이 됐어요. 오래 함께했네요!",
    cond:  (s) => s.age >= 300,
    cash:  50,
    cat:   "성장",
  },

  // ── 출석
  {
    id:    "attend_3",
    icon:  "📅",
    name:  "꼬박꼬박 집사",
    desc:  "3일 연속 출석했어요!",
    cond:  (s) => s.attendStreak >= 3,
    cash:  15,
    cat:   "출석",
  },
  {
    id:    "attend_7",
    icon:  "🔥",
    name:  "일주일 개근",
    desc:  "7일 연속 출석했어요!",
    cond:  (s) => s.attendStreak >= 7,
    cash:  40,
    cat:   "출석",
  },
  {
    id:    "attend_total_10",
    icon:  "📆",
    name:  "열 번째 방문",
    desc:  "총 10일 출석했어요.",
    cond:  (s) => s.totalAttendDays >= 10,
    cash:  20,
    cat:   "출석",
  },
  {
    id:    "attend_total_30",
    icon:  "🗓️",
    name:  "한 달 단골",
    desc:  "총 30일 출석했어요.",
    cond:  (s) => s.totalAttendDays >= 30,
    cash:  60,
    cat:   "출석",
  },

  // ── 재산
  {
    id:    "cash_100",
    icon:  "💰",
    name:  "백만장자의 꿈",
    desc:  "캐시를 100C 이상 보유했어요.",
    cond:  (s) => s.cash >= 100,
    cash:  10,
    cat:   "재산",
  },
  {
    id:    "cash_300",
    icon:  "💎",
    name:  "부자 집사",
    desc:  "캐시를 300C 이상 보유했어요.",
    cond:  (s) => s.cash >= 300,
    cash:  30,
    cat:   "재산",
  },
  {
    id:    "cash_total_200",
    icon:  "🏦",
    name:  "돈 잘 버는 집사",
    desc:  "누적 획득 캐시가 200C를 넘었어요.",
    cond:  (s) => s.totalCashEarned >= 200,
    cash:  20,
    cat:   "재산",
  },

  // ── 게임
  {
    id:    "game_first",
    icon:  "🎮",
    name:  "게임 시작",
    desc:  "미니게임에서 처음으로 이겼어요!",
    cond:  (s) => s.totalGameWins >= 1,
    cash:  10,
    cat:   "게임",
  },
  {
    id:    "game_10",
    icon:  "🕹️",
    name:  "게임 고수",
    desc:  "미니게임에서 10번 이겼어요.",
    cond:  (s) => s.totalGameWins >= 10,
    cash:  25,
    cat:   "게임",
  },
  {
    id:    "game_30",
    icon:  "🏅",
    name:  "게임 마스터",
    desc:  "미니게임에서 30번 이겼어요.",
    cond:  (s) => s.totalGameWins >= 30,
    cash:  50,
    cat:   "게임",
  },

  // ── 비밀
  {
    id:     "secret_health0",
    icon:   "💀",
    name:   "위험했어요...",
    desc:   "건강이 0이 됐어요. 다음엔 더 잘 돌봐주세요!",
    cond:   (s) => s.health <= 0,
    cash:   5,
    cat:    "비밀 🔒",
    secret: true,
  },
  {
    id:     "secret_night",
    icon:   "🌙",
    name:   "밤샘 집사",
    desc:   "밤 11시 이후에 접속했어요.",
    cond:   () => new Date().getHours() >= 23,
    cash:   10,
    cat:    "비밀 🔒",
    secret: true,
  },
  {
    id:     "secret_morning",
    icon:   "🌅",
    name:   "새벽 집사",
    desc:   "새벽 6시 이전에 접속했어요.",
    cond:   () => new Date().getHours() < 6,
    cash:   10,
    cat:    "비밀 🔒",
    secret: true,
  },
];

// ── 카테고리 순서
const ACH_CATS = ["전체", "돌봄", "성장", "출석", "재산", "게임", "비밀 🔒"];

// 현재 선택된 카테고리
let currentAchCat = "전체";

// ════════════════════════════════════════
//  업적 체크 & 지급
// ════════════════════════════════════════

function checkAchievements() {
  let newlyUnlocked = [];

  ACHIEVEMENTS.forEach((ach) => {
    if (hamster.unlockedAch && hamster.unlockedAch.includes(ach.id)) return;

    let passed = false;
    try { passed = ach.cond(hamster); } catch { passed = false; }
    if (!passed) return;

    if (!hamster.unlockedAch) hamster.unlockedAch = [];
    hamster.unlockedAch.push(ach.id);
    hamster.cash            += ach.cash;
    hamster.totalCashEarned  = (hamster.totalCashEarned || 0) + ach.cash;

    newlyUnlocked.push(ach);
  });

  if (newlyUnlocked.length > 0) {
    saveGame();
    updateCashDisplay();
    showAchievementToast(newlyUnlocked);

    // 업적 탭이 열려 있으면 실시간 갱신
    const achTab = document.getElementById("tab-achievement");
    if (achTab && achTab.classList.contains("active")) {
      renderAchievementPage();
    }
  }
}

// ════════════════════════════════════════
//  🍞 토스트 알림
// ════════════════════════════════════════

let toastQueue   = [];
let toastShowing = false;

function showAchievementToast(list) {
  toastQueue.push(...list);
  if (!toastShowing) processToastQueue();
}

function processToastQueue() {
  if (toastQueue.length === 0) {
    toastShowing = false;
    return;
  }
  toastShowing = true;
  const ach = toastQueue.shift();

  const toast = document.createElement("div");
  toast.className = "ach-toast";
  toast.innerHTML = `
    <span class="ach-toast-icon">${ach.icon}</span>
    <div class="ach-toast-body">
      <div class="ach-toast-title">🏆 업적 달성!</div>
      <div class="ach-toast-name">${ach.name}</div>
      <div class="ach-toast-desc">${ach.desc}</div>
      <div class="ach-toast-cash">+${ach.cash}C 획득!</div>
    </div>
  `;

  document.body.appendChild(toast);
  requestAnimationFrame(() => toast.classList.add("show"));

  setTimeout(() => {
    toast.classList.remove("show");
    toast.classList.add("hide");
    setTimeout(() => {
      toast.remove();
      setTimeout(processToastQueue, 300);
    }, 500);
  }, 3000);
}

// ════════════════════════════════════════
//  🏆 업적 탭 페이지 렌더링
// ════════════════════════════════════════

function renderAchievementPage() {
  renderAchProgressBar();
  renderAchCatBar();
  renderAchCards(currentAchCat);
}

// ── 달성 현황 바
function renderAchProgressBar() {
  const total    = ACHIEVEMENTS.length;
  const unlocked = (hamster.unlockedAch || []).length;
  const pct      = total > 0 ? Math.round((unlocked / total) * 100) : 0;

  document.getElementById("ach-prog-count").textContent = `${unlocked} / ${total} 달성`;
  document.getElementById("ach-prog-pct").textContent   = `${pct}%`;
  document.getElementById("ach-progress-fill").style.width = `${pct}%`;
}

// ── 카테고리 탭 바
function renderAchCatBar() {
  const bar = document.getElementById("ach-cat-bar");
  bar.innerHTML = "";

  ACH_CATS.forEach((cat) => {
    const btn = document.createElement("button");
    btn.className   = "ach-cat-btn";
    btn.textContent = cat;

    if (cat === currentAchCat) btn.classList.add("active");

    // 카테고리별 달성 수 뱃지
    if (cat !== "전체") {
      const list     = ACHIEVEMENTS.filter(a => a.cat === cat);
      const doneNum  = list.filter(a => (hamster.unlockedAch || []).includes(a.id)).length;
      const badge    = document.createElement("span");
      badge.className   = "ach-cat-badge";
      badge.textContent = `${doneNum}/${list.length}`;
      btn.appendChild(badge);
    } else {
      const total    = ACHIEVEMENTS.length;
      const unlocked = (hamster.unlockedAch || []).length;
      const badge    = document.createElement("span");
      badge.className   = "ach-cat-badge";
      badge.textContent = `${unlocked}/${total}`;
      btn.appendChild(badge);
    }

    btn.onclick = () => {
      currentAchCat = cat;
      renderAchCatBar();
      renderAchCards(cat);
    };

    bar.appendChild(btn);
  });
}

// ── 업적 카드 목록
function renderAchCards(cat) {
  const list =
    cat === "전체"
      ? ACHIEVEMENTS
      : ACHIEVEMENTS.filter(a => a.cat === cat);

  const container = document.getElementById("ach-card-list");
  container.innerHTML = "";

  // 달성한 것 먼저, 미달성 나중
  const sorted = [
    ...list.filter(a => (hamster.unlockedAch || []).includes(a.id)),
    ...list.filter(a => !(hamster.unlockedAch || []).includes(a.id)),
  ];

  sorted.forEach((ach) => {
    const isDone   = (hamster.unlockedAch || []).includes(ach.id);
    const isSecret = ach.secret && !isDone;

    const card = document.createElement("div");
    card.className = `ach-card${isDone ? " done" : ""}`;

    // 아이콘
    const iconEl = document.createElement("div");
    iconEl.className   = "ach-card-icon";
    iconEl.textContent = isSecret ? "❓" : ach.icon;

    // 본문
    const body = document.createElement("div");
    body.className = "ach-card-body";

    const nameEl = document.createElement("div");
    nameEl.className   = "ach-card-name";
    nameEl.textContent = isSecret ? "???" : ach.name;

    const descEl = document.createElement("div");
    descEl.className   = "ach-card-desc";
    descEl.textContent = isSecret
      ? "숨겨진 업적이에요. 직접 찾아보세요!"
      : ach.desc;

    const rewardEl = document.createElement("div");
    rewardEl.className   = "ach-card-reward";
    rewardEl.textContent = `💰 +${ach.cash}C`;

    body.append(nameEl, descEl, rewardEl);

    // 뱃지
    const badgeEl = document.createElement("div");
    badgeEl.className   = "ach-card-badge";
    badgeEl.textContent = isDone ? "✅ 달성" : "🔒 미달성";

    card.append(iconEl, body, badgeEl);
    container.appendChild(card);
  });

  // 비어있을 때
  if (sorted.length === 0) {
    const empty = document.createElement("div");
    empty.className   = "ach-empty";
    empty.textContent = "이 카테고리에 업적이 없어요!";
    container.appendChild(empty);
  }
}

// ════════════════════════════════════════
//  통계 카운터 헬퍼
// ════════════════════════════════════════

function recordFeed() {
  hamster.totalFeed = (hamster.totalFeed || 0) + 1;
  checkAchievements();
}

function recordClean() {
  hamster.totalClean = (hamster.totalClean || 0) + 1;
  checkAchievements();
}

function recordMedicine() {
  hamster.totalMedicine = (hamster.totalMedicine || 0) + 1;
  checkAchievements();
}

function recordGameWin() {
  hamster.totalGameWins = (hamster.totalGameWins || 0) + 1;
  checkAchievements();
}
