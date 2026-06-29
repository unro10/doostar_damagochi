// ════════════════════════════════════════
//  🎮 뚜스터 미니게임 모음
// ════════════════════════════════════════

// ── 게임 시작 분기
function startGame(type) {
  document.getElementById("mg-select").classList.add("hidden");
  document.getElementById("mg-play").classList.remove("hidden");

  const area = document.getElementById("mg-game-area");
  area.innerHTML = "";

  switch (type) {
    case "quiz":   startQuiz(area);   break;
    case "word":   startWord(area);   break;
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

function buildChoices(choices) {
  const div = document.createElement("div");
  div.className = "mg-choices";
  choices.forEach(({ label, onClick }) => {
    const btn = document.createElement("button");
    btn.className   = "mg-choice-btn";
    btn.textContent = label;
    btn.onclick     = onClick;
    div.appendChild(btn);
  });
  return div;
}

function buildResult(area, { win, cashEarned, message, onRetry, onExit }) {
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
  exitBtn.onclick     = onExit ?? backToSelect;

  div.append(title, msg, retryBtn, exitBtn);
  area.appendChild(div);

  if (win) {
    addCash(cashEarned);

    // 행복도 소폭 증가
    hamster.happiness = clamp(hamster.happiness + randInt(5,12));
    saveGame();
  }
}

// ════════════════════════════════════════
//  🧠 퀴즈 게임  (보상: 15C)
// ════════════════════════════════════════

const QUIZ_BANK = [
  {
    q: "햄스터가 가장 좋아하는 먹이는?",
    choices: ["🥕 당근", "🧄 마늘", "🍋 레몬", "☕ 커피"],
    answer: 0,
  },
  {
    q: "햄스터의 평균 수명은?",
    choices: ["1~2년", "3~4년", "10년", "20년"],
    answer: 0,
  },
  {
    q: "햄스터의 볼 주머니는 어디에 있나요?",
    choices: ["배", "꼬리", "뺨", "귀"],
    answer: 2,
  },
  {
    q: "햄스터가 하루에 달리는 거리는?",
    choices: ["1km", "5~10km", "50km", "100km"],
    answer: 1,
  },
  {
    q: "햄스터의 이빨은 평생 계속 자라나요?",
    choices: ["예", "아니오"],
    answer: 0,
  },
  {
    q: "햄스터는 어느 동물 목(目)에 속하나요?",
    choices: ["육식목", "설치목", "영장목", "유제목"],
    answer: 1,
  },
  {
    q: "다음 중 햄스터에게 위험한 음식은?",
    choices: ["🌽 옥수수", "🧅 양파", "🫐 블루베리", "🥦 브로콜리"],
    answer: 1,
  },
  {
    q: "뚜스터의 이름에서 '뚜'는 어떤 의미?",
    choices: ["두 번째", "뚜별(특별)하다", "두더지", "뚝딱"],
    answer: 1,
  },
  {
    q: "햄스터는 야행성인가요?",
    choices: ["예, 밤에 활동해요", "아니오, 낮에 활동해요"],
    answer: 0,
  },
  {
    q: "햄스터 케이지 청소는 얼마나 자주 해야 하나요?",
    choices: ["매일", "1~2주에 한 번", "한 달에 한 번", "1년에 한 번"],
    answer: 1,
  },
];

function startQuiz(area) {
  // 문제 랜덤 선택
  const q = QUIZ_BANK[Math.floor(Math.random() * QUIZ_BANK.length)];
  let answered = false;

  area.innerHTML = "";

  const story = buildStory(`🧠 퀴즈 타임!\n\n${q.q}`);
  area.appendChild(story);

  const choices = buildChoices(
    q.choices.map((label, idx) => ({
      label: `${["①","②","③","④"][idx]} ${label}`,
      onClick() {
        if (answered) return;
        answered = true;
        const win = idx === q.answer;
        buildResult(area, {
          win,
          cashEarned: 15,
          message: win
            ? `정답! "${q.choices[q.answer]}" 이(가) 맞아요! 🎉`
            : `틀렸어요... 정답은 "${q.choices[q.answer]}" 이에요 😢`,
          onRetry: () => startQuiz(area),
        });
      },
    }))
  );
  area.appendChild(choices);
}

// ════════════════════════════════════════
//  📝 끝말잇기  (보상: 10C)
// ════════════════════════════════════════

const WORD_DICT = [
  "사과","과일","일기","기차","차도","도로","로봇","봇물","물고기","기린",
  "린스","스타","타자","자동차","차량","량반","반지","지도","도서","서랍",
  "랍스터","터널","널빤지","지붕","붕어","어머니","니트","트럭","럭비","비행기",
  "기둥","둥지","지팡이","이불","불꽃","꽃잎","잎사귀","귀신","신발","발가락",
  "락","악기","기와","와인","인형","형사","사탕","탕수육","육개장","장미",
  "미소","소금","금반지","지갑","갑옷","옷장","장난감","감자","자전거","거울",
  "울음","음악","악어","어린이","이슬","슬기","기억","억울","울타리","리본",
];

function getWordStartChar(word) {
  return word[word.length - 1];
}

function findNextWord(lastChar, used) {
  const candidates = WORD_DICT.filter(
    w => w[0] === lastChar && !used.has(w)
  );
  return candidates.length > 0
    ? candidates[Math.floor(Math.random() * candidates.length)]
    : null;
}

function startWord(area) {
  area.innerHTML = "";

  const used  = new Set();
  const chain = [];
  let roundCount = 0;
  const TARGET   = 5; // 5번 이어야 성공

  // 시작 단어 선택
  const firstWord = WORD_DICT[Math.floor(Math.random() * WORD_DICT.length)];
  used.add(firstWord);
  chain.push(`🐹 뚜스터: "${firstWord}"`);

  function render(lastWord) {
    area.innerHTML = "";

    // 현재 체인 표시
    const story = buildStory(
      `📝 끝말잇기!\n"${lastWord}"로 끝나는 단어를 입력하세요.\n\n` +
      `진행 (${roundCount}/${TARGET})\n\n` +
      chain.slice(-4).join("\n")
    );
    area.appendChild(story);

    // 입력창
    const row = document.createElement("div");
    row.className = "mg-input-row";

    const input = document.createElement("input");
    input.className   = "mg-input";
    input.placeholder = `"${getWordStartChar(lastWord)}"(으)로 시작하는 단어`;
    input.type        = "text";
    input.maxLength   = 10;
    input.autofocus   = true;

    const submitBtn = document.createElement("button");
    submitBtn.className   = "mg-submit-btn";
    submitBtn.textContent = "입력";

    row.append(input, submitBtn);
    area.appendChild(row);

    const msgEl = document.createElement("p");
    msgEl.style.cssText = "margin-top:8px; font-size:0.88rem; color:#c00; text-align:center;";
    area.appendChild(msgEl);

    function trySubmit() {
      const val = input.value.trim();
      if (!val) return;

      const startChar = getWordStartChar(lastWord);

      // 첫 글자 체크
      if (val[0] !== startChar) {
        msgEl.textContent = `⚠️ "${startChar}"(으)로 시작해야 해요!`;
        input.value = "";
        return;
      }

      // 사전에 있는지 체크
      if (!WORD_DICT.includes(val)) {
        msgEl.textContent = "⚠️ 사전에 없는 단어예요! 다시 입력하세요.";
        input.value = "";
        return;
      }

      // 이미 사용한 단어
      if (used.has(val)) {
        msgEl.textContent = "⚠️ 이미 사용한 단어예요!";
        input.value = "";
        return;
      }

      // 정상 입력
      used.add(val);
      chain.push(`😊 나: "${val}"`);
      roundCount++;

      // 성공 조건
      if (roundCount >= TARGET) {
        buildResult(area, {
          win: true,
          cashEarned: 10,
          message: `${TARGET}번 끝말잇기 성공! 대단해요! 🎉`,
          onRetry: () => startWord(area),
        });
        return;
      }

      // 뚜스터 응수
      const next = findNextWord(getWordStartChar(val), used);
      if (!next) {
        // 뚜스터가 막힘 → 플레이어 승리!
        chain.push("🐹 뚜스터: 항복! 모르겠어요~ 🏳️");
        buildResult(area, {
          win: true,
          cashEarned: 10,
          message: "뚜스터가 이을 단어를 찾지 못했어요! 🎉",
          onRetry: () => startWord(area),
        });
        return;
      }

      used.add(next);
      chain.push(`🐹 뚜스터: "${next}"`);

      render(next);
    }

    submitBtn.onclick = trySubmit;
    input.addEventListener("keydown", e => {
      if (e.key === "Enter") trySubmit();
    });

    // 포커스
    setTimeout(() => input.focus(), 100);
  }

  render(firstWord);
}

// ════════════════════════════════════════
//  ✊ 가위바위보  (보상: 8C)
// ════════════════════════════════════════

const RPS_ITEMS = ["✊","✌️","🖐️"];
const RPS_NAMES = ["주먹","가위","보"];
const RPS_WIN   = [2, 0, 1]; // [0]=주먹이 이기는 것=보(2), 등등

function startRPS(area) {
  area.innerHTML = "";

  let myScore   = 0;
  let tuScore   = 0;
  let round     = 0;
  const ROUNDS  = 3; // 3판

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
      // 내가 이김
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
      // 최종 결과
      setTimeout(() => {
        const win = myScore > tuScore;
        const draw = myScore === tuScore;
        buildResult(area, {
          win: win || draw,
          cashEarned: 8,
          message: win
            ? `${myScore}:${tuScore}으로 승리! 🎉`
            : draw
            ? `${myScore}:${tuScore} 무승부! 그래도 캐시 드려요~ 🤝`
            : `${tuScore}:${myScore}으로 뚜스터가 이겼어요 😢`,
          onRetry: () => startRPS(area),
        });
      }, 1200);
    } else {
      // 다음 라운드
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
  const MAX     = 50;
  const answer  = Math.floor(Math.random() * MAX) + 1;
  let   tries   = 0;
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
