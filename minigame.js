// ════════════════════════════════════════
//  🎮 뚜별 햄스터 - 미니게임
// ════════════════════════════════════════

const PLAY_AREA = () => document.getElementById("mg-play");
const SELECT    = () => document.getElementById("mg-select");

// ── 게임 시작 라우터
function startGame(type) {
  SELECT().classList.add("hidden");
  PLAY_AREA().classList.remove("hidden");
  PLAY_AREA().innerHTML = "";

  if (type === "guess")   buildGuess();
  if (type === "rps")     buildRPS();
  if (type === "scratch") buildSlot();
  if (type === "memory")  buildMemory();
}

// ── 게임 → 선택 화면으로 돌아가기
function backToSelect() {
  PLAY_AREA().classList.add("hidden");
  PLAY_AREA().innerHTML = "";
  SELECT().classList.remove("hidden");
}

// ════════════════════════════════════════
//  공통 결과 렌더러
// ════════════════════════════════════════

function buildResult(area, { win, cashEarned, message, onRetry }) {
  const result = document.createElement("div");
  result.className = `mg-result ${win ? "win" : "lose"}`;
  result.textContent = message;
  area.appendChild(result);

  if (win) {
    addCash(cashEarned);
    hamster.happiness = clamp(hamster.happiness + randInt(5, 12));
    recordGameWin();
    saveGame();
  }

  // 버튼 래퍼
  const btns = document.createElement("div");
  btns.style.cssText =
    "display:flex; gap:10px; width:100%; margin-top:4px;";

  const retryBtn = document.createElement("button");
  retryBtn.className   = "mg-btn";
  retryBtn.textContent = "🔄 다시 하기";
  retryBtn.onclick     = onRetry;

  const backBtn = document.createElement("button");
  backBtn.className   = "mg-btn";
  backBtn.style.background =
    "linear-gradient(135deg, #444, #666)";
  backBtn.textContent = "← 목록으로";
  backBtn.onclick     = backToSelect;

  btns.append(retryBtn, backBtn);
  area.appendChild(btns);
}

// ════════════════════════════════════════
//  🔢 숫자 맞추기
// ════════════════════════════════════════

function buildGuess() {
  const area   = PLAY_AREA();
  const wrap   = document.createElement("div");
  wrap.className = "mg-game-wrap";

  let answer    = randInt(1, 30);
  let tries     = 0;
  const maxTry  = 5;

  const title = document.createElement("div");
  title.className   = "mg-game-title";
  title.textContent = "🔢 숫자 맞추기";

  const desc = document.createElement("div");
  desc.className   = "mg-game-desc";
  desc.textContent = `1 ~ 30 사이의 숫자를 ${maxTry}번 안에 맞춰보세요!\n맞추면 최대 +30C!`;

  const input = document.createElement("input");
  input.className   = "mg-input";
  input.type        = "number";
  input.min         = "1";
  input.max         = "30";
  input.placeholder = "숫자 입력 (1~30)";

  const hint = document.createElement("div");
  hint.className = "mg-hint";

  const submitBtn = document.createElement("button");
  submitBtn.className   = "mg-btn";
  submitBtn.textContent = "확인!";

  function doGuess() {
    const val = parseInt(input.value, 10);
    if (isNaN(val) || val < 1 || val > 30) {
      hint.textContent = "⚠️ 1~30 사이 숫자를 입력해주세요!";
      return;
    }

    tries++;
    const left = maxTry - tries;

    if (val === answer) {
      submitBtn.disabled = true;
      input.disabled     = true;
      // 남은 시도 횟수에 따라 보상 차등
      const cash = left === 4 ? 30
                 : left === 3 ? 25
                 : left === 2 ? 20
                 : left === 1 ? 15
                 : 10;

      hint.textContent = "";
      buildResult(wrap, {
        win:       true,
        cashEarned: cash,
        message:   `🎉 정답! ${tries}번 만에 맞췄어요! (+${cash}C)`,
        onRetry:   buildGuess,
      });
    } else if (tries >= maxTry) {
      submitBtn.disabled = true;
      input.disabled     = true;
      hint.textContent = "";
      buildResult(wrap, {
        win:       false,
        cashEarned: 0,
        message:   `😢 아쉬워요! 정답은 ${answer}이었어요.`,
        onRetry:   buildGuess,
      });
    } else {
      hint.textContent =
        val < answer
          ? `📈 더 큰 숫자예요! (남은 기회: ${left}번)`
          : `📉 더 작은 숫자예요! (남은 기회: ${left}번)`;
      input.value = "";
      input.focus();
    }
  }

  submitBtn.onclick = doGuess;
  input.addEventListener("keydown", (e) => {
    if (e.key === "Enter") doGuess();
  });

  wrap.append(title, desc, input, hint, submitBtn);
  area.appendChild(wrap);
}

