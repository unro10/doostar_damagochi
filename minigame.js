// ════════════════════════════════════════
//  🎮 뚜별 햄스터 - 미니게임
// ════════════════════════════════════════

const MG_CASH = {
  guess:  15,
  rps:    12,
  memory: 20,
};

let currentGame = null;

// ── 게임 선택
function selectGame(type) {
  currentGame = type;
  document.getElementById("mg-select").classList.add("hidden");

  const play = document.getElementById("mg-play");
  play.classList.remove("hidden");
  play.innerHTML = "";

  if (type === "guess")  buildGuess(play);
  if (type === "rps")    buildRPS(play);
  if (type === "memory") buildMemory(play);
}

// ════════════════════════════════════════
//  공통 UI 헬퍼
// ════════════════════════════════════════

function buildHeader(area, title, desc) {
  const h = document.createElement("div");
  h.className = "mg-header";

  const t = document.createElement("h3");
  t.textContent = title;

  const d = document.createElement("p");
  d.className   = "mg-desc";
  d.textContent = desc;

  h.append(t, d);
  area.appendChild(h);
}

function buildResult(area, { win, cashEarned, message, onRetry }) {
  area.innerHTML = "";

  const box = document.createElement("div");
  box.className = "mg-result";

  const emoji = document.createElement("div");
  emoji.className   = "mg-result-emoji";
  emoji.textContent = win ? "🎉" : "😢";

  const msg = document.createElement("div");
  msg.className   = "mg-result-msg";
  msg.textContent = message;

  const cashMsg = document.createElement("div");
  cashMsg.className = "mg-result-cash";

  if (win) {
    addCash(cashEarned);
    hamster.happiness = clamp(hamster.happiness + randInt(5, 12));
    recordGameWin();
    saveGame();
    cashMsg.textContent = `+${cashEarned}C 획득!`;
    cashMsg.style.color = "#2E7D32";
  } else {
    cashMsg.textContent = "다음엔 꼭 이겨요!";
    cashMsg.style.color = "#C62828";
  }

  const retryBtn = document.createElement("button");
  retryBtn.className   = "mg-btn";
  retryBtn.textContent = "🔄 다시 하기";
  retryBtn.onclick     = onRetry;

  const backBtn = document.createElement("button");
  backBtn.className   = "mg-btn secondary";
  backBtn.textContent = "← 게임 목록";
  backBtn.onclick     = () => {
    document.getElementById("mg-play").classList.add("hidden");
    document.getElementById("mg-select").classList.remove("hidden");
  };

  box.append(emoji, msg, cashMsg, retryBtn, backBtn);
  area.appendChild(box);
}

// ════════════════════════════════════════
//  🔢 숫자 맞히기
// ════════════════════════════════════════

function buildGuess(area) {
  area.innerHTML = "";

  const answer  = randInt(1, 10);
  let   tries   = 3;

  buildHeader(area, "🔢 숫자 맞히기",
    `1~10 사이의 숫자를 맞혀요! (${tries}번 도전 가능)`);

  const triesEl = document.createElement("p");
  triesEl.className   = "mg-tries";
  triesEl.textContent = `남은 기회: ${tries}번`;

  const hintEl = document.createElement("p");
  hintEl.className = "mg-hint";

  const btnGrid = document.createElement("div");
  btnGrid.className = "mg-number-grid";

  const usedBtns = new Set();

  for (let i = 1; i <= 10; i++) {
    const btn = document.createElement("button");
    btn.className   = "mg-number-btn";
    btn.textContent = i;

    btn.onclick = () => {
      if (usedBtns.has(i)) return;
      usedBtns.add(i);
      btn.disabled = true;
      tries--;

      if (i === answer) {
        buildResult(area, {
          win:        true,
          cashEarned: MG_CASH.guess,
          message:    `정답! ${answer}이(가) 맞아요! 🎯`,
          onRetry:    () => buildGuess(area),
        });
        return;
      }

      hintEl.textContent = i < answer ? "📈 더 크게!" : "📉 더 작게!";
      triesEl.textContent = `남은 기회: ${tries}번`;
      btn.classList.add("wrong");

      if (tries === 0) {
        buildResult(area, {
          win:        false,
          cashEarned: 0,
          message:    `아쉬워요! 정답은 ${answer}이었어요.`,
          onRetry:    () => buildGuess(area),
        });
      }
    };

    btnGrid.appendChild(btn);
  }

  area.append(triesEl, hintEl, btnGrid);
}

// ════════════════════════════════════════
//  ✂️ 가위바위보
// ════════════════════════════════════════

