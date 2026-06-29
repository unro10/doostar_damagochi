// ════════════════════════════════════════
//  🎮 뚜스터 미니게임 모음
//  수록 게임: 가위바위보 / 숫자 맞히기
// ════════════════════════════════════════

// ── 게임 시작 분기
function startGame(type) {
  document.getElementById("mg-select").classList.add("hidden");
  document.getElementById("mg-play").classList.remove("hidden");

  const area = document.getElementById("mg-game-area");
  area.innerHTML = "";

  switch (type) {
    case "rps":    startRPS(area);    break;
    case "number": startNumber(area); break;
  }
}

// ── 선택 화면으로 돌아가기
function backToSelect() {
  document.getElementById("mg-select").classList.remove("hidden");
  document.getElementById("mg-play").classList.add("hidden");
}

// ════════════════════════════════════════
//  공통 UI 빌더
// ════════════════════════════════════════

function buildStory(text) {
  const div = document.createElement("div");
  div.className   = "mg-story";
  div.textContent = text;
  return div;
}

function buildResult(area, { win, cashEarned, message, onRetry }) {
  area.innerHTML = "";

  const div = document.createElement("div");
  div.className = `mg-result${win ? "" : " fail"}`;

  const title = document.createElement("h3");
  title.textContent = win
    ? `🎉 성공! +${cashEarned}C 획득!`
    : "😢 아쉬워요...";

  const msg = document.createElement("p");
  msg.textContent = message;

  const retryBtn = document.createElement("button");
  retryBtn.className   = "mg-result-btn";
  retryBtn.textContent = "🔄 다시 하기";
  retryBtn.onclick     = onRetry;

  const exitBtn = document.createElement("button");
  exitBtn.className   = "mg-result-btn secondary";
  exitBtn.textContent = "📋 게임 목록";
  exitBtn.onclick     = backToSelect;

  div.append(title, msg, retryBtn, exitBtn);
  area.appendChild(div);

  if (win) {
    addCash(cashEarned);
    hamster.happiness = clamp(hamster.happiness + randInt(5, 12));
    saveGame();
  }
}

// ════════════════════════════════════════
//  ✊ 가위바위보  (보상: 8C)
// ════════════════════════════════════════

const RPS_ITEMS = ["✊", "✌️", "🖐️"];
const RPS_NAMES = ["주먹", "가위", "보"];
// RPS_WIN[idx] = 내 idx가 이기는 상대 idx
// 주먹(0)은 가위(1)를 이김
// 가위(1)는 보(2)를 이김
// 보(2)는 주먹(0)을 이김
const RPS_WIN = [1, 2, 0];