// ════════════════════════════════════════
//  ✂️ 가위바위보
// ════════════════════════════════════════

function buildRPS() {
  const area = PLAY_AREA();
  const wrap = document.createElement("div");
  wrap.className = "mg-game-wrap";

  const CHOICES = ["✊", "✌️", "🖐️"];
  const NAMES   = { "✊": "바위", "✌️": "가위", "🖐️": "보" };

  // 승패 규칙
  function judge(me, cpu) {
    if (me === cpu) return "draw";
    if (
      (me === "✊" && cpu === "✌️") ||
      (me === "✌️" && cpu === "🖐️") ||
      (me === "🖐️" && cpu === "✊")
    ) return "win";
    return "lose";
  }

  const title = document.createElement("div");
  title.className   = "mg-game-title";
  title.textContent = "✂️ 가위바위보";

  const desc = document.createElement("div");
  desc.className   = "mg-game-desc";
  desc.textContent = "3판 2선승제! 이기면 +20C!";

  // 스코어
  let myScore  = 0;
  let cpuScore = 0;
  let round    = 1;

  const scoreEl = document.createElement("div");
  scoreEl.className = "mg-hint";
  scoreEl.textContent = `나 0 : 0 뚜스터  (라운드 ${round}/3)`;

  const resultEl = document.createElement("div");
  resultEl.className = "mg-hint";
  resultEl.style.minHeight = "28px";

  const rpsbtns = document.createElement("div");
  rpsbtns.className = "rps-btns";

  CHOICES.forEach((ch) => {
    const btn = document.createElement("button");
    btn.className   = "rps-btn";
    btn.textContent = ch;
    btn.title       = NAMES[ch];

    btn.onclick = () => {
      const cpu = CHOICES[randInt(0, 2)];
      const res = judge(ch, cpu);

      if (res === "win")       { myScore++;  resultEl.textContent = `${ch} vs ${cpu} → ✅ 이겼어요!`; }
      else if (res === "lose") { cpuScore++; resultEl.textContent = `${ch} vs ${cpu} → ❌ 졌어요...`; }
      else                     {             resultEl.textContent = `${ch} vs ${cpu} → 🤝 비겼어요!`; }

      round++;
      scoreEl.textContent =
        `나 ${myScore} : ${cpuScore} 뚜스터  (라운드 ${round > 3 ? 3 : round}/3)`;

      // 2선승 또는 3판 소진
      const ended = myScore >= 2 || cpuScore >= 2 || round > 3;
      if (ended) {
        rpsbtns.querySelectorAll("button").forEach(b => b.disabled = true);

        const win = myScore > cpuScore;
        const draw = myScore === cpuScore;
        setTimeout(() => {
          buildResult(wrap, {
            win:       win && !draw,
            cashEarned: 20,
            message:
              draw ? `🤝 비겼어요! (${myScore}:${cpuScore})`
            : win  ? `🎉 이겼어요! (+20C)  (${myScore}:${cpuScore})`
            :        `😢 졌어요...  (${myScore}:${cpuScore})`,
            onRetry: buildRPS,
          });
        }, 600);
      }
    };

    rpsbtns.appendChild(btn);
  });

  wrap.append(title, desc, scoreEl, rpsbtns, resultEl);
  area.appendChild(wrap);
}

// ════════════════════════════════════════
//  🎰 슬롯머신
// ════════════════════════════════════════

