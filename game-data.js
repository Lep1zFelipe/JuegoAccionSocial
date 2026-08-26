// ============================================================
// RETO NARANJA — Datos del juego
// Tablero circular de 32 casillas. No hay compra de propiedades:
// cada casilla dispara un reto, una trivia, un evento o un efecto
// de dinero relacionado con la economía naranja.
// ============================================================

const SECTORS = {
  cine: { name: "Cine y Audiovisual", color: "#7A3B2E", tint: "#E8D4CC", icon: "🎬" },
  musica: { name: "Música", color: "#C9A227", tint: "#F3E7C2", icon: "🎵" },
  diseno: { name: "Diseño y Moda", color: "#B23A6B", tint: "#F0D4E1", icon: "🎨" },
  videojuegos: { name: "Videojuegos y Digital", color: "#4B5FA3", tint: "#D9DEF0", icon: "🎮" },
};

/*
Cada casilla:
  id: posición en el tablero (0-31, sentido horario, 0 = salida)
  type: 'start' | 'reto' | 'retoRapido' | 'trivia' | 'grupal' | 'evento' | 'impuesto' | 'bonus' | 'fondoComunitario' | 'pausa'
  sector: solo para type 'reto'
  name, icon, desc (opcional, para casillas sin baraja propia)
*/
const BOARD = [
  { id: 0, type: "start", name: "Feria Creativa", icon: "🎪", desc: "Cobra ₡2,000 al pasar o caer aquí." },

  { id: 1, type: "reto", sector: "cine", name: "Reto: Cine y Audiovisual", icon: "🎬" },
  { id: 2, type: "evento", name: "Carta de Economía Creativa", icon: "🃏" },
  { id: 3, type: "reto", sector: "musica", name: "Reto: Música", icon: "🎵" },
  { id: 4, type: "trivia", name: "Trivia Naranja", icon: "❓" },
  { id: 5, type: "reto", sector: "diseno", name: "Reto: Diseño y Moda", icon: "🎨" },
  { id: 6, type: "retoRapido", name: "Reto Creativo Rápido", icon: "⚡" },
  { id: 7, type: "reto", sector: "videojuegos", name: "Reto: Videojuegos y Digital", icon: "🎮" },

  { id: 8, type: "fondoComunitario", name: "Fondo Comunitario", icon: "💰", desc: "Te llevás todo lo acumulado en el fondo." },

  { id: 9, type: "reto", sector: "cine", name: "Reto: Cine y Audiovisual", icon: "🎬" },
  { id: 10, type: "impuesto", name: "Impuesto Cultural", icon: "🧾" },
  { id: 11, type: "reto", sector: "musica", name: "Reto: Música", icon: "🎵" },
  { id: 12, type: "grupal", name: "Reto Grupal", icon: "👥" },
  { id: 13, type: "reto", sector: "diseno", name: "Reto: Diseño y Moda", icon: "🎨" },
  { id: 14, type: "trivia", name: "Trivia Naranja", icon: "❓" },
  { id: 15, type: "reto", sector: "videojuegos", name: "Reto: Videojuegos y Digital", icon: "🎮" },

  { id: 16, type: "pausa", name: "Pausa Creativa", icon: "☕", desc: "No pasa nada. Respira un momento." },

  { id: 17, type: "reto", sector: "cine", name: "Reto: Cine y Audiovisual", icon: "🎬" },
  { id: 18, type: "retoRapido", name: "Reto Creativo Rápido", icon: "⚡" },
  { id: 19, type: "reto", sector: "musica", name: "Reto: Música", icon: "🎵" },
  { id: 20, type: "evento", name: "Carta de Economía Creativa", icon: "🃏" },
  { id: 21, type: "reto", sector: "diseno", name: "Reto: Diseño y Moda", icon: "🎨" },
  { id: 22, type: "grupal", name: "Reto Grupal", icon: "👥" },
  { id: 23, type: "reto", sector: "videojuegos", name: "Reto: Videojuegos y Digital", icon: "🎮" },

  { id: 24, type: "bonus", name: "Mercado Naranja", icon: "🎁", desc: "Bono instantáneo, sin condiciones." },

  { id: 25, type: "retoRapido", name: "Reto Creativo Rápido", icon: "⚡" },
  { id: 26, type: "trivia", name: "Trivia Naranja", icon: "❓" },
  { id: 27, type: "grupal", name: "Reto Grupal", icon: "👥" },
  { id: 28, type: "evento", name: "Carta de Economía Creativa", icon: "🃏" },
  { id: 29, type: "impuesto", name: "Impuesto Cultural", icon: "🧾" },
  { id: 30, type: "retoRapido", name: "Reto Creativo Rápido", icon: "⚡" },
  { id: 31, type: "trivia", name: "Trivia Naranja", icon: "❓" },
];

