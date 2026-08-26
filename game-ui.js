// ============================================================
// RETO NARANJA — Capa de interfaz
// Conecta el estado de `Game` (game-logic.js) con el DOM.
// ============================================================

const UI = {
  selectedTokenByPlayer: {},
  playerCount: 4,
  challengeIntervalId: null,
  ratingIntervalId: null,

  // ---------------------------------------------------------
  // SETUP SCREEN
  // ---------------------------------------------------------
  initSetupScreen() {
    this.renderPlayerCountRow();
    this.renderPlayerSetupRows();
    document.getElementById("btnStartGame").addEventListener("click", () => this.handleStartGame());
  },

  renderPlayerCountRow() {
    const row = document.getElementById("playerCountRow");
    row.innerHTML = "";
    [2, 3, 4].forEach(n => {
      const btn = document.createElement("button");
      btn.className = "count-btn" + (n === this.playerCount ? " active" : "");
      btn.textContent = `${n} jugadores`;
      btn.addEventListener("click", () => {
        this.playerCount = n;
        this.renderPlayerCountRow();
        this.renderPlayerSetupRows();
      });
      row.appendChild(btn);
    });
  },

  renderPlayerSetupRows() {
    const container = document.getElementById("playerSetupRows");
    container.innerHTML = "";
    for (let i = 0; i < this.playerCount; i++) {
      if (this.selectedTokenByPlayer[i] === undefined) {
        this.selectedTokenByPlayer[i] = PLAYER_TOKENS[i % PLAYER_TOKENS.length].id;
      }
      const row = document.createElement("div");
      row.className = "player-row";

      const swatchWrap = document.createElement("div");
      swatchWrap.style.display = "flex";
      swatchWrap.style.gap = "4px";
      PLAYER_TOKENS.forEach(tok => {
        const sw = document.createElement("div");
        sw.className = "token-swatch" + (this.selectedTokenByPlayer[i] === tok.id ? " selected" : "");
        sw.style.background = tok.color;
        sw.title = tok.name;
        sw.addEventListener("click", () => {
          this.selectedTokenByPlayer[i] = tok.id;
          this.renderPlayerSetupRows();
        });
        swatchWrap.appendChild(sw);
      });

      const input = document.createElement("input");
      input.type = "text";
      input.maxLength = 18;
      input.placeholder = `Jugador ${i + 1}`;
      input.id = `playerNameInput_${i}`;
      input.value = this.playerNames?.[i] || "";

      row.appendChild(swatchWrap);
      row.appendChild(input);
      container.appendChild(row);
    }
  },

  handleStartGame() {
    const configs = [];
    for (let i = 0; i < this.playerCount; i++) {
      const input = document.getElementById(`playerNameInput_${i}`);
      const name = (input.value || "").trim() || `Jugador ${i + 1}`;
      const tokenId = this.selectedTokenByPlayer[i];
      const token = PLAYER_TOKENS.find(t => t.id === tokenId);
      configs.push({ name, tokenId, color: token.color });
    }
    Game.init(configs);
    this.showScreen("game");
    document.getElementById("timerDisplay").style.display = "block";
    this.renderBoard();
    this.renderPlayerList();
    this.renderPot();
    this.renderLog();
    Game.startTimer(
      (secs) => this.renderTimer(secs),
      () => this.forceEndGame()
    );
    this.startTurn();
  },

  // ---------------------------------------------------------
  // SCREEN SWITCHING
  // ---------------------------------------------------------
  showScreen(name) {
    document.querySelectorAll(".screen").forEach(s => s.classList.remove("active"));
    document.getElementById(`screen-${name}`).classList.add("active");
  },

  // ---------------------------------------------------------
  // BOARD RENDER — grid 9x9, esquinas en id 0/8/16/24
  // ---------------------------------------------------------
  boardGridPosition(id) {
    if (id <= 8) {
      return { col: 9 - id, row: 9 };
    } else if (id <= 16) {
      return { col: 1, row: 9 - (id - 8) };
    } else if (id <= 24) {
      return { col: 1 + (id - 16), row: 1 };
    } else {
      return { col: 9, row: 1 + (id - 24) };
    }
  },

  cellRowClass(id) {
    if (id === 0 || id === 8 || id === 16 || id === 24) return "corner";
    if (id < 8) return "row-bottom";
    if (id < 16) return "row-left";
    if (id < 24) return "row-top";
    return "row-right";
  },

  renderBoard() {
    const board = document.getElementById("board");
    board.innerHTML = "";

    const center = document.createElement("div");
    center.className = "board-center";
    center.innerHTML = `
      <div class="board-center-deco">${this.centerDecoSvg()}</div>
      <div class="board-center-logo">
        <span class="big">RETO<br>NARANJA</span>
        <span class="small">Economía creativa · edición tablero</span>
      </div>
    `;
    board.appendChild(center);

    BOARD.forEach(cell => {
      const { col, row } = this.boardGridPosition(cell.id);
      const el = document.createElement("div");
      el.className = `cell ${this.cellRowClass(cell.id)} type-${cell.type}`;
      el.style.gridColumn = col;
      el.style.gridRow = row;
      el.dataset.cellId = cell.id;
      el.setAttribute("role", "button");
      el.setAttribute("tabindex", "0");
      el.setAttribute("aria-label", this.cellAriaLabel(cell));

      el.innerHTML = this.cellInnerHtml(cell);
      el.addEventListener("click", () => this.showCellInfo(cell.id));
      el.addEventListener("keydown", (e) => {
        if (e.key === "Enter" || e.key === " ") { e.preventDefault(); this.showCellInfo(cell.id); }
      });
      board.appendChild(el);
    });

    this.refreshBoardDynamic();
  },

  cellAriaLabel(cell) {
    let label = cell.name;
    if (cell.type === "reto") label += `, sector ${SECTORS[cell.sector].name}`;
    if (cell.desc) label += `, ${cell.desc}`;
    return label;
  },

  cellTypeColor(cell) {
    if (cell.type === "reto") return SECTORS[cell.sector].color;
    const map = {
      start: "#E8622C",
      fondoComunitario: "#C9A227",
      bonus: "#E8622C",
      pausa: "var(--paper-dark)",
      retoRapido: "#4B5FA3",
      trivia: "#4B5FA3",
      grupal: "#B23A6B",
      evento: "#7A3B2E",
      impuesto: "var(--ink-soft)",
    };
    return map[cell.type] || "var(--paper-dark)";
  },

  cellInnerHtml(cell) {
    const isCorner = cell.type === "start" || cell.type === "fondoComunitario" || cell.type === "pausa" || cell.type === "bonus";
    let colorBar = "";
    if (!isCorner) {
      colorBar = `<div class="cell-color-bar" style="background:${this.cellTypeColor(cell)}"></div>`;
    }

    return `
      ${colorBar}
      <div class="cell-body">
        <div class="cell-icon">${cell.icon}</div>
        <div class="cell-name">${cell.name}</div>
      </div>
      <div class="token-stack" data-tokens-for="${cell.id}"></div>
    `;
  },

  centerDecoSvg() {
    return `<svg width="100%" height="100%" viewBox="0 0 400 400" preserveAspectRatio="xMidYMid slice">
      <line x1="0" y1="80" x2="400" y2="40" stroke="#7A3B2E" stroke-width="3" opacity="0.15"/>
      <line x1="0" y1="140" x2="400" y2="100" stroke="#7A3B2E" stroke-width="3" opacity="0.1"/>
      <circle cx="330" cy="300" r="60" stroke="#C9A227" stroke-width="3" fill="none" opacity="0.15"/>
      <circle cx="330" cy="300" r="40" stroke="#C9A227" stroke-width="3" fill="none" opacity="0.12"/>
      <rect x="30" y="250" width="70" height="70" stroke="#B23A6B" stroke-width="3" fill="none" opacity="0.15" transform="rotate(8 65 285)"/>
      <path d="M200 340 L215 370 L185 370 Z" fill="#4B5FA3" opacity="0.12"/>
    </svg>`;
  },

  refreshBoardDynamic() {
    BOARD.forEach(cell => {
      const tokStack = document.querySelector(`[data-tokens-for="${cell.id}"]`);
      if (tokStack) {
        tokStack.innerHTML = "";
        Game.players.forEach(p => {
          if (p.position === cell.id) {
            const dot = document.createElement("div");
            dot.className = "token-dot";
            dot.style.background = p.color;
            dot.title = p.name;
            tokStack.appendChild(dot);
          }
        });
      }
    });
  },

  // ---------------------------------------------------------
  // PLAYER LIST / TIMER / POT
  // ---------------------------------------------------------
  renderPlayerList() {
    const list = document.getElementById("playerList");
    list.innerHTML = "";
    Game.players.forEach(p => {
      const card = document.createElement("div");
      card.className = "player-card" + (p.id === Game.currentPlayerIndex ? " current" : "");
      card.innerHTML = `
        <div class="p-token" style="background:${p.color}"></div>
        <div class="p-info">
          <div class="p-name">${p.name}</div>
          <div class="p-cash">${p.points} pts</div>
        </div>
      `;
      list.appendChild(card);
    });
    document.getElementById("currentPlayerName").textContent = Game.currentPlayer().name;
    const badge = document.getElementById("turnBadge");
    badge.textContent = `Turno de ${Game.currentPlayer().name}`;
    badge.style.background = Game.currentPlayer().color;
  },

  renderTimer(secs) {
    const m = Math.floor(secs / 60).toString().padStart(2, "0");
    const s = (secs % 60).toString().padStart(2, "0");
    const el = document.getElementById("timerDisplay");
    if (el) {
      el.textContent = `${m}:${s}`;
      el.classList.toggle("timer-warning", secs <= 60 && secs > 0);
    }
  },

  renderPot() {
    const el = document.getElementById("potDisplay");
    if (el) el.textContent = `${Game.pot} pts`;
  },

  // ---------------------------------------------------------
  // LOG
  // ---------------------------------------------------------
  renderLog() {
    const box = document.getElementById("logBox");
    box.innerHTML = "";
    Game.log.slice().reverse().forEach(entry => {
      const line = document.createElement("div");
      line.className = "log-line";
      if (entry.playerName) {
        line.innerHTML = `<span class="log-p" style="color:${entry.playerColor}">${entry.playerName}:</span> ${entry.message}`;
      } else {
        line.textContent = entry.message;
      }
      box.appendChild(line);
    });
  },

  announce(msg) {
    document.getElementById("srAnnouncer").textContent = msg;
  },

  // ---------------------------------------------------------
  // TURN FLOW
  // ---------------------------------------------------------
  startTurn() {
    if (Game.gameOver) return;
    this.renderPlayerList();
    this.setDiceColor(Game.currentPlayer().color);
    this.renderDiceFaces(0, 0);
    this.renderPreRollActions();
  },

  setDiceColor(color) {
    document.getElementById("die1").style.background = color;
    document.getElementById("die2").style.background = color;
  },

  renderPreRollActions() {
    const row = document.getElementById("actionRow");
    row.innerHTML = "";
    const rollBtn = document.createElement("button");
    rollBtn.className = "btn btn-primary btn-block";
    rollBtn.textContent = "🎲 Lanzar dados";
    rollBtn.addEventListener("click", () => this.handleRoll());
    row.appendChild(rollBtn);
  },

  renderDiceFaces(d1, d2) {
    this.drawDie(document.getElementById("die1"), d1);
    this.drawDie(document.getElementById("die2"), d2);
  },

  drawDie(el, value) {
    el.innerHTML = "";
    const patterns = {
      0: [], 1: [4], 2: [0, 8], 3: [0, 4, 8],
      4: [0, 2, 6, 8], 5: [0, 2, 4, 6, 8], 6: [0, 2, 3, 5, 6, 8],
    };
    const onCells = new Set(patterns[value] || []);
    for (let i = 0; i < 9; i++) {
      const pip = document.createElement("div");
      pip.className = "pip" + (onCells.has(i) ? " on" : "");
      el.appendChild(pip);
    }
  },

  async handleRoll() {
    if (Game.gameOver) return;
    const player = Game.currentPlayer();
    const [d1, d2] = Game.rollDice();
    document.getElementById("actionRow").innerHTML = "";
    await this.animateDice(d1, d2);
    if (Game.gameOver) return;

    if (Game.isDoubles()) {
      Game.turnState.doublesCount += 1;
    }

    await this.resolveMovement(player, d1 + d2);
  },

  animateDice(d1, d2) {
    return new Promise(resolve => {
      const die1 = document.getElementById("die1");
      const die2 = document.getElementById("die2");
      die1.classList.add("rolling");
      die2.classList.add("rolling");
      let ticks = 0;
      const interval = setInterval(() => {
        this.renderDiceFaces(1 + Math.floor(Math.random() * 6), 1 + Math.floor(Math.random() * 6));
        ticks++;
        if (ticks > 6) {
          clearInterval(interval);
          this.renderDiceFaces(d1, d2);
          die1.classList.remove("rolling");
          die2.classList.remove("rolling");
          setTimeout(resolve, 150);
        }
      }, 60);
    });
  },

  sleep(ms) { return new Promise(r => setTimeout(r, ms)); },

  async resolveMovement(player, steps) {
    const oldPos = player.position;
    const targetPos = (oldPos + steps) % BOARD.length;
    const passesGo = (oldPos + steps) >= BOARD.length;

    let pos = oldPos;
    for (let i = 0; i < steps; i++) {
      if (Game.gameOver) return;
      pos = (pos + 1) % BOARD.length;
      player.position = pos;
      this.refreshBoardDynamic();
      await this.sleep(90);
    }
    if (Game.gameOver) return;

    if (passesGo) {
      Game.gainPoints(player, GO_BONUS_POINTS);
      Game.addLog(player, `Pasa por la Feria Creativa y gana ${GO_BONUS_POINTS} puntos.`);
      this.renderLog();
      this.renderPlayerList();
    }

    this.landOnCell(player, targetPos);
  },

  // ---------------------------------------------------------
  // LANDING LOGIC
  // ---------------------------------------------------------
  landOnCell(player, pos) {
    if (Game.gameOver) return;
    const cell = Game.cellAt(pos);
    this.refreshBoardDynamic();

    switch (cell.type) {
      case "start":
        Game.addLog(player, "Cae justo en la Feria Creativa.");
        this.renderLog();
        this.showEndTurnButton();
        break;

      case "pausa":
        Game.addLog(player, "Toma una Pausa Creativa. No pasa nada.");
        this.renderLog();
        this.showEndTurnButton();
        break;

      case "bonus":
        Game.gainPoints(player, BONUS_AMOUNT);
        Game.addLog(player, `Cae en Mercado Naranja y gana ${BONUS_AMOUNT} puntos.`);
        this.renderLog();
        this.renderPlayerList();
        this.showEndTurnButton();
        break;

      case "fondoComunitario": {
        const amount = Game.collectPot(player);
        Game.addLog(player, `Cae en el Fondo Comunitario y se lleva ${amount} puntos.`);
        this.renderLog();
        this.renderPlayerList();
        this.renderPot();
        this.showEndTurnButton();
        break;
      }

      case "impuesto": {
        const paid = Game.spendPoints(player, IMPUESTO_AMOUNT);
        Game.addToPot(paid);
        Game.addLog(player, `Paga ${paid} punto(s) de Impuesto Cultural al Fondo Comunitario.`);
        this.renderLog();
        this.renderPlayerList();
        this.renderPot();
        this.showEndTurnButton();
        break;
      }

      case "reto":
        this.showChallengeModal(player, {
          text: Game.draw(cell.sector, RETOS[cell.sector]),
          icon: SECTORS[cell.sector].icon,
          eyebrow: `Reto de ${SECTORS[cell.sector].name} · ${player.name}`,
          color: SECTORS[cell.sector].color,
        });
        break;

      case "retoRapido":
        this.showChallengeModal(player, {
          text: Game.draw("retoRapido", RETOS_RAPIDOS),
          icon: "⚡",
          eyebrow: `Reto Creativo Rápido · ${player.name}`,
          color: "#4B5FA3",
        });
        break;

      case "trivia":
        this.showTriviaModal(player, cell);
        break;

      case "grupal":
        this.showGrupalModal(player, cell);
        break;

      case "evento":
        this.showEventoModal(player, cell);
        break;
    }
  },

  // ---------------------------------------------------------
  // MODAL HELPERS
  // ---------------------------------------------------------
  showModal(html) {
    document.getElementById("modalContent").innerHTML = html;
    document.getElementById("modalBackdrop").classList.remove("hidden");
  },
  hideModal() {
    document.getElementById("modalBackdrop").classList.add("hidden");
  },

  clearChallengeTimer() {
    if (this.challengeIntervalId) {
      clearInterval(this.challengeIntervalId);
      this.challengeIntervalId = null;
    }
  },
  clearRatingTimer() {
    if (this.ratingIntervalId) {
      clearInterval(this.ratingIntervalId);
      this.ratingIntervalId = null;
    }
  },

  showCellInfo(cellId) {
    if (!document.getElementById("modalBackdrop").classList.contains("hidden")) return;
    const cell = Game.cellAt(cellId);
    let bodyHtml = "";
    const tag = cell.type === "reto"
      ? `<span class="sector-tag" style="background:${SECTORS[cell.sector].color}">${SECTORS[cell.sector].icon} ${SECTORS[cell.sector].name}</span>`
      : "";
    if (tag) bodyHtml += `<div>${tag}</div>`;
    if (cell.desc) bodyHtml += `<div class="modal-body">${cell.desc}</div>`;

    this.showModal(`
      <div class="modal-eyebrow" style="color:var(--ink-soft)">Información de casilla</div>
      <div class="modal-title">${cell.icon} ${cell.name}</div>
      ${bodyHtml}
      <div class="modal-actions">
        <button class="btn btn-block" id="btnCloseInfo">Cerrar</button>
      </div>
    `);
    document.getElementById("btnCloseInfo").addEventListener("click", () => this.hideModal());
  },

  // ---------------------------------------------------------
  // RETO DE TALENTO / RETO RÁPIDO — 40s para actuar, luego calificar
  // ---------------------------------------------------------
  showChallengeModal(player, { text, icon, eyebrow, color }) {
    let secondsLeft = CHALLENGE_TIME_SECONDS;
    this.showModal(`
      <div class="card-face" style="border-color:${color}">
        <div class="card-face-icon">${icon}</div>
        <div class="card-face-eyebrow" style="color:${color}">${eyebrow}</div>
        <div class="card-face-text">${text}</div>
        <div class="challenge-timer" id="challengeTimer">${secondsLeft}s</div>
      </div>
      <div class="modal-actions" style="margin-top:18px;">
        <button class="btn btn-primary btn-block" id="btnDoneReto">Ya lo hice → calificar</button>
      </div>
    `);

    this.clearChallengeTimer();
    const timerEl = document.getElementById("challengeTimer");
    this.challengeIntervalId = setInterval(() => {
      secondsLeft -= 1;
      if (secondsLeft <= 0) {
        secondsLeft = 0;
        timerEl.textContent = "¡Tiempo!";
        timerEl.classList.add("challenge-timer-up");
        this.clearChallengeTimer();
      } else {
        timerEl.textContent = `${secondsLeft}s`;
      }
    }, 1000);

    document.getElementById("btnDoneReto").addEventListener("click", () => {
      this.clearChallengeTimer();
      this.hideModal();
      this.startRatingFlow(player);
    });
  },

  // ---------------------------------------------------------
  // FLUJO DE CALIFICACIÓN — secuencial, oculto por jugador, 10s cada uno
  // ---------------------------------------------------------
  startRatingFlow(performer) {
    const raters = Game.otherPlayers(performer);
    const ratings = {}; // playerId -> puntaje 1-10
    let idx = 0;

    const showGate = () => {
      if (Game.gameOver) return this.finishRatingFlow(performer, ratings);
      if (idx >= raters.length) {
        return this.finishRatingFlow(performer, ratings);
      }
      const rater = raters[idx];
      this.showModal(`
        <div class="modal-eyebrow" style="color:var(--ink-soft)">Calificación en privado</div>
        <div class="modal-title">Pasa el dispositivo a<br>${rater.name}</div>
        <div class="modal-body">Los demás cubran la pantalla. Cuando <strong>${rater.name}</strong> tenga el control, toca "Estoy listo" para calificar el reto de 1 a 10.</div>
        <div class="modal-actions">
          <button class="btn btn-primary btn-block" id="btnReady">Estoy listo</button>
        </div>
      `);
      document.getElementById("btnReady").addEventListener("click", showOptions);
    };

    const submitRating = (rater, score) => {
      this.clearRatingTimer();
      ratings[rater.id] = score;
      idx += 1;
      showHidden();
    };

    const showOptions = () => {
      const rater = raters[idx];
      let secondsLeft = RATING_TIME_SECONDS;
      const nums = [];
      for (let n = RATING_MIN; n <= RATING_MAX; n++) nums.push(n);
      const optsHtml = nums.map(n =>
        `<button class="btn rating-option-btn" data-score="${n}">${n}</button>`
      ).join("");
      this.showModal(`
        <div class="modal-eyebrow" style="color:var(--orange)">${rater.name}, califica del 1 al 10</div>
        <div class="modal-title">Reto de ${performer.name}</div>
        <div class="modal-body">¿Qué tan bien lo hizo? Nadie más verá tu nota hasta el final.</div>
        <div class="rating-timer" id="ratingTimer">${secondsLeft}s</div>
        <div class="rating-options">${optsHtml}</div>
      `);
      const timerEl = document.getElementById("ratingTimer");
      this.clearRatingTimer();
      this.ratingIntervalId = setInterval(() => {
        secondsLeft -= 1;
        if (secondsLeft <= 0) {
          timerEl.textContent = "¡Tiempo!";
          submitRating(rater, RATING_DEFAULT_ON_TIMEOUT);
        } else {
          timerEl.textContent = `${secondsLeft}s`;
        }
      }, 1000);
      document.querySelectorAll(".rating-option-btn").forEach(btn => {
        btn.addEventListener("click", () => {
          submitRating(rater, parseInt(btn.dataset.score, 10));
        });
      });
    };

    const showHidden = () => {
      this.showModal(`
        <div class="modal-eyebrow" style="color:var(--ink-soft)">Listo</div>
        <div class="modal-title">Calificación guardada</div>
        <div class="modal-body">Pasa el dispositivo al siguiente jugador cuando estés listo.</div>
        <div class="modal-actions">
          <button class="btn btn-primary btn-block" id="btnNextRater">Continuar</button>
        </div>
      `);
      document.getElementById("btnNextRater").addEventListener("click", showGate);
    };

    if (raters.length === 0) {
      this.finishRatingFlow(performer, ratings);
    } else {
      showGate();
    }
  },

  finishRatingFlow(performer, ratings) {
    const raters = Game.otherPlayers(performer);
    let total = 0;
    const rows = raters.map(r => {
      const score = ratings[r.id] ?? RATING_DEFAULT_ON_TIMEOUT;
      total += score;
      return `<div class="row"><span>${r.name}</span><span>${score} / 10</span></div>`;
    }).join("");
    Game.gainPoints(performer, total);
    Game.addLog(performer, `Recibe ${total} puntos por su reto (suma de calificaciones).`);

    this.showModal(`
      <div class="modal-eyebrow" style="color:var(--orange)">Calificaciones reveladas</div>
      <div class="modal-title">${performer.name} gana ${total} puntos</div>
      <div class="modal-stats">${rows || '<div class="row"><span>Nadie más en la partida</span><span>—</span></div>'}</div>
      <div class="modal-actions">
        <button class="btn btn-primary btn-block" id="btnCloseRatings">Continuar</button>
      </div>
    `);
    document.getElementById("btnCloseRatings").addEventListener("click", () => {
      this.hideModal();
      this.renderLog();
      this.renderPlayerList();
      this.showEndTurnButton();
    });
  },

  // ---------------------------------------------------------
  // TRIVIA
  // ---------------------------------------------------------
  showTriviaModal(player, cell) {
    const item = Game.draw("trivia", TRIVIA);
    const optsHtml = item.options.map((opt, i) =>
      `<button class="btn btn-block trivia-option-btn" data-idx="${i}" style="margin-bottom:8px;">${opt}</button>`
    ).join("");
    this.showModal(`
      <div class="modal-eyebrow" style="color:#4B5FA3">Trivia Naranja · ${player.name}</div>
      <div class="modal-title">❓ ${item.q}</div>
      <div style="margin-top:14px;">${optsHtml}</div>
    `);
    document.querySelectorAll(".trivia-option-btn").forEach(btn => {
      btn.addEventListener("click", () => {
        const idx = parseInt(btn.dataset.idx, 10);
        const correct = idx === item.correctIndex;
        this.resolveTriviaAnswer(player, item, correct);
      });
    });
  },

  resolveTriviaAnswer(player, item, correct) {
    let resultMsg;
    if (correct) {
      Game.gainPoints(player, TRIVIA_CORRECT_REWARD);
      Game.addLog(player, `Responde bien la trivia y gana ${TRIVIA_CORRECT_REWARD} puntos.`);
      resultMsg = `<div class="card-face" style="border-color:#4B5FA3"><div class="card-face-icon">✅</div><div class="card-face-eyebrow" style="color:#4B5FA3">¡Correcto!</div><div class="card-face-text">Ganas ${TRIVIA_CORRECT_REWARD} puntos.</div></div>`;
    } else {
      const paid = Game.spendPoints(player, TRIVIA_WRONG_PENALTY);
      Game.addToPot(paid);
      Game.addLog(player, `Falla la trivia. La respuesta correcta era: "${item.options[item.correctIndex]}". Pierde ${paid} punto(s) al Fondo Comunitario.`);
      resultMsg = `<div class="card-face" style="border-color:#7A3B2E"><div class="card-face-icon">❌</div><div class="card-face-eyebrow" style="color:#7A3B2E">Incorrecto</div><div class="card-face-text">La respuesta correcta era: <strong>${item.options[item.correctIndex]}</strong>.<br>Pierdes ${paid} punto(s) al Fondo Comunitario.</div></div>`;
    }
    this.showModal(`
      ${resultMsg}
      <div class="modal-actions" style="margin-top:18px;">
        <button class="btn btn-primary btn-block" id="btnCloseTrivia">Continuar</button>
      </div>
    `);
    document.getElementById("btnCloseTrivia").addEventListener("click", () => {
      this.hideModal();
      this.renderLog();
      this.renderPlayerList();
      this.renderPot();
      this.showEndTurnButton();
    });
  },

  // ---------------------------------------------------------
  // RETO GRUPAL
  // ---------------------------------------------------------
  showGrupalModal(player, cell) {
    const text = Game.draw("grupal", GRUPAL);
    const playerBtns = Game.players.map(p =>
      `<button class="btn btn-block winner-pick-btn" data-id="${p.id}" style="margin-bottom:8px; border-color:${p.color};">${p.name}</button>`
    ).join("");
    this.showModal(`
      <div class="card-face" style="border-color:#B23A6B">
        <div class="card-face-icon">👥</div>
        <div class="card-face-eyebrow" style="color:#B23A6B">Reto Grupal</div>
        <div class="card-face-text">${text}</div>
      </div>
      <div class="modal-body" style="margin-top:14px;">Todos participan. Cuando terminen, el grupo decide en voz alta quién ganó:</div>
      <div>${playerBtns}</div>
    `);
    document.querySelectorAll(".winner-pick-btn").forEach(btn => {
      btn.addEventListener("click", () => {
        const winnerId = parseInt(btn.dataset.id, 10);
        const winner = Game.players.find(p => p.id === winnerId);
        Game.gainPoints(winner, GRUPAL_PRIZE);
        Game.addLog(winner, `Gana el reto grupal y suma ${GRUPAL_PRIZE} puntos.`);
        this.hideModal();
        this.renderLog();
        this.renderPlayerList();
        this.showEndTurnButton();
      });
    });
  },

  // ---------------------------------------------------------
  // CARTA DE EVENTO
  // ---------------------------------------------------------
  showEventoModal(player, cell) {
    const card = Game.draw("evento", EVENTOS);
    this.showModal(`
      <div class="card-face" style="border-color:#7A3B2E">
        <div class="card-face-icon">🃏</div>
        <div class="card-face-eyebrow" style="color:#7A3B2E">Carta de Economía Creativa</div>
        <div class="card-face-text">${card.text}</div>
      </div>
      <div class="modal-actions" style="margin-top:18px;">
        <button class="btn btn-primary btn-block" id="btnResolveCard">Continuar</button>
      </div>
    `);
    document.getElementById("btnResolveCard").addEventListener("click", () => {
      this.hideModal();
      this.applyEventEffect(player, card);
    });
  },

  applyEventEffect(player, card) {
    const eff = card.effect;
    Game.addLog(player, card.text);
    this.renderLog();

    const finish = () => {
      this.renderPlayerList();
      this.refreshBoardDynamic();
      this.renderPot();
      this.showEndTurnButton();
    };

    switch (eff.type) {
      case "points":
        if (eff.amount >= 0) Game.gainPoints(player, eff.amount);
        else Game.spendPoints(player, -eff.amount);
        finish();
        break;
      case "moveRelative": {
        const newPos = Game.movePlayer(player, eff.steps);
        this.renderPlayerList();
        this.refreshBoardDynamic();
        this.sleep(200).then(() => this.landOnCell(player, newPos));
        return;
      }
      default:
        finish();
    }
  },

  // ---------------------------------------------------------
  // END OF TURN
  // ---------------------------------------------------------
  showEndTurnButton() {
    if (Game.gameOver) return;
    const row = document.getElementById("actionRow");
    row.innerHTML = "";

    const canRollAgain = Game.isDoubles() && Game.turnState.doublesCount < 3 && Game.turnState.doublesCount > 0;

    if (canRollAgain) {
      const info = document.createElement("div");
      info.style.fontFamily = "var(--font-mono)";
      info.style.fontSize = "0.75rem";
      info.style.marginBottom = "8px";
      info.style.color = "var(--orange-deep)";
      info.textContent = "¡Sacaste dobles! Vuelves a tirar.";
      row.appendChild(info);

      const rollAgainBtn = document.createElement("button");
      rollAgainBtn.className = "btn btn-primary btn-block";
      rollAgainBtn.textContent = "🎲 Lanzar de nuevo";
      rollAgainBtn.addEventListener("click", () => this.handleRoll());
      row.appendChild(rollAgainBtn);
      return;
    }

    const endBtn = document.createElement("button");
    endBtn.className = "btn btn-primary btn-block";
    endBtn.textContent = "Terminar turno →";
    endBtn.addEventListener("click", () => this.advanceTurn());
    row.appendChild(endBtn);
  },

  advanceTurn() {
    if (Game.gameOver) return;
    Game.nextTurn();
    this.startTurn();
  },

  // ---------------------------------------------------------
  // FIN DE PARTIDA (por cronómetro)
  // ---------------------------------------------------------
  forceEndGame() {
    Game.gameOver = true;
    Game.stopTimer();
    this.clearChallengeTimer();
    this.clearRatingTimer();
    this.hideModal();
    const ranking = Game.getRanking();
    this.showRanking(ranking);
  },

  showRanking(ranking) {
    const medals = ["🏆", "🥈", "🥉"];
    const rows = ranking.map((p, i) => `
      <div class="ranking-row ${i === 0 ? "first" : ""}">
        <span class="ranking-medal">${medals[i] || `${i + 1}.`}</span>
        <span class="ranking-token" style="background:${p.color}"></span>
        <span class="ranking-name">${p.name}</span>
        <span class="ranking-cash">${p.points} pts</span>
      </div>
    `).join("");
    document.getElementById("winnerName").textContent = ranking[0].name;
    document.getElementById("winnerName").style.color = ranking[0].color;
    document.getElementById("rankingList").innerHTML = rows;
    this.showScreen("winner");
  },
};

// ---------------------------------------------------------
// BOOT
// ---------------------------------------------------------
document.addEventListener("DOMContentLoaded", () => {
  UI.initSetupScreen();
  document.getElementById("btnPlayAgain").addEventListener("click", () => {
    Game.stopTimer();
    document.getElementById("timerDisplay").style.display = "none";
    UI.showScreen("setup");
  });
  document.getElementById("modalBackdrop").addEventListener("click", (e) => {
    if (e.target.id === "modalBackdrop") {
      if (document.getElementById("btnCloseInfo")) UI.hideModal();
    }
  });
});
