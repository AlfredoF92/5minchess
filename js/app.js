import { Chess, SQUARES } from "./chess.min.js";
import { Engine } from "./engine.js";
import { Board } from "./board.js";
import { loadOpenings, describePosition, START_OPENINGS } from "./openings.js";
import { applyStaticI18n, getLang, t } from "./i18n.js";

const PIECE_VALUE = { p: 1, n: 3, b: 3, r: 5, q: 9, k: 0 };
const HINTS_PER_PAGE = 6;
const HINT_POOL_SIZE = 12;

function pieceName(type) {
  return t(`piece.${type}`) || t("hints.move");
}

function namedPiece(type) {
  return t(`plain.${type || "x"}`);
}

function ourPieceName(type) {
  return t(`our.${type || "p"}`);
}

function joinTalk(parts) {
  return parts.filter(Boolean).join(" ").replace(/\s+/g, " ").trim();
}

function lossPhrase(type) {
  return t(`loss.${type}`) || t("loss.weak");
}

function thePiece(type) {
  return getLang() === "en" ? t(`piece.${type}`).toLowerCase() : t(`plain.${type}`);
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

  if (move.san.includes("#")) return t("explain.mate");
  if (move.san.includes("+")) return t("explain.check");

  if (move.san.startsWith("O-O-O")) return t("explain.castleLong");
  if (move.san.startsWith("O-O")) return t("explain.castle");

  if (move.promotion) {
    return t("explain.promo", { piece: thePiece(move.promotion) });
  }

  if (String(move.flags).includes("e")) {
    return t("explain.ep");
  }

  if (threatenedBefore.has(move.from) && !threatenedAfter.has(move.to)) {
    return t("explain.save", { piece: thePiece(move.piece) });
  }

  for (const square of threatenedBefore) {
    if (square === move.from) continue;
    if (threatenedAfter.has(square)) continue;
    const rescued = before.get(square);
    if (rescued) return t("explain.guard", { piece: thePiece(rescued.type) });
  }

  if (move.captured) {
    const ours = PIECE_VALUE[move.piece];
    const theirs = PIECE_VALUE[move.captured];
    if (theirs > ours) return t("explain.winMat", { piece: thePiece(move.captured) });
    if (theirs === ours && move.piece !== "p") {
      return t("explain.trade", { give: thePiece(move.piece), take: thePiece(move.captured) });
    }
    return t("explain.capture", { piece: thePiece(move.captured) });
  }

  const attacks = after.moves({ square: move.to, verbose: true }).filter((m) => m.captured);
  attacks.sort((a, b) => PIECE_VALUE[b.captured] - PIECE_VALUE[a.captured]);
  const threat = attacks[0];
  if (threat && PIECE_VALUE[threat.captured] >= 5) {
    return t("explain.threatQ", { piece: thePiece(threat.captured) });
  }
  if (threat && PIECE_VALUE[threat.captured] >= 3) {
    return t("explain.threat", { piece: thePiece(threat.captured) });
  }

  if ((move.piece === "n" || move.piece === "b") && move.from[1] === backRank) {
    if (isCenterSquare(move.to) || isWideCenter(move.to)) {
      return t("explain.devCenter", { piece: thePiece(move.piece) });
    }
    return t("explain.dev", { piece: thePiece(move.piece) });
  }

  if (move.piece === "p") {
    if (isCenterSquare(move.to)) return t("explain.pawnCenter");
    if (Math.abs(Number(move.to[1]) - Number(move.from[1])) === 2) {
      return t("explain.pawnTwo");
    }
    if (move.to[0] === "c" || move.to[0] === "f") {
      return t("explain.pawnDiag");
    }
    return t("explain.pawn");
  }

  if (move.piece === "r") {
    const file = move.to[0];
    const pawnsOnFile = SQUARES.some((sq) => sq[0] === file && after.get(sq)?.type === "p");
    if (!pawnsOnFile) return t("explain.rookOpen");
    return t("explain.rook");
  }

  if (move.piece === "q") {
    if (isCenterSquare(move.to) || isWideCenter(move.to)) {
      return t("explain.queenCenter");
    }
    return t("explain.queen");
  }

  if (move.piece === "k") return t("explain.king");

  if (hint?.scoreType === "mate" && hint.score > 0) return t("explain.huntMate");
  if (typeof hint?.score === "number" && hint.scoreType === "cp" && hint.score < -80) {
    return t("explain.defend");
  }
  return t("explain.solid");
}

const ARROW_GREEN = "#8ec85a";

const SKILL_ELO = {
  1: 1350,
  2: 1450,
  3: 1550,
  4: 1650,
  5: 1750,
  6: 1850,
  7: 2000,
  8: 2150,
};

function engineLabelText(skill) {
  return `Stockfish ${t(`engine.${skill}`)} · ${SKILL_ELO[skill]} Elo`;
}

function localizeSan(san) {
  if (getLang() === "en") return san;
  if (san.startsWith("O-O-O")) return `0-0-0${san.slice(5)}`;
  if (san.startsWith("O-O")) return `0-0${san.slice(3)}`;
  return san.replace(/^[NBRQK]/, (letter) => ({ N: "C", B: "A", R: "T", Q: "D", K: "R" }[letter]));
}