// ============================================================
// BARAJAS DE RETOS DE TALENTO (por sector)
// ============================================================
const RETOS = {
  cine: [
    "Actúa una escena de terror, sin hablar.",
    "Haz de tráiler de película: narra una escena de la vida real como si fuera un avance de cine.",
    "Imita a un actor o actriz famoso hasta que alguien lo adivine.",
    "Actúa una escena de telenovela con final trágico.",
    "Haz de director de cine dando instrucciones exageradas a un actor imaginario.",
    "Recrea la escena más dramática de una película que te sepas de memoria.",
    "Haz una escena muda (sin palabras) que cuente una historia completa en 20 segundos.",
    "Dobla la voz de un personaje de dibujos animados durante 15 segundos.",
  ],
  musica: [
    "Canta el coro de una canción inventada en el momento.",
    "Tararea una melodía y que los demás adivinen la canción.",
    "Crea un ritmo de percusión solo con las manos y la mesa, 15 segundos.",
    "Canta tu canción favorita cambiando la letra por palabras relacionadas con economía naranja.",
    "Haz un beatbox improvisado de 15 segundos.",
    "Canta como si fueras un cantante de ópera pidiendo algo cotidiano (ej. pedir agua).",
    "Compón y canta un jingle publicitario para un producto inventado.",
    "Silba una melodía y que los demás la adivinen.",
  ],
  diseno: [
    "Diseña un outfit imaginario usando solo objetos que tengas cerca y descríbelo como si fueras diseñador de moda.",
    "Describe, como si fueras crítico de moda, el look de otro jugador.",
    "Inventa el nombre y eslogan de tu propia marca de ropa en 15 segundos.",
    "Haz una pose de pasarela y descríbela como si estuvieras en un desfile.",
    "Diseña (con palabras) el logo de una marca de moda sostenible.",
    "Combina tres objetos de la mesa en un 'accesorio de moda' y véndelo al grupo.",
    "Describe la colección de ropa del 'futuro' en 20 segundos.",
    "Actúa como maniquí de tienda durante 15 segundos sin moverte.",
  ],
  videojuegos: [
    "Inventa el nombre y la mecánica principal de un videojuego en 20 segundos.",
    "Haz de personaje de videojuego anunciando su 'ataque especial' con voz y gesto.",
    "Describe cómo sería el videojuego de tu vida diaria.",
    "Imita el sonido de una máquina arcade clásica (monedas, power-up, game over).",
    "Presenta, como si fueras streamer, los primeros 15 segundos de un videojuego inventado.",
    "Inventa un personaje de videojuego (nombre, poder y debilidad) en 20 segundos.",
    "Actúa la reacción de un jugador que acaba de perder en el último segundo de una partida.",
    "Describe el villano de un videojuego inventado en 15 segundos.",
  ],
};

// ============================================================
// RETOS CREATIVOS RÁPIDOS (menos exposición, ideales para tímidos)
// ============================================================
const RETOS_RAPIDOS = [
  "Dibuja un logo para una marca creativa; los demás adivinan qué es.",
  "Inventa un eslogan publicitario para 'Economía Naranja' en 15 segundos.",
  "Arma un 'logo' usando solo objetos que tengas sobre la mesa.",
  "Escribe (o dicta) el título de una película inexistente y su género.",
  "Nombra 3 industrias creativas distintas en 10 segundos, sin repetir.",
  "Inventa el nombre de una startup creativa y en qué sector estaría.",
  "Describe en una frase de qué trataría tu propio pódcast.",
  "Piensa un nombre creativo para una cafetería temática de videojuegos.",
  "Inventa el titular de una noticia cultural para mañana.",
  "Describe, en 10 segundos, tu 'marca personal' como si fueras un producto creativo.",
];

// ============================================================
// RETOS GRUPALES (participan todos los jugadores)
// ============================================================
const GRUPAL = [
  "Cada quien inventa un eslogan publicitario en 20 segundos; el grupo decide cuál es el mejor.",
  "Cada quien hace una pose de 'portada de disco' al mismo tiempo; el grupo vota la más creativa.",
  "Cada quien inventa el nombre de una película en 10 segundos; el grupo vota el más original.",
  "Cada quien dibuja en el aire un ícono para una app creativa; el grupo adivina y vota el mejor.",
  "Cada quien improvisa 5 segundos de baile; el grupo vota quién tiene más ritmo.",
  "Cada quien inventa el nombre de una banda musical; el grupo vota el mejor nombre.",
  "Cada quien describe en una frase 'la app que cambiaría el mundo'; el grupo vota la mejor idea.",
  "Cada quien hace una expresión facial de 'ganador de premio'; el grupo vota la más convincente.",
];