function buildRPS(area) {
  area.innerHTML = "";

  buildHeader(area, "✂️ 가위바위보", "뚜스터와 가위바위보 대결!");

  const choices = [
    { key: "가위", icon: "✂️" },
    { key: "바위", icon: "🪨" },
    { key: "보",   icon: "📄" },
  ];

  const btnRow = document.createElement("div");
  btnRow.className = "mg-rps-row";

  choices.forEach(({ key, icon }) => {
    const btn = document.createElement("button");
    btn.className = "mg-rps-btn";
    btn.innerHTML = `<span>${icon}</span><br />${key}`;

    btn.onclick = () => {
      const hamChoice = choices[randInt(0, 2)];
      const result    = getRPSResult(key, hamChoice.key);

      let win     = false;
      let message = "";

      if (result === "win") {
        win     = true;
        message = `뚜스터는 ${hamChoice.icon} ${hamChoice.key}! 이겼어요! 🎉`;
      } else if (result === "lose") {
        message = `뚜스터는 ${hamChoice.icon} ${hamChoice.key}! 졌어요... 😢`;
      } else {
        // 비겼을 때 한 번 더
        message = `뚜스터도 ${hamChoice.icon} ${hamChoice.key}! 비겼어요! 다시 도전해요!`;
        area.innerHTML = "";
        buildHeader(area, "✂️ 가위바위보", "비겼어요! 다시 선택하세요!");
        const hint = document.createElement("p");
        hint.className   = "mg-hint";
        hint.textContent = `뚜스터: ${hamChoice.icon} ${hamChoice.key}`;
        area.appendChild(hint);
        const row2 = document.createElement("div");
        row2.className   = "mg-rps-row";
        choices.forEach(({ key: k, icon: ico }) => {
          const b = document.createElement("button");
          b.className = "mg-rps-btn";
          b.innerHTML = `<span>${ico}</span><br />${k}`;
          b.onclick   = () => {
            const hc2 = choices[randInt(0, 2)];
            const r2  = getRPSResult(k, hc2.key);
            const w2  = r2 === "win";
            buildResult(area, {
              win:        w2,
              cashEarned: MG_CASH.rps,
              message:    w2
                ? `뚜스터는 ${hc2.icon} ${hc2.key}! 이겼어요! 🎉`
                : `뚜스터는 ${hc2.icon} ${hc2.key}! ${r2 === "lose" ? "졌어요..." : "또 비겼어요!"}`,
              onRetry: () => buildRPS(area),
            });
          };
          row2.appendChild(b);
        });
        area.appendChild(row2);
        return;
      }

      buildResult(area, {
        win,
        cashEarned: MG_CASH.rps,
        message,
        onRetry:    () => buildRPS(area),
      });
    };

    btnRow.appendChild(btn);
  });

  area.appendChild(btnRow);
}

function getRPSResult(mine, theirs) {
  if (mine === theirs) return "draw";
  if (
    (mine === "가위" && theirs === "보")  ||
    (mine === "바위" && theirs === "가위") ||
    (mine === "보"   && theirs === "바위")
  ) return "win";
  return "lose";
}

// ════════════════════════════════════════
//  🧠 기억력 게임
// ════════════════════════════════════════

function buildMemory(area) {
  area.innerHTML = "";

  buildHeader(area, "🧠 기억력 게임",
    "순서대로 깜빡이는 버튼을 기억하세요!");

  const EMOJIS   = ["🐹", "🥕", "🛁", "💊", "⭐"];
  const sequence = [];
  let   userSeq  = [];
  let   level    = 1;
  let   canClick = false;

  const levelEl = document.createElement("p");
  levelEl.className   = "mg-tries";
  levelEl.textContent = `레벨 ${level}`;

  const statusEl = document.createElement("p");
  statusEl.className   = "mg-hint";
  statusEl.textContent = "잘 보세요...";

  const grid = document.createElement("div");
  grid.className = "mg-memory-grid";

  const btns = EMOJIS.map((em, idx) => {
    const b = document.createElement("button");
    b.className   = "mg-memory-btn";
    b.textContent = em;
    b.dataset.idx = idx;

    b.onclick = () => {
      if (!canClick) return;
      b.classList.add("active");
      setTimeout(() => b.classList.remove("active"), 250);

      userSeq.push(idx);
      const pos = userSeq.length - 1;

      if (userSeq[pos] !== sequence[pos]) {
        canClick = false;
        buildResult(area, {
          win:        false,
          cashEarned: 0,
          message:    `레벨 ${level}에서 실패했어요. 순서가 틀렸어요!`,
          onRetry:    () => buildMemory(area),
        });
        return;
      }

      if (userSeq.length === sequence.length) {
        canClick = false;
        if (level >= 5) {
          buildResult(area, {
            win:        true,
            cashEarned: MG_CASH.memory,
            message:    "5레벨 클리어! 기억력 천재! 🧠",
            onRetry:    () => buildMemory(area),
          });
          return;
        }
        level++;
        levelEl.textContent  = `레벨 ${level}`;
        statusEl.textContent = "잘했어요! 다음 레벨...";
        userSeq = [];
        setTimeout(() => playSequence(), 1000);
      }
    };

    grid.appendChild(b);
    return b;
  });

  area.append(levelEl, statusEl, grid);

  function flashBtn(idx, cb) {
    btns[idx].classList.add("active");
    setTimeout(() => {
      btns[idx].classList.remove("active");
      setTimeout(cb, 300);
    }, 600);
  }

  function playSequence() {
    sequence.push(randInt(0, EMOJIS.length - 1));
    canClick             = false;
    statusEl.textContent = "잘 보세요...";

    let i = 0;
    function next() {
      if (i >= sequence.length) {
        canClick             = true;
        statusEl.textContent = "이제 눌러보세요!";
        return;
      }
      flashBtn(sequence[i++], next);
    }
    setTimeout(next, 500);
  }

  playSequence();
}
