// ════════════════════════════════════════
//  🎮 미니게임
// ════════════════════════════════════════

const MG_CASH = { guess: 15, rps: 12, memory: 20 };

function selectGame(type) {
  document.getElementById("mg-select").classList.add("hidden");
  const play = document.getElementById("mg-play");
  play.classList.remove("hidden");
  play.innerHTML = "";

  if (type === "guess")  buildGuess(play);
  if (type === "rps")    buildRPS(play);
  if (type === "memory") buildMemory(play);
}

// ── 공통 헬퍼
function buildHeader(area, title, desc) {
  const h = document.createElement("div");
  h.className = "mg-header";
  h.innerHTML = `<h3>${title}</h3><p class="mg-desc">${desc}</p>`;
  area.appendChild(h);
}

function buildResult(area, { win, cashEarned, message, onRetry }) {
  area.innerHTML = "";
  const box = document.createElement("div");
  box.className = "mg-result";

  const cashColor = win ? "#2E7D32" : "#C62828";
  const cashText  = win ? `+${cashEarned}C 획득!` : "다음엔 꼭 이겨요!";

  if (win) {
    addCash(cashEarned);
    hamster.happiness = clamp(hamster.happiness + randInt(5, 12));
    recordGameWin();
    saveGame();
  }

  box.innerHTML = `
    <div class="mg-result-emoji">${win ? "🎉" : "😢"}</div>
    <div class="mg-result-msg">${message}</div>
    <div class="mg-result-cash" style="color:${cashColor}">${cashText}</div>
  `;

  const retryBtn = document.createElement("button");
  retryBtn.className   = "mg-btn";
  retryBtn.textContent = "🔄 다시 하기";
  retryBtn.onclick     = onRetry;

  const backBtn = document.createElement("button");
  backBtn.className   = "mg-btn secondary";
  backBtn.textContent = "← 게임 목록";
  backBtn.onclick     = () => {
    area.classList.add("hidden");
    area.innerHTML = "";
    document.getElementById("mg-select").classList.remove("hidden");
  };

  box.append(retryBtn, backBtn);
  area.appendChild(box);
}

// ════════════════════════════════════════
//  🔢 숫자 맞히기
// ════════════════════════════════════════