// ============================================================
// CARTAS DE EVENTO (Tendencias y Contratiempos de la economía creativa)
// Efectos en puntos, no en dinero: 'points' suma/resta puntos fijos al
// jugador actual; 'moveRelative' lo mueve por el tablero.
// ============================================================
const EVENTOS = [
  { text: "Tu corto se viraliza en redes. Gana 2 puntos.", effect: { type: "points", amount: 2 } },
  { text: "Ganas un fondo de fomento cultural. Gana 3 puntos.", effect: { type: "points", amount: 3 } },
  { text: "Una marca licencia tu diseño. Gana 3 puntos.", effect: { type: "points", amount: 3 } },
  { text: "Recibes una beca de creación. Gana 2 puntos.", effect: { type: "points", amount: 2 } },
  { text: "Firmas contrato de distribución. Avanza 3 casillas.", effect: { type: "moveRelative", steps: 3 } },
  { text: "Tu formato se pone de moda. Gana 1 punto.", effect: { type: "points", amount: 1 } },
  { text: "Inversionista ángel apuesta por tu proyecto. Gana 3 puntos.", effect: { type: "points", amount: 3 } },
  { text: "Tu pieza gana un concurso de diseño. Gana 2 puntos.", effect: { type: "points", amount: 2 } },
  { text: "Piratería golpea tus ventas. Pierde 2 puntos.", effect: { type: "points", amount: -2 } },
  { text: "Retraso de producción por falta de permisos. Pierde 1 punto.", effect: { type: "points", amount: -1 } },
  { text: "Multa por incumplir un contrato de licencia. Pierde 2 puntos.", effect: { type: "points", amount: -2 } },
  { text: "Demanda por plagio (sin fundamento, pero cuesta defenderse). Pierde 1 punto.", effect: { type: "points", amount: -1 } },
  { text: "Mala crítica hunde el estreno. Retrocede 3 casillas.", effect: { type: "moveRelative", steps: -3 } },
  { text: "Se cae el proveedor de vestuario a última hora. Pierde 1 punto.", effect: { type: "points", amount: -1 } },
];

// ============================================================
// TRIVIA DE ECONOMÍA NARANJA
// ============================================================
const TRIVIA = [
  {
    q: "¿Cuáles de estos sectores forma parte de la 'economía naranja'?",
    options: ["Videojuegos", "Minería", "Petróleo", "Pesca industrial"],
    correctIndex: 0,
  },
  {
    q: "La economía naranja se basa principalmente en:",
    options: ["Recursos no renovables", "El talento y la creatividad", "La agricultura extensiva", "La banca tradicional"],
    correctIndex: 1,
  },
  {
    q: "¿Cuál de estos NO es un sector típico de industrias creativas?",
    options: ["Diseño de moda", "Cine y audiovisual", "Extracción minera", "Música"],
    correctIndex: 2,
  },
  {
    q: "Las 'industrias culturales' dentro de la economía naranja incluyen:",
    options: ["Editorial y publicaciones", "Refinación de petróleo", "Construcción vial", "Ganadería"],
    correctIndex: 0,
  },
  {
    q: "¿Qué protege legalmente las creaciones originales (canciones, diseños, software)?",
    options: ["El impuesto de renta", "La propiedad intelectual", "El salario mínimo", "El arancel aduanero"],
    correctIndex: 1,
  },
  {
    q: "Un videojuego indie es un ejemplo de producto de:",
    options: ["Economía naranja", "Economía circular de residuos", "Economía extractiva", "Economía informal agrícola"],
    correctIndex: 0,
  },
  {
    q: "¿Cuál de estas actividades pertenece al sector 'diseño'?",
    options: ["Diseño gráfico", "Extracción de arena", "Pesca artesanal", "Transporte de carga"],
    correctIndex: 0,
  },
  {
    q: "El streaming de música y series es relevante para la economía naranja porque:",
    options: ["Distribuye contenido creativo", "Reduce impuestos", "Sustituye la agricultura", "Elimina el diseño"],
    correctIndex: 0,
  },
  {
    q: "¿Cuál de estos NO es un beneficio típico que se busca con la economía naranja?",
    options: ["Generar empleo creativo", "Diversificar la economía", "Aumentar solo la exportación de minerales", "Impulsar el talento local"],
    correctIndex: 2,
  },
  {
    q: "Una editorial que publica libros y cómics pertenece al sector:",
    options: ["Editorial / literario", "Agroindustrial", "Energético", "Metalúrgico"],
    correctIndex: 0,
  },
];

// ============================================================
// TOKENS DE JUGADOR
// ============================================================
const PLAYER_TOKENS = [
  { id: "orange", color: "#E8622C", name: "Naranja" },
  { id: "blue", color: "#4B5FA3", name: "Azul" },
  { id: "magenta", color: "#B23A6B", name: "Magenta" },
  { id: "gold", color: "#C9A227", name: "Dorado" },
];

// ============================================================
// CONSTANTES DE JUEGO
// ============================================================
const STARTING_POINTS = 0;
const GO_BONUS_POINTS = 3;
const GAME_DURATION_SECONDS = 20 * 60;

const TRIVIA_CORRECT_REWARD = 2;
const TRIVIA_WRONG_PENALTY = 1;
const IMPUESTO_AMOUNT = 1;
const BONUS_AMOUNT = 2;
const GRUPAL_PRIZE = 3;

// Reto de talento / reto rápido: tiempo para actuar y luego calificar
const CHALLENGE_TIME_SECONDS = 40;
const RATING_TIME_SECONDS = 10;
const RATING_MIN = 1;
const RATING_MAX = 10;
const RATING_DEFAULT_ON_TIMEOUT = 5;