function tryHint(hint) {
  if (!hint?.uci) return { played: null, after: null };
  const move = uciToMove(hint.uci);
  const after = new Chess(state.game.fen());
  const played = after.move({
    from: move.from,
    to: move.to,
    promotion: move.promotion || "q",
  });
  return { played: played || null, after: played ? after : null };
}

function playedFromHint(hint) {
  return tryHint(hint).played;
}

function hintSan(hint) {
  const played = playedFromHint(hint);
  return played ? localizeSan(played.san) : hint?.uci || "";
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
    if (info.score > 0) return t("eval.mateIn", { n: info.score });
    if (info.score < 0) return t("eval.mateIn", { n: Math.abs(info.score) });
    return t("eval.mate");
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
  if (!move) return t("hints.move");
  if (move.san.startsWith("O-O-O")) return t("headline.castleLong");
  if (move.san.startsWith("O-O")) return t("headline.castle");
  const piece = pieceName(move.piece);
  if (move.promotion) {
    return t("headline.promo", { piece, promo: pieceName(move.promotion), to: move.to });
  }
  if (move.captured) return t("headline.capture", { piece, to: move.to });
  return t("headline.move", { piece, to: move.to });
}

function pieceIcon(move, color) {
  if (!move) return "";
  if (move.san.startsWith("O-O")) return `pieces/${color}K.svg`;
  const type = (move.piece || "p").toUpperCase();
  return `pieces/${color}${type}.svg`;
}

function uciFromVerbose(move) {
  return move.from + move.to + (move.promotion || "");
}