function buildGuess(area) {
  area.innerHTML = "";
  const answer = randInt(1, 10);
  let   tries  = 3;

  buildHeader(area, "🔢 숫자 맞히기", `1~10 숫자를 맞혀요! (${tries}번 도전 가능)`);

  const triesEl = document.createElement("p");
  triesEl.className   = "mg-tries";
  triesEl.textContent = `남은 기회: ${tries}번`;

  const hintEl = document.createElement("p");
  hintEl.className = "mg-hint";

  const btnGrid = document.createElement("div");
  btnGrid.className = "mg-number-grid";

  for (let i = 1; i <= 10; i++) {
    const btn = document.createElement("button");
    btn.className   = "mg-number-btn";
    btn.textContent = i;
    btn.onclick = () => {
      btn.disabled = true;
      tries--;
      if (i === answer) {
        buildResult(area, { win:true, cashEarned:MG_CASH.guess, message:`정답! ${answer}이(가) 맞아요! 🎯`, onRetry:()=>buildGuess(area) });
        return;
      }
      hintEl.textContent  = i < answer ? "📈 더 크게!" : "📉 더 작게!";
      triesEl.textContent = `남은 기회: ${tries}번`;
      btn.classList.add("wrong");
      if (tries === 0) {
        buildResult(area, { win:false, cashEarned:0, message:`아쉬워요! 정답은 ${answer}이었어요.`, onRetry:()=>buildGuess(area) });
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
  buildHeader(area, "✂️ 가위바위보", "뚜스터와 대결!");

  const choices = [
    { key:"가위", icon:"✂️" },
    { key:"바위", icon:"🪨" },
    { key:"보",   icon:"📄" },
  ];

  function makeRPSButtons(container, onPick) {
    const row = document.createElement("div");
    row.className = "mg-rps-row";
    choices.forEach(({ key, icon }) => {
      const btn = document.createElement("button");
      btn.className = "mg-rps-btn";
      btn.innerHTML = `<span>${icon}</span><br />${key}`;
      btn.onclick   = () => onPick(key);
      row.appendChild(btn);
    });
    container.appendChild(row);
  }

  function fight(myKey, callback) {
    const hc     = choices[randInt(0, 2)];
    const result = getRPSResult(myKey, hc.key);
    callback(hc, result);
  }

  makeRPSButtons(area, (myKey) => {
    fight(myKey, (hc, result) => {
      if (result === "draw") {
        area.innerHTML = "";
        buildHeader(area, "✂️ 비겼어요!", "다시 선택하세요!");
        const hint = document.createElement("p");
        hint.className   = "mg-hint";
        hint.textContent = `뚜스터: ${hc.icon} ${hc.key}`;
        area.appendChild(hint);
        makeRPSButtons(area, (k2) => {
          fight(k2, (hc2, r2) => {
            buildResult(area, {
              win:        r2 === "win",
              cashEarned: MG_CASH.rps,
              message:    `뚜스터는 ${hc2.icon} ${hc2.key}! ${r2 === "win" ? "이겼어요! 🎉" : r2 === "lose" ? "졌어요... 😢" : "또 비겼어요!"}`,
              onRetry:    () => buildRPS(area),
            });
          });
        });
        return;
      }
      buildResult(area, {
        win:        result === "win",
        cashEarned: MG_CASH.rps,
        message:    `뚜스터는 ${hc.icon} ${hc.key}! ${result === "win" ? "이겼어요! 🎉" : "졌어요... 😢"}`,
        onRetry:    () => buildRPS(area),
      });
    });
  });
}

function getRPSResult(mine, theirs) {
  if (mine === theirs) return "draw";
  if ((mine==="가위"&&theirs==="보")||(mine==="바위"&&theirs==="가위")||(mine==="보"&&theirs==="바위")) return "win";
  return "lose";
}

// ════════════════════════════════════════
//  🧠 기억력 게임
// ════════════════════════════════════════

function buildMemory(area) {
  area.innerHTML = "";
  buildHeader(area, "🧠 기억력 게임", "순서대로 깜빡이는 버튼을 기억하세요!");

  const EMOJIS   = ["🐹","🥕","🛁","💊","⭐"];
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
    b.onclick = () => {
      if (!canClick) return;
      b.classList.add("active");
      setTimeout(() => b.classList.remove("active"), 250);
      userSeq.push(idx);
      const pos = userSeq.length - 1;
      if (userSeq[pos] !== sequence[pos]) {
        canClick = false;
        buildResult(area, { win:false, cashEarned:0, message:`레벨 ${level}에서 실패! 순서가 틀렸어요.`, onRetry:()=>buildMemory(area) });
        return;
      }
      if (userSeq.length === sequence.length) {
        canClick = false;
        if (level >= 5) {
          buildResult(area, { win:true, cashEarned:MG_CASH.memory, message:"5레벨 클리어! 기억력 천재! 🧠", onRetry:()=>buildMemory(area) });
          return;
        }
        level++;
        levelEl.textContent  = `레벨 ${level}`;
        statusEl.textContent = "잘했어요! 다음 레벨...";
        userSeq = [];
        setTimeout(playSequence, 1000);
      }
    };
    grid.appendChild(b);
    return b;
  });

  area.append(levelEl, statusEl, grid);

  function flashBtn(idx, cb) {
    btns[idx].classList.add("active");
    setTimeout(() => { btns[idx].classList.remove("active"); setTimeout(cb, 300); }, 600);
  }

  function playSequence() {
    sequence.push(randInt(0, 4));
    canClick = false;
    statusEl.textContent = "잘 보세요...";
    let i = 0;
    function next() {
      if (i >= sequence.length) { canClick = true; statusEl.textContent = "이제 눌러보세요!"; return; }
      flashBtn(sequence[i++], next);
    }
    setTimeout(next, 500);
  }

  playSequence();
}
