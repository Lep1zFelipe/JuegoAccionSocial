// ============================================================
// RETO NARANJA — Motor de lógica del juego
// Sin dependencias externas. Expone `Game`, un objeto con
// estado + métodos que la capa de UI (game-ui.js) consume.
// Juego por puntos (no dinero): cada jugador arranca en 0 y los
// puntos nunca bajan de 0. Termina por cronómetro, no por eliminación.
// ============================================================

const Game = {
  players: [],       // { id, name, tokenId, color, points, position }
  currentPlayerIndex: 0,
  decks: {},          // nombre -> array barajado (se repone al vaciarse)
  pot: 0,              // Fondo Comunitario, en puntos
  log: [],
  turnState: {
    hasRolled: false,
    lastRoll: [0, 0],
    doublesCount: 0,
  },
  timeRemaining: GAME_DURATION_SECONDS,
  timerId: null,
  gameOver: false,

  // ---------------------------------------------------------
  // Inicialización
  // ---------------------------------------------------------
  init(playerConfigs) {
    this.players = playerConfigs.map((cfg, i) => ({
      id: i,
      name: cfg.name || `Jugador ${i + 1}`,
      tokenId: cfg.tokenId,
      color: cfg.color,
      points: STARTING_POINTS,
      position: 0,
    }));
    this.currentPlayerIndex = 0;
    this.pot = 0;
    this.decks = {
      cine: this.shuffle([...RETOS.cine]),
      musica: this.shuffle([...RETOS.musica]),
      diseno: this.shuffle([...RETOS.diseno]),
      videojuegos: this.shuffle([...RETOS.videojuegos]),
      retoRapido: this.shuffle([...RETOS_RAPIDOS]),
      grupal: this.shuffle([...GRUPAL]),
      evento: this.shuffle([...EVENTOS]),
      trivia: this.shuffle([...TRIVIA]),
    };
    this.log = [];
    this.turnState = { hasRolled: false, lastRoll: [0, 0], doublesCount: 0 };
    this.timeRemaining = GAME_DURATION_SECONDS;
    this.gameOver = false;
    this.addLog(null, "La partida comienza. ¡A ganarse los puntos con talento creativo!");
  },

  shuffle(arr) {
    for (let i = arr.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [arr[i], arr[j]] = [arr[j], arr[i]];
    }
    return arr;
  },

  // Roba un elemento de la baraja `deckSource` (array fuente original, ej. RETOS.cine).
  // Guarda el mazo barajado bajo `deckKey` en this.decks y lo repone al vaciarse.
  draw(deckKey, deckSource) {
    if (!this.decks[deckKey] || this.decks[deckKey].length === 0) {
      this.decks[deckKey] = this.shuffle([...deckSource]);
    }
    return this.decks[deckKey].pop();
  },

  // ---------------------------------------------------------
  // Helpers de estado
  // ---------------------------------------------------------
  currentPlayer() {
    return this.players[this.currentPlayerIndex];
  },

  otherPlayers(player) {
    return this.players.filter(p => p.id !== player.id);
  },

  cellAt(pos) {
    return BOARD[pos];
  },

  addLog(player, message) {
    this.log.push({ playerName: player ? player.name : null, playerColor: player ? player.color : null, message, ts: Date.now() });
  },

  // ---------------------------------------------------------
  // Puntos (siempre clamped a >= 0)
  // ---------------------------------------------------------
  gainPoints(player, amount) {
    player.points = Math.max(0, player.points + Math.max(0, amount));
  },

  // Resta hasta `amount` puntos del jugador, sin bajar de 0. Devuelve lo realmente descontado.
  spendPoints(player, amount) {
    const actual = Math.min(player.points, Math.max(0, amount));
    player.points -= actual;
    return actual;
  },

  addToPot(amount) {
    this.pot += Math.max(0, amount);
  },

  collectPot(player) {
    const amount = this.pot;
    this.pot = 0;
    this.gainPoints(player, amount);
    return amount;
  },

  // ---------------------------------------------------------
  // Dados y movimiento
  // ---------------------------------------------------------
  rollDice() {
    const d1 = 1 + Math.floor(Math.random() * 6);
    const d2 = 1 + Math.floor(Math.random() * 6);
    this.turnState.lastRoll = [d1, d2];
    this.turnState.hasRolled = true;
    return [d1, d2];
  },

  isDoubles() {
    return this.turnState.lastRoll[0] === this.turnState.lastRoll[1];
  },

  // Mueve al jugador actual `steps` casillas (con wraparound), gestiona el bono de Salida.
  movePlayer(player, steps) {
    const oldPos = player.position;
    let newPos = (oldPos + steps) % BOARD.length;
    if (newPos < 0) newPos += BOARD.length;
    const passedGo = steps > 0 && (oldPos + steps) >= BOARD.length;
    player.position = newPos;
    if (passedGo) {
      this.gainPoints(player, GO_BONUS_POINTS);
      this.addLog(player, `Pasa por la Feria Creativa y gana ${GO_BONUS_POINTS} puntos.`);
    }
    return newPos;
  },

  // ---------------------------------------------------------
  // Avance de turno
  // ---------------------------------------------------------
  nextTurn() {
    this.turnState = { hasRolled: false, lastRoll: [0, 0], doublesCount: 0 };
    this.currentPlayerIndex = (this.currentPlayerIndex + 1) % this.players.length;
  },

  // ---------------------------------------------------------
  // Cronómetro
  // ---------------------------------------------------------
  startTimer(onTick, onEnd) {
    this.stopTimer();
    onTick(this.timeRemaining);
    this.timerId = setInterval(() => {
      this.timeRemaining -= 1;
      if (this.timeRemaining <= 0) {
        this.timeRemaining = 0;
        onTick(this.timeRemaining);
        this.stopTimer();
        this.gameOver = true;
        onEnd();
        return;
      }
      onTick(this.timeRemaining);
    }, 1000);
  },

  stopTimer() {
    if (this.timerId) {
      clearInterval(this.timerId);
      this.timerId = null;
    }
  },

  // ---------------------------------------------------------
  // Clasificación final
  // ---------------------------------------------------------
  getRanking() {
    return [...this.players].sort((a, b) => b.points - a.points);
  },
};