function buildSlot() {
  const area = PLAY_AREA();
  const wrap = document.createElement("div");
  wrap.className = "mg-game-wrap";

  const SYMBOLS = ["🍒", "🍋", "⭐", "🎯", "💎", "🐹"];
  const COST    = 5;

  const title = document.createElement("div");
  title.className   = "mg-game-title";
  title.textContent = "🎰 슬롯머신";

  const desc = document.createElement("div");
  desc.className   = "mg-game-desc";
  desc.textContent = `1회 배팅: ${COST}C\n🎯🎯🎯 = +30C  💎💎💎 = +50C\n같은 3개 = +20C  2개 일치 = +8C`;

  // 릴 3개
  const display = document.createElement("div");
  display.className = "slot-display";

  const reels = [0, 1, 2].map(() => {
    const el = document.createElement("div");
    el.className   = "slot-reel";
    el.textContent = "❓";
    display.appendChild(el);
    return el;
  });

  const hint = document.createElement("div");
  hint.className = "mg-hint";
  hint.textContent = `보유 캐시: ${hamster.cash}C`;

  const spinBtn = document.createElement("button");
  spinBtn.className   = "mg-btn";
  spinBtn.textContent = `🎰 돌리기 (-${COST}C)`;

  spinBtn.onclick = () => {
    if (hamster.cash < COST) {
      hint.textContent = "💰 캐시가 부족해요!";
      return;
    }

    spendCash(COST);
    spinBtn.disabled = true;
    hint.textContent = "두근두근...";

    // 스핀 애니메이션
    reels.forEach(r => r.classList.add("spinning"));

    const results = reels.map(() => SYMBOLS[randInt(0, SYMBOLS.length - 1)]);

    // 순차적으로 멈춤
    reels.forEach((reel, i) => {
      setTimeout(() => {
        reel.classList.remove("spinning");
        reel.textContent = results[i];
        if (i === 2) {
          // 결과 판정
          const [a, b, c] = results;
          let earned = 0;

          if (a === b && b === c) {
            earned = a === "💎" ? 50 : a === "🎯" ? 30 : 20;
          } else if (a === b || b === c || a === c) {
            earned = 8;
          }

          if (earned > 0) {
            addCash(earned);
            hint.textContent = `🎉 +${earned}C 획득!  보유: ${hamster.cash}C`;
            recordGameWin();
          } else {
            hint.textContent = `😢 꽝!  보유: ${hamster.cash}C`;
          }

          spinBtn.disabled = false;
          checkAchievements();
        }
      }, (i + 1) * 600);
    });
  };

  wrap.append(title, desc, display, hint, spinBtn);

  const backBtn = document.createElement("button");
  backBtn.className   = "mg-btn";
  backBtn.style.background = "linear-gradient(135deg, #444, #666)";
  backBtn.textContent = "← 목록으로";
  backBtn.onclick     = backToSelect;

  wrap.appendChild(backBtn);
  area.appendChild(wrap);
}

// ════════════════════════════════════════
//  🧠 기억력 게임
// ════════════════════════════════════════

function buildMemory() {
  const area = PLAY_AREA();
  const wrap = document.createElement("div");
  wrap.className = "mg-game-wrap";

  const EMOJIS  = ["🐹","🌸","⭐","🍎","🎀","🌈","🦊","🍦"];
  const PAIRS   = [...EMOJIS, ...EMOJIS];
  const REWARD  = 40;

  // 셔플
  for (let i = PAIRS.length - 1; i > 0; i--) {
    const j = randInt(0, i);
    [PAIRS[i], PAIRS[j]] = [PAIRS[j], PAIRS[i]];
  }

  const title = document.createElement("div");
  title.className   = "mg-game-title";
  title.textContent = "🧠 기억력 게임";

  const desc = document.createElement("div");
  desc.className   = "mg-game-desc";
  desc.textContent = `같은 카드 쌍을 모두 찾아요!\n성공하면 +${REWARD}C!`;

  // 이동 횟수
  let moves   = 0;
  let matched = 0;
  const moveEl = document.createElement("div");
  moveEl.className   = "mg-hint";
  moveEl.textContent = "이동: 0번";

  const grid = document.createElement("div");
  grid.className = "memory-grid";

  let first   = null;
  let second  = null;
  let locked  = false;

  // 카드 미리보기 (1.5초 후 뒤집기)
  const cards = PAIRS.map((emoji, idx) => {
    const card = document.createElement("div");
    card.className        = "mem-card flipped";
    card.textContent      = emoji;
    card.dataset.emoji    = emoji;
    card.dataset.idx      = idx;

    grid.appendChild(card);
    return card;
  });

  // 1.5초 뒤 전부 뒤집기
  setTimeout(() => {
    cards.forEach(c => {
      c.classList.remove("flipped");
      c.textContent = "❓";
    });

    // 클릭 이벤트 활성화
    cards.forEach(card => {
      card.onclick = () => {
        if (locked) return;
        if (card.classList.contains("matched")) return;
        if (card.classList.contains("flipped")) return;

        card.classList.add("flipped");
        card.textContent = card.dataset.emoji;

        if (!first) {
          first = card;
        } else {
          second = card;
          locked = true;
          moves++;
          moveEl.textContent = `이동: ${moves}번`;

          if (first.dataset.emoji === second.dataset.emoji) {
            first.classList.add("matched");
            second.classList.add("matched");
            matched += 2;
            first  = null;
            second = null;
            locked = false;

            if (matched === PAIRS.length) {
              // 클리어!
              setTimeout(() => {
                buildResult(wrap, {
                  win:        true,
                  cashEarned: REWARD,
                  message:    `🎉 성공! ${moves}번 만에 다 찾았어요! (+${REWARD}C)`,
                  onRetry:    buildMemory,
                });
              }, 500);
            }
          } else {
            setTimeout(() => {
              first.classList.remove("flipped");
              first.textContent  = "❓";
              second.classList.remove("flipped");
              second.textContent = "❓";
              first  = null;
              second = null;
              locked = false;
            }, 900);
          }
        }
      };
    });
  }, 1500);

  wrap.append(title, desc, moveEl, grid);
  area.appendChild(wrap);
}
