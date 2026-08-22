import { Chess, SQUARES } from "./chess.min.js";
import { Engine } from "./engine.js";
import { Board } from "./board.js";
import { loadOpenings, describePosition } from "./openings.js";

const PIECE_IT = {
  p: "Pedone",
  n: "Cavallo",
  b: "Alfiere",
  r: "Torre",
  q: "Donna",
  k: "Re",
};

const PIECE_VALUE = { p: 1, n: 3, b: 3, r: 5, q: 9, k: 0 };

function thePiece(type) {
  if (type === "b") return "l'alfiere";
  if (type === "r") return "la torre";
  if (type === "q") return "la donna";
  if (type === "n") return "il cavallo";
  if (type === "k") return "il re";
  return "il pedone";
}

function isCenterSquare(square) {
  return square === "d4" || square === "d5" || square === "e4" || square === "e5";
}

function isWideCenter(square) {
  const file = square.charCodeAt(0) - 97;
  const rank = Number(square[1]);
  return file >= 2 && file <= 5 && rank >= 3 && rank <= 6;
}

function escapeHtml(text) {
  return String(text).replace(/[&<>"']/g, (ch) => (
    { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[ch]
  ));
}

function explainMove(before, move, after, hint) {
  const us = before.turn();
  const backRank = us === "w" ? "1" : "8";
  const threatenedBefore = new Set(playerPiecesUnderAttack(before, us));
  const threatenedAfter = new Set(playerPiecesUnderAttack(after, us));

  if (move.san.includes("#")) return "Scacco matto! Chiudi la partita.";
  if (move.san.includes("+")) return "Scacco al re: l'avversario deve reagire.";

  if (move.san.startsWith("O-O-O")) return "Arrocco lungo: re al sicuro, torre al centro.";
  if (move.san.startsWith("O-O")) return "Arrocco: metti il re al sicuro e attiva la torre.";

  if (move.promotion) {
    return `Promozione: il pedone diventa ${PIECE_IT[move.promotion].toLowerCase()}!`;
  }

  if (String(move.flags).includes("e")) {
    return "Presa en passant: cattura il pedone al volo.";
  }

  if (threatenedBefore.has(move.from) && !threatenedAfter.has(move.to)) {
    return `Salva ${thePiece(move.piece)}: era sotto attacco.`;
  }

  for (const square of threatenedBefore) {
    if (square === move.from) continue;
    if (threatenedAfter.has(square)) continue;
    const rescued = before.get(square);
    if (rescued) return `Proteggi ${thePiece(rescued.type)}: era in pericolo.`;
  }

  if (move.captured) {
    const ours = PIECE_VALUE[move.piece];
    const theirs = PIECE_VALUE[move.captured];
    if (theirs > ours) return `Guadagno di materiale: prendi ${thePiece(move.captured)}!`;
    if (theirs === ours && move.piece !== "p") {
      return `Scambio di pezzi: dai ${thePiece(move.piece)}, prendi ${thePiece(move.captured)}.`;
    }
    return `Vai all'attacco: cattura ${thePiece(move.captured)}.`;
  }

  const attacks = after.moves({ square: move.to, verbose: true }).filter((m) => m.captured);
  attacks.sort((a, b) => PIECE_VALUE[b.captured] - PIECE_VALUE[a.captured]);
  const threat = attacks[0];
  if (threat && PIECE_VALUE[threat.captured] >= 5) {
    return `Minaccia ${thePiece(threat.captured)} avversaria.`;
  }
  if (threat && PIECE_VALUE[threat.captured] >= 3) {
    return `Attacca ${thePiece(threat.captured)} nemico.`;
  }

  if ((move.piece === "n" || move.piece === "b") && move.from[1] === backRank) {
    if (isCenterSquare(move.to) || isWideCenter(move.to)) {
      return `Sviluppa ${thePiece(move.piece)} verso il centro.`;
    }
    return `Sviluppa ${thePiece(move.piece)} e mettilo in gioco.`;
  }

  if (move.piece === "p") {
    if (isCenterSquare(move.to)) return "Avanza il pedone e occupa il centro!";
    if (Math.abs(Number(move.to[1]) - Number(move.from[1])) === 2) {
      return "Avanza il pedone di due case.";
    }
    if (move.to[0] === "c" || move.to[0] === "f") {
      return "Avanza il pedone e apri la diagonale all'alfiere.";
    }
    return "Avanza il pedone!";
  }

  if (move.piece === "r") {
    const file = move.to[0];
    const pawnsOnFile = SQUARES.some((sq) => sq[0] === file && after.get(sq)?.type === "p");
    if (!pawnsOnFile) return "Torre sulla colonna aperta: fai pressione.";
    return "Attiva la torre.";
  }

  if (move.piece === "q") {
    if (isCenterSquare(move.to) || isWideCenter(move.to)) {
      return "Centralizza la donna: più case sotto controllo.";
    }
    return "Riposiziona la donna verso l'attacco.";
  }

  if (move.piece === "k") return "Porta il re in gioco: nel finale deve aiutare.";

  if (hint?.scoreType === "mate" && hint.score > 0) return "Cerca il matto!";
  if (typeof hint?.score === "number" && hint.scoreType === "cp" && hint.score < -80) {
    return "Mossa di difesa: limita i danni.";
  }
  return "Mossa solida: migliora la posizione.";
}

const ARROW_COLORS = ["#5ea02e", "#3d8c4a", "#2b7a78", "#c9a227"];

const SKILL_LABELS = {
  1: "livello 1 · principiante",
  2: "livello 2 · facile",
  3: "livello 3 · amichevole",
  4: "livello 4 · intermedio",
  5: "livello 5 · medio",
  6: "livello 6 · impegnativo",
  7: "livello 7 · difficile",
  8: "livello 8 · esperto",
};

function italianSan(san) {
  if (san.startsWith("O-O-O")) return `0-0-0${san.slice(5)}`;
  if (san.startsWith("O-O")) return `0-0${san.slice(3)}`;
  return san.replace(/^[NBRQK]/, (letter) => ({ N: "C", B: "A", R: "T", Q: "D", K: "R" }[letter]));
}

function uciToMove(uci) {
  return {
    from: uci.slice(0, 2),
    to: uci.slice(2, 4),
    promotion: uci.length > 4 ? uci[4] : undefined,
  };
}

function hintScore(info) {
  if (!info) return -Infinity;
  if (info.scoreType === "mate") {
    return info.score > 0 ? 100000 - info.score : -100000 - info.score;
  }
  return Number.isFinite(info.score) ? info.score : -Infinity;
}

function formatHintEval(info) {
  if (!info || info.synthetic) return "—";
  if (info.scoreType === "mate") {
    if (info.score > 0) return `Matto in ${info.score}`;
    if (info.score < 0) return `Matto in ${Math.abs(info.score)}`;
    return "Matto";
  }
  const pawns = info.score / 100;
  if (pawns > 0) return `+${pawns.toFixed(2)}`;
  if (pawns < 0) return pawns.toFixed(2);
  return "0.00";
}

function evalClass(info) {
  if (!info || info.synthetic) return "";
  if (info.scoreType === "mate") return info.score > 0 ? "" : " is-neg";
  if (info.score > 0) return "";
  if (info.score < 0) return " is-neg";
  return "";
}

function moveHeadline(move) {
  if (!move) return "Mossa";
  if (move.san.startsWith("O-O-O")) return "Arrocco lungo";
  if (move.san.startsWith("O-O")) return "Arrocco corto";
  const piece = PIECE_IT[move.piece] || "Pezzo";
  if (move.promotion) {
    return `${piece} diventa ${PIECE_IT[move.promotion]} in ${move.to}`;
  }
  if (move.captured) return `${piece} mangia in ${move.to}`;
  return piece;
}

function uciFromVerbose(move) {
  return move.from + move.to + (move.promotion || "");
}

function fillHintPool(engineLines, game) {
  const pool = [];
  const seen = new Set();
  [...engineLines]
    .filter((line) => line?.uci)
    .sort((a, b) => hintScore(b) - hintScore(a) || a.multipv - b.multipv)
    .forEach((line) => {
      if (seen.has(line.uci)) return;
      seen.add(line.uci);
      pool.push(line);
    });
  if (pool.length < 4) {
    game.moves({ verbose: true }).forEach((move) => {
      const uci = uciFromVerbose(move);
      if (seen.has(uci)) return;
      seen.add(uci);
      pool.push({
        uci,
        synthetic: true,
        scoreType: "cp",
        score: 0,
        multipv: pool.length + 1,
      });
    });
  }
  return pool.slice(0, 12);
}

function visibleHints() {
  const start = state.hintPage * 4;
  return state.hintPool.slice(start, start + 4);
}

function syncMoreHintsButton() {
  const btn = els.moreHints;
  if (!btn) return;
  const canUse = playerIsSideToMove() && !state.busy && !state.game.game_over() && state.hintPool.length > 4;
  btn.disabled = !canUse;
}

function clearHints() {
  state.hints = [];
  state.hintPool = [];
  state.hintPage = 0;
}

function playerPiecesUnderAttack(game, playerColor) {
  const attacker = playerColor === "w" ? "b" : "w";
  const parts = game.fen().split(" ");
  parts[1] = attacker;
  const clone = new Chess();
  if (!clone.load(parts.join(" "))) return [];
  const threatened = new Set();
  clone.moves({ verbose: true, legal: false }).forEach((move) => {
    if (!move.captured) return;
    if (String(move.flags).includes("e")) {
      const capturedOn = move.to[0] + move.from[1];
      const victim = game.get(capturedOn);
      if (victim && victim.color === playerColor) threatened.add(capturedOn);
      return;
    }
    const victim = game.get(move.to);
    if (victim && victim.color === playerColor) threatened.add(move.to);
  });
  return [...threatened];
}

function markDanger(paint = true) {
  state.board.setDanger(playerPiecesUnderAttack(state.game, state.playerColor), paint);
}

function destsFromGame(game) {
  const dests = {};
  SQUARES.forEach((square) => {
    const moves = game.moves({ square, verbose: true });
    if (moves.length) dests[square] = moves.map((m) => m.to);
  });
  return dests;
}

function kingSquare(game, color) {
  for (const square of SQUARES) {
    const piece = game.get(square);
    if (piece && piece.type === "k" && piece.color === color) return square;
  }
  return null;
}

function needsPromotion(game, from, to) {
  const piece = game.get(from);
  return Boolean(piece && piece.type === "p" && (to[1] === "8" || to[1] === "1"));
}

const els = {
  boardRoot: document.getElementById("board-root"),
  hints: document.getElementById("hints"),
  statusTitle: document.getElementById("status-title"),
  statusText: document.getElementById("status-text"),
  statusIcon: document.getElementById("status-icon"),
  engineLabel: document.getElementById("engine-label"),
  skill: document.getElementById("skill"),
  moves: document.getElementById("moves"),
  playerName: document.getElementById("player-name"),
  turnBanner: document.getElementById("turn-banner"),
  overlay: document.getElementById("overlay"),
  overlayTitle: document.getElementById("overlay-title"),
  overlayText: document.getElementById("overlay-text"),
  promo: document.getElementById("promo"),
  theoryPhase: document.getElementById("theory-phase"),
  theoryKind: document.getElementById("theory-kind"),
  theoryStructure: document.getElementById("theory-structure"),
  theoryEco: document.getElementById("theory-eco"),
  theoryTitle: document.getElementById("theory-title"),
  theoryVariant: document.getElementById("theory-variant"),
  theoryBlurb: document.getElementById("theory-blurb"),
  moreHints: document.getElementById("btn-more-hints"),
};

const state = {
  game: new Chess(),
  engine: new Engine(),
  board: null,
  playerColor: "w",
  skill: 5,
  busy: false,
  hints: [],
  hintPool: [],
  hintPage: 0,
  gameId: 0,
  pendingPromo: null,
};

function playerIsSideToMove() {
  return state.game.turn() === state.playerColor;
}

function setStatus(title, text, kind = "info") {
  els.statusTitle.textContent = title;
  els.statusText.textContent = text;
  els.statusIcon.dataset.kind = kind;
  els.turnBanner.textContent = title;
}

function renderTheory() {
  const sans = state.game.history();
  const info = describePosition(sans, state.game);
  els.theoryPhase.textContent = info.phase;
  els.theoryKind.textContent = info.kindLabel;
  els.theoryKind.dataset.kind = info.kind;
  els.theoryStructure.textContent = info.structure;
  els.theoryEco.textContent = info.eco || "";
  els.theoryTitle.textContent = info.title;
  els.theoryVariant.textContent = info.variant || "";
  els.theoryBlurb.textContent = info.blurb;
}

function renderHistory() {
  const history = state.game.history({ verbose: true });
  let html = "";
  for (let i = 0; i < history.length; i += 2) {
    const n = i / 2 + 1;
    const white = italianSan(history[i].san);
    const black = history[i + 1] ? italianSan(history[i + 1].san) : "";
    html += `<div class="move-row"><span class="move-n">${n}.</span><span>${white}</span><span>${black}</span></div>`;
  }
  els.moves.innerHTML = html || `<div class="moves-empty">Nessuna mossa ancora.</div>`;
  els.moves.scrollTop = els.moves.scrollHeight;
  renderTheory();
}

function syncBoard(options = {}) {
  const fen = state.game.fen();
  markDanger(false);
  state.board.setPosition(fen);
  state.board.setTurn(state.game.turn(), state.playerColor);
  state.board.setDests(playerIsSideToMove() && !state.busy ? destsFromGame(state.game) : {});
  state.board.setInteractive(!state.busy && playerIsSideToMove() && !state.game.game_over());
  state.board.setCheck(state.game.in_check() ? kingSquare(state.game, state.game.turn()) : null);
  if (!options.keepArrows) showHintArrows();
}

function renderHints() {
  state.hints = visibleHints();
  const buttons = [];
  const rankOffset = state.hintPage * 4;
  for (let i = 0; i < 4; i += 1) {
    const hint = state.hints[i];
    const rank = rankOffset + i + 1;
    if (!hint) {
      buttons.push(`
        <button class="hint-btn empty" disabled>
          <span class="hint-rank">${rank}</span>
          <span class="hint-piece">—</span>
          <span class="hint-main">—</span>
        </button>`);
      continue;
    }
    const move = uciToMove(hint.uci);
    const probe = new Chess(state.game.fen());
    const played = probe.move({
      from: move.from,
      to: move.to,
      promotion: move.promotion || "q",
    });
    const san = played ? italianSan(played.san) : hint.uci;
    const headline = played ? moveHeadline(played) : "Mossa";
    const why = played ? explainMove(state.game, played, probe, hint) : "";
    const best = rank === 1 ? " migliore" : "";
    buttons.push(`
      <button class="hint-btn${rank === 1 ? " best" : ""}" data-index="${i}" type="button">
        <span class="hint-rank">${rank}${best}</span>
        <span class="hint-piece">${escapeHtml(headline)}</span>
        <span class="hint-main">${san}</span>
        <span class="hint-eval${evalClass(hint)}">${formatHintEval(hint)}</span>
        <span class="hint-why">${escapeHtml(why)}</span>
      </button>`);
  }
  els.hints.innerHTML = buttons.join("");
  syncMoreHintsButton();
}

function showHintArrows(index = null) {
  if (!state.hints.length) {
    state.board.setArrows([]);
    return;
  }
  state.board.setArrows(
    state.hints.map((hint, i) => {
      const active = index !== null && i === index;
      return {
        from: hint.uci.slice(0, 2),
        to: hint.uci.slice(2, 4),
        color: ARROW_COLORS[i],
        opacity: active ? 0.95 : 0.28,
        width: active ? "0.22" : "0.14",
      };
    })
  );
}

function youLabel() {
  return state.playerColor === "w" ? "Sei il Bianco" : "Sei il Nero";
}

async function refreshHints() {
  const gameId = state.gameId;
  if (state.game.game_over() || !playerIsSideToMove()) {
    state.hints = [];
    state.hintPool = [];
    state.hintPage = 0;
    renderHints();
    state.board.setArrows([]);
    return;
  }
  const fen = state.game.fen();
  els.hints.classList.add("loading");
  setStatus("Tocca a te!", "Calcolo le 4 mosse migliori…", "think");
  try {
    const lines = await state.engine.analyze(fen, {
      depth: 11,
      multipv: 12,
    });
    if (gameId !== state.gameId || state.game.fen() !== fen) return;
    state.hintPool = fillHintPool(lines, state.game);
    state.hintPage = 0;
    renderHints();
    showHintArrows();
    setStatus("Tocca a te!", `${youLabel()}. Clicca un pulsante o muovi un pezzo.`, "play");
  } catch (err) {
    if (err.message === "aborted") return;
    console.error(err);
    if (gameId !== state.gameId || state.game.fen() !== fen) return;
    state.hints = [];
    state.hintPool = [];
    state.hintPage = 0;
    renderHints();
    setStatus("Tocca a te!", "Motore occupato: puoi comunque muovere i pezzi.", "info");
  } finally {
    if (gameId === state.gameId && state.game.fen() === fen) {
      els.hints.classList.remove("loading");
    }
  }
}

function endMessage() {
  if (state.game.in_checkmate()) {
    const userWon = state.game.turn() !== state.playerColor;
    return userWon
      ? ["Scacco matto!", "Hai vinto. Bella partita.", "win"]
      : ["Scacco matto!", "Il computer ha vinto. Riprova con i suggerimenti.", "lose"];
  }
  if (state.game.in_stalemate()) return ["Stallo", "La partita è patta.", "draw"];
  if (state.game.in_draw()) return ["Patta", "Nessuno dei due ha vinto.", "draw"];
  return ["Fine partita", "", "info"];
}

function finishGame() {
  state.busy = false;
  clearHints();
  renderHints();
  syncBoard();
  const [title, text, kind] = endMessage();
  setStatus(title, text, kind);
}

async function computerMove() {
  const gameId = state.gameId;
  if (state.game.game_over()) {
    finishGame();
    return;
  }
  if (playerIsSideToMove()) {
    await refreshHints();
    return;
  }
  state.busy = true;
  clearHints();
  renderHints();
  syncBoard();
  setStatus("Tocca al computer", "Stockfish sta pensando…", "think");
  const fen = state.game.fen();
  try {
    const skill = Number(state.skill);
    const { uci } = await state.engine.play(fen, {
      skill,
      movetime: 250 + skill * 90,
    });
    if (gameId !== state.gameId) return;
    if (state.game.fen() !== fen) return;
    if (!uci) throw new Error("Nessuna mossa dal motore");
    const move = uciToMove(uci);
    const played = state.game.move({
      from: move.from,
      to: move.to,
      promotion: move.promotion || "q",
    });
    if (played) {
      state.board.setLastMove(played.from, played.to);
      await state.board.animateMove(played.from, played.to);
      if (gameId !== state.gameId) return;
      markDanger(false);
      state.board.setPosition(state.game.fen());
    }
  } catch (err) {
    if (err.message === "aborted" || gameId !== state.gameId) return;
    console.error(err);
    setStatus("Errore", "Il computer non è riuscito a muovere. Nuova partita?", "lose");
    state.busy = false;
    syncBoard();
    return;
  }
  if (gameId !== state.gameId) return;
  state.busy = false;
  renderHistory();
  if (state.game.game_over()) {
    finishGame();
    return;
  }
  syncBoard();
  await refreshHints();
}

async function applyUserMove(from, to, promotion) {
  if (state.busy || !playerIsSideToMove() || state.game.game_over()) {
    syncBoard();
    return;
  }
  if (needsPromotion(state.game, from, to) && !promotion) {
    openPromo(from, to);
    return;
  }
  state.busy = true;
  const played = state.game.move({ from, to, promotion: promotion || undefined });
  if (!played) {
    state.busy = false;
    syncBoard();
    return;
  }
  state.engine.stop();
  clearHints();
  renderHints();
  state.board.setLastMove(played.from, played.to);
  await state.board.animateMove(played.from, played.to);
  markDanger(false);
  state.board.setPosition(state.game.fen());
  renderHistory();
  if (state.game.game_over()) {
    finishGame();
    return;
  }
  state.busy = false;
  await computerMove();
}

function openPromo(from, to) {
  state.pendingPromo = { from, to };
  const color = state.playerColor === "w" ? "w" : "b";
  els.promo.innerHTML = ["q", "r", "b", "n"]
    .map(
      (p) =>
        `<button type="button" data-piece="${p}" title="${PIECE_IT[p]}">
           <img src="pieces/${color}${p.toUpperCase()}.svg" alt="${PIECE_IT[p]}">
         </button>`
    )
    .join("");
  els.promo.hidden = false;
}

els.promo.addEventListener("click", (event) => {
  const btn = event.target.closest("button");
  if (!btn || !state.pendingPromo) return;
  const { from, to } = state.pendingPromo;
  state.pendingPromo = null;
  els.promo.hidden = true;
  applyUserMove(from, to, btn.dataset.piece);
});

els.hints.addEventListener("click", (event) => {
  const btn = event.target.closest(".hint-btn");
  if (!btn || btn.disabled) return;
  const hint = state.hints[Number(btn.dataset.index)];
  if (!hint) return;
  const move = uciToMove(hint.uci);
  applyUserMove(move.from, move.to, move.promotion);
});

els.hints.addEventListener("pointerover", (event) => {
  const btn = event.target.closest(".hint-btn");
  if (!btn || btn.disabled) return;
  showHintArrows(Number(btn.dataset.index));
});

els.hints.addEventListener("pointerout", (event) => {
  if (event.relatedTarget && els.hints.contains(event.relatedTarget)) return;
  showHintArrows();
});

els.moreHints.addEventListener("click", () => {
  if (els.moreHints.disabled || state.hintPool.length <= 4) return;
  const pages = Math.ceil(state.hintPool.length / 4);
  state.hintPage = (state.hintPage + 1) % pages;
  renderHints();
  showHintArrows();
});

function startGame(playerColor = state.playerColor) {
  state.gameId += 1;
  state.engine.stop();
  state.game.reset();
  state.playerColor = playerColor;
  state.skill = Number(els.skill.value);
  state.busy = false;
  clearHints();
  state.pendingPromo = null;
  els.promo.hidden = true;
  els.engineLabel.textContent = `Stockfish ${SKILL_LABELS[state.skill]}`;
  state.board.setOrientation(playerColor === "w" ? "white" : "black");
  state.board.setLastMove(null, null);
  renderHints();
  renderHistory();
  syncBoard();
  setStatus(
    playerIsSideToMove() ? "Tocca a te!" : "Tocca al computer",
    youLabel(),
    "play"
  );
  computerMove();
}

function undoFullTurn() {
  if (state.busy || !state.game.history().length) return;
  state.gameId += 1;
  state.engine.stop();
  state.game.undo();
  if (state.game.turn() !== state.playerColor && state.game.history().length) {
    state.game.undo();
  }
  const hist = state.game.history({ verbose: true });
  const last = hist[hist.length - 1];
  state.board.setLastMove(last ? last.from : null, last ? last.to : null);
  clearHints();
  renderHistory();
  syncBoard();
  computerMove();
}

document.getElementById("btn-new").addEventListener("click", () => startGame(state.playerColor));
document.getElementById("btn-white").addEventListener("click", () => startGame("w"));
document.getElementById("btn-black").addEventListener("click", () => startGame("b"));
document.getElementById("btn-flip").addEventListener("click", () => {
  const next = state.board.orientation === "white" ? "black" : "white";
  state.board.setOrientation(next);
});
document.getElementById("btn-undo").addEventListener("click", undoFullTurn);
document.getElementById("btn-resign").addEventListener("click", () => {
  if (state.game.game_over() || !state.game.history().length) {
    startGame(state.playerColor);
    return;
  }
  state.engine.stop();
  state.busy = false;
  clearHints();
  renderHints();
  setStatus("Hai abbandonato", "Nuova partita quando vuoi.", "lose");
  state.board.setInteractive(false);
});
els.skill.addEventListener("change", () => {
  state.skill = Number(els.skill.value);
  els.engineLabel.textContent = `Stockfish ${SKILL_LABELS[state.skill]}`;
});

state.board = new Board(els.boardRoot, {
  onMove: (from, to) => applyUserMove(from, to),
});

setStatus("Caricamento", "Avvio del motore e del libro aperture…", "think");
els.hints.innerHTML = "";
renderHints();

Promise.all([
  state.engine.ready,
  loadOpenings().catch((err) => console.error("Libro aperture:", err)),
])
  .then(() => startGame("w"))
  .catch((err) => {
    console.error(err);
    setStatus("Errore", "Impossibile avviare Stockfish. Apri il sito da XAMPP (http://localhost/5minchess/).", "lose");
  });