function shuffle(list) {
  const items = [...list];
  for (let i = items.length - 1; i > 0; i -= 1) {
    const j = Math.floor(Math.random() * (i + 1));
    [items[i], items[j]] = [items[j], items[i]];
  }
  return items;
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
  if (pool.length < HINT_POOL_SIZE) {
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
  const ranked = pool.slice(0, HINT_POOL_SIZE);
  state.hintBestScore = ranked.length ? hintScore(ranked[0]) : -Infinity;
  const pages = [];
  for (let i = 0; i < ranked.length; i += HINTS_PER_PAGE) {
    pages.push(...shuffle(ranked.slice(i, i + HINTS_PER_PAGE)));
  }
  return pages;
}

function hintPageCount() {
  return Math.max(1, Math.ceil(state.hintPool.length / HINTS_PER_PAGE));
}

function visibleHints() {
  const start = state.hintPage * HINTS_PER_PAGE;
  return state.hintPool.slice(start, start + HINTS_PER_PAGE);
}

function syncHintNav() {
  const canUse = playerIsSideToMove() && !state.busy && !state.game.game_over() && !state.kingSpeaking;
  const lastPage = hintPageCount() - 1;
  const canLoadMore = canUse && state.hintPool.length > HINTS_PER_PAGE && state.hintsUnlocked < lastPage;
  if (els.moreHints) {
    els.moreHints.textContent = canLoadMore
      ? t("hints.more")
      : t("hints.range", {
        from: state.hintPage * HINTS_PER_PAGE + 1,
        to: Math.min((state.hintPage + 1) * HINTS_PER_PAGE, state.hintPool.length) || HINTS_PER_PAGE,
      });
    els.moreHints.disabled = !canLoadMore;
  }
  if (els.prevHints) {
    els.prevHints.disabled = !canUse || state.hintPage === 0;
  }
  if (els.nextHints) {
    els.nextHints.disabled = !canUse || state.hintPage >= state.hintsUnlocked || state.hintPage >= lastPage;
  }
}

function showHintPage(page) {
  const lastPage = hintPageCount() - 1;
  const cap = Math.min(state.hintsUnlocked, lastPage);
  state.hintPage = Math.max(0, Math.min(page, cap));
  renderHints();
  if (state.aids.moves) showHintArrows(null, { reveal: true });
}

function clearHints() {
  state.hints = [];
  state.hintPool = [];
  state.hintPage = 0;
  state.hintsUnlocked = 0;
  state.hintBestScore = -Infinity;
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

function isSquareDefended(game, square, byColor) {
  const piece = game.get(square);
  if (!piece || piece.color !== byColor) return false;
  const clone = new Chess();
  if (!clone.load(game.fen())) return false;
  clone.remove(square);
  const enemy = byColor === "w" ? "b" : "w";
  if (!clone.put({ type: "q", color: enemy }, square)) return false;
  const parts = clone.fen().split(" ");
  parts[1] = byColor;
  parts[3] = "-";
  if (!clone.load(parts.join(" "))) return false;
  return clone.moves({ verbose: true, legal: false }).some(
    (move) => move.to === square && move.captured && move.from !== square
  );
}

function capturesFromSquare(game, fromSquare, attackerColor) {
  const parts = game.fen().split(" ");
  parts[1] = attackerColor;
  parts[3] = "-";
  const clone = new Chess();
  if (!clone.load(parts.join(" "))) return [];
  return clone.moves({ square: fromSquare, verbose: true, legal: false }).filter((move) => move.captured);
}

function worstImmediateLoss(game, defenderColor) {
  if (game.in_checkmate() && game.turn() === defenderColor) return "k";
  const attacker = defenderColor === "w" ? "b" : "w";
  const parts = game.fen().split(" ");
  parts[1] = attacker;
  const clone = new Chess();
  if (!clone.load(parts.join(" "))) return null;
  let worstType = null;
  let worstVal = 0;
  clone.moves({ verbose: true }).forEach((move) => {
    if (!move.captured) return;
    const val = PIECE_VALUE[move.captured] || 0;
    const cheaper = val > (PIECE_VALUE[move.piece] || 0);
    const hanging = !isSquareDefended(game, move.to, defenderColor);
    if ((hanging || cheaper) && val > worstVal) {
      worstVal = val;
      worstType = move.captured;
    }
  });
  return worstType;
}

function hintDanger(hint) {
  if (state.hintPage === 0) return null;
  const { played, after } = tryHint(hint);
  if (!played || !after) return null;
  if (after.in_checkmate()) return lossPhrase("k");
  const drop = Number.isFinite(state.hintBestScore) ? state.hintBestScore - hintScore(hint) : 0;
  const loss = worstImmediateLoss(after, state.playerColor);
  const tooWeak = drop >= 150 || (hint.scoreType === "mate" && hint.score < 0);
  if (loss && (tooWeak || PIECE_VALUE[loss] >= 3 || drop >= 80)) return lossPhrase(loss);
  if (tooWeak) return t("loss.weak");
  return null;
}

function pieceOnSquare(type, square) {
  return `${t(`plain.${type || "x"}`)} ${t("prep.in")} <strong>${square}</strong>`;
}

function joinIt(items) {
  const and = t("conj.and");
  if (!items.length) return "";
  if (items.length === 1) return items[0];
  if (items.length === 2) return `${items[0]} ${and} ${items[1]}`;
  return `${items.slice(0, -1).join(", ")} ${and} ${items[items.length - 1]}`;
}

function hitsFromSquare(game, square, attackerColor, defenderColor) {
  return capturesFromSquare(game, square, attackerColor)
    .filter((hit) => {
      const victim = game.get(hit.to);
      return victim && victim.color === defenderColor && hit.captured !== "k";
    })
    .sort((a, b) => (PIECE_VALUE[b.captured] || 0) - (PIECE_VALUE[a.captured] || 0));
}

function threatsFromMove(after, move, defenderColor) {
  const attacker = move.color;
  const hits = hitsFromSquare(after, move.to, attacker, defenderColor);
  if (move.san.startsWith("O-O-O")) {
    hits.push(...hitsFromSquare(after, move.color === "w" ? "d1" : "d8", attacker, defenderColor));
  } else if (move.san.startsWith("O-O")) {
    hits.push(...hitsFromSquare(after, move.color === "w" ? "f1" : "f8", attacker, defenderColor));
  }
  const seen = new Set();
  return hits.filter((hit) => {
    if (seen.has(hit.to)) return false;
    seen.add(hit.to);
    return true;
  });
}

function ourSingular(type) {
  return t(`our.${type || "p"}`);
}

function ourPlural(type) {
  return t(`ours.${type || "p"}`);
}

function squareList(squares) {
  return joinIt(squares.map((square) => `${t("prep.in")} <strong>${square}</strong>`));
}

function ourHitsPhrase(hits) {
  const order = ["q", "r", "b", "n", "p", "k"];
  const groups = new Map();
  hits.forEach((hit) => {
    const type = hit.captured;
    if (!groups.has(type)) groups.set(type, []);
    groups.get(type).push(hit.to);
  });
  const parts = [];
  for (const type of order) {
    const squares = groups.get(type);
    if (!squares?.length) continue;
    parts.push(
      squares.length === 1
        ? `${ourSingular(type)} ${squareList(squares)}`
        : `${ourPlural(type)} ${squareList(squares)}`
    );
  }
  return joinIt(parts);
}

function hangingAdvice(hits) {
  if (!hits.length) return "";
  const phrase = ourHitsPhrase(hits);
  if (hits.length === 1) return t("king.hang1", { phrase });
  return t("king.hangN", { phrase });
}

function capturedOn(move) {
  if (String(move.flags || "").includes("e")) return move.to[0] + move.from[1];
  return move.to;
}

function opponentLead(move) {
  if (move.san.startsWith("O-O-O")) return t("king.castleLong");
  if (move.san.startsWith("O-O")) return t("king.castle");
  if (move.captured) {
    return t("king.capture", {
      mover: pieceOnSquare(move.piece, move.to),
      victim: `${ourSingular(move.captured)} ${squareList([capturedOn(move)])}`,
    });
  }
  return t("king.play", { mover: pieceOnSquare(move.piece, move.to) });
}

function narrateOpponentMove(before, move, after) {
  if (move.san.includes("#")) {
    return t("king.mateOpp");
  }
  const hits = threatsFromMove(after, move, state.playerColor).slice(0, 3);
  const labels = ourHitsPhrase(hits);
  let lead = opponentLead(move);
  if (labels) {
    lead += move.captured
      ? `. ${t("king.nowThreats", { list: labels })}`
      : ` ${t("king.andThreats", { list: labels })}`;
  } else {
    lead += ".";
  }
  if (move.san.includes("+")) lead += ` ${t("king.check")}`;

  const hanging = hits.filter((hit) => !isSquareDefended(after, hit.to, state.playerColor));
  const parts = [lead];
  const warning = hangingAdvice(hanging);
  if (warning) parts.push(warning);
  return `${joinTalk(parts)}<br><span class="king-closer">${t("king.closer")}</span>`;
}

function narratePlayerMove(before, move, after) {
  const san = localizeSan(move.san);
  const parts = [t("king.chose", { san })];
  if (after.in_checkmate()) {
    parts.push(t("king.youMate"));
    return joinTalk(parts);
  }
  const loss = worstImmediateLoss(after, state.playerColor);
  if (loss === "q") parts.push(t("king.hangQueen"));
  else if (loss === "r") parts.push(t("king.hangRook"));
  else if (loss === "n") parts.push(t("king.hangKnight"));
  else if (loss === "b") parts.push(t("king.hangBishop"));
  else parts.push(explainMove(before, move, after, null));
  parts.push(t("king.seeReply"));
  return joinTalk(parts);
}

function hangingSquares(game, color) {
  return playerPiecesUnderAttack(game, color).filter((square) => {
    const piece = game.get(square);
    if (!piece || piece.type === "k") return false;
    return !isSquareDefended(game, square, color);
  });
}

function allThreatenedSquares() {
  const opponent = state.playerColor === "w" ? "b" : "w";
  return [
    ...playerPiecesUnderAttack(state.game, state.playerColor),
    ...playerPiecesUnderAttack(state.game, opponent),
  ];
}

function pieceSquareLabel(square) {
  const piece = state.game.get(square);
  if (!piece) return square;
  return `${namedPiece(piece.type)} ${t("prep.in")} ${square}`;
}

function boldItems(items) {
  return items.map((item) => `<strong>${escapeHtml(item)}</strong>`).join(", ");
}

function kingTurnAdvice() {
  const opponent = state.playerColor === "w" ? "b" : "w";
  const ours = hangingSquares(state.game, state.playerColor).map(pieceSquareLabel);
  const theirs = hangingSquares(state.game, opponent).map(pieceSquareLabel);
  const parts = [];
  if (ours.length) {
    parts.push(t("king.ourHanging", { list: boldItems(ours) }));
  }
  if (theirs.length) {
    parts.push(t("king.theirHanging", { list: boldItems(theirs) }));
  }
  if (!ours.length && !theirs.length) {
    parts.push(t("king.noneHanging"));
  }
  parts.push(t("turn.make"));
  return parts.join(" ");
}

function clearBoardAids() {
  state.aids.moves = true;
  state.aids.threats = false;
  if (state.board) {
    state.board.setArrows([]);
    if (Date.now() >= state.pipUntil) state.board.setDanger([]);
  }
  syncAidButtons();
}

function syncAidButtons() {
  els.aidMoves?.classList.toggle("is-on", state.aids.moves);
  els.aidThreats?.classList.toggle("is-on", state.aids.threats);
}

function paintThreatPips() {
  state.board.setDanger(allThreatenedSquares());
}

function squaresAttackedByMovedPiece(move) {
  if (!move) return [];
  const attacker = move.color;
  const seen = new Set();
  const addFrom = (from) => {
    capturesFromSquare(state.game, from, attacker).forEach((hit) => {
      const victim = state.game.get(hit.to);
      if (!victim || victim.color === attacker) return;
      seen.add(hit.to);
    });
  };
  addFrom(move.to);
  if (move.san.startsWith("O-O-O")) addFrom(move.color === "w" ? "d1" : "d8");
  else if (move.san.startsWith("O-O")) addFrom(move.color === "w" ? "f1" : "f8");
  return [...seen];
}

function paintActiveThreats() {
  if (state.aids.threats) {
    paintThreatPips();
    return;
  }
  if (Date.now() < state.pipUntil) {
    state.board.setDanger(state.flashSquares);
    return;
  }
  state.board.setDanger([]);
}

function showAid(kind) {
  if (kind === "moves") {
    state.aids.moves = !state.aids.moves;
    if (state.aids.moves) showHintArrows(null, { reveal: true });
    else state.board.setArrows([]);
    syncAidButtons();
    return;
  }
  clearTimeout(state.aidTimer);
  state.aids.threats = true;
  paintThreatPips();
  if (state.aids.moves) showHintArrows(null, { reveal: true });
  syncAidButtons();
  const token = (state.aidToken += 1);
  state.aidTimer = setTimeout(() => {
    if (state.aidToken !== token) return;
    state.aids.threats = false;
    paintActiveThreats();
    syncAidButtons();
  }, 5000);
}

function flashThreatenedPieces(move) {
  const token = (state.flashToken += 1);
  state.flashSquares = squaresAttackedByMovedPiece(move);
  state.pipUntil = Date.now() + 3000;
  paintActiveThreats();
  setTimeout(() => {
    if (state.flashToken !== token) return;
    state.pipUntil = 0;
    state.flashSquares = [];
    paintActiveThreats();
  }, 3000);
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
  startOpening: document.getElementById("start-opening"),
  openingLine: document.getElementById("opening-line"),
  moves: document.getElementById("moves"),
  playerName: document.getElementById("player-name"),
  turnBanner: document.getElementById("turn-banner"),
  overlay: document.getElementById("overlay"),
  overlayTitle: document.getElementById("overlay-title"),
  overlayText: document.getElementById("overlay-text"),
  promo: document.getElementById("promo"),
  kingNote: document.getElementById("king-note"),
  moreHints: document.getElementById("btn-more-hints"),
  prevHints: document.getElementById("btn-prev-hints"),
  nextHints: document.getElementById("btn-next-hints"),
  aidMoves: document.getElementById("btn-aid-moves"),
  aidThreats: document.getElementById("btn-aid-threats"),
};

const state = {
  game: new Chess(),
  engine: new Engine(),
  board: null,
  playerColor: "w",
  skill: 1,
  busy: false,
  hints: [],
  hintPool: [],
  hintPage: 0,
  hintsUnlocked: 0,
  hintBestScore: -Infinity,
  openingPly: 0,
  startOpening: START_OPENINGS[0],
  aids: { moves: true, threats: false },
  aidTimer: null,
  aidToken: 0,
  flashToken: 0,
  pipUntil: 0,
  flashSquares: [],
  lastKingTalk: "",
  speakToken: 0,
  kingSpeaking: false,
  pendingHintReveal: false,
  gameId: 0,
  kingReplay: null,
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

function openingAside() {
  const info = describePosition(state.game.history(), state.game);
  if (!info?.title || info.title === t("opening.choose")) return "";
  if (info.variant) return ` ${t("king.inOpeningVar", { title: info.title, variant: info.variant })}`;
  return ` ${t("king.inOpening", { title: info.title })}`;
}

function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

function wrapKingWords(root) {
  [...root.childNodes].forEach((node) => {
    if (node.nodeType === Node.ELEMENT_NODE) {
      wrapKingWords(node);
      return;
    }
    if (node.nodeType !== Node.TEXT_NODE) return;
    const parts = (node.textContent || "").split(/(\s+)/);
    if (parts.length === 1 && !parts[0].trim()) return;
    const frag = document.createDocumentFragment();
    parts.forEach((part) => {
      if (!part) return;
      if (/^\s+$/.test(part)) {
        frag.appendChild(document.createTextNode(part));
        return;
      }
      const word = document.createElement("span");
      word.className = "king-word";
      word.textContent = part;
      frag.appendChild(word);
    });
    node.replaceWith(frag);
  });
}

function paintKingNote(note, html) {
  if (!els.kingNote) return 0;
  const source = document.createElement("div");
  if (html) source.innerHTML = note;
  else source.textContent = note;
  wrapKingWords(source);
  els.kingNote.innerHTML = source.innerHTML;
  const words = [...els.kingNote.querySelectorAll(".king-word")];
  let delay = 0;
  words.forEach((word) => {
    word.style.animationDelay = `${delay}ms`;
    delay += /[.!?…]$/.test(word.textContent.trim()) ? 520 : 175;
  });
  return delay + 900;
}

function clearKingTalk() {
  state.speakToken += 1;
  state.kingSpeaking = false;
  state.lastKingTalk = "";
  els.kingNote?.classList.remove("is-typing");
  if (els.kingNote) els.kingNote.innerHTML = "";
}

function waitingForHints() {
  return playerIsSideToMove() && !state.game.game_over() && (state.kingSpeaking || !state.hintPool.length);
}

function loadingHintCard(rank) {
  const color = state.playerColor === "w" ? "w" : "b";
  const ghosts = [
    { piece: "n", to: "d4" },
    { piece: "p", to: "d5" },
    { piece: "b", to: "f5" },
    { piece: "q", to: "d2" },
    { piece: "r", to: "e1" },
    { piece: "p", to: "e4" },
  ];
  const ghost = ghosts[rank - 1];
  const letter = { n: "N", b: "B", q: "Q", r: "R" }[ghost.piece];
  const san = localizeSan(ghost.piece === "p" ? ghost.to : letter + ghost.to);
  return `
    <button class="hint-btn is-loading" disabled>
      <span class="hint-rank">${rank}</span>
      <span class="hint-move-row">
        <img class="hint-icon" src="pieces/${color}${ghost.piece.toUpperCase()}.svg" alt="">
        <span class="hint-main">${san}</span>
      </span>
      <span class="hint-calc">${t("hints.loading")}</span>
    </button>`;
}

function revealHintsIfReady() {
  if (state.kingSpeaking) return;
  renderHints();
  if (state.pendingHintReveal && state.hintPool.length && playerIsSideToMove()) {
    els.hints.classList.remove("is-reveal");
    void els.hints.offsetWidth;
    els.hints.classList.add("is-reveal");
    state.pendingHintReveal = false;
    if (state.aids.moves) showHintArrows(null, { reveal: true });
  } else if (!state.hintPool.length) {
    els.hints.classList.remove("is-reveal");
    state.board?.setArrows([]);
  }
}

async function speakKing(note, { calculating = false, html = false } = {}) {
  const token = (state.speakToken += 1);
  const text = note || "";
  state.kingSpeaking = Boolean(text);
  state.pendingHintReveal = Boolean(text);
  els.hints.classList.remove("is-reveal");
  els.kingNote?.classList.remove("is-typing");
  if (!text) {
    if (els.kingNote) els.kingNote.innerHTML = "";
    state.kingSpeaking = false;
    revealHintsIfReady();
    return;
  }
  renderHints();
  const duration = paintKingNote(text, html);
  await sleep(duration);
  if (token !== state.speakToken) return;
  state.kingSpeaking = false;
  revealHintsIfReady();
}

function kingComment(beforeFen, played, asOpponent) {
  const before = new Chess(beforeFen);
  const after = new Chess(state.game.fen());
  return asOpponent
    ? narrateOpponentMove(before, played, after)
    : narratePlayerMove(before, played, after);
}

function renderHistory() {
  const history = state.game.history({ verbose: true });
  let html = "";
  for (let i = 0; i < history.length; i += 2) {
    const n = i / 2 + 1;
    const white = localizeSan(history[i].san);
    const black = history[i + 1] ? localizeSan(history[i + 1].san) : "";
    html += `<div class="move-row"><span class="move-n">${n}.</span><span>${white}</span><span>${black}</span></div>`;
  }
  els.moves.innerHTML = html || `<div class="moves-empty">${t("moves.empty")}</div>`;
  els.moves.scrollTop = els.moves.scrollHeight;
}

function syncBoard(options = {}) {
  const fen = state.game.fen();
  state.board.setPosition(fen);
  state.board.setTurn(state.game.turn(), state.playerColor);
  state.board.setDests({});
  state.board.setInteractive(false);
  state.board.setCheck(state.game.in_check() ? kingSquare(state.game, state.game.turn()) : null);
  if (state.aids.moves) showHintArrows(null, { reveal: true });
  else if (!options.keepArrows) state.board.setArrows([]);
  if (state.aids.threats) {
    paintThreatPips();
  } else if (Date.now() < state.pipUntil) {
    state.board.setDanger(state.flashSquares);
  } else {
    state.board.setDanger([]);
  }
}

function renderHints() {
  if (waitingForHints()) {
    state.hints = [];
    els.hints.innerHTML = Array.from({ length: HINTS_PER_PAGE }, (_, i) => loadingHintCard(i + 1)).join("");
    syncHintNav();
    state.board?.setArrows([]);
    return;
  }
  state.hints = visibleHints();
  const buttons = [];
  for (let i = 0; i < HINTS_PER_PAGE; i += 1) {
    const hint = state.hints[i];
    const rank = i + 1;
    if (!hint) {
      buttons.push(`
        <button class="hint-btn empty" disabled>
          <span class="hint-rank">${rank}</span>
          <span class="hint-main">—</span>
        </button>`);
      continue;
    }
    const played = playedFromHint(hint);
    const san = played ? localizeSan(played.san) : hint.uci;
    const icon = played ? pieceIcon(played, state.game.turn()) : "";
    const danger = hintDanger(hint);
    buttons.push(`
      <button class="hint-btn${danger ? " is-danger" : ""}" data-index="${i}" type="button">
        <span class="hint-rank">${rank}</span>
        <span class="hint-move-row">
          ${icon ? `<img class="hint-icon" src="${icon}" alt="">` : ""}
          <span class="hint-main">${san}</span>
        </span>
        ${danger ? `<span class="hint-warn">${escapeHtml(danger)}</span>` : ""}
      </button>`);
  }
  els.hints.innerHTML = buttons.join("");
  syncHintNav();
}

function showHintArrows(index = null, { reveal = false, onlyActive = false } = {}) {
  if (!reveal && !state.aids.moves) {
    state.board.setArrows([]);
    return;
  }
  if (!state.hints.length) {
    state.board.setArrows([]);
    return;
  }
  state.board.setArrows(
    state.hints
      .map((hint, i) => {
        const active = index !== null && i === index;
        if (onlyActive && !active) return null;
        const to = hint.uci.slice(2, 4);
        return {
          from: hint.uci.slice(0, 2),
          to,
          color: ARROW_GREEN,
          opacity: active || onlyActive ? 0.9 : 0.64,
          width: active || onlyActive ? "0.2" : "0.15",
          label: active ? hintSan(hint) : "",
          labelColor: "#1f1f1f",
        };
      })
      .filter(Boolean)
  );
}

function youLabel() {
  return state.playerColor === "w" ? t("you.white") : t("you.black");
}

async function refreshHints() {
  const gameId = state.gameId;
  if (state.game.game_over() || !playerIsSideToMove()) {
    clearHints();
    renderHints();
    state.board.setArrows([]);
    return;
  }
  const fen = state.game.fen();
  clearHints();
  renderHints();
  setStatus(t("turn.you"), `${youLabel()}.`, "think");
  try {
    const lines = await state.engine.analyze(fen, {
      depth: 11,
      multipv: 12,
    });
    if (gameId !== state.gameId || state.game.fen() !== fen) return;
    state.hintPool = fillHintPool(lines, state.game);
    state.hintPage = 0;
    state.hintsUnlocked = 0;
    revealHintsIfReady();
    setStatus(t("turn.you"), `${youLabel()}. ${t("turn.make")}`, "play");
  } catch (err) {
    if (err.message === "aborted") return;
    console.error(err);
    if (gameId !== state.gameId || state.game.fen() !== fen) return;
    clearHints();
    renderHints();
    speakKing(t("king.analyzeFail"), { calculating: false });
    setStatus(t("turn.you"), t("king.busy"), "info");
  }
}

function endMessage() {
  if (state.game.in_checkmate()) {
    const userWon = state.game.turn() !== state.playerColor;
    return userWon
      ? [t("end.mateWinTitle"), t("end.mateWin"), "win"]
      : [t("end.mateLoseTitle"), t("end.mateLose"), "lose"];
  }
  if (state.game.in_stalemate()) return [t("end.staleTitle"), t("end.stale"), "draw"];
  if (state.game.in_draw()) return [t("end.drawTitle"), t("end.draw"), "draw"];
  return [t("end.overTitle"), "", "info"];
}

function finishGame() {
  state.busy = false;
  clearHints();
  renderHints();
  syncBoard();
  const [title, text, kind] = endMessage();
  setStatus(title, text, kind);
  state.kingReplay = { type: "end" };
  speakKing(`${title} ${text}`.trim(), { calculating: false });
}

function waitAtLeast(ms, startedAt = Date.now()) {
  const left = ms - (Date.now() - startedAt);
  if (left <= 0) return Promise.resolve();
  return new Promise((resolve) => setTimeout(resolve, left));
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
  setStatus(t("turn.opp"), t("king.waiting"), "think");
  state.kingReplay = { type: "waiting" };
  if (!state.kingSpeaking) speakKing(t("king.waiting"));
  const fen = state.game.fen();
  const startedAt = Date.now();
  try {
    const skill = Number(state.skill);
    const { uci } = await state.engine.play(fen, {
      skill,
      movetime: 250 + skill * 90,
    });
    await waitAtLeast(6000, startedAt);
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
      state.board.setPosition(state.game.fen());
      flashThreatenedPieces(played);
      const talk = kingComment(fen, played, true);
      state.lastKingTalk = talk;
      state.kingReplay = { type: "opponent", beforeFen: fen, afterFen: state.game.fen(), move: { ...played } };
      renderHints();
      await sleep(1500);
      if (gameId !== state.gameId) return;
      speakKing(talk, { calculating: true, html: true });
    }
  } catch (err) {
    if (err.message === "aborted" || gameId !== state.gameId) return;
    console.error(err);
    setStatus(t("error"), t("king.engineFail"), "lose");
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
  state.board.setPosition(state.game.fen());
  flashThreatenedPieces(played);
  renderHistory();
  if (state.game.game_over()) {
    finishGame();
    return;
  }
  state.kingReplay = { type: "waiting" };
  speakKing(t("king.waiting"));
  state.busy = false;
  await computerMove();
}

function openPromo(from, to) {
  state.pendingPromo = { from, to };
  const color = state.playerColor === "w" ? "w" : "b";
  els.promo.innerHTML = ["q", "r", "b", "n"]
    .map(
      (p) =>
        `<button type="button" data-piece="${p}" title="${pieceName(p)}">
           <img src="pieces/${color}${p.toUpperCase()}.svg" alt="${pieceName(p)}">
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
  if (!btn || btn.disabled || state.busy || els.hints.classList.contains("loading")) return;
  const hint = state.hints[Number(btn.dataset.index)];
  if (!hint) return;
  const move = uciToMove(hint.uci);
  applyUserMove(move.from, move.to, move.promotion);
});

els.hints.addEventListener("pointerover", (event) => {
  const btn = event.target.closest(".hint-btn");
  if (!btn || btn.disabled) return;
  const index = Number(btn.dataset.index);
  if (state.aids.moves) showHintArrows(index, { reveal: true });
  else showHintArrows(index, { reveal: true, onlyActive: true });
});

els.hints.addEventListener("pointerout", (event) => {
  if (event.relatedTarget && els.hints.contains(event.relatedTarget)) return;
  if (state.aids.moves) showHintArrows(null, { reveal: true });
  else state.board.setArrows([]);
});

els.moreHints.addEventListener("click", () => {
  if (els.moreHints.disabled) return;
  const lastPage = hintPageCount() - 1;
  if (state.hintsUnlocked >= lastPage) return;
  state.hintsUnlocked += 1;
  showHintPage(state.hintsUnlocked);
});

els.prevHints.addEventListener("click", () => {
  if (els.prevHints.disabled) return;
  showHintPage(state.hintPage - 1);
});

els.nextHints.addEventListener("click", () => {
  if (els.nextHints.disabled) return;
  showHintPage(state.hintPage + 1);
});

function openingOptionLabel(opening) {
  const name = t(`opening.${opening.id}`);
  const n = opening.sans.length;
  if (!n) return name;
  return t("opening.moves", { name, n });
}

function fillSkillSelect() {
  const select = els.skill;
  if (!select) return;
  const current = select.value || "1";
  select.innerHTML = [1, 2, 3, 4, 5, 6, 7, 8]
    .map((n) => `<option value="${n}"${String(n) === current ? " selected" : ""}>${t(`skill.${n}`)}</option>`)
    .join("");
}

function replayKingTalk() {
  const replay = state.kingReplay;
  if (!replay) return;
  if (replay.type === "opening") {
    speakKing(startOpeningTalk(), { calculating: playerIsSideToMove() });
    return;
  }
  if (replay.type === "waiting") {
    speakKing(t("king.waiting"));
    return;
  }
  if (replay.type === "opponent" && replay.move && replay.beforeFen) {
    const before = new Chess(replay.beforeFen);
    const after = new Chess(replay.afterFen || state.game.fen());
    speakKing(narrateOpponentMove(before, replay.move, after), { calculating: true, html: true });
    return;
  }
  if (replay.type === "resign") {
    speakKing(t("king.resign"));
    return;
  }
  if (replay.type === "end") {
    const [title, text] = endMessage();
    speakKing(`${title} ${text}`.trim());
    return;
  }
  if (replay.type === "boot") speakKing(t("king.boot"), { calculating: true });
}

function applyLanguage() {
  applyStaticI18n();
  fillSkillSelect();
  fillStartOpeningSelect();
  if (els.engineLabel) els.engineLabel.textContent = engineLabelText(state.skill);
  if (els.openingLine) {
    els.openingLine.textContent = state.startOpening?.sans?.length
      ? formatOpeningLine(state.game)
      : t("opening.startPos");
  }
  renderHistory();
  renderHints();
  replayKingTalk();
}

function fillStartOpeningSelect() {
  const select = els.startOpening;
  if (!select) return;
  const current = select.value || "start";
  select.innerHTML = START_OPENINGS.map((opening) => (
    `<option value="${opening.id}"${opening.id === current ? " selected" : ""}>${openingOptionLabel(opening)}</option>`
  )).join("");
}

function formatOpeningLine(game) {
  const history = game.history({ verbose: true });
  if (!history.length) return t("opening.startPos");
  let text = "";
  for (let i = 0; i < history.length; i += 2) {
    const n = i / 2 + 1;
    const white = localizeSan(history[i].san);
    const black = history[i + 1] ? localizeSan(history[i + 1].san) : "";
    text += `${n}.${white}${black ? ` ${black}` : ""} `;
  }
  return text.trim();
}

function selectedStartOpening() {
  const id = els.startOpening?.value || "start";
  return START_OPENINGS.find((opening) => opening.id === id) || START_OPENINGS[0];
}

function applyStartOpening() {
  const opening = selectedStartOpening();
  state.startOpening = opening;
  for (const san of opening.sans) {
    if (!state.game.move(san)) break;
  }
  state.openingPly = state.game.history().length;
  const hist = state.game.history({ verbose: true });
  const last = hist[hist.length - 1];
  state.board.setLastMove(last ? last.from : null, last ? last.to : null);
  if (els.openingLine) {
    els.openingLine.textContent = opening.sans.length
      ? formatOpeningLine(state.game)
      : t("opening.startPos");
  }
}

function startOpeningTalk() {
  const opening = state.startOpening;
  const title = opening?.id && opening.id !== "start"
    ? t(`opening.${opening.id}`)
    : "";
  const start = title ? t("king.startNamed", { title }) : t("king.start");
  const next = playerIsSideToMove() ? t("king.yourMove") : t("king.waitTurn");
  return `${start} ${next}`;
}

function pickRandomStartOpening() {
  const playable = START_OPENINGS.filter((opening) => opening.sans.length);
  return playable[Math.floor(Math.random() * playable.length)] || START_OPENINGS[0];
}

function startFirstVisitGame() {
  const opening = pickRandomStartOpening();
  const color = Math.random() < 0.5 ? "w" : "b";
  if (els.skill) els.skill.value = "1";
  state.skill = 1;
  if (els.startOpening && opening) els.startOpening.value = opening.id;
  startGame(color);
}

function startGame(playerColor = state.playerColor) {
  state.gameId += 1;
  state.speakToken += 1;
  state.kingSpeaking = false;
  state.engine.stop();
  state.game.reset();
  state.playerColor = playerColor;
  state.skill = Number(els.skill.value);
  state.busy = false;
  clearHints();
  clearTimeout(state.aidTimer);
  state.aidToken += 1;
  state.flashToken += 1;
  state.board.setFlash([]);
  state.pipUntil = 0;
  state.flashSquares = [];
  state.lastKingTalk = "";
  clearBoardAids();
  state.pendingPromo = null;
  els.promo.hidden = true;
  els.engineLabel.textContent = engineLabelText(state.skill);
  state.board.setOrientation(playerColor === "w" ? "white" : "black");
  applyStartOpening();
  renderHints();
  renderHistory();
  syncBoard({ keepArrows: true });
  setStatus(
    playerIsSideToMove() ? t("turn.you") : t("turn.opp"),
    youLabel(),
    "play"
  );
  const talk = startOpeningTalk();
  state.lastKingTalk = talk;
  state.kingReplay = { type: "opening" };
  speakKing(talk, { calculating: playerIsSideToMove() });
  computerMove();
}

function undoFullTurn() {
  if (state.busy || state.game.history().length <= state.openingPly) return;
  state.gameId += 1;
  state.engine.stop();
  state.game.undo();
  if (state.game.turn() !== state.playerColor && state.game.history().length > state.openingPly) {
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
  setStatus(t("end.resignTitle"), t("end.resign"), "lose");
  state.kingReplay = { type: "resign" };
  speakKing(t("king.resign"), { calculating: false });
  state.board.setInteractive(false);
});
els.skill.addEventListener("change", () => {
  state.skill = Number(els.skill.value);
  els.engineLabel.textContent = engineLabelText(state.skill);
});
els.startOpening.addEventListener("change", () => startGame(state.playerColor));
els.aidMoves.addEventListener("click", () => showAid("moves"));
els.aidThreats.addEventListener("click", () => showAid("threats"));

state.board = new Board(els.boardRoot, {
  onMove: (from, to) => applyUserMove(from, to),
});

applyStaticI18n();
fillSkillSelect();
fillStartOpeningSelect();
setStatus(t("status.loading"), t("status.boot"), "think");
state.kingReplay = { type: "boot" };
speakKing(t("king.boot"), { calculating: true });
els.hints.innerHTML = "";
renderHints();

Promise.all([
  state.engine.ready,
  loadOpenings().catch((err) => console.error("Libro aperture:", err)),
])
  .then(() => startFirstVisitGame())
  .catch((err) => {
    console.error(err);
    setStatus(t("error"), t("error.stockfish"), "lose");
  });