function startRPS(area) {
  let myScore  = 0;
  let tuScore  = 0;
  let round    = 0;
  const ROUNDS = 3;

  function render() {
    area.innerHTML = "";

    const story = buildStory(
      `✊ 가위바위보! (${round}/${ROUNDS}판)\n` +
      `나: ${myScore}승  vs  뚜스터: ${tuScore}승\n\n` +
      `무엇을 낼까요?`
    );
    area.appendChild(story);

    const btnRow = document.createElement("div");
    btnRow.className = "rps-btn-row";

    RPS_ITEMS.forEach((emoji, idx) => {
      const btn = document.createElement("button");
      btn.className   = "rps-btn";
      btn.textContent = emoji;
      btn.title       = RPS_NAMES[idx];
      btn.onclick     = () => playRound(idx);
      btnRow.appendChild(btn);
    });

    area.appendChild(btnRow);

    const hint = document.createElement("p");
    hint.style.cssText = "text-align:center; margin-top:14px; font-size:0.82rem; color:#888;";
    hint.textContent   = "✊ 주먹   ✌️ 가위   🖐️ 보";
    area.appendChild(hint);
  }

  function playRound(myIdx) {
    const tuIdx = Math.floor(Math.random() * 3);
    round++;

    let resultText;
    if (myIdx === tuIdx) {
      resultText = "비겼어요! 🤝";
    } else if (RPS_WIN[myIdx] === tuIdx) {
      myScore++;
      resultText = `이겼어요! ${RPS_ITEMS[myIdx]} > ${RPS_ITEMS[tuIdx]} 🎉`;
    } else {
      tuScore++;
      resultText = `졌어요... ${RPS_ITEMS[tuIdx]} > ${RPS_ITEMS[myIdx]} 😢`;
    }

    area.innerHTML = "";

    const msg = buildStory(
      `✊ ${round}판 결과\n` +
      `나: ${RPS_ITEMS[myIdx]} (${RPS_NAMES[myIdx]})\n` +
      `뚜스터: ${RPS_ITEMS[tuIdx]} (${RPS_NAMES[tuIdx]})\n\n` +
      `${resultText}\n\n` +
      `현재 스코어 → 나: ${myScore}  뚜스터: ${tuScore}`
    );
    area.appendChild(msg);

    if (round >= ROUNDS) {
      setTimeout(() => {
        const win  = myScore >= tuScore; // 무승부도 캐시 지급
        const draw = myScore === tuScore;
        buildResult(area, {
          win,
          cashEarned: 8,
          message: win && !draw
            ? `${myScore}:${tuScore} 으로 승리! 🎉`
            : draw
            ? `${myScore}:${tuScore} 무승부! 그래도 캐시 드려요~ 🤝`
            : `${tuScore}:${myScore} 으로 뚜스터가 이겼어요 😢`,
          onRetry: () => startRPS(area),
        });
      }, 1200);
    } else {
      const nextBtn = document.createElement("button");
      nextBtn.className   = "mg-result-btn";
      nextBtn.textContent = "▶ 다음 라운드";
      nextBtn.style.marginTop = "14px";
      nextBtn.onclick     = render;
      area.appendChild(nextBtn);
    }
  }

  render();
}

// ════════════════════════════════════════
//  🔢 숫자 맞히기  (보상: 20C)
// ════════════════════════════════════════

function startNumber(area) {
  const MAX       = 50;
  const answer    = Math.floor(Math.random() * MAX) + 1;
  let   tries     = 0;
  const MAX_TRIES = 7;

  function render(hint) {
    area.innerHTML = "";

    const story = buildStory(
      `🔢 숫자 맞히기!\n` +
      `1 ~ ${MAX} 사이의 숫자를 맞혀보세요.\n` +
      `기회: ${MAX_TRIES - tries}번 남음`
    );
    area.appendChild(story);

    if (hint) {
      const hintEl = document.createElement("div");
      hintEl.className   = `number-hint ${hint.cls}`;
      hintEl.textContent = hint.text;
      area.appendChild(hintEl);
    }

    const row = document.createElement("div");
    row.className = "mg-input-row";

    const input = document.createElement("input");
    input.className   = "mg-input";
    input.type        = "number";
    input.min         = "1";
    input.max         = String(MAX);
    input.placeholder = `1 ~ ${MAX}`;

    const submitBtn = document.createElement("button");
    submitBtn.className   = "mg-submit-btn";
    submitBtn.textContent = "확인";

    row.append(input, submitBtn);
    area.appendChild(row);

    function tryGuess() {
      const val = parseInt(input.value, 10);
      if (isNaN(val) || val < 1 || val > MAX) {
        input.value = "";
        return;
      }

      tries++;

      if (val === answer) {
        buildResult(area, {
          win: true,
          cashEarned: 20,
          message: `정답! ${answer}! ${tries}번 만에 맞혔어요! 🎉`,
          onRetry: () => startNumber(area),
        });
      } else if (tries >= MAX_TRIES) {
        buildResult(area, {
          win: false,
          cashEarned: 0,
          message: `기회를 모두 썼어요... 정답은 ${answer} 이었어요 😢`,
          onRetry: () => startNumber(area),
        });
      } else {
        render(
          val > answer
            ? { cls: "high", text: `📉 ${val} → 더 낮은 숫자예요!` }
            : { cls: "low",  text: `📈 ${val} → 더 높은 숫자예요!` }
        );
      }
    }

    submitBtn.onclick = tryGuess;
    input.addEventListener("keydown", e => {
      if (e.key === "Enter") tryGuess();
    });

    setTimeout(() => input.focus(), 100);
  }

  render(null);
}
