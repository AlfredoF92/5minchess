import { Chess, SQUARES } from "./chess.min.js";
import { Engine } from "./engine.js?v=20260822elo12";
import { Board } from "./board.js?v=20260825sel";
import { loadOpenings, describePosition, START_OPENINGS } from "./openings.js";
import { applyStaticI18n, getLang, t } from "./i18n.js?v=20260826card3";

const PIECE_VALUE = { p: 1, n: 3, b: 3, r: 5, q: 9, k: 0 };
const HINT_LAYOUT_KEY = "5minchess.hintLayout";
const TRAIN_MODE_KEY = "5minchess.trainingMode";
const AUTO_CONTINUE_KEY = "5minchess.autoContinue";
const HINT_LAYOUTS = {
  "6x1": { perPage: 6, pages: 1 },
  "4x1": { perPage: 4, pages: 1 },
  "6x2": { perPage: 6, pages: 2 },
  "4x2": { perPage: 4, pages: 2 },
  "4x3": { perPage: 4, pages: 3 },
};
const CLOCK_KEY = "5minchess.moveClock";
const ROUND_EVAL_KEY = "5minchess.roundEval";
const STORY_ICONS_KEY = "5minchess.pieceCards";
const WAR_KNIGHT_DIR = "immagini-stile-war/cavallonero";
const WAR_PAWN_DIR = "immagini-stile-war/pedonennero";
const WAR_BISHOP_DIR = "immagini-stile-war/alfierennero";
const WAR_ROOK_DIR = "immagini-stile-war/torrenera";
const WAR_QUEEN_DIR = "immagini-stile-war/reginanera";
const WAR_KING_DIR = "immagini-stile-war/renero";
const WAR_CASTLE_DIR = "immagini-stile-war/arrocconero";
const WAR_KNIGHT_ART = {
  captureP: { file: "Cavallo Nero cattura Pedone Bianco.png", title: "art.knight.captureP" },
  captureR: { file: "Cavallo Nero cattura Torre Bianca.png", title: "art.knight.captureR" },
  captureN: { file: "Cavallo Nero cattura Cavallo.png", title: "art.knight.captureN" },
  captureB: { file: "Cavallo Nero cattura Alfiere.png", title: "art.knight.captureB" },
  captureQ: { file: "Cavallo Nero Cattura Regina.png", title: "art.knight.captureQ" },
  check: { file: "Cavallo Nero Fa scacco al RE.png", title: "art.knight.check" },
};
const WAR_PAWN_ART = {
  captureP: { file: "Pedone Nero cattura Pedone Bianco.png", title: "art.pawn.captureP" },
  captureR: { file: "Pedone Nero cattura Torre Bianca.png", title: "art.pawn.captureR" },
  captureN: { file: "Pedone Nero cattura Cavallo.png", title: "art.pawn.captureN" },
  captureB: { file: "Pedone Nero cattura Alfiere.png", title: "art.pawn.captureB" },
  captureQ: { file: "Pedone Nero Cattura Regina.png", title: "art.pawn.captureQ" },
  check: { file: "Pedone Nero Fa scacco al RE.png", title: "art.pawn.check" },
};
const WAR_BISHOP_ART = {
  captureP: { file: "Alfiere Nero cattura Pedone Bianco.png", title: "art.bishop.captureP" },
  captureR: { file: "Alfiere Nero cattura Torre Bianca.png", title: "art.bishop.captureR" },
  captureN: { file: "Alfiere Nero cattura Cavallo.png", title: "art.bishop.captureN" },
  captureB: { file: "Alfiere Nero cattura Alfiere.png", title: "art.bishop.captureB" },
  captureQ: { file: "Alfiere Nero Cattura Regina.png", title: "art.bishop.captureQ" },
  check: { file: "Alfiere Nero Fa scacco al RE.png", title: "art.bishop.check" },
};
const WAR_ROOK_ART = {
  captureP: { file: "Torre Nera cattura Pedone Bianco.png", title: "art.rook.captureP" },
  captureR: { file: "Torre Nera cattura Torre Bianca.png", title: "art.rook.captureR" },
  captureN: { file: "Torre Nera cattura Cavallo.png", title: "art.rook.captureN" },
  captureB: { file: "Torre Nera cattura Alfiere.png", title: "art.rook.captureB" },
  captureQ: { file: "Torre Nera Cattura Regina.png", title: "art.rook.captureQ" },
  check: { file: "Torre Nera Fa scacco al RE.png", title: "art.rook.check" },
};
const WAR_QUEEN_ART = {
  captureP: { file: "Regina Nera cattura Pedone Bianco.png", title: "art.queen.captureP" },
  captureR: { file: "Regina Nera cattura Torre Bianca.png", title: "art.queen.captureR" },
  captureN: { file: "Regina Nera cattura Cavallo.png", title: "art.queen.captureN" },
  captureB: { file: "Regina Nera cattura Alfiere.png", title: "art.queen.captureB" },
  captureQ: { file: "Regina Nera Cattura Regina.png", title: "art.queen.captureQ" },
  check: { file: "Regina Nera Fa scacco al RE.png", title: "art.queen.check" },
};
const WAR_KING_ART = {
  captureP: { file: "Re Nero cattura Pedone Bianco.png", title: "art.king.captureP" },
  captureR: { file: "Re Nero cattura Torre Bianca.png", title: "art.king.captureR" },
  captureN: { file: "Re Nero cattura Cavallo.png", title: "art.king.captureN" },
  captureB: { file: "Re Nero cattura Alfiere.png", title: "art.king.captureB" },
  captureQ: { file: "Re Nero Cattura Regina.png", title: "art.king.captureQ" },
  check: { file: "Re Nero Fa scacco al RE.png", title: "art.king.check" },
};
const WAR_W_KNIGHT_DIR = "immagini-stile-war/cavallobianco";
const WAR_W_PAWN_DIR = "immagini-stile-war/pedonebianco";
const WAR_W_BISHOP_DIR = "immagini-stile-war/alfierobianco";
const WAR_W_ROOK_DIR = "immagini-stile-war/torrebianca";
const WAR_W_QUEEN_DIR = "immagini-stile-war/reginabianca";
const WAR_W_KING_DIR = "immagini-stile-war/rebianco";
const WAR_W_KNIGHT_ART = {
  captureP: { file: "Cavallo Bianco cattura Pedone Nero.png", title: "art.wknight.captureP" },
  captureR: { file: "Cavallo Bianco cattura Torre Nera.png", title: "art.wknight.captureR" },
  captureN: { file: "Cavallo Bianco cattura Cavallo.png", title: "art.wknight.captureN" },
  captureB: { file: "Cavallo Bianco cattura Alfiere.png", title: "art.wknight.captureB" },
  captureQ: { file: "Cavallo Bianco Cattura Regina.png", title: "art.wknight.captureQ" },
  check: { file: "Cavallo Bianco Fa scacco al RE.png", title: "art.wknight.check" },
};
const WAR_W_PAWN_ART = {
  captureP: { file: "Pedone Bianco cattura Pedone Nero.png", title: "art.wpawn.captureP" },
  captureR: { file: "Pedone Bianco cattura Torre Nera.png", title: "art.wpawn.captureR" },
  captureN: { file: "Pedone Bianco cattura Cavallo.png", title: "art.wpawn.captureN" },
  captureB: { file: "Pedone Bianco cattura Alfiere.png", title: "art.wpawn.captureB" },
  captureQ: { file: "Pedone Bianco Cattura Regina.png", title: "art.wpawn.captureQ" },
  check: { file: "Pedone Bianco Fa scacco al RE.png", title: "art.wpawn.check" },
};
const WAR_W_BISHOP_ART = {
  captureP: { file: "Alfiere Bianco cattura Pedone Nero.png", title: "art.wbishop.captureP" },
  captureR: { file: "Alfiere Bianco cattura Torre Nera.png", title: "art.wbishop.captureR" },
  captureN: { file: "Alfiere Bianco cattura Cavallo.png", title: "art.wbishop.captureN" },
  captureB: { file: "Alfiere Bianco cattura Alfiere.png", title: "art.wbishop.captureB" },
  captureQ: { file: "Alfiere Bianco Cattura Regina.png", title: "art.wbishop.captureQ" },
  check: { file: "Alfiere Bianco Fa scacco al RE.png", title: "art.wbishop.check" },
};
const WAR_W_ROOK_ART = {
  captureP: { file: "Torre Bianca cattura Pedone Nero.png", title: "art.wrook.captureP" },
  captureR: { file: "Torre Bianca cattura Torre Nera.png", title: "art.wrook.captureR" },
  captureN: { file: "Torre Bianca cattura Cavallo.png", title: "art.wrook.captureN" },
  captureB: { file: "Torre Bianca cattura Alfiere.png", title: "art.wrook.captureB" },
  check: { file: "Torre Bianca Fa scacco al RE.png", title: "art.wrook.check" },
};
const WAR_W_QUEEN_ART = {
  captureP: { file: "Regina Bianca cattura Pedone Nero.png", title: "art.wqueen.captureP" },
  captureR: { file: "Regina Bianca cattura Torre Nera.png", title: "art.wqueen.captureR" },
  captureN: { file: "Regina Bianca cattura Cavallo.png", title: "art.wqueen.captureN" },
  captureB: { file: "Regina Bianca cattura Alfiere.png", title: "art.wqueen.captureB" },
  captureQ: { file: "Regina Bianca Cattura Regina.png", title: "art.wqueen.captureQ" },
  check: { file: "Regina Bianca Fa scacco al RE.png", title: "art.wqueen.check" },
};
const WAR_W_KING_ART = {
  captureP: { file: "Re Bianco cattura Pedone Nero.png", title: "art.wking.captureP" },
  captureR: { file: "Re Bianco cattura Torre Nera.png", title: "art.wking.captureR" },
  captureN: { file: "Re Bianco cattura Cavallo.png", title: "art.wking.captureN" },
  captureB: { file: "Re Bianco cattura Alfiere.png", title: "art.wking.captureB" },
  captureQ: { file: "Re Bianco Cattura Regina.png", title: "art.wking.captureQ" },
};
const CLOCK_OPTIONS = [0, 10, 30, 45, 60];
const CLOCK_AUTO_BEST = new Set([10]);
const HINT_RECALC_MS = 8000;

function readHintLayout() {
  try {
    const saved = localStorage.getItem(HINT_LAYOUT_KEY);
    if (HINT_LAYOUTS[saved]) return saved;
  } catch {
    /* ignore */
  }
  return "6x1";
}

function hintLayout() {
  return HINT_LAYOUTS[state.hintLayout] || HINT_LAYOUTS["6x1"];
}

function hintsPerPage() {
  return hintLayout().perPage;
}

function hintPoolSize() {
  const layout = hintLayout();
  return layout.perPage * layout.pages;
}

function readMoveClock() {
  try {
    const n = Number(localStorage.getItem(CLOCK_KEY));
    if (CLOCK_OPTIONS.includes(n)) return n;
  } catch {
    /* ignore */
  }
  return 0;
}

function readTrainingMode() {
  try {
    return localStorage.getItem(TRAIN_MODE_KEY) === "1";
  } catch {
    return false;
  }
}

function readAutoContinue() {
  try {
    return localStorage.getItem(AUTO_CONTINUE_KEY) === "1";
  } catch {
    return false;
  }
}

function readRoundEval() {
  try {
    return localStorage.getItem(ROUND_EVAL_KEY) === "1";
  } catch {
    return false;
  }
}

function readStoryIcons() {
  try {
    return localStorage.getItem(STORY_ICONS_KEY) !== "0";
  } catch {
    return true;
  }
}

function moveClockSec() {
  return CLOCK_OPTIONS.includes(state.moveClockSec) ? state.moveClockSec : 0;
}

function clockPlaysBest() {
  return CLOCK_AUTO_BEST.has(moveClockSec());
}

const MOVE_CLOCK_DELAY_MS = 2000;

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

function talkPiece(type) {
  return getLang() === "en" ? t(`piece.${type || "p"}`).toLowerCase() : t(`plain.${type || "p"}`);
}

function isFianchettoTo(color, square) {
  return color === "w" ? square === "g2" || square === "b2" : square === "g7" || square === "b7";
}

function isBackRank(color, square) {
  return square[1] === (color === "w" ? "1" : "8");
}

function hangingSquaresOf(game, color) {
  return playerPiecesUnderAttack(game, color).filter((square) => {
    const piece = game.get(square);
    if (!piece || piece.type === "k") return false;
    return !isSquareDefended(game, square, color);
  });
}

function fileOf(square) {
  return square.charCodeAt(0) - 97;
}

function rankOf(square) {
  return Number(square[1]);
}

function mkSq(file, rank) {
  if (file < 0 || file > 7 || rank < 1 || rank > 8) return null;
  return `${String.fromCharCode(97 + file)}${rank}`;
}

function withTurn(game, color) {
  const parts = game.fen().split(" ");
  parts[1] = color;
  parts[3] = "-";
  const clone = new Chess();
  if (!clone.load(parts.join(" "))) return null;
  return clone;
}

function piecesOf(game, color, type) {
  const out = [];
  for (const square of SQUARES) {
    const piece = game.get(square);
    if (!piece || piece.color !== color) continue;
    if (type && piece.type !== type) continue;
    out.push({ square, type: piece.type });
  }
  return out;
}

function isEndgame(game) {
  return piecesOf(game, "w").concat(piecesOf(game, "b")).filter((p) => p.type !== "p").length <= 10;
}

function rayBetween(a, b) {
  const df = fileOf(b) - fileOf(a);
  const dr = rankOf(b) - rankOf(a);
  if (!df && !dr) return null;
  if (df && dr && Math.abs(df) !== Math.abs(dr)) return null;
  const sf = Math.sign(df);
  const sr = Math.sign(dr);
  const out = [];
  let f = fileOf(a) + sf;
  let r = rankOf(a) + sr;
  while (f !== fileOf(b) || r !== rankOf(b)) {
    const square = mkSq(f, r);
    if (!square) return null;
    out.push(square);
    f += sf;
    r += sr;
  }
  return out;
}

function rayClear(game, a, b) {
  const mid = rayBetween(a, b);
  return Boolean(mid && mid.every((square) => !game.get(square)));
}

function pieceAttacksSquare(game, from, to) {
  const piece = game.get(from);
  if (!piece || from === to) return false;
  const df = fileOf(to) - fileOf(from);
  const dr = rankOf(to) - rankOf(from);
  const adf = Math.abs(df);
  const adr = Math.abs(dr);
  if (piece.type === "n") return (adf === 1 && adr === 2) || (adf === 2 && adr === 1);
  if (piece.type === "k") return adf <= 1 && adr <= 1;
  if (piece.type === "p") {
    const dir = piece.color === "w" ? 1 : -1;
    return adr === 1 && adf === 1 && dr === dir;
  }
  const diag = adf === adr && adf > 0;
  const ortho = Boolean(df) !== Boolean(dr);
  if (piece.type === "b") return diag && rayClear(game, from, to);
  if (piece.type === "r") return ortho && rayClear(game, from, to);
  if (piece.type === "q") return (diag || ortho) && rayClear(game, from, to);
  return false;
}

function checkingSquares(game, defenderColor) {
  const king = kingSquare(game, defenderColor);
  if (!king) return [];
  const attacker = defenderColor === "w" ? "b" : "w";
  return piecesOf(game, attacker).filter((p) => pieceAttacksSquare(game, p.square, king)).map((p) => p.square);
}

function pieceAttacks(game, from) {
  const piece = game.get(from);
  if (!from || !piece) return [];
  const hits = [];
  for (const square of SQUARES) {
    const victim = game.get(square);
    if (!victim || victim.color === piece.color) continue;
    if (pieceAttacksSquare(game, from, square)) hits.push({ to: square, captured: victim.type });
  }
  return hits;
}

function pieceBehind(game, from, mid, color) {
  const ray = rayBetween(from, mid);
  if (!ray || !rayClear(game, from, mid)) return null;
  const sf = Math.sign(fileOf(mid) - fileOf(from));
  const sr = Math.sign(rankOf(mid) - rankOf(from));
  let f = fileOf(mid) + sf;
  let r = rankOf(mid) + sr;
  while (f >= 0 && f <= 7 && r >= 1 && r <= 8) {
    const square = mkSq(f, r);
    const hit = game.get(square);
    if (hit) return hit.color === color ? { square, type: hit.type } : null;
    f += sf;
    r += sr;
  }
  return null;
}

function newPinOrSkewer(after, move, us) {
  if (!"brq".includes(move.piece)) return null;
  const enemy = us === "w" ? "b" : "w";
  for (const victim of piecesOf(after, enemy)) {
    if (victim.square === move.to) continue;
    if (!rayBetween(move.to, victim.square) || !rayClear(after, move.to, victim.square)) continue;
    if (!pieceAttacksSquare(after, move.to, victim.square)) continue;
    const behind = pieceBehind(after, move.to, victim.square, enemy);
    if (!behind) continue;
    const frontVal = PIECE_VALUE[victim.type] || 0;
    const backVal = PIECE_VALUE[behind.type] || 0;
    if (victim.type === "k" || (behind.type === "k" && frontVal >= 3)) return "pin";
    if ((victim.type === "q" || victim.type === "k") && backVal >= 3 && backVal < frontVal + 9) return "skewer";
    if (frontVal >= 5 && behind.type === "k") return "pin";
  }
  return null;
}

function isPassedPawn(game, square, color) {
  const pawn = game.get(square);
  if (!pawn || pawn.type !== "p" || pawn.color !== color) return false;
  const dir = color === "w" ? 1 : -1;
  const file = fileOf(square);
  for (let rank = rankOf(square) + dir; rank >= 1 && rank <= 8; rank += dir) {
    for (let df = -1; df <= 1; df += 1) {
      const sq = mkSq(file + df, rank);
      const hit = sq && game.get(sq);
      if (hit && hit.type === "p" && hit.color !== color) return false;
    }
  }
  return true;
}

function passedPawns(game, color) {
  return piecesOf(game, color, "p").filter((p) => isPassedPawn(game, p.square, color));
}

function squareInFront(square, color) {
  return mkSq(fileOf(square), rankOf(square) + (color === "w" ? 1 : -1));
}

function isIsolatedPawn(game, square, color) {
  const file = fileOf(square);
  return !piecesOf(game, color, "p").some((p) => Math.abs(fileOf(p.square) - file) === 1);
}

function undevelopedMinors(game, us) {
  const homes = us === "w" ? ["b1", "g1", "c1", "f1"] : ["b8", "g8", "c8", "f8"];
  return homes.filter((square) => {
    const piece = game.get(square);
    return piece && piece.color === us && (piece.type === "n" || piece.type === "b");
  });
}

function kingHasCastled(game, us) {
  const king = kingSquare(game, us);
  return Boolean(king && king[0] !== "e");
}

function enemyCastledShort(game, enemy) {
  const king = kingSquare(game, enemy);
  return Boolean(king && (king[0] === "g" || king[0] === "h"));
}

function openFiles(game) {
  return [..."abcdefgh"].filter((file) => fileIsOpen(game, file));
}

function mobility(game, square, color) {
  const clone = withTurn(game, color);
  if (!clone || !clone.get(square)) return 0;
  return clone.moves({ square, verbose: true }).length;
}

function slidersSeeing(game, us, target) {
  if (!target) return [];
  return piecesOf(game, us).filter((p) => "brq".includes(p.type) && pieceAttacksSquare(game, p.square, target));
}

function attackersOf(game, square, color) {
  return piecesOf(game, color).filter((p) => p.square !== square && pieceAttacksSquare(game, p.square, square));
}

function kingHasLuft(game, color) {
  const king = kingSquare(game, color);
  if (!king) return true;
  const dir = color === "w" ? 1 : -1;
  const rank = rankOf(king) + dir;
  return [-1, 0, 1].some((df) => {
    const sq = mkSq(fileOf(king) + df, rank);
    return sq && !game.get(sq);
  });
}

function touchesEnemyChain(game, square, enemy) {
  const pawns = [];
  for (let df = -1; df <= 1; df += 1) {
    for (let dr = -1; dr <= 1; dr += 1) {
      if (!df && !dr) continue;
      const sq = mkSq(fileOf(square) + df, rankOf(square) + dr);
      const hit = sq && game.get(sq);
      if (hit && hit.type === "p" && hit.color === enemy) pawns.push(sq);
    }
  }
  for (let i = 0; i < pawns.length; i += 1) {
    for (let j = i + 1; j < pawns.length; j += 1) {
      if (Math.abs(fileOf(pawns[i]) - fileOf(pawns[j])) <= 1 && Math.abs(rankOf(pawns[i]) - rankOf(pawns[j])) <= 1) {
        return true;
      }
    }
  }
  return false;
}

function evalDrop(hint) {
  if (!hint || hint.synthetic || !Number.isFinite(state.hintBestScore)) return 0;
  return state.hintBestScore - hintScore(hint);
}

const LIFE_FEEDBACK_KEYS = {
  gain: ["life.gain.1", "life.gain.2", "life.gain.3", "life.gain.4", "life.gain.5", "life.gain.6", "life.gain.7", "life.gain.8", "life.gain.9", "life.gain.10"],
  hold: ["life.hold.1", "life.hold.2", "life.hold.3", "life.hold.4", "life.hold.5", "life.hold.6", "life.hold.7", "life.hold.8", "life.hold.9", "life.hold.10"],
  lose05: ["life.lose05.1", "life.lose05.2", "life.lose05.3", "life.lose05.4", "life.lose05.5", "life.lose05.6", "life.lose05.7", "life.lose05.8", "life.lose05.9", "life.lose05.10"],
  lose10: ["life.lose10.1", "life.lose10.2", "life.lose10.3", "life.lose10.4", "life.lose10.5", "life.lose10.6", "life.lose10.7", "life.lose10.8", "life.lose10.9", "life.lose10.10"],
  lose15: ["life.lose15.1", "life.lose15.2", "life.lose15.3", "life.lose15.4", "life.lose15.5", "life.lose15.6", "life.lose15.7", "life.lose15.8", "life.lose15.9", "life.lose15.10"],
  lose20: ["life.lose20.1", "life.lose20.2", "life.lose20.3", "life.lose20.4", "life.lose20.5", "life.lose20.6", "life.lose20.7", "life.lose20.8", "life.lose20.9", "life.lose20.10"],
  lose25: ["life.lose25.1", "life.lose25.2", "life.lose25.3", "life.lose25.4", "life.lose25.5", "life.lose25.6", "life.lose25.7", "life.lose25.8", "life.lose25.9", "life.lose25.10"],
};

const OPP_ADV_KEYS = [
  "opp.adv.1", "opp.adv.2", "opp.adv.3", "opp.adv.4", "opp.adv.5",
  "opp.adv.6", "opp.adv.7", "opp.adv.8", "opp.adv.9", "opp.adv.10",
];

const OPPONENT_FEEDBACK_KEYS = {
  best: ["ofb.1", "ofb.2", "ofb.3", "ofb.4", "ofb.5"],
  excellent: ["ofb.6", "ofb.7", "ofb.8", "ofb.9"],
  strong: ["ofb.10", "ofb.11", "ofb.12", "ofb.13"],
  good: ["ofb.14", "ofb.15", "ofb.16", "ofb.17"],
  inaccuracy: ["ofb.18", "ofb.19", "ofb.20", "ofb.21"],
  mistake: ["ofb.22", "ofb.23", "ofb.24", "ofb.25"],
  blunder: ["ofb.26", "ofb.27", "ofb.28", "ofb.29"],
  mateMiss: ["ofb.30", "ofb.31"],
  mateRisk: ["ofb.32", "ofb.33"],
};

const FEEDBACK_REACT = {
  best: "🤩",
  excellent: "🤩",
  strong: "👌",
  good: "👍",
  inaccuracy: "🤔",
  mistake: "🤔",
  blunder: "😱",
  mateMiss: "🙈",
  mateRisk: "😠",
  oppBest: "😭",
  heartHalf: "😭",
  heartOne: "😭",
  heartMany: "😭",
};

const FEEDBACK_REACT_LOW = {
  best: "👍",
  excellent: "👍",
  strong: "👌",
  good: "👌",
  inaccuracy: "🤔",
  mistake: "🤔",
  blunder: "🤔",
  mateMiss: "🤔",
};

const FEEDBACK_LEGEND = [
  "best", "excellent", "strong", "good",
  "inaccuracy", "mistake", "blunder", "mateMiss", "mateRisk", "oppBest",
  "heartHalf", "heartOne", "heartMany",
];

const SEE_REPLY_KEYS = [
  "wait.1", "wait.2", "wait.3", "wait.4", "wait.5",
  "wait.6", "wait.7", "wait.8", "wait.9", "wait.10",
];

function hintForPlayedMove(from, to, promotion, passedHint) {
  if (passedHint?.uci) return passedHint;
  const uci = `${from}${to}${promotion || ""}`;
  return (state.hintPool || []).find((hint) => hint.uci === uci)
    || (state.hints || []).find((hint) => hint.uci === uci)
    || null;
}

function poolHasOurMate(pool) {
  return (pool || []).some((hint) => !hint.synthetic && hint.scoreType === "mate" && hint.score > 0);
}

function feedbackBand(hint, bestScore, pool) {
  if (!hint || hint.synthetic || !Number.isFinite(bestScore)) return "good";
  if (hint.scoreType === "mate" && hint.score < 0) return "mateRisk";
  if (poolHasOurMate(pool) && !(hint.scoreType === "mate" && hint.score > 0)) return "mateMiss";
  const drop = bestScore - hintScore(hint);
  if (drop <= 0) return "best";
  if (drop <= 20) return "excellent";
  if (drop <= 50) return "strong";
  if (drop <= 90) return "good";
  if (drop <= 160) return "inaccuracy";
  if (drop <= 300) return "mistake";
  return "blunder";
}

function pickKey(keys, lastProp) {
  if (!keys?.length) return "";
  const others = keys.length > 1 ? keys.filter((key) => key !== state[lastProp]) : keys;
  const pick = others[Math.floor(Math.random() * others.length)];
  state[lastProp] = pick;
  return pick;
}

function pickLifeFeedbackKey(deltaHalves) {
  let bucket = "hold";
  if (deltaHalves > 0) bucket = "gain";
  else if (deltaHalves === -1) bucket = "lose05";
  else if (deltaHalves === -2) bucket = "lose10";
  else if (deltaHalves === -3) bucket = "lose15";
  else if (deltaHalves === -4) bucket = "lose20";
  else if (deltaHalves <= -5) bucket = "lose25";
  return pickKey(LIFE_FEEDBACK_KEYS[bucket], "lastLifeFeedbackKey");
}

function rankReactBand(kind) {
  if (kind === "best") return "best";
  if (kind === "worst") return "inaccuracy";
  return "good";
}

function kingMoraleLow() {
  return kingLifeHalves() <= 3;
}

function reactEmoji(band) {
  if (!band) return "";
  if (kingMoraleLow() && FEEDBACK_REACT_LOW[band]) return FEEDBACK_REACT_LOW[band];
  return FEEDBACK_REACT[band] || "";
}

function renderKingLegend() {
  const root = els.kingLegend;
  if (!root) return;
  root.innerHTML = FEEDBACK_LEGEND.map((band) => (
    `<span class="legend-item${state.lastFeedbackBand === band ? " is-on" : ""}" data-band="${band}">
      <span class="legend-emoji">${reactEmoji(band)}</span>
      <span class="legend-label">${t(`legend.${band}`)}</span>
    </span>`
  )).join("");
}

function hideKingReactEmoji() {
  if (!els.kingReact) return;
  els.kingReact.hidden = true;
  els.kingReact.textContent = "";
  els.kingReact.classList.remove("is-pop");
}

function showKingReact(band) {
  const emoji = reactEmoji(band);
  state.lastFeedbackBand = band || "";
  renderKingLegend();
  clearTimeout(state.reactTimer);
  if (!els.kingReact) return;
  if (!emoji) {
    hideKingReactEmoji();
    return;
  }
  els.kingReact.hidden = false;
  els.kingReact.textContent = emoji;
  els.kingReact.classList.remove("is-pop");
  void els.kingReact.offsetWidth;
  els.kingReact.classList.add("is-pop");
  state.reactTimer = setTimeout(hideKingReactEmoji, 8000);
}

function clearKingReact() {
  clearTimeout(state.reactTimer);
  state.lastFeedbackBand = "";
  hideKingReactEmoji();
  renderKingLegend();
}

function pickOpponentKeyFromEval(beforeScore, afterScore) {
  if (!Number.isFinite(beforeScore) || !Number.isFinite(afterScore)) {
    return pickKey(OPPONENT_FEEDBACK_KEYS.strong, "lastOppFeedbackKey");
  }
  const swing = beforeScore - afterScore;
  let band = "good";
  if (afterScore < -80000) band = "best";
  else if (swing >= -20) band = "best";
  else if (swing >= -50) band = "excellent";
  else if (swing >= -90) band = "strong";
  else if (swing >= -160) band = "good";
  else if (swing >= -250) band = "inaccuracy";
  else if (swing >= -400) band = "mistake";
  else band = "blunder";
  return pickKey(OPPONENT_FEEDBACK_KEYS[band] || OPPONENT_FEEDBACK_KEYS.good, "lastOppFeedbackKey");
}

function pickOpponentFeedbackKey(hint, bestScore, pool) {
  if (!hint || hint.synthetic) {
    return pickKey(OPPONENT_FEEDBACK_KEYS.mistake, "lastOppFeedbackKey");
  }
  return pickKey(
    OPPONENT_FEEDBACK_KEYS[feedbackBand(hint, bestScore, pool)] || OPPONENT_FEEDBACK_KEYS.good,
    "lastOppFeedbackKey"
  );
}

function opponentRankKind(feedbackKey) {
  const band = Object.keys(OPPONENT_FEEDBACK_KEYS).find((name) =>
    OPPONENT_FEEDBACK_KEYS[name].includes(feedbackKey)
  );
  if (band === "best" || band === "excellent" || band === "mateRisk") return "best";
  if (band === "inaccuracy" || band === "mistake" || band === "blunder" || band === "mateMiss") return "worst";
  return "normal";
}

function pickSeeReplyKey() {
  return pickKey(SEE_REPLY_KEYS, "lastSeeReplyKey");
}

function playerFeedbackTalk(lifeKey, replyKey, rankKind = "normal") {
  const opener = t(
    rankKind === "best" ? "fb.open.best" : rankKind === "worst" ? "fb.open.worst" : "fb.open.normal"
  );
  const body = t(lifeKey);
  const wait = replyKey ? t(replyKey) : "";
  const line = `<strong>${escapeHtml(opener)}</strong> ${escapeHtml(body)}`.trim();
  return wait ? `${line}<br><br>${escapeHtml(wait)}` : line;
}

async function scorePlayedUci(fen, uci) {
  try {
    const lines = await state.engine.analyze(fen, { depth: 15, multipv: 12 });
    const pool = (lines || []).filter((line) => line?.uci);
    const best = pool.length ? Math.max(...pool.map(hintScore)) : -Infinity;
    const hint = pool.find((line) => line.uci === uci) || null;
    return { hint, best, pool };
  } catch {
    return { hint: null, best: -Infinity, pool: [] };
  }
}

function evalHolds(hint, margin = 80) {
  if (!hint || hint.synthetic) return false;
  if (hint.scoreType === "mate" && hint.score > 0) return true;
  return evalDrop(hint) <= margin;
}

function isOnlyHoldingHint(hint) {
  if (!hint?.uci || hint.synthetic) return false;
  const pool = (state.hintPool || []).filter((line) => line?.uci && !line.synthetic);
  if (pool.length < 3) return false;
  const holders = pool.filter((line) => evalHolds(line, 140));
  return holders.length === 1 && holders[0].uci === hint.uci;
}

function pvTakesOn(hint, square) {
  const pv = hint?.pv;
  if (!square || !Array.isArray(pv) || pv.length < 2) return false;
  return pv.slice(1).some((uci) => String(uci).slice(2, 4) === square);
}

function onLongDiagonal(square) {
  const file = fileOf(square);
  const rank = rankOf(square);
  return file === rank - 1 || file + rank === 8;
}

function longDiagOpen(game, square) {
  if (!onLongDiagonal(square)) return false;
  const a1h8 = fileOf(square) === rankOf(square) - 1;
  let pawns = 0;
  for (const sq of SQUARES) {
    if (a1h8 ? fileOf(sq) !== rankOf(sq) - 1 : fileOf(sq) + rankOf(sq) !== 8) continue;
    if (game.get(sq)?.type === "p") pawns += 1;
  }
  return pawns <= 1;
}

function pawnSupports(game, square, color) {
  const file = square.charCodeAt(0) - 97;
  const rank = Number(square[1]);
  const behind = rank + (color === "w" ? -1 : 1);
  if (behind < 1 || behind > 8) return false;
  return [-1, 1].some((df) => {
    const f = file + df;
    if (f < 0 || f > 7) return false;
    const pawn = game.get(`${String.fromCharCode(97 + f)}${behind}`);
    return pawn && pawn.color === color && pawn.type === "p";
  });
}

function enemyPawnKicks(game, square, color) {
  const enemy = color === "w" ? "b" : "w";
  const file = square.charCodeAt(0) - 97;
  const rank = Number(square[1]);
  const ahead = rank + (color === "w" ? 1 : -1);
  if (ahead < 1 || ahead > 8) return false;
  return [-1, 1].some((df) => {
    const f = file + df;
    if (f < 0 || f > 7) return false;
    const pawn = game.get(`${String.fromCharCode(97 + f)}${ahead}`);
    return pawn && pawn.color === enemy && pawn.type === "p";
  });
}

function fileIsOpen(game, file) {
  return !SQUARES.some((sq) => sq[0] === file && game.get(sq)?.type === "p");
}

function opensOwnBishop(before, move, us) {
  if (move.piece !== "p") return false;
  const home = us === "w" ? { c: "c1", f: "f1" } : { c: "c8", f: "f8" };
  const file = move.from[0];
  if (file !== "c" && file !== "f") return false;
  const bishop = before.get(home[file]);
  return Boolean(bishop && bishop.type === "b" && bishop.color === us);
}

function lastOpponentMove(before) {
  const history = before.history({ verbose: true });
  return history[history.length - 1] || null;
}

function eyesEnemyKingSide(game, from, us) {
  if (!from || !game.get(from)) return false;
  const weak = us === "w" ? "f7" : "f2";
  const king = kingSquare(game, us === "w" ? "b" : "w");
  return pieceAttacksSquare(game, from, weak) || Boolean(king && pieceAttacksSquare(game, from, king));
}

function coachLine(before, move, after, hint) {
  const piece = talkPiece(move.piece);
  const square = move.to;
  const target = move.captured ? talkPiece(move.captured) : "";
  const us = before.turn();
  const enemy = us === "w" ? "b" : "w";
  const vars = { piece, square, target };
  const say = (key, extra) => t(key, { ...vars, ...extra });
  const fromBack = isBackRank(us, move.from);
  const toBack = isBackRank(us, move.to);
  const hangBefore = new Set(hangingSquaresOf(before, us));
  const hangAfter = new Set(hangingSquaresOf(after, us));
  const savedSelf = hangBefore.has(move.from) && !hangAfter.has(move.to);
  const rescuedSq = [...hangBefore].find((sq) => sq !== move.from && !hangAfter.has(sq));
  const otherHang = [...hangAfter].find((sq) => sq !== move.to);
  const movedHangs = hangAfter.has(move.to);
  const captureVal = PIECE_VALUE[move.captured] || 0;
  const ourVal = PIECE_VALUE[move.piece] || 0;
  const riskyTake = movedHangs && captureVal <= ourVal && ourVal >= 3;
  const hangPiece = talkPiece(after.get(move.to)?.type || move.piece);
  const last = lastOpponentMove(before);
  const recapture = Boolean(move.captured && last?.captured && last.to === move.to);
  const oldTargets = new Set(pieceAttacks(before, move.from).map((hit) => hit.to));
  const freshHits = pieceAttacks(after, move.to).filter((hit) => !oldTargets.has(hit.to));
  const freshValuable = freshHits.filter((hit) => (PIECE_VALUE[hit.captured] || 0) >= 3);
  const bestFresh = [...freshValuable].sort((a, b) => (PIECE_VALUE[b.captured] || 0) - (PIECE_VALUE[a.captured] || 0))[0];
  const toRank = rankOf(move.to);
  const fromRank = rankOf(move.from);
  const onSeventh = us === "w" ? toRank === 7 : toRank === 2;
  const enemyKing = kingSquare(after, enemy);
  const ourKing = kingSquare(after, us);
  const isCheck = move.san.includes("+") || after.in_check();
  const checkers = isCheck ? checkingSquares(after, enemy) : [];
  const discovered = isCheck && !checkers.includes(move.to);
  const doubleCheck = checkers.length >= 2;
  const replies = after.moves({ verbose: true });
  const forceKing = isCheck && replies.length > 0 && replies.every((reply) => reply.piece === "k");
  const hangEnemyBefore = new Set(hangingSquaresOf(before, enemy));
  const hangEnemyAfter = hangingSquaresOf(after, enemy).filter((sq) => sq !== move.to);
  const newlyLoose = hangEnemyAfter.filter((sq) => !hangEnemyBefore.has(sq));
  const drop = evalDrop(hint);
  const holds = evalHolds(hint, 80);
  const mateScore = hint?.scoreType === "mate" ? hint.score : 0;
  const pinKind = newPinOrSkewer(after, move, us);
  const endgame = isEndgame(after);
  const ourPassersBefore = passedPawns(before, us).map((p) => p.square);
  const ourPassersAfter = passedPawns(after, us);
  const newPasser = ourPassersAfter.find((p) => !ourPassersBefore.includes(p.square));
  const enemyPassers = passedPawns(before, enemy);
  const minorsBefore = undevelopedMinors(before, us);
  const minorsAfter = undevelopedMinors(after, us);
  const seesKingBefore = slidersSeeing(before, us, kingSquare(before, enemy)).map((p) => p.square);
  const seesKingAfter = slidersSeeing(after, us, enemyKing).map((p) => p.square);
  const openedLine = seesKingAfter.some((sq) => sq !== move.to && !seesKingBefore.includes(sq));
  const linedUp = "brq".includes(move.piece) && enemyKing && rayBetween(move.to, enemyKing)
    && rayClear(after, move.to, enemyKing) && !isCheck;
  const homePawnLuft = move.piece === "p" && !move.captured
    && Math.abs(toRank - fromRank) === 1
    && "ahgb".includes(move.from[0])
    && ourKing && isBackRank(us, ourKing)
    && Math.abs(fileOf(ourKing) - fileOf(move.to)) <= 2;

  if (move.san.includes("#")) return say("talk.mate");
  if (move.san.startsWith("O-O-O")) return t("talk.castleLong");
  if (move.san.startsWith("O-O")) return t("talk.castle");
  if (move.promotion) return t("talk.promo", { square, promo: talkPiece(move.promotion) });
  if (String(move.flags).includes("e")) return say("talk.ep");

  if (before.in_check() && !move.captured) {
    if (move.piece === "k") return say("talk.kingSafe");
    return say("talk.block");
  }

  if (savedSelf) return say("talk.save");

  if (move.captured) {
    const replyOnTo = hint?.pv?.[1] && String(hint.pv[1]).slice(2, 4) === move.to;
    if (movedHangs && isCheck && holds && replyOnTo) return say("talk.decoy");
    if (movedHangs && holds && ourVal >= 3 && captureVal < ourVal) return say("talk.sac");
    if (move.piece === "r" && (move.captured === "n" || move.captured === "b") && holds) return say("talk.exchange");
    if (recapture) return say("talk.recapture");
    if (isCheck) return say("talk.checkTake");
    if (newlyLoose.length && captureVal <= 5) {
      const loose = after.get(newlyLoose[0]);
      if (loose) return say("talk.removeDef", { target: talkPiece(loose.type) });
    }
    if (hangEnemyBefore.has(move.to) && captureVal >= 3) return say("talk.takeLoose");
    if (captureVal === ourVal && move.piece !== "p") {
      if (typeof hint?.score === "number" && hint.scoreType === "cp" && hint.score >= 150) return say("talk.simplifyWin");
      if (typeof hint?.score === "number" && hint.scoreType === "cp" && Math.abs(hint.score) <= 40) return say("talk.trade");
      return say("talk.trade");
    }
    if (enemyCastledShort(before, enemy) && "gh".includes(move.to[0]) && (move.piece === "p" || move.captured === "p")) {
      return say("talk.breakCastle");
    }
    if (captureVal > ourVal) return say("talk.takeWin");
    if (move.captured === "p") return say("talk.takePawn");
    if (!movedHangs && !otherHang) return say("talk.takeSolid");
    return say("talk.takePiece");
  }

  if (rescuedSq) {
    const saved = before.get(rescuedSq);
    if (saved) return say("talk.guard", { target: talkPiece(saved.type) });
  }

  const extraCover = playerPiecesUnderAttack(before, us).find((sq) => {
    if (sq === move.from) return false;
    const beforeDefs = attackersOf(before, sq, us).length;
    const afterDefs = attackersOf(after, sq, us).length;
    return beforeDefs >= 1 && afterDefs > beforeDefs;
  });
  if (extraCover) return say("talk.overprotect");

  if (last?.captured && last.to !== move.to && isCheck && pvTakesOn(hint, last.to)) {
    return say("talk.zwischen");
  }

  if (doubleCheck) return say("talk.doubleCheck");
  if (discovered) return say("talk.discover");
  if (forceKing) return say("talk.forceKing");
  if (isCheck && newlyLoose.length) return say("talk.deflect");
  if (isCheck) return say("talk.check");

  if (freshValuable.length >= 2) return say("talk.fork");
  if (pinKind === "pin") return say("talk.pin");
  if (pinKind === "skewer") return say("talk.skewer");
  if (discovered || (openedLine && bestFresh)) return say("talk.discoverAttack");
  const overloaded = freshHits.some((hit, i) => {
    const defs = attackersOf(after, hit.to, enemy);
    if (defs.length !== 1) return false;
    return freshHits.some((other, j) => j !== i && attackersOf(after, other.to, enemy).length === 1
      && attackersOf(after, other.to, enemy)[0].square === defs[0].square);
  });
  if (overloaded) return say("talk.overload");
  if (newlyLoose.length) {
    const loose = after.get(newlyLoose[0]);
    if (loose) return say("talk.removeDef", { target: talkPiece(loose.type) });
  }
  if (bestFresh && PIECE_VALUE[bestFresh.captured] >= 5) {
    return say("talk.threat", { target: talkPiece(bestFresh.captured) });
  }
  const trapped = piecesOf(after, enemy).find((p) => {
    if (p.type === "k" || p.type === "p") return false;
    const attacked = playerPiecesUnderAttack(after, enemy).includes(p.square);
    if (!attacked) return false;
    return after.moves({ square: p.square, verbose: true }).length === 0;
  });
  if (trapped) return say("talk.trap");

  if (!isCheck && mateScore >= 2) return say("talk.setupMate");
  if (mateScore >= 2) return say("talk.threatMate");
  if ((move.piece === "r" || move.piece === "q") && enemyKing && isBackRank(enemy, move.to) && isBackRank(enemy, enemyKing) && !kingHasLuft(after, enemy)) {
    return say("talk.backRank");
  }
  if ((move.piece === "q" || move.piece === "r") && enemyKing) {
    const beforeDist = Math.abs(fileOf(move.from) - fileOf(enemyKing)) + Math.abs(fromRank - rankOf(enemyKing));
    const afterDist = Math.abs(fileOf(move.to) - fileOf(enemyKing)) + Math.abs(toRank - rankOf(enemyKing));
    if (afterDist < beforeDist - 1) return say(intoAttackKey());
  }
  if (openedLine) return say("talk.openHunt");
  if (linedUp) return say("talk.lineUp");

  if (homePawnLuft) return say("talk.luft");
  if (move.piece === "p" && !move.captured && (move.to === (us === "w" ? "h3" : "h6") || move.to === (us === "w" ? "a3" : "a6"))) {
    return say("talk.prophylaxis");
  }

  const ourKingBefore = kingSquare(before, us);
  if (slidersSeeing(before, enemy, ourKingBefore).length > slidersSeeing(after, enemy, ourKing).length) {
    return say(move.piece === "p" ? "talk.closePos" : "talk.closeLines");
  }
  if (move.piece !== "k" && ourKing && rayBetween(move.to, ourKing) && attackersOf(after, ourKing, us).length > attackersOf(before, ourKingBefore, us).length) {
    return say("talk.protectKing");
  }
  if (move.piece === "k" && !before.in_check()) {
    const oldKing = move.from;
    const wasOnPin = piecesOf(before, enemy).some((a) => {
      if (!"brq".includes(a.type)) return false;
      if (!rayBetween(a.square, oldKing) || !rayClear(before, a.square, oldKing)) return false;
      const mid = rayBetween(a.square, oldKing);
      return mid && mid.some((sq) => {
        const hit = before.get(sq);
        return hit && hit.color === us && hit.type !== "k";
      });
    });
    const stillOnPin = piecesOf(after, enemy).some((a) => (
      "brq".includes(a.type) && rayBetween(a.square, move.to) && rayClear(after, a.square, move.to)
    ));
    if (wasOnPin && !stillOnPin) return say("talk.unpin");
  }

  if (!fromBack && toBack && move.piece !== "k") return say(move.piece === "r" ? "talk.defendRook" : "talk.defend");
  if (!move.captured && "qr".includes(move.piece) && Math.abs(toRank - fromRank) >= 2
    && ((us === "w" && toRank < fromRank) || (us === "b" && toRank > fromRank)) && !bestFresh) {
    return say("talk.retreat");
  }

  if (move.piece === "b" && isFianchettoTo(us, move.to) && before.get(us === "w" ? (move.to === "g2" ? "g3" : "b3") : (move.to === "g7" ? "g6" : "b6"))?.type === "p") {
    return say("talk.fianchetto");
  }
  if (move.piece === "b" && isFianchettoTo(us, move.to)) return say("talk.lookout");
  if (move.piece === "n" && pawnSupports(after, move.to, us) && !enemyPawnKicks(after, move.to, us) && ((us === "w" && toRank >= 4) || (us === "b" && toRank <= 5))) {
    return say("talk.outpost");
  }
  if (move.piece === "n" && pawnSupports(after, move.to, us) && !enemyPawnKicks(after, move.to, us)) {
    return say("talk.anchor");
  }
  if (!enemyPawnKicks(after, move.to, us) && ((us === "w" && toRank >= 5) || (us === "b" && toRank <= 4)) && "nb".includes(move.piece)) {
    return say("talk.strongSq");
  }
  if (move.piece === "b" && eyesEnemyKingSide(after, move.to, us)) return say("talk.attackDiag");
  if (move.piece === "b" && longDiagOpen(after, move.to)) return say("talk.longDiag");
  if ((move.piece === "n" || move.piece === "b") && "abgh".includes(move.to[0]) && ((us === "w" && toRank >= 4 && toRank <= 6) || (us === "b" && toRank >= 3 && toRank <= 5))) {
    return say("talk.lookoutPost");
  }

  if (move.piece === "r") {
    const file = move.to[0];
    const ourRooks = piecesOf(after, us, "r");
    const doubled = ourRooks.filter((p) => p.square[0] === file).length >= 2
      && piecesOf(before, us, "r").filter((p) => p.square[0] === file).length < 2;
    const battery = piecesOf(after, us).filter((p) => (p.type === "r" || p.type === "q") && p.square[0] === file).length >= 2
      && piecesOf(before, us).filter((p) => (p.type === "r" || p.type === "q") && p.square[0] === file).length < 2;
    const liftRank = us === "w" ? (toRank === 3 || toRank === 4) : (toRank === 5 || toRank === 6);
    const cutRank = us === "w" ? 6 : 3;
    if (onSeventh) return say("talk.rookSeventh");
    if (doubled) return say("talk.doubleRooks");
    if (battery) return say("talk.battery");
    if (fromBack && liftRank && move.from[0] === file) return say("talk.rookLift");
    if (toRank === cutRank && enemyKing && isBackRank(enemy, enemyKing)) return say("talk.cutKing");
    if (fromBack && toBack) return say("talk.rookConnect");
    if (fileIsOpen(after, file)) {
      const files = openFiles(after);
      return say(files.length === 1 ? "talk.onlyFile" : "talk.rookOpen");
    }
    if (ourPassersAfter.some((p) => p.square[0] === file && (us === "w" ? toRank < rankOf(p.square) : toRank > rankOf(p.square)))) {
      return say("talk.rookBehind");
    }
    return say("talk.rook");
  }

  if (minorsBefore.length === 1 && minorsAfter.length === 0) return say("talk.lastOut");
  if (minorsAfter.length === 0 && kingHasCastled(after, us) && fromBack) return say("talk.finishDev");
  if ((move.piece === "n" || move.piece === "b") && fromBack) {
    if (isCenterSquare(move.to) || isWideCenter(move.to)) return say("talk.devCenter");
    if ("abgh".includes(move.to[0])) return say("talk.devSide");
    if (before.history().length >= 12) return say("talk.idle");
    return say("talk.dev");
  }

  if (move.piece === "p") {
    const blockSq = enemyPassers.map((p) => squareInFront(p.square, enemy)).find((sq) => sq === move.to);
    const promoSq = enemyPassers.find((p) => {
      const goal = enemy === "w" ? 8 : 1;
      return p.square[0] === move.to[0] && toRank === goal;
    });
    if (promoSq) return say("talk.stopPromo");
    if (blockSq) return say("talk.blockPasser");
    if (newPasser) return say("talk.passed");
    if (isCenterSquare(move.to)) return say("talk.pawnCenter");
    const front = squareInFront(move.to, us);
    const facing = front && after.get(front);
    if (facing?.type === "p" && facing.color === enemy) return say("talk.fixPawn");
    if (enemyCastledShort(before, enemy) && "gh".includes(move.from[0]) && (us === "w" ? toRank > fromRank : toRank < fromRank)) {
      return say(move.captured ? "talk.breakCastle" : intoAttackKey());
    }
    if (touchesEnemyChain(before, move.to, enemy) && (move.captured || "cf".includes(move.from[0]))) {
      return say("talk.pawnBreak");
    }
    if (opensOwnBishop(before, move, us)) return say("talk.pawnDiag");
    if (enemyKing && "brq".includes((slidersSeeing(before, enemy, ourKing)[0] || {}).type || "") && !slidersSeeing(after, enemy, ourKing).length) {
      return say("talk.closePos");
    }
    if (Math.abs(toRank - fromRank) === 2) return say("talk.pawnTwo");
    if ((us === "w" && toRank >= 4) || (us === "b" && toRank <= 5)) return say("talk.pawnSpace");
    return say("talk.pawn");
  }

  if (move.piece === "q") {
    if (isCenterSquare(move.to) || isWideCenter(move.to)) return say("talk.queenCenter");
    if (fromBack) return say("talk.dev");
    return say("talk.queen");
  }

  if (move.piece === "k") {
    if (endgame && ((us === "w" && toRank > fromRank) || (us === "b" && toRank < fromRank))) {
      const theirKing = kingSquare(after, enemy);
      if (theirKing) {
        const sameFile = fileOf(move.to) === fileOf(theirKing);
        const sameRank = toRank === rankOf(theirKing);
        const gap = sameFile ? Math.abs(toRank - rankOf(theirKing)) : Math.abs(fileOf(move.to) - fileOf(theirKing));
        if ((sameFile || sameRank) && gap === 2) return say("talk.opposition");
        const closer = Math.abs(fileOf(move.to) - fileOf(theirKing)) + Math.abs(toRank - rankOf(theirKing))
          < Math.abs(fileOf(move.from) - fileOf(theirKing)) + Math.abs(fromRank - rankOf(theirKing));
        if (closer) return say("talk.shoulder");
      }
      return say("talk.activateKing");
    }
    return say("talk.kingSafe");
  }

  const weakHit = freshHits.find((hit) => {
    const victim = after.get(hit.to);
    return victim?.type === "p" && isIsolatedPawn(after, hit.to, enemy);
  });
  if (weakHit) return say("talk.weakPawn");

  if (bestFresh) return say("talk.attack", { target: talkPiece(bestFresh.captured) });
  if (mateScore > 0) return say("talk.huntMate");
  if (isOnlyHoldingHint(hint)) return say("talk.onlyMove");
  if (endgame && !move.captured && !isCheck && evalHolds(hint, 25)) return say("talk.squeeze");
  if (!move.captured && !isCheck && evalHolds(hint, 25) && mobility(after, move.to, us) <= mobility(before, move.from, us) + 1) {
    return say("talk.wait");
  }
  if (fromBack) return say("talk.dev");
  if (mobility(after, move.to, us) > mobility(before, move.from, us) + 1) return say("talk.improve");
  return say("talk.reposition");
}

function intoAttackKey() {
  const keys = ["talk.intoAttack", "talk.intoAttack2", "talk.intoAttack3"];
  return keys[Math.floor(Math.random() * keys.length)];
}

function hintTalk(hint) {
  if (hint?.talk) return hint.talk;
  const { played, after } = tryHint(hint);
  if (!played || !after) return t("talk.solid", { piece: talkPiece("p"), square: hint?.uci?.slice(2, 4) || "" });
  return coachLine(state.game, played, after, hint);
}

function prepareHintTalks() {
  for (const hint of state.hintPool) {
    try {
      hint.talk = hintTalk(hint);
    } catch {
      hint.talk = t("talk.solid", { piece: talkPiece("p"), square: hint?.uci?.slice(2, 4) || "" });
    }
  }
}

async function computeHintPool(game, { movetime = 3000, freezeStand = false } = {}) {
  if (game.game_over()) return [];
  try {
    const lines = await state.engine.analyze(game.fen(), {
      multipv: 12,
      movetime,
    });
    return fillHintPool(lines || [], game, { freezeStand });
  } catch (err) {
    if (err.message === "aborted") throw err;
    return fillHintPool([], game, { freezeStand });
  }
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
const ARROW_GRAY = "#c5c5c5";

const SKILL_LEVELS = {
  1: { elo: 1200, skill: 0, movetime: 350 },
  2: { elo: 1400, skill: 1, movetime: 400 },
  3: { elo: 1600, movetime: 500 },
  4: { elo: 1800, movetime: 600 },
  5: { elo: 2000, movetime: 700 },
  6: { elo: 2200, movetime: 800 },
  7: { elo: 2400, movetime: 900 },
  8: { elo: 2600, movetime: 1000 },
  9: { elo: 0, unlimited: true, movetime: 1200 },
};

function skillSettings(skill) {
  return SKILL_LEVELS[Number(skill)] || SKILL_LEVELS[1];
}

function engineLabelText(skill) {
  const settings = skillSettings(skill);
  return settings.unlimited
    ? `Stockfish ${t("engine.9")}`
    : `Stockfish ${settings.elo} Elo`;
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
  const fen = isTrainHold() && state.trainFen ? state.trainFen : state.game.fen();
  const after = new Chess(fen);
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

const RANK_TIE_CP = 5;

function gapIsCliff(gap, spread, gaps) {
  if (spread <= 30 || gap <= RANK_TIE_CP) return false;
  const pct = gap / spread;
  if (pct >= 0.4) return true;
  if (pct < 0.25 || gaps.length < 2) return false;
  const ordered = [...gaps].sort((a, b) => a - b);
  const median = ordered[Math.floor(ordered.length / 2)];
  return gap >= median * 2;
}

function hintLifeDelta(hint) {
  if (!hint || hint.synthetic) return 0;
  const score = hintScore(hint);
  if (!Number.isFinite(score)) return 0;
  const nowHalves = isTrainHold() && Number.isFinite(state.trainLives) ? state.trainLives : kingLifeHalves();
  const now = displayLifeHalves(nowHalves);
  const game = isTrainHold() && state.trainFen ? new Chess(state.trainFen) : state.game;
  const after = displayLifeHalves(livesFromCp(evalForPlayer(score, game)));
  return after - now;
}

function hintRankMap(pool = state.hintPool) {
  const scored = (pool || []).filter((line) => line && !line.synthetic && Number.isFinite(hintScore(line)));
  const kinds = new Map();
  if (!scored.length) return kinds;
  const items = scored
    .map((hint) => ({ hint, score: hintScore(hint) }))
    .sort((a, b) => b.score - a.score);
  const top = items[0].score;
  const bottom = items[items.length - 1].score;
  const spread = top - bottom;
  const gaps = [];
  for (let i = 1; i < items.length; i += 1) {
    gaps.push(items[i - 1].score - items[i].score);
  }
  const cluster = [0];
  let lastCluster = 0;
  for (let i = 1; i < items.length; i += 1) {
    if (gapIsCliff(gaps[i - 1], spread, gaps)) lastCluster += 1;
    cluster.push(lastCluster);
  }
  items.forEach((item, i) => {
    let kind = "normal";
    if (item.score >= top - RANK_TIE_CP) kind = "best";
    else if (lastCluster > 0 && cluster[i] === lastCluster) kind = "worst";
    else if (lastCluster === 0 && spread > RANK_TIE_CP && item.score <= bottom + RANK_TIE_CP) kind = "worst";
    kinds.set(item.hint.uci, kind);
  });
  const kindOf = (item) => kinds.get(item.hint.uci);
  const count = (kind) => items.filter((item) => kindOf(item) === kind).length;
  if (count("best") === 0) kinds.set(items[0].hint.uci, "best");
  if (items.length >= 2 && count("normal") === 0) {
    const notBest = items.find((item) => kindOf(item) !== "best");
    const target = notBest || items[items.length - 1];
    if (kindOf(items[0]) === "best" && target.hint.uci !== items[0].hint.uci) {
      kinds.set(target.hint.uci, "normal");
    }
  }
  return kinds;
}

function hintPlaceMap(pool = state.hintPool) {
  const map = new Map();
  const items = (pool || [])
    .filter((line) => line?.uci && !line.synthetic && Number.isFinite(hintScore(line)))
    .sort((a, b) => hintScore(b) - hintScore(a) || String(a.uci).localeCompare(b.uci));
  items.forEach((hint, i) => map.set(hint.uci, i + 1));
  return map;
}

function formatPlace(n) {
  const place = Number(n);
  if (!place) return "";
  if (getLang() === "it") return `${place}°`;
  const j = place % 10;
  const k = place % 100;
  if (j === 1 && k !== 11) return `${place}st`;
  if (j === 2 && k !== 12) return `${place}nd`;
  if (j === 3 && k !== 13) return `${place}rd`;
  return `${place}th`;
}

function hintRankKind(hint, pool = state.hintPool) {
  if (!hint || hint.synthetic || !hint.uci) return "";
  return hintRankMap(pool).get(hint.uci) || "";
}

function hintRankTag(hint, pool = state.hintPool) {
  const place = hintPlaceMap(pool).get(hint?.uci);
  if (!place) return "";
  const ordinal = formatPlace(place);
  if (place === 1) return t("hint.tag.bestPlace", { place: ordinal });
  return t("hint.tag.variant", { place: ordinal });
}

function hintMixCounts(pool = state.hintPool) {
  let best = 0;
  let normal = 0;
  let worst = 0;
  for (const hint of pool || []) {
    const kind = hintRankKind(hint, pool);
    if (kind === "best") best += 1;
    else if (kind === "worst") worst += 1;
    else if (kind === "normal") normal += 1;
  }
  return { best, normal, worst };
}

function formatHintMix(pool = state.hintPool) {
  const { best, normal, worst } = hintMixCounts(pool);
  const good = normal + worst;
  const parts = [];
  if (best) parts.push(t(best === 1 ? "hint.mix.best1" : "hint.mix.bestN", { n: best }));
  if (good) parts.push(t(good === 1 ? "hint.mix.normal1" : "hint.mix.normalN", { n: good }));
  return parts.join(" · ");
}

function hintEvalGame() {
  return isTrainHold() && state.trainFen ? new Chess(state.trainFen) : state.game;
}

function hintMoveEval(info) {
  if (!info || info.synthetic || !Number.isFinite(hintScore(info))) return null;
  return evalForPlayer(hintScore(info), hintEvalGame());
}

function formatHintEval(info) {
  if (!info || info.synthetic) return "—";
  if (info.scoreType === "mate") {
    if (info.score > 0) return t("eval.mateIn", { n: info.score });
    if (info.score < 0) return t("eval.mateIn", { n: Math.abs(info.score) });
    return t("eval.mate");
  }
  const raw = info.score / 100;
  if (!Number.isFinite(raw)) return "—";
  const shown = state.roundEval ? Math.round(raw * 10) / 10 : raw;
  if (!shown) return state.roundEval ? "0.0" : "0.00";
  const digits = state.roundEval ? Math.abs(shown).toFixed(1) : Math.abs(shown).toFixed(2);
  return shown > 0 ? `+${digits}` : `-${digits}`;
}

function hintEvalDir(info) {
  const moveEval = hintMoveEval(info);
  if (moveEval == null) return "";
  const now = Number.isFinite(state.standEval) ? state.standEval : 0;
  const step = state.roundEval ? 10 : 5;
  if (moveEval > now + step) return "up";
  if (moveEval < now - step) return "down";
  return "";
}

function hintEvalArrowSvg(dir) {
  const path = dir === "down"
    ? "M12 20 4 12h5V4h6v8h5Z"
    : "M12 4l8 8h-5v8h-6v-8H4Z";
  return `<svg class="hint-eval-dir is-${dir}" viewBox="0 0 24 24" aria-hidden="true"><path fill="currentColor" d="${path}"/></svg>`;
}

function hintEvalHtml(info) {
  if (!info || info.synthetic) return "—";
  const dir = hintEvalDir(info);
  const arrow = dir ? hintEvalArrowSvg(dir) : "";
  return `${arrow}${escapeHtml(formatHintEval(info))}`;
}

function hintTagHtml(hint, pool = state.hintPool) {
  const tag = hintRankTag(hint, pool);
  if (!tag) return "";
  const place = hintPlaceMap(pool).get(hint?.uci);
  if (place === 1) {
    return `<span class="hint-tag is-best"><span class="hint-star" aria-hidden="true">★</span>${escapeHtml(tag)}</span>`;
  }
  return `<span class="hint-tag is-good">${escapeHtml(tag)}</span>`;
}

function evalClass(info) {
  if (!info || info.synthetic) return "";
  if (info.scoreType === "mate") return info.score > 0 ? "" : " is-neg";
  if (info.score > 0) return "";
  if (info.score < 0) return " is-neg";
  return "";
}

function formatHintSquare(square) {
  return String(square || "").toUpperCase();
}

function hintCheckTail(move) {
  const san = String(move?.san || "");
  if (san.includes("#")) return t("headline.checkmate");
  if (san.includes("+")) return t("headline.check");
  return "";
}

function withCheckLine(text, move) {
  const tail = hintCheckTail(move);
  return tail ? `${text}. ${tail}` : text;
}

function moveHeadline(move) {
  if (!move) return t("hints.move");
  if (move.san.startsWith("O-O-O")) return withCheckLine(t("headline.castleLong"), move);
  if (move.san.startsWith("O-O")) return withCheckLine(t("headline.castle"), move);
  const piece = pieceName(move.piece);
  const to = formatHintSquare(move.to);
  const target = move.captured ? pieceName(move.captured).toLowerCase() : "";
  const ep = String(move.flags || "").includes("e");
  let line = "";
  if (move.promotion) {
    line = move.captured
      ? t("headline.promoTake", { piece, target, to, promo: pieceName(move.promotion) })
      : t("headline.promo", { piece, to, promo: pieceName(move.promotion) });
  } else if (ep) {
    line = t("headline.ep", { to });
  } else if (move.captured) {
    line = move.piece === "p"
      ? t("headline.pawnTake", { to })
      : t("headline.take", { piece, target, to });
  } else {
    line = t("headline.move", { piece, to });
  }
  return withCheckLine(line, move);
}

function pieceIcon(move, color) {
  if (!move) return "";
  if (move.san.startsWith("O-O")) return `pieces/${color}K.svg`;
  const type = (move.piece || "p").toUpperCase();
  return `pieces/${color}${type}.svg`;
}

function warArtUrl(dir, art) {
  return `${dir}/${encodeURIComponent(art.file)}`;
}

function moveHash(move) {
  const key = `${move?.from || ""}${move?.to || ""}${move?.san || ""}`;
  return [...key].reduce((n, ch) => n + ch.charCodeAt(0), 0);
}

function numberedPoseArt(filePrefix, title, n) {
  const pose = ((Number(n) - 1) % 3 + 3) % 3 + 1;
  return { file: `${filePrefix} ${pose}.png`, title, n: pose };
}

function pickWarArt(pack, poseArt, move, poseN) {
  const san = String(move?.san || "");
  if ((san.includes("#") || san.includes("+")) && pack.check) return pack.check;
  const cap = move?.captured;
  if (cap === "p" && pack.captureP) return pack.captureP;
  if (cap === "r" && pack.captureR) return pack.captureR;
  if (cap === "n" && pack.captureN) return pack.captureN;
  if (cap === "b" && pack.captureB) return pack.captureB;
  if (cap === "q" && pack.captureQ) return pack.captureQ;
  return poseArt(poseN || moveHash(move) + 1);
}

function blackKnightPoseArt(n) {
  return numberedPoseArt("Cavallo Nero Si muove da solo", "art.knight.pose", n);
}

function whiteKnightPoseArt(n) {
  return numberedPoseArt("Cavallo Bianco Si muove da solo", "art.wknight.pose", n);
}

function blackKnightWarArt(move, poseN) {
  return pickWarArt(WAR_KNIGHT_ART, blackKnightPoseArt, move, poseN);
}

function blackPawnPoseArt(n) {
  return numberedPoseArt("Pedone Nero Si muove da solo", "art.pawn.pose", n);
}

function whitePawnPoseArt(n) {
  return numberedPoseArt("Pedone Bianco Si muove da solo", "art.wpawn.pose", n);
}

function quietPiecePoseMap(hints, side, piece) {
  const map = new Map();
  if (side !== "b" && side !== "w") return map;
  const ucis = [];
  for (const hint of hints || []) {
    if (!hint?.uci) continue;
    const played = playedFromHint(hint);
    if (!played || played.piece !== piece) continue;
    const san = String(played.san || "");
    if (played.captured || san.startsWith("O-O") || san.includes("+") || san.includes("#")) continue;
    ucis.push(hint.uci);
  }
  ucis.sort();
  ucis.forEach((uci, i) => map.set(uci, (i % 9) + 1));
  return map;
}

function quietPawnPoseMap(hints, side) {
  return quietPiecePoseMap(hints, side, "p");
}

function blackPawnWarArt(move, poseN) {
  return pickWarArt(WAR_PAWN_ART, blackPawnPoseArt, move, poseN);
}

function blackBishopPoseArt(n) {
  return numberedPoseArt("Alfiere Nero Si muove da solo", "art.bishop.pose", n);
}

function whiteBishopPoseArt(n) {
  return numberedPoseArt("Alfiere Bianco Si muove da solo", "art.wbishop.pose", n);
}

function blackBishopWarArt(move, poseN) {
  return pickWarArt(WAR_BISHOP_ART, blackBishopPoseArt, move, poseN);
}

function blackQueenPoseArt(n) {
  return numberedPoseArt("Regina Nera Si muove da sola", "art.queen.pose", n);
}

function whiteQueenPoseArt(n) {
  return numberedPoseArt("Regina Bianca Si muove da sola", "art.wqueen.pose", n);
}

function blackQueenWarArt(move, poseN) {
  return pickWarArt(WAR_QUEEN_ART, blackQueenPoseArt, move, poseN);
}

function blackRookPoseArt(n) {
  return numberedPoseArt("Torre Nera Si muove da sola", "art.rook.pose", n);
}

function whiteRookPoseArt(n) {
  return numberedPoseArt("Torre Bianca Si muove da sola", "art.wrook.pose", n);
}

function blackRookWarArt(move, poseN) {
  return pickWarArt(WAR_ROOK_ART, blackRookPoseArt, move, poseN);
}

function castlePoseMap(hints, side) {
  const map = new Map();
  if (side !== "b") return map;
  const ucis = [];
  for (const hint of hints || []) {
    if (!hint?.uci) continue;
    const played = playedFromHint(hint);
    if (!played || !String(played.san || "").startsWith("O-O")) continue;
    ucis.push(hint.uci);
  }
  ucis.sort();
  ucis.forEach((uci, i) => map.set(uci, (i % 9) + 1));
  return map;
}

function blackCastlePoseArt(n) {
  const pose = ((Number(n || 1) - 1) % 9 + 9) % 9 + 1;
  return {
    file: `Re Nero Arrocco ${pose}.png`,
    title: "art.castle.pose",
    n: pose,
  };
}

function blackKingPoseArt(n) {
  return numberedPoseArt("Re Nero Si muove da solo", "art.king.pose", n);
}

function whiteKingPoseArt(n) {
  return numberedPoseArt("Re Bianco Si muove da solo", "art.wking.pose", n);
}

function blackKingWarArt(move, poseN) {
  return pickWarArt(WAR_KING_ART, blackKingPoseArt, move, poseN);
}

function warCardHtml(dir, art) {
  const title = escapeHtml(t(art.title, { n: art.n || "" }).trim());
  const src = warArtUrl(dir, art);
  return `<span class="hint-card-art is-war" role="img" aria-label="${title}" title="${title}" style="background-image:url('${src}')"></span>`;
}

function hintCardSanHtml(san) {
  const text = String(san || "").trim();
  if (!text || text === "—") return "";
  const n = text.length;
  const size = n <= 2 ? "is-2" : n <= 3 ? "is-3" : n <= 4 ? "is-4" : "is-long";
  return `<span class="hint-card-san ${size}">${escapeHtml(text)}</span>`;
}

function hintCardMediaHtml(art, san) {
  return `<span class="hint-card-media">${art}${hintCardSanHtml(san)}</span>`;
}

function iconArtHtml(move, color) {
  const src = pieceIcon(move, color) || `pieces/${color || "w"}N.svg`;
  const title = escapeHtml(move ? pieceName(move.piece || "p") : t("hints.move"));
  return `<span class="hint-card-art is-icon"><img src="${src}" alt="${title}" title="${title}"></span>`;
}

function hintArtHtml(move, color, poses = {}) {
  if (state.storyIcons) return storyArtHtml(move || { piece: "n", san: "" }, color, poses);
  return iconArtHtml(move, color);
}

function storyArtHtml(move, color, poses = {}) {
  if (color === "b" && move?.piece === "n") return warCardHtml(WAR_KNIGHT_DIR, blackKnightWarArt(move, poses.n));
  if (color === "b" && move?.piece === "p") return warCardHtml(WAR_PAWN_DIR, blackPawnWarArt(move, poses.p));
  if (color === "b" && move?.piece === "b") return warCardHtml(WAR_BISHOP_DIR, blackBishopWarArt(move, poses.b));
  if (color === "b" && move?.piece === "r") return warCardHtml(WAR_ROOK_DIR, blackRookWarArt(move, poses.r));
  if (color === "b" && move?.piece === "q") return warCardHtml(WAR_QUEEN_DIR, blackQueenWarArt(move, poses.q));
  if (color === "b" && move?.piece === "k") {
    if (String(move?.san || "").startsWith("O-O")) {
      return warCardHtml(WAR_CASTLE_DIR, blackCastlePoseArt(poses.castle));
    }
    return warCardHtml(WAR_KING_DIR, blackKingWarArt(move, poses.k));
  }
  if (color === "w" && move?.piece === "n") {
    return warCardHtml(WAR_W_KNIGHT_DIR, pickWarArt(WAR_W_KNIGHT_ART, whiteKnightPoseArt, move, poses.n));
  }
  if (color === "w" && move?.piece === "p") {
    return warCardHtml(WAR_W_PAWN_DIR, pickWarArt(WAR_W_PAWN_ART, whitePawnPoseArt, move, poses.p));
  }
  if (color === "w" && move?.piece === "b") {
    return warCardHtml(WAR_W_BISHOP_DIR, pickWarArt(WAR_W_BISHOP_ART, whiteBishopPoseArt, move, poses.b));
  }
  if (color === "w" && move?.piece === "r") {
    return warCardHtml(WAR_W_ROOK_DIR, pickWarArt(WAR_W_ROOK_ART, whiteRookPoseArt, move, poses.r));
  }
  if (color === "w" && move?.piece === "q") {
    return warCardHtml(WAR_W_QUEEN_DIR, pickWarArt(WAR_W_QUEEN_ART, whiteQueenPoseArt, move, poses.q));
  }
  if (color === "w" && move?.piece === "k") {
    if (String(move?.san || "").startsWith("O-O")) {
      return warCardHtml(WAR_W_KING_DIR, whiteKingPoseArt(poses.castle || poses.k || moveHash(move) + 1));
    }
    return warCardHtml(WAR_W_KING_DIR, pickWarArt(WAR_W_KING_ART, whiteKingPoseArt, move, poses.k));
  }
  const src = pieceIcon(move, color) || `pieces/${color || "w"}N.svg`;
  const title = escapeHtml(move ? pieceName(move.piece || "p") : t("hints.move"));
  return `<span class="hint-card-art is-icon"><img src="${src}" alt="${title}" title="${title}"></span>`;
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

function fillHintPool(engineLines, game, { freezeStand = false } = {}) {
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
  const want = hintPoolSize();
  if (pool.length < want) {
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
  const ranked = pool.slice(0, want);
  state.hintBestScore = ranked.length ? hintScore(ranked[0]) : -Infinity;
  const realBest = ranked.find((line) => line && !line.synthetic);
  if (realBest && Number.isFinite(hintScore(realBest))) {
    if (!freezeStand) {
      state.nextStandEval = Number.isFinite(state.gameEval) ? state.gameEval : 0;
    }
    state.gameEval = evalForPlayer(hintScore(realBest), game);
  }
  return shuffle(ranked);
}

function adoptHintPool(pool, { freezeStand = false } = {}) {
  if (!freezeStand && Number.isFinite(state.nextStandEval)) {
    state.standEval = state.nextStandEval;
  }
  state.nextStandEval = null;
  state.hintPool = pool || [];
}

function evalForPlayer(score, game) {
  const stm = game.turn();
  const me = isLocalVsHuman() ? stm : state.playerColor;
  return stm === me ? score : -score;
}

function livesFromCp(cp) {
  if (!Number.isFinite(cp) || cp >= -100) return 6;
  if (cp > -180) return 5;
  if (cp > -280) return 4;
  if (cp > -410) return 3;
  if (cp > -610) return 2;
  return 1;
}

function kingLifeHalves() {
  if (Number.isFinite(state.livesForced)) return state.livesForced;
  if (state.game.in_checkmate()) {
    return state.game.turn() !== state.playerColor ? 6 : 0;
  }
  if (state.game.game_over()) return 6;
  return livesFromCp(state.gameEval);
}

function opponentReactBand(afterGame, beforeEval, feedbackKey) {
  if (afterGame.in_checkmate() || afterGame.in_check()) return "mateRisk";
  const lost = displayLifeHalves(livesFromCp(beforeEval)) - displayLifeHalves(livesFromCp(state.gameEval));
  if (lost > 0) return "heartMany";
  if (feedbackKey && opponentRankKind(feedbackKey) === "best") return "oppBest";
  return "";
}

function opponentSwingTalk(beforeEval, feedbackKey) {
  if (!Number.isFinite(beforeEval) || !Number.isFinite(state.gameEval)) return "";
  const visDelta = displayLifeHalves(livesFromCp(state.gameEval)) - displayLifeHalves(livesFromCp(beforeEval));
  if (visDelta < 0) return t(pickLifeFeedbackKey(visDelta));
  if (opponentRankKind(feedbackKey) === "worst") return "";
  if (beforeEval - state.gameEval >= 40) return t(pickKey(OPP_ADV_KEYS, "lastOppAdvKey"));
  return "";
}

function displayLifeHalves(halves = kingLifeHalves()) {
  return halves === 5 ? 4 : halves;
}

function visibleLifeHalves() {
  if (Number.isInteger(state.livesHold)) return displayLifeHalves(state.livesHold);
  return displayLifeHalves();
}

function freezeKingLives(halves) {
  if (!Number.isInteger(halves)) return;
  state.livesHold = halves;
}

function thawKingLives() {
  state.livesHold = null;
}

function heartKind(halves, i) {
  const left = halves - i * 2;
  return left >= 2 ? "full" : left === 1 ? "half" : "empty";
}

function hintHeartPiece(kind, tone) {
  return `<span class="king-heart hint-heart is-${kind} is-${tone}" aria-hidden="true"><span class="heart-bg">♥</span><span class="heart-fg">♥</span></span>`;
}

function hintDeltaHeartPieces(halves, tone) {
  const parts = [];
  let left = Math.abs(halves);
  while (left >= 2) {
    parts.push(hintHeartPiece("full", tone));
    left -= 2;
  }
  if (left === 1) parts.push(hintHeartPiece("half", tone));
  return parts.join("");
}

function hintHeartsHtml(hint) {
  if (!hint || hint.synthetic) return "";
  const score = hintScore(hint);
  if (!Number.isFinite(score)) return "";
  const delta = hintLifeDelta(hint);
  if (!delta) return "";
  const gain = delta > 0;
  const label = gain ? t("hint.lives.gain") : t("hint.lives.lose");
  const sign = gain ? "+" : "−";
  const tone = gain ? "gain" : "lose";
  return `<span class="hint-hearts is-${tone}" title="${escapeHtml(label)}" aria-label="${escapeHtml(label)}"><span class="hint-hearts-mark">(</span><span class="hint-hearts-sign">${sign}</span>${hintDeltaHeartPieces(delta, tone)}<span class="hint-hearts-mark">)</span></span>`;
}

function stopLivesAnim() {
  clearTimeout(state.livesAnimTimer);
  state.livesAnimTimer = null;
  state.livesAnimating = false;
  state.pendingLives = null;
  els.kingLives?.classList.remove("is-flash");
}

function paintKingHearts(halves) {
  const root = els.kingLives;
  if (!root) return;
  const shown = displayLifeHalves(halves);
  root.classList.remove("is-flash");
  root.innerHTML = [0, 1, 2]
    .map((i) => {
      const kind = heartKind(shown, i);
      return `<span class="king-heart is-${kind}" aria-hidden="true"><span class="heart-bg">♥</span><span class="heart-fg">♥</span></span>`;
    })
    .join("");
  state.shownLives = shown;
}

function applyHeartKinds(halves, { drop = false } = {}) {
  const root = els.kingLives;
  const shown = displayLifeHalves(halves);
  if (!root?.children.length) {
    paintKingHearts(shown);
    return;
  }
  [...root.children].forEach((el, i) => {
    const kind = heartKind(shown, i);
    const prev = el.classList.contains("is-full") ? "full" : el.classList.contains("is-half") ? "half" : "empty";
    el.classList.remove("is-full", "is-half", "is-empty", "is-drop");
    el.classList.add(`is-${kind}`);
    if (drop && prev !== kind) {
      el.classList.add("is-drop");
      el.addEventListener("animationend", () => el.classList.remove("is-drop"), { once: true });
    }
  });
  state.shownLives = shown;
}

function queueLifeLoss(next) {
  next = displayLifeHalves(next);
  state.pendingLives = Number.isInteger(state.pendingLives) ? Math.min(state.pendingLives, next) : next;
  if (state.livesAnimating) return;
  const root = els.kingLives;
  if (!root) return;
  state.livesAnimating = true;
  root.classList.remove("is-flash");
  void root.offsetWidth;
  root.classList.add("is-flash");
  state.livesAnimTimer = setTimeout(() => {
    root.classList.remove("is-flash");
    const to = Number.isInteger(state.pendingLives) ? state.pendingLives : next;
    state.pendingLives = null;
    applyHeartKinds(to, { drop: true });
    state.livesAnimTimer = setTimeout(() => {
      state.livesAnimating = false;
      const latest = visibleLifeHalves();
      if (latest < state.shownLives) queueLifeLoss(latest);
      else if (latest !== state.shownLives) paintKingHearts(latest);
    }, 480);
  }, 900);
}

function renderKingLives() {
  const root = els.kingLives;
  if (!root) return;
  const next = visibleLifeHalves();
  if (!root.children.length || !Number.isInteger(state.shownLives)) {
    paintKingHearts(next);
    return;
  }
  if (next === state.shownLives && !state.livesAnimating) return;
  if (next >= state.shownLives) {
    stopLivesAnim();
    paintKingHearts(next);
    return;
  }
  queueLifeLoss(next);
}

function hintPageCount() {
  const perPage = hintsPerPage();
  const maxPages = hintLayout().pages;
  return Math.max(1, Math.min(maxPages, Math.ceil(state.hintPool.length / perPage)));
}

function visibleHints() {
  const perPage = hintsPerPage();
  const start = state.hintPage * perPage;
  return state.hintPool.slice(start, start + perPage);
}

function visibleHintDests() {
  const dests = {};
  for (const hint of state.hints || []) {
    if (!hint?.uci) continue;
    const { from, to } = uciToMove(hint.uci);
    if (!from || !to) continue;
    if (!dests[from]) dests[from] = [];
    if (!dests[from].includes(to)) dests[from].push(to);
  }
  return dests;
}

function boardHintPlayReady() {
  return Boolean(state.board)
    && hintsArePlayable()
    && hintPanelOpen()
    && !waitingForHints()
    && (state.hints || []).some((hint) => hint?.uci);
}

function firstBoardPlaySquare() {
  const dests = visibleHintDests();
  const squares = Object.keys(dests).filter((square) => dests[square]?.length);
  const white = state.board?.orientation !== "black";
  squares.sort((a, b) => {
    const ay = white ? 8 - Number(a[1]) : Number(a[1]) - 1;
    const by = white ? 8 - Number(b[1]) : Number(b[1]) - 1;
    const ax = white ? a.charCodeAt(0) : 7 - (a.charCodeAt(0) - 97);
    const bx = white ? b.charCodeAt(0) : 7 - (b.charCodeAt(0) - 97);
    return ay - by || ax - bx;
  });
  return squares[0] || null;
}

function hintIndexForSquares(from, to) {
  return (state.hints || []).findIndex((hint) => {
    if (!hint?.uci) return false;
    const move = uciToMove(hint.uci);
    return move.from === from && move.to === to;
  });
}

function hintIndicesFromSquare(from) {
  const indices = [];
  (state.hints || []).forEach((hint, i) => {
    if (hint?.uci?.slice(0, 2) === from) indices.push(i);
  });
  return indices;
}

function previewHintsFromSquare(from) {
  const indices = hintIndicesFromSquare(from);
  showHintArrows(indices.length ? indices : null, { reveal: true });
}

function previewFromBoardCursor() {
  if (!state.board) return;
  const selected = state.board.getSelected();
  const cursor = state.board.getCursor();
  if (selected && cursor && cursor !== selected) {
    const index = hintIndexForSquares(selected, cursor);
    if (index >= 0) {
      state.kbdHint = index;
      paintKbdHint();
      showHintArrows(index, { reveal: true });
      return;
    }
  }
  state.kbdHint = null;
  paintKbdHint();
  if (selected) previewHintsFromSquare(selected);
  else if (cursor) previewHintsFromSquare(cursor);
  else showHintArrows(null, { reveal: Boolean(state.aids.moves) });
}

function playHintMove(from, to) {
  const index = hintIndexForSquares(from, to);
  const hint = index >= 0 ? state.hints[index] : null;
  const promo = hint ? uciToMove(hint.uci).promotion : undefined;
  applyUserMove(from, to, promo, hint);
}

function syncHintBoardPlay() {
  if (!state.board) return;
  if (!boardHintPlayReady()) {
    state.board.setDests({});
    state.board.setInteractive(false);
    return;
  }
  state.board.setDests(visibleHintDests());
  state.board.setInteractive(true);
}

function syncHintLayoutUi() {
  const n = hintsPerPage();
  els.hints?.classList.toggle("is-four", n === 4);
  els.hints?.classList.toggle("is-six", n !== 4);
  els.hints?.classList.add("is-cards");
}

function syncHintNav() {
  const hidden = waitingForHints() && !isTrainHold();
  const perPage = hintsPerPage();
  const label = t("hints.more", { n: perPage });
  els.hints?.classList.toggle("is-waiting", hidden);
  els.hintNav?.classList.toggle("is-waiting", hidden);
  const hold = isTrainHold();
  const canUse = (playerIsSideToMove() || hold) && !hidden && (!state.game.game_over() || hold);
  const canToggle = canUse && hintPageCount() > 1 && (hold || !state.busy);
  if (els.hintNav) els.hintNav.hidden = hintPageCount() <= 1;
  if (els.moreHints) {
    els.moreHints.textContent = label;
    els.moreHints.title = label;
    els.moreHints.setAttribute("aria-label", label);
    els.moreHints.disabled = !canToggle;
  }
  syncRecalcButton();
  syncHintMix();
}

function currentHintMixLine() {
  const text = formatHintMix();
  if (text) state.lastHintMix = text;
  return text || state.lastHintMix || "";
}

function kingFinaleAllowed() {
  if (isReviewing() || isTrainHold()) return false;
  if (state.game.game_over()) return false;
  if (!currentHintMixLine()) return false;
  return playerIsSideToMove();
}

function paintKingFinaleContent() {
  if (!els.hintMix) return;
  const line = currentHintMixLine();
  if (!line) {
    els.hintMix.innerHTML = "";
    els.hintMix.hidden = true;
    return;
  }
  els.hintMix.innerHTML = `${escapeHtml(t("hint.mix.intro"))}<br>${escapeHtml(line)}`;
  els.hintMix.hidden = false;
  syncRecalcButton();
}

function hideKingFinale() {
  if (els.kingFinale) els.kingFinale.hidden = true;
}

function revealKingFinale({ animate = false } = {}) {
  if (!els.kingFinale) return;
  if (state.kingSpeaking || !kingFinaleAllowed()) {
    hideKingFinale();
    paintKingFinaleContent();
    return;
  }
  paintKingFinaleContent();
  els.kingFinale.hidden = false;
  if (!animate || !els.hintMix) return;
  wrapKingWords(els.hintMix);
  let delay = 80;
  els.hintMix.querySelectorAll(".king-word").forEach((word) => {
    word.style.animationDelay = `${delay}ms`;
    delay += /[:.!?…]$/.test(word.textContent.trim()) ? 110 : 40;
  });
  if (els.recalcWrap && !els.recalcWrap.hidden && els.recalcHints) {
    els.recalcHints.classList.remove("king-word");
    void els.recalcHints.offsetWidth;
    els.recalcHints.classList.add("king-word");
    els.recalcHints.style.animationDelay = `${delay}ms`;
  }
}

function syncHintMix() {
  if (!els.hintMix) return;
  if (state.kingSpeaking) {
    paintKingFinaleContent();
    hideKingFinale();
    return;
  }
  const wasHidden = Boolean(els.kingFinale?.hidden);
  revealKingFinale({ animate: wasHidden && kingFinaleAllowed() });
}

function syncRecalcButton() {
  if (!els.recalcHints) return;
  const canRecalc = playerIsSideToMove()
    && !state.busy
    && !state.recalcHints
    && !state.recalcUsedThisTurn
    && !state.game.game_over()
    && !isReviewing()
    && !isTrainHold()
    && !waitingForHints()
    && state.hintPool.length;
  const label = state.recalcHints ? t("hints.recalcing") : t("hints.recalc");
  els.recalcHints.textContent = label;
  els.recalcHints.title = label;
  els.recalcHints.setAttribute("aria-label", label);
  els.recalcHints.disabled = !canRecalc;
  els.recalcWrap?.classList.toggle("is-busy", Boolean(state.recalcHints));
  const show = state.recalcHints || canRecalc;
  if (els.recalcWrap) els.recalcWrap.hidden = !show;
}

function showHintPage(page) {
  const lastPage = hintPageCount() - 1;
  const pages = lastPage + 1;
  if (pages <= 1) {
    state.hintPage = 0;
  } else {
    state.hintPage = ((page % pages) + pages) % pages;
  }
  state.kbdHint = null;
  renderHints();
  if (isTrainHold()) state.board.setArrows([]);
  else if (state.aids.moves) showHintArrows(null, { reveal: true });
}

function isTrainHold() {
  return Boolean(state.trainHold);
}

function isTrainQuiz() {
  return Boolean(state.trainingMode) && !state.trainHold;
}

function clearTrainHold() {
  state.trainHold = false;
  state.trainPickedUci = "";
  state.trainFen = "";
  state.trainColor = "";
  state.trainLives = null;
}

function syncTrainingModeUi() {
  const on = Boolean(state.trainingMode);
  els.trainingMode?.classList.toggle("is-on", on);
  if (els.trainingMode) {
    els.trainingMode.setAttribute("aria-pressed", on ? "true" : "false");
    const hint = t("train.modeHint");
    els.trainingMode.title = hint;
    els.trainingMode.setAttribute("aria-label", `${t("train.mode")}. ${hint}`);
  }
  syncTrainContinue();
}

function syncTrainContinue() {
  if (els.trainContinue) {
    const show = isTrainHold() && !state.autoContinue;
    els.trainContinue.hidden = !show;
    els.trainContinue.disabled = !show || state.busy;
    els.trainContinue.textContent = t("train.continue");
  }
  syncOppWait();
}

function syncOppWait() {
  const show = isTrainHold();
  if (els.oppWait) {
    els.oppWait.hidden = !show;
    els.oppWait.textContent = t("hints.oppWait");
  }
  els.hints?.classList.toggle("is-wait-opp", show);
  els.hintNav?.classList.toggle("is-wait-opp", show);
}

function syncAutoContinueUi() {
  if (els.autoContinue) els.autoContinue.checked = Boolean(state.autoContinue);
}

function setAutoContinue(on) {
  state.autoContinue = Boolean(on);
  try {
    localStorage.setItem(AUTO_CONTINUE_KEY, state.autoContinue ? "1" : "0");
  } catch {
    /* ignore */
  }
  syncAutoContinueUi();
  syncTrainContinue();
  if (state.autoContinue && isTrainHold() && !state.busy) continueTrainMove();
}

function setTrainingMode(on) {
  const next = Boolean(on);
  state.trainingMode = next;
  try {
    localStorage.setItem(TRAIN_MODE_KEY, next ? "1" : "0");
  } catch {
    /* ignore */
  }
  syncTrainingModeUi();
  renderHints();
}

async function continueTrainMove({ afterTalk, keepSpeaking = false } = {}) {
  if (!state.trainHold || state.busy) return;
  const gameOver = state.game.game_over();
  const local = isLocalVsHuman();
  state.busy = true;
  if (!keepSpeaking) {
    state.speakToken += 1;
    state.kingSpeaking = false;
  }
  hideKingFinale();
  syncTrainContinue();
  if (gameOver) {
    clearTrainHold();
    hideHintPanel();
    finishGame();
    return;
  }
  if (local) {
    clearTrainHold();
    hideHintPanel();
    syncCoach();
    await refreshHints({ reveal: false });
    state.busy = false;
    state.pendingHintReveal = true;
    revealHintsIfReady();
    return;
  }
  await computerMove({ silentWait: true, afterTalk });
}

function clearHints() {
  stopMoveClock();
  clearTrainHold();
  state.kbdHint = null;
  state.hints = [];
  state.hintPool = [];
  state.hintPage = 0;
  state.hintsUnlocked = 0;
  state.hintBestScore = -Infinity;
  state.nextStandEval = null;
  state.recalcUsedThisTurn = false;
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
  return `${t(`plain.${type || "x"}`)} ${t("prep.in")} ${square}`;
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
  return joinIt(squares.map((square) => `${t("prep.in")} ${square}`));
}

function ourHitsPhrase(hits, withSquares = true) {
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
    const name = squares.length === 1 ? ourSingular(type) : ourPlural(type);
    parts.push(withSquares ? `${name} ${squareList(squares)}` : name);
  }
  return joinIt(parts);
}

function mixedThreatPhrase(threatHits, hanging) {
  if (!threatHits.length) return "";
  const hangSet = new Set(hanging.map((hit) => hit.to));
  const dang = threatHits.filter((hit) => hangSet.has(hit.to));
  if (!dang.length) return ourHitsPhrase(threatHits);
  const safe = threatHits.filter((hit) => !hangSet.has(hit.to));
  return joinIt([ourHitsPhrase(safe, false), ourHitsPhrase(dang)].filter(Boolean));
}

function capturedOn(move) {
  if (String(move.flags || "").includes("e")) return move.to[0] + move.from[1];
  return move.to;
}

function opponentActionLine(move, hits, hanging) {
  const victim = move.captured
    ? `${ourSingular(move.captured)} ${squareList([capturedOn(move)])}`
    : "";
  const capSq = move.captured ? capturedOn(move) : "";
  const threatHits = hits.filter((hit) => hit.to !== capSq);
  const hangSet = new Set(hanging.map((hit) => hit.to));
  threatHits.sort((a, b) => Number(hangSet.has(a.to)) - Number(hangSet.has(b.to)));
  const manyThreats = threatHits.length >= 3;
  const threatList = manyThreats ? "" : mixedThreatPhrase(threatHits, hanging);
  const hangPhrase = hanging.length ? ourHitsPhrase(hanging) : "";
  const hangInThreats = hanging.length && hanging.every((hit) => threatHits.some((th) => th.to === hit.to));

  const parts = [];
  if (victim) parts.push(t("king.oppEat", { victim }));
  else if (move.san.startsWith("O-O-O")) parts.push(t("king.oppCastleLong"));
  else if (move.san.startsWith("O-O")) parts.push(t("king.oppCastle"));

  if (manyThreats) {
    parts.push(parts.length ? t("king.oppAndMany") : t("king.oppMany"));
  } else if (threatList) {
    parts.push(parts.length ? t("king.oppAndThreat", { list: threatList }) : t("king.oppThreat", { list: threatList }));
  }

  if (hangPhrase) {
    if (hangInThreats && !manyThreats) {
      parts.push(hanging.length === 1 ? t("king.oppUnprotTail1") : t("king.oppUnprotTailN"));
    } else if (manyThreats) {
      parts.push(
        hanging.length === 1
          ? t("king.oppAmongHang1", { phrase: hangPhrase })
          : t("king.oppAmongHangN", { phrase: hangPhrase })
      );
    } else if (!parts.length) {
      parts.push(hanging.length === 1 ? t("king.oppHangOnly1", { phrase: hangPhrase }) : t("king.oppHangOnlyN", { phrase: hangPhrase }));
    } else {
      parts.push(hanging.length === 1 ? t("king.oppAndHang1", { phrase: hangPhrase }) : t("king.oppAndHangN", { phrase: hangPhrase }));
    }
  }

  if (move.san.includes("+")) {
    parts.push(parts.length ? t("king.oppAndCheck") : t("king.oppCheckOnly"));
  }
  return parts.join(" ").replace(/\s+/g, " ").trim();
}

function narrateOpponentMove(before, move, after, feedbackKey, beforeEval) {
  if (move.san.includes("#")) {
    return t("king.mateOpp");
  }
  const hits = threatsFromMove(after, move, state.playerColor).slice(0, 3);
  const hanging = hits.filter((hit) => !isSquareDefended(after, hit.to, state.playerColor));
  const action = opponentActionLine(move, hits, hanging);
  const swing = opponentSwingTalk(beforeEval, feedbackKey);
  const bits = [];
  if (feedbackKey) {
    const rank = opponentRankKind(feedbackKey);
    const opener = t(
      rank === "best" ? "ofb.open.best" : rank === "worst" ? "ofb.open.worst" : "ofb.open.normal"
    );
    bits.push(`<strong>${escapeHtml(opener)}</strong> ${escapeHtml(swing || t(feedbackKey))}`);
  } else if (swing) {
    bits.push(escapeHtml(swing));
  }
  if (action) bits.push(escapeHtml(action));
  bits.push(escapeHtml(t("king.closer")));
  return bits.join("<br><br>");
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
  return items.join(", ");
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
    paintActiveThreats();
  }
  syncAidButtons();
}

function syncAidButtons() {
  els.aidMoves?.classList.toggle("is-on", state.aids.moves);
  els.aidThreats?.classList.toggle("is-on", state.aids.threats);
  syncStoryIconsButton();
}

function syncStoryIconsButton() {
  const on = Boolean(state.storyIcons);
  els.aidIcons?.classList.toggle("is-on", on);
  els.aidIcons?.setAttribute("aria-pressed", on ? "true" : "false");
  if (els.aidIcons) {
    els.aidIcons.textContent = t(on ? "settings.storyIcons.images" : "settings.storyIcons.standard");
  }
}

function paintThreatPips() {
  paintActiveThreats();
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

function threatPipSquares() {
  const squares = [];
  if (state.aids.threats) squares.push(...allThreatenedSquares());
  else if (Date.now() < state.pipUntil) squares.push(...(state.flashSquares || []));
  if (state.game?.in_check()) {
    const king = kingSquare(state.game, state.game.turn());
    if (king) squares.push(king);
  }
  return [...new Set(squares)];
}

function paintActiveThreats() {
  if (!state.board) return;
  state.board.setDanger(threatPipSquares());
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
  skillRow: document.getElementById("skill-row"),
  playMode: document.getElementById("play-mode"),
  playColor: document.getElementById("play-color"),
  colorRow: document.getElementById("color-row"),
  startKind: document.getElementById("start-kind"),
  customOpeningRow: document.getElementById("custom-opening-row"),
  newGame: document.getElementById("new-game"),
  newGameTitle: document.getElementById("new-game-title"),
  newGameTabs: document.querySelector(".new-game-tabs"),
  friendWhere: document.getElementById("friend-where"),
  friendSoon: document.getElementById("friend-soon"),
  btnNewCancel: document.getElementById("btn-new-cancel"),
  btnNewStart: document.getElementById("btn-new-start"),
  startOpening: document.getElementById("start-opening"),
  hintLayout: document.getElementById("hint-layout"),
  moveClockSelect: document.getElementById("move-clock-sec"),
  openingLine: document.getElementById("opening-line"),
  moves: document.getElementById("moves"),
  reviewBack: document.getElementById("btn-review-back"),
  reviewFwd: document.getElementById("btn-review-fwd"),
  reviewLive: document.getElementById("btn-review-live"),
  playerTop: document.getElementById("player-top"),
  playerYou: document.getElementById("player-you"),
  playerName: document.getElementById("player-name"),
  playerRating: document.getElementById("player-rating"),
  playerRatingTop: document.getElementById("player-rating-top"),
  oppKing: document.getElementById("opp-king"),
  kingPiece: document.getElementById("king-piece"),
  kingTitle: document.getElementById("king-title"),
  kingLives: document.getElementById("king-lives"),
  kingReact: document.getElementById("king-react"),
  kingLegend: document.getElementById("king-legend"),
  turnBanner: document.getElementById("turn-banner"),
  overlay: document.getElementById("overlay"),
  overlayTitle: document.getElementById("overlay-title"),
  overlayText: document.getElementById("overlay-text"),
  promo: document.getElementById("promo"),
  kingNote: document.getElementById("king-note"),
  kingFinale: document.getElementById("king-finale"),
  moreHints: document.getElementById("btn-more-hints"),
  hintNav: document.getElementById("hint-nav"),
  hintPanel: document.getElementById("hint-panel"),
  hintMix: document.getElementById("hint-mix"),
  recalcWrap: document.getElementById("hint-recalc"),
  recalcHints: document.getElementById("btn-recalc-hints"),
  recalcBar: document.getElementById("hint-recalc-bar"),
  recalcFill: document.getElementById("hint-recalc-fill"),
  moveClock: document.getElementById("move-clock"),
  moveClockNum: document.getElementById("move-clock-num"),
  moveClockFill: document.getElementById("move-clock-fill"),
  graveTop: document.getElementById("grave-top"),
  graveBottom: document.getElementById("grave-bottom"),
  aidMoves: document.getElementById("btn-aid-moves"),
  aidThreats: document.getElementById("btn-aid-threats"),
  aidIcons: document.getElementById("btn-aid-icons"),
  trainingMode: document.getElementById("btn-training-mode"),
  trainContinue: document.getElementById("btn-train-continue"),
  oppWait: document.getElementById("opp-wait"),
  autoContinue: document.getElementById("auto-continue"),
  roundEval: document.getElementById("round-eval"),
  storyIcons: document.getElementById("story-icons"),
};

const state = {
  game: new Chess(),
  engine: new Engine(),
  board: null,
  playerColor: "w",
  mode: "engine",
  skill: 2,
  playColorPref: "random",
  startKind: "custom",
  startOpeningId: "random",
  busy: false,
  recalcHints: false,
  recalcUsedThisTurn: false,
  hints: [],
  hintPool: [],
  hintPage: 0,
  hintsUnlocked: 0,
  hintBestScore: -Infinity,
  lastHintMix: "",
  gameEval: 0,
  standEval: 0,
  nextStandEval: null,
  livesForced: null,
  shownLives: null,
  livesHold: null,
  livesAnimating: false,
  livesAnimTimer: null,
  pendingLives: null,
  hintLayout: readHintLayout(),
  moveClockSec: readMoveClock(),
  roundEval: readRoundEval(),
  storyIcons: readStoryIcons(),
  hasGame: false,
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
  allowHintsWhileSpeaking: false,
  gameId: 0,
  kingReplay: null,
  lastLifeFeedbackKey: "",
  lastFeedbackBand: "",
  reactTimer: null,
  lastOppFeedbackKey: "",
  lastOppAdvKey: "",
  lastSeeReplyKey: "",
  lastPlayerScore: -Infinity,
  reviewPly: null,
  pendingPromo: null,
  moveClockToken: 0,
  moveClockTimer: null,
  moveClockTick: null,
  trainingMode: readTrainingMode(),
  autoContinue: readAutoContinue(),
  trainHold: false,
  kbdHint: null,
  trainPickedUci: "",
  trainFen: "",
  trainColor: "",
  trainLives: null,
};

function isLocalVsHuman() {
  return state.mode === "local";
}

function playerIsSideToMove() {
  if (state.game.game_over()) return false;
  if (isLocalVsHuman()) return true;
  return state.game.turn() === state.playerColor;
}

function sideName(color = state.game.turn()) {
  return t(color === "w" ? "player.white" : "player.black");
}

function syncCoach() {
  if (isLocalVsHuman() && !state.game.game_over()) {
    state.playerColor = state.game.turn();
  }
  const color = isLocalVsHuman() ? state.game.turn() : state.playerColor;
  if (els.kingPiece) els.kingPiece.src = color === "b" ? "pieces/bK.svg" : "pieces/wK.svg";
  if (els.kingTitle) {
    els.kingTitle.textContent = isLocalVsHuman()
      ? t(color === "b" ? "king.black" : "king.white")
      : t("king");
  }
  document.body.classList.toggle("is-local", isLocalVsHuman());
  const whiteBottom = state.board?.orientation !== "black";
  if (isLocalVsHuman()) {
    const topColor = whiteBottom ? "b" : "w";
    const botColor = whiteBottom ? "w" : "b";
    if (els.engineLabel) els.engineLabel.textContent = t(topColor === "w" ? "player.white" : "player.black");
    if (els.playerRatingTop) {
      els.playerRatingTop.hidden = false;
      els.playerRatingTop.textContent = t("player.local");
    }
    if (els.playerName) els.playerName.textContent = t(botColor === "w" ? "player.white" : "player.black");
    if (els.playerRating) els.playerRating.textContent = t("player.local");
    els.playerTop?.classList.toggle("is-turn", state.game.turn() === topColor);
    els.playerYou?.classList.toggle("is-turn", state.game.turn() === botColor);
    if (els.oppKing) els.oppKing.src = `pieces/${topColor}K.svg`;
  } else {
    if (els.engineLabel) els.engineLabel.textContent = engineLabelText(state.skill);
    if (els.playerRatingTop) els.playerRatingTop.hidden = true;
    if (els.playerName) els.playerName.textContent = t("you");
    if (els.playerRating) els.playerRating.textContent = t("you.rating");
    els.playerTop?.classList.remove("is-turn");
    els.playerYou?.classList.toggle("is-turn", playerIsSideToMove());
    if (els.oppKing) els.oppKing.src = `pieces/${state.playerColor === "w" ? "b" : "w"}K.svg`;
  }
  renderKingLives();
}

function setStatus(title, text, kind = "info") {
  if (els.statusTitle) els.statusTitle.textContent = title;
  if (els.statusText) els.statusText.textContent = text;
  if (els.statusIcon) els.statusIcon.dataset.kind = kind;
  if (els.turnBanner) els.turnBanner.textContent = title;
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
        part.split("\n").forEach((chunk, i) => {
          if (i) frag.appendChild(document.createElement("br"));
          if (chunk) frag.appendChild(document.createTextNode(chunk));
        });
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
  if (html) source.innerHTML = note || "";
  else source.textContent = note || "";
  wrapKingWords(source);
  els.kingNote.innerHTML = source.innerHTML;
  const words = [...els.kingNote.querySelectorAll(".king-word")];
  let delay = 0;
  words.forEach((word) => {
    word.style.animationDelay = `${delay}ms`;
    delay += /[.!?…]$/.test(word.textContent.trim()) ? 110 : 40;
  });
  return delay + 220;
}

function clearKingTalk() {
  state.speakToken += 1;
  state.kingSpeaking = false;
  state.lastKingTalk = "";
  els.kingNote?.classList.remove("is-typing");
  if (els.kingNote) els.kingNote.innerHTML = "";
  hideKingFinale();
}

function waitingForHints() {
  return playerIsSideToMove() && !state.game.game_over() && !state.hintPool.length;
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
  const fake = { piece: ghost.piece, san };
  return wrapHintSlot(`
    <button class="hint-btn is-card is-loading" disabled>
      ${hintCardMediaHtml(hintArtHtml(fake, color), san)}
      <span class="hint-body">
        <span class="hint-rank">${rank}</span>
        <span class="hint-calc">${t("hints.loading")}</span>
      </span>
    </button>`);
}

function paintMoveClock(sec) {
  if (els.moveClockNum) els.moveClockNum.textContent = String(Math.max(0, sec));
  if (els.moveClockFill) {
    els.moveClockFill.style.transform = `scaleX(${Math.max(0, sec) / moveClockSec()})`;
  }
  els.moveClock?.classList.toggle("is-low", sec <= 5);
}

function stopMoveClock() {
  state.moveClockToken += 1;
  if (state.moveClockTimer) {
    clearTimeout(state.moveClockTimer);
    state.moveClockTimer = null;
  }
  if (state.moveClockTick) {
    clearInterval(state.moveClockTick);
    state.moveClockTick = null;
  }
  if (els.moveClock) {
    els.moveClock.hidden = true;
    els.moveClock.classList.remove("is-on", "is-low");
  }
}

function startMoveClock() {
  stopMoveClock();
  if (!moveClockSec()) return;
  if (!playerIsSideToMove() || state.game.game_over() || !state.hintPool.length) return;
  const token = (state.moveClockToken += 1);
  const gameId = state.gameId;
  if (els.moveClock) {
    els.moveClock.hidden = false;
    els.moveClock.classList.add("is-on");
    els.moveClock.classList.remove("is-low");
  }
  if (els.moveClockFill) {
    els.moveClockFill.style.transition = "none";
    els.moveClockFill.style.transform = "scaleX(1)";
  }
  paintMoveClock(moveClockSec());
  state.moveClockTimer = setTimeout(() => {
    if (token !== state.moveClockToken || gameId !== state.gameId) return;
    if (!playerIsSideToMove() || state.busy || state.game.game_over() || !state.hintPool.length) return;
    let left = moveClockSec();
    if (els.moveClockFill) {
      void els.moveClockFill.offsetWidth;
      els.moveClockFill.style.transition = "transform 1s linear, background 0.2s ease";
    }
    paintMoveClock(left);
    state.moveClockTick = setInterval(() => {
      if (token !== state.moveClockToken || gameId !== state.gameId) return;
      left -= 1;
      paintMoveClock(left);
      if (left > 0) return;
      stopMoveClock();
      playClockHint();
    }, 1000);
  }, MOVE_CLOCK_DELAY_MS);
}

function worstPoolHint() {
  const pool = (state.hintPool || []).filter((hint) => hint?.uci);
  const real = pool.filter((hint) => !hint.synthetic);
  const list = real.length ? real : pool;
  if (!list.length) return null;
  return list.reduce((worst, hint) => (hintScore(hint) < hintScore(worst) ? hint : worst));
}

function bestPoolHint() {
  const pool = (state.hintPool || []).filter((hint) => hint?.uci);
  const real = pool.filter((hint) => !hint.synthetic);
  const list = real.length ? real : pool;
  if (!list.length) return null;
  return list.reduce((best, hint) => (hintScore(hint) > hintScore(best) ? hint : best));
}

function playClockHint() {
  if (state.busy || !playerIsSideToMove() || state.game.game_over()) return;
  const hint = clockPlaysBest() ? bestPoolHint() : worstPoolHint();
  if (!hint) return;
  const move = uciToMove(hint.uci);
  applyUserMove(move.from, move.to, move.promotion, hint);
}

function playWorstHint() {
  playClockHint();
}

function trainPickedIndex() {
  if (!state.trainPickedUci) return null;
  const i = (state.hints || []).findIndex((hint) => hint?.uci === state.trainPickedUci);
  return i >= 0 ? i : null;
}

function wrapHintSlot(buttonHtml, verdict = "") {
  return `<div class="hint-slot">${buttonHtml}<span class="hint-verdict">${verdict}</span></div>`;
}

function revealTrainPick() {
  renderHints();
  state.board?.setArrows([]);
  showHintPanel();
  syncHintNav();
  syncTrainContinue();
  state.kbdHint = null;
  paintKbdHint();
  syncHintBoardPlay();
}

function hideHintPanel() {
  stopMoveClock();
  stopRecalcProgress();
  if (isTrainHold()) return;
  els.hintPanel?.classList.add("is-waiting");
  els.hints?.classList.remove("is-reveal");
  els.hints?.classList.add("is-waiting");
  els.hintNav?.classList.add("is-waiting");
  if (state.board) state.board.setArrows([]);
  syncHintMix();
  syncRecalcButton();
  syncHintBoardPlay();
}

function hintPanelOpen() {
  return Boolean(els.hintPanel && !els.hintPanel.classList.contains("is-waiting"));
}

function showHintPanel() {
  els.hintPanel?.classList.remove("is-waiting");
  els.hints?.classList.remove("is-waiting");
  els.hintNav?.classList.remove("is-waiting");
  syncHintMix();
  syncRecalcButton();
  syncHintBoardPlay();
}

function revealHintsIfReady() {
  if (isTrainHold()) {
    showHintPanel();
    return;
  }
  if (isReviewing()) {
    hideHintPanel();
    return;
  }
  const canShow = playerIsSideToMove() && !state.game.game_over() && state.hintPool.length && (!state.kingSpeaking || state.allowHintsWhileSpeaking);
  if (!canShow) {
    hideHintPanel();
    if (waitingForHints()) renderHints();
    return;
  }
  if (!state.pendingHintReveal) return;
  showHintPanel();
  renderHints();
  els.hints.classList.remove("is-reveal");
  void els.hints.offsetWidth;
  els.hints.classList.add("is-reveal");
  state.pendingHintReveal = false;
  if (state.aids.moves) showHintArrows(null, { reveal: true });
  startMoveClock();
}

async function speakKing(note, { calculating = false, html = false } = {}) {
  const token = (state.speakToken += 1);
  const text = note || "";
  const hold = isTrainHold();
  state.kingSpeaking = Boolean(text);
  hideKingFinale();
  if (!hold) hideHintPanel();
  els.kingNote?.classList.remove("is-typing");
  if (!text) {
    if (els.kingNote) els.kingNote.innerHTML = "";
    state.kingSpeaking = false;
    revealKingFinale({ animate: false });
    revealHintsIfReady();
    return;
  }
  const hintsReady = Boolean(state.hintPool.length) && playerIsSideToMove() && !state.game.game_over();
  if (hintsReady) state.pendingHintReveal = true;
  else if (!hold) renderHints();
  const duration = paintKingNote(text, html);
  await sleep(duration);
  if (token !== state.speakToken) return;
  state.kingSpeaking = false;
  revealKingFinale({ animate: true });
  revealHintsIfReady();
}

function kingComment(beforeFen, played, asOpponent, feedbackKey, beforeEval) {
  const before = new Chess(beforeFen);
  const after = new Chess(state.game.fen());
  return asOpponent
    ? narrateOpponentMove(before, played, after, feedbackKey, beforeEval)
    : narratePlayerMove(before, played, after);
}

function isReviewing() {
  return Number.isInteger(state.reviewPly);
}

function livePly() {
  return state.game.history().length;
}

function gameAtPly(ply) {
  const clone = new Chess();
  const hist = state.game.history({ verbose: true });
  const n = Math.max(0, Math.min(ply, hist.length));
  for (let i = 0; i < n; i += 1) clone.move(hist[i]);
  return clone;
}

function syncReviewBar() {
  const live = livePly();
  const ply = isReviewing() ? state.reviewPly : live;
  if (els.reviewBack) els.reviewBack.disabled = !live || ply <= 0;
  if (els.reviewFwd) els.reviewFwd.disabled = !isReviewing();
  if (els.reviewLive) els.reviewLive.hidden = !isReviewing();
  document.body.classList.toggle("is-review", isReviewing());
}

function paintReviewBoard() {
  const ply = isReviewing() ? state.reviewPly : livePly();
  const snap = gameAtPly(ply);
  const hist = state.game.history({ verbose: true });
  const last = ply > 0 ? hist[ply - 1] : null;
  state.board.setPosition(snap.fen());
  state.board.setLastMove(last?.from || null, last?.to || null);
  state.board.setCheck(snap.in_check() ? kingSquare(snap, snap.turn()) : null);
  state.board.setArrows([]);
  state.board.setInteractive(false);
  renderGraveyard();
}

function showReviewPly(ply) {
  const live = livePly();
  if (ply >= live) {
    exitReview();
    return;
  }
  state.reviewPly = Math.max(0, ply);
  hideHintPanel();
  paintReviewBoard();
  syncReviewBar();
  renderHistory();
}

function exitReview() {
  if (!isReviewing()) {
    syncReviewBar();
    return;
  }
  state.reviewPly = null;
  document.body.classList.remove("is-review");
  const hist = state.game.history({ verbose: true });
  const last = hist[hist.length - 1];
  state.board.setLastMove(last?.from || null, last?.to || null);
  syncBoard({ keepArrows: true });
  if (state.hintPool.length && playerIsSideToMove() && !state.game.game_over()) {
    state.pendingHintReveal = true;
    revealHintsIfReady();
  }
  syncReviewBar();
  renderHistory();
}

function stepReview(delta) {
  const live = livePly();
  if (!live) return;
  const current = isReviewing() ? state.reviewPly : live;
  showReviewPly(current + delta);
}

function capturedSets() {
  const lost = { w: [], b: [] };
  const order = { q: 0, r: 1, b: 2, n: 3, p: 4 };
  const hist = state.game.history({ verbose: true });
  const moves = isReviewing() ? hist.slice(0, state.reviewPly) : hist;
  for (const move of moves) {
    if (!move.captured) continue;
    const victimColor = move.color === "w" ? "b" : "w";
    lost[victimColor].push(move.captured);
  }
  for (const color of ["w", "b"]) {
    lost[color].sort((a, b) => {
      const byValue = (PIECE_VALUE[b] || 0) - (PIECE_VALUE[a] || 0);
      if (byValue) return byValue;
      return (order[a] ?? 9) - (order[b] ?? 9);
    });
  }
  return lost;
}

function graveHtml(types, victimColor, advantage) {
  const icons = types.map((type) => (
    `<img class="grave-piece" src="pieces/${victimColor}${String(type).toUpperCase()}.svg" alt="">`
  )).join("");
  const score = advantage > 0 ? `<span class="grave-score">+${advantage}</span>` : "";
  return `${icons}${score}`;
}

function renderGraveyard() {
  const lost = capturedSets();
  const whiteTook = lost.b.reduce((sum, type) => sum + (PIECE_VALUE[type] || 0), 0);
  const blackTook = lost.w.reduce((sum, type) => sum + (PIECE_VALUE[type] || 0), 0);
  const whiteAdv = Math.max(0, whiteTook - blackTook);
  const blackAdv = Math.max(0, blackTook - whiteTook);
  const whiteBottom = state.board?.orientation !== "black";
  const topColor = whiteBottom ? "b" : "w";
  const botColor = whiteBottom ? "w" : "b";
  if (els.graveTop) {
    els.graveTop.innerHTML = graveHtml(
      lost[botColor],
      botColor,
      topColor === "w" ? whiteAdv : blackAdv
    );
  }
  if (els.graveBottom) {
    els.graveBottom.innerHTML = graveHtml(
      lost[topColor],
      topColor,
      botColor === "w" ? whiteAdv : blackAdv
    );
  }
}

function renderHistory() {
  const history = state.game.history({ verbose: true });
  const mark = isReviewing() ? state.reviewPly : history.length;
  let html = "";
  for (let i = 0; i < history.length; i += 2) {
    const n = i / 2 + 1;
    const white = localizeSan(history[i].san);
    const black = history[i + 1] ? localizeSan(history[i + 1].san) : "";
    const whiteOn = mark === i + 1 ? " is-on" : "";
    const blackOn = mark === i + 2 ? " is-on" : "";
    html += `<div class="move-row"><span class="move-n">${n}.</span><span class="move-san${whiteOn}" data-ply="${i + 1}">${white}</span>${
      black ? `<span class="move-san${blackOn}" data-ply="${i + 2}">${black}</span>` : "<span></span>"
    }</div>`;
  }
  els.moves.innerHTML = html || `<div class="moves-empty">${t("moves.empty")}</div>`;
  if (isReviewing()) {
    els.moves.querySelector(".move-san.is-on")?.scrollIntoView({ block: "nearest" });
  } else {
    els.moves.scrollTop = els.moves.scrollHeight;
  }
  renderGraveyard();
  syncReviewBar();
}

function syncBoard(options = {}) {
  if (isReviewing() && !options.keepReview) {
    state.reviewPly = null;
    document.body.classList.remove("is-review");
    syncReviewBar();
  }
  if (isReviewing()) {
    paintReviewBoard();
    return;
  }
  const fen = state.game.fen();
  state.board.setPosition(fen);
  state.board.setTurn(state.game.turn(), state.playerColor);
  state.board.setCheck(state.game.in_check() ? kingSquare(state.game, state.game.turn()) : null);
  syncHintBoardPlay();
  if (isTrainHold()) {
    if (!options.keepArrows) state.board.setArrows([]);
  } else if (state.aids.moves && hintPanelOpen() && !waitingForHints()) showHintArrows(null, { reveal: true });
  else if (!options.keepArrows) state.board.setArrows([]);
  paintActiveThreats();
  syncCoach();
}

function renderHints() {
  els.hints?.classList.toggle("is-hold", isTrainHold());
  if (waitingForHints() && !isTrainHold()) {
    state.hints = [];
    els.hints.innerHTML = "";
    syncHintNav();
    state.board?.setArrows([]);
    syncTrainContinue();
    syncHintBoardPlay();
    return;
  }
  state.hints = visibleHints();
  const hold = isTrainHold();
  const side = hold && state.trainColor ? state.trainColor : state.game.turn();
  const pawnPoses = quietPawnPoseMap(state.hints, side);
  const knightPoses = quietPiecePoseMap(state.hints, side, "n");
  const bishopPoses = quietPiecePoseMap(state.hints, side, "b");
  const rookPoses = quietPiecePoseMap(state.hints, side, "r");
  const queenPoses = quietPiecePoseMap(state.hints, side, "q");
  const kingPoses = quietPiecePoseMap(state.hints, side, "k");
  const castlePoses = castlePoseMap(state.hints, side);
  const buttons = [];
  for (let i = 0; i < hintsPerPage(); i += 1) {
    const hint = state.hints[i];
    const rank = i + 1;
    if (!hint) {
      const emptyBtn = `
        <button class="hint-btn empty is-card" disabled>
          ${hintCardMediaHtml(`<span class="hint-card-art is-empty"></span>`, "")}
          <span class="hint-body">
            <span class="hint-rank">${rank}</span>
          </span>
        </button>`;
      buttons.push(wrapHintSlot(emptyBtn));
      continue;
    }
    const played = playedFromHint(hint);
    const san = played ? localizeSan(played.san) : hint.uci;
    const art = hintCardMediaHtml(hintArtHtml(played || { piece: "n", san: "" }, side, {
      n: knightPoses.get(hint.uci),
      p: pawnPoses.get(hint.uci),
      b: bishopPoses.get(hint.uci),
      r: rookPoses.get(hint.uci),
      q: queenPoses.get(hint.uci),
      k: kingPoses.get(hint.uci),
      castle: castlePoses.get(hint.uci),
    }), san);
    const picked = hold && hint.uci === state.trainPickedUci;
    const desc = played ? moveHeadline(played) : "";
    const verdict = hold
      ? `${hintTagHtml(hint)}<span class="hint-eval">${hintEvalHtml(hint)}</span>`
      : "";
    const btn = `
      <button class="hint-btn is-card${picked ? " is-picked" : ""}" data-index="${i}" type="button">
        ${art}
        <span class="hint-body">
          <span class="hint-rank">${rank}</span>
          ${desc ? `<span class="hint-desc">${escapeHtml(desc)}</span>` : ""}
        </span>
      </button>`;
    buttons.push(wrapHintSlot(btn, verdict));
  }
  els.hints.innerHTML = buttons.join("");
  syncHintNav();
  syncTrainContinue();
  paintKbdHint();
  syncHintBoardPlay();
}

function showHintArrows(index = null, { reveal = false, onlyActive = false } = {}) {
  if (!isTrainHold() && !hintPanelOpen()) {
    state.board.setArrows([]);
    return;
  }
  if (isTrainHold()) {
    reveal = true;
    onlyActive = true;
  }
  if (!reveal && !state.aids.moves) {
    state.board.setArrows([]);
    return;
  }
  const activeSet = index == null
    ? null
    : new Set((Array.isArray(index) ? index : [index]).filter((i) => Number.isInteger(i)));
  const hasActive = Boolean(activeSet && activeSet.size);
  if (!state.hints.length || !hasActive && onlyActive) {
    state.board.setArrows([]);
    return;
  }
  state.board.setArrows(
    state.hints
      .map((hint, i) => {
        const active = hasActive && activeSet.has(i);
        if (onlyActive && !active) return null;
        const to = hint.uci.slice(2, 4);
        const picked = isTrainHold() && hint.uci === state.trainPickedUci;
        const preview = isTrainHold() && !picked;
        return {
          from: hint.uci.slice(0, 2),
          to,
          color: preview ? ARROW_GRAY : ARROW_GREEN,
          opacity: preview
            ? active || onlyActive ? 0.72 : 0.48
            : active || onlyActive ? 0.95 : 0.64,
          width: active || onlyActive ? "0.24" : "0.15",
          label: active ? hintSan(hint) : "",
          labelColor: "#1f1f1f",
        };
      })
      .filter(Boolean)
  );
}

function youLabel() {
  if (isLocalVsHuman()) return t(state.game.turn() === "w" ? "turn.white" : "turn.black");
  return state.playerColor === "w" ? t("you.white") : t("you.black");
}

async function refreshHints({ reveal = true } = {}) {
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
    const pool = await computeHintPool(state.game);
    if (gameId !== state.gameId || state.game.fen() !== fen) return;
    adoptHintPool(pool);
    state.hintPage = 0;
    state.hintsUnlocked = 0;
    prepareHintTalks();
    renderKingLives();
    if (reveal) {
      state.pendingHintReveal = true;
      revealHintsIfReady();
    }
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
    if (isLocalVsHuman()) {
      const winner = state.game.turn() === "w" ? "black" : "white";
      return [t("end.mateWinTitle"), t("end.mateLocal", { color: t(`player.${winner}`) }), "win"];
    }
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
  thawKingLives();
  if (state.game.in_checkmate()) {
    state.livesForced = state.game.turn() !== state.playerColor ? 6 : 0;
  } else {
    state.livesForced = 6;
  }
  clearHints();
  renderHints();
  syncBoard();
  renderKingLives();
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

function isFirstEngineMove() {
  if (isLocalVsHuman() || state.playerColor !== "b") return false;
  if (state.game.turn() !== "w" || state.game.game_over()) return false;
  return state.game.history().length === (state.openingPly || 0);
}

async function computerMove({ silentWait = false, afterTalk } = {}) {
  const gameId = state.gameId;
  if (state.game.game_over()) {
    finishGame();
    return;
  }
  if (playerIsSideToMove()) {
    await refreshHints();
    return;
  }
  const firstEngine = isFirstEngineMove();
  if (!firstEngine) state.allowHintsWhileSpeaking = false;
  state.busy = true;
  if (!isTrainHold()) {
    clearHints();
    renderHints();
  }
  setStatus(t("turn.opp"), t("king.waiting"), "think");
  if (!silentWait && !firstEngine) {
    state.kingReplay = { type: "waiting" };
    if (!state.kingSpeaking) speakKing(t("king.waiting"));
  }
  const fen = state.game.fen();
  const startedAt = Date.now();
  try {
    const settings = skillSettings(state.skill);
    let uci = "";
    try {
      const played = await state.engine.play(fen, settings);
      uci = played?.uci || "";
    } catch (err) {
      if (err.message === "aborted") throw err;
    }
    if (gameId !== state.gameId || state.game.fen() !== fen) return;
    if (!uci) {
      const legal = new Chess(fen).moves({ verbose: true });
      const pick = legal[Math.floor(Math.random() * Math.max(legal.length, 1))];
      uci = pick ? `${pick.from}${pick.to}${pick.promotion || ""}` : "";
    }
    if (!uci) throw new Error("Nessuna mossa dal motore");
    const preview = new Chess(fen);
    const move = uciToMove(uci);
    const previewPlayed = preview.move({
      from: move.from,
      to: move.to,
      promotion: move.promotion || "q",
    });
    if (!previewPlayed) throw new Error("Mossa motore illegale");

    const beforeEval = Number.isFinite(state.lastPlayerScore) ? state.lastPlayerScore : state.gameEval;
    let pool = [];
    if (!preview.game_over()) {
      pool = await computeHintPool(preview);
      if (gameId !== state.gameId || state.game.fen() !== fen) return;
    }
    const oppKey = pickOpponentKeyFromEval(state.lastPlayerScore, state.hintBestScore);
    const oppBand = opponentReactBand(preview, beforeEval, oppKey);

    if (!firstEngine) await waitAtLeast(10000, startedAt);
    if (afterTalk) await afterTalk;
    if (gameId !== state.gameId || state.game.fen() !== fen) return;

    state.board.setArrows([]);
    if (!firstEngine) await sleep(300);
    if (gameId !== state.gameId || state.game.fen() !== fen) return;
    if (isTrainHold()) {
      clearTrainHold();
      syncTrainContinue();
    }
    hideHintPanel();

    const played = state.game.move({
      from: move.from,
      to: move.to,
      promotion: move.promotion || "q",
    });
    if (!played) throw new Error("Mossa motore illegale");

    state.board.setLastMove(played.from, played.to);
    await state.board.animateMove(played.from, played.to);
    if (gameId !== state.gameId) return;
    thawKingLives();
    state.board.setPosition(state.game.fen());
    flashThreatenedPieces(played);
    renderHistory();

    if (state.game.game_over()) {
      state.busy = false;
      finishGame();
      return;
    }

    adoptHintPool(pool);
    state.hintPage = 0;
    state.hintsUnlocked = 0;
    prepareHintTalks();
    state.pendingHintReveal = true;
    state.busy = false;
    if (oppBand && !firstEngine) showKingReact(oppBand);
    const talk = kingComment(fen, played, true, oppKey, beforeEval);
    state.lastKingTalk = talk;
    state.kingReplay = { type: "opponent", beforeFen: fen, afterFen: state.game.fen(), move: { ...played }, feedbackKey: oppKey, reactBand: oppBand, beforeEval };
    setStatus(t("turn.you"), `${youLabel()}. ${t("turn.make")}`, "play");
    if (firstEngine) {
      state.allowHintsWhileSpeaking = true;
      revealHintsIfReady();
      syncBoard({ keepArrows: true });
      return;
    }
    speakKing(talk, { calculating: true, html: true });
    syncBoard({ keepArrows: true });
  } catch (err) {
    if (err.message === "aborted" || gameId !== state.gameId) return;
    console.error(err);
    setStatus(t("error"), t("king.engineFail"), "lose");
    state.busy = false;
    if (isTrainHold()) {
      clearTrainHold();
      hideHintPanel();
      syncTrainContinue();
    }
    thawKingLives();
    syncBoard();
    return;
  }
}

async function applyUserMove(from, to, promotion, chosenHint) {
  if (state.busy || state.trainHold || !playerIsSideToMove() || state.game.game_over()) {
    syncBoard();
    return;
  }
  if (needsPromotion(state.game, from, to) && !promotion) {
    openPromo(from, to);
    return;
  }
  const chosen = hintForPlayedMove(from, to, promotion, chosenHint);
  const bestScore = state.hintBestScore;
  const poolSnap = (state.hintPool || []).slice();
  const rankKind = hintRankKind(chosen, poolSnap) || "normal";
  const band = rankReactBand(rankKind);
  const livesBefore = kingLifeHalves();
  state.lastPlayerScore = chosen && !chosen.synthetic ? hintScore(chosen) : -Infinity;
  if (Number.isFinite(state.lastPlayerScore)) {
    state.gameEval = evalForPlayer(state.lastPlayerScore, state.game);
  }
  if (!isLocalVsHuman()) freezeKingLives(livesBefore);
  const lifeKey = pickLifeFeedbackKey(kingLifeHalves() - livesBefore);
  const visDelta = displayLifeHalves(kingLifeHalves()) - displayLifeHalves(livesBefore);
  state.busy = true;
  syncHintBoardPlay();
  const fen = state.game.fen();
  const trainReview = Boolean(state.trainingMode);
  if (trainReview) {
    state.trainHold = true;
    state.trainPickedUci = chosen?.uci || `${from}${to}${promotion || ""}`;
    state.trainFen = fen;
    state.trainColor = state.game.turn();
    state.trainLives = livesBefore;
    hideKingFinale();
    state.kbdHint = null;
    paintKbdHint();
  }
  showKingReact(visDelta < 0 ? "heartMany" : band);
  const played = state.game.move({ from, to, promotion: promotion || undefined });
  if (!played) {
    clearTrainHold();
    thawKingLives();
    state.busy = false;
    syncBoard();
    return;
  }
  state.engine.stop();
  if (trainReview) {
    stopMoveClock();
    revealTrainPick();
  } else {
    clearHints();
    hideHintPanel();
    renderHints();
  }
  state.board.setLastMove(played.from, played.to);
  await state.board.animateMove(played.from, played.to);
  state.board.setPosition(state.game.fen());
  flashThreatenedPieces(played);
  renderHistory();
  renderKingLives();
  const replyKey = state.game.game_over() ? "" : pickSeeReplyKey();
  state.kingReplay = { type: "feedback", key: lifeKey, replyKey, rankKind };
  const feedbackTalk = speakKing(playerFeedbackTalk(lifeKey, replyKey, rankKind), { html: true });
  if (trainReview) {
    if (state.autoContinue && !state.game.game_over()) {
      state.busy = false;
      await continueTrainMove({ afterTalk: feedbackTalk, keepSpeaking: true });
      return;
    }
    state.busy = false;
    syncTrainContinue();
    return;
  }
  if (state.game.game_over()) {
    await feedbackTalk;
    finishGame();
    return;
  }
  if (isLocalVsHuman()) {
    await feedbackTalk;
    syncCoach();
    const oppKey = pickOpponentFeedbackKey(chosen, bestScore, poolSnap);
    state.busy = false;
    const beforeEval = Number.isFinite(state.lastPlayerScore) ? state.lastPlayerScore : state.gameEval;
    await refreshHints({ reveal: false });
    const oppBand = opponentReactBand(state.game, beforeEval, oppKey);
    if (oppBand) showKingReact(oppBand);
    const talk = kingComment(fen, played, true, oppKey, beforeEval);
    state.lastKingTalk = talk;
    state.kingReplay = { type: "opponent", beforeFen: fen, afterFen: state.game.fen(), move: { ...played }, feedbackKey: oppKey, reactBand: oppBand, beforeEval };
    state.pendingHintReveal = true;
    speakKing(talk, { calculating: true, html: true });
    return;
  }
  await computerMove({ silentWait: true, afterTalk: feedbackTalk });
}

function openPromo(from, to) {
  state.pendingPromo = { from, to };
  const color = state.game.turn() === "b" ? "b" : "w";
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

function hintsArePlayable() {
  return !isReviewing() && playerIsSideToMove() && !state.busy && !state.trainHold && !state.game.game_over() && state.hints.length;
}

function hintsAreSelectable() {
  return !isReviewing() && !isTrainHold() && !state.game.game_over() && hintPanelOpen() && state.hints.some(Boolean);
}

function moreHintsHotkeyReady() {
  return Boolean(els.moreHints) && !els.moreHints.disabled && !els.hintNav?.hidden && hintPageCount() > 1 && hintPanelOpen();
}

function paintKbdHint() {
  els.hints?.querySelectorAll(".hint-btn").forEach((btn) => {
    btn.classList.toggle("is-kbd", Number.isInteger(state.kbdHint) && Number(btn.dataset.index) === state.kbdHint);
  });
}

function selectHintAt(index) {
  const hint = state.hints[index];
  if (!hint || hint.synthetic && !hint.uci) {
    state.kbdHint = null;
    paintKbdHint();
    return false;
  }
  state.board?.clearPlayFocus();
  state.kbdHint = index;
  paintKbdHint();
  if (isTrainHold() || !state.aids.moves) showHintArrows(index, { reveal: true, onlyActive: true });
  else showHintArrows(index, { reveal: true });
  return true;
}

function playHintAt(index) {
  if (!hintsArePlayable()) return false;
  const hint = state.hints[index];
  if (!hint) return false;
  const move = uciToMove(hint.uci);
  applyUserMove(move.from, move.to, move.promotion, hint);
  return true;
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
  playHintAt(Number(btn.dataset.index));
});

document.addEventListener("keydown", (event) => {
  if (event.altKey || event.ctrlKey || event.metaKey) return;
  if (els.newGame && !els.newGame.hidden) return;
  const target = event.target;
  if (target && (target.closest("input, select, textarea") || target.isContentEditable)) return;
  const arrow = ({
    ArrowUp: [0, -1],
    ArrowDown: [0, 1],
    ArrowLeft: [-1, 0],
    ArrowRight: [1, 0],
  })[event.key];
  if (arrow && boardHintPlayReady()) {
    event.preventDefault();
    if (!state.board.getCursor()) {
      const start = firstBoardPlaySquare();
      if (start) state.board.setCursor(start);
      previewFromBoardCursor();
      return;
    }
    state.board.stepCursor(arrow[0], arrow[1]);
    previewFromBoardCursor();
    return;
  }
  if (event.repeat) return;
  if (event.key === "Escape" && boardHintPlayReady() && (state.board.getSelected() || state.board.getCursor())) {
    event.preventDefault();
    state.board.clearPlayFocus();
    state.kbdHint = null;
    paintKbdHint();
    if (state.aids.moves) showHintArrows(null, { reveal: true });
    else state.board.setArrows([]);
    return;
  }
  if ((event.key === " " || event.key === "Spacebar") && boardHintPlayReady()) {
    event.preventDefault();
    const selected = state.board.getSelected();
    const cursor = state.board.getCursor();
    if (selected && cursor && hintIndexForSquares(selected, cursor) >= 0) {
      playHintMove(selected, cursor);
      return;
    }
    if (!cursor) {
      const start = firstBoardPlaySquare();
      if (start) state.board.setCursor(start);
    }
    state.board.activateCursor();
    previewFromBoardCursor();
    return;
  }
  if (event.key === "Enter") {
    const selected = state.board?.getSelected();
    const cursor = state.board?.getCursor();
    if (boardHintPlayReady() && selected && cursor && hintIndexForSquares(selected, cursor) >= 0) {
      event.preventDefault();
      playHintMove(selected, cursor);
      return;
    }
    if (Number.isInteger(state.kbdHint) && hintsArePlayable()) {
      event.preventDefault();
      playHintAt(state.kbdHint);
      return;
    }
    if (boardHintPlayReady()) {
      event.preventDefault();
      if (!cursor) {
        const start = firstBoardPlaySquare();
        if (start) state.board.setCursor(start);
      }
      state.board.activateCursor();
      previewFromBoardCursor();
    }
    return;
  }
  if (event.key === "5" && moreHintsHotkeyReady()) {
    event.preventDefault();
    els.moreHints.click();
    return;
  }
  if (event.key < "1" || event.key > "9") return;
  const index = Number(event.key) - 1;
  if (index >= hintsPerPage() || !hintsAreSelectable()) return;
  event.preventDefault();
  selectHintAt(index);
});

els.hints.addEventListener("pointerover", (event) => {
  const btn = event.target.closest(".hint-btn");
  if (!btn || btn.disabled || btn.classList.contains("empty")) return;
  const index = Number(btn.dataset.index);
  if (state.board?.getSelected() || state.board?.getCursor()) {
    state.board.clearPlayFocus();
    state.kbdHint = null;
    paintKbdHint();
  }
  if (isTrainHold()) showHintArrows(index, { reveal: true, onlyActive: true });
  else showHintArrows(index, { reveal: true });
});

els.hints.addEventListener("pointerout", (event) => {
  if (event.relatedTarget && els.hints.contains(event.relatedTarget)) return;
  if (isTrainHold()) {
    state.board.setArrows([]);
    return;
  }
  if (Number.isInteger(state.kbdHint)) {
    selectHintAt(state.kbdHint);
    return;
  }
  if (state.aids.moves) showHintArrows(null, { reveal: true });
  else state.board.setArrows([]);
});

els.moreHints.addEventListener("click", () => {
  if (els.moreHints.disabled) return;
  showHintPage(state.hintPage + 1);
});

function startRecalcProgress(ms) {
  if (els.recalcBar) {
    els.recalcBar.hidden = false;
    els.recalcBar.setAttribute("aria-valuenow", "0");
  }
  if (!els.recalcFill) return;
  els.recalcFill.style.transition = "none";
  els.recalcFill.style.transform = "scaleX(0)";
  void els.recalcFill.offsetWidth;
  els.recalcFill.style.transition = `transform ${ms}ms linear`;
  els.recalcFill.style.transform = "scaleX(1)";
}

function stopRecalcProgress() {
  if (els.recalcFill) {
    els.recalcFill.style.transition = "none";
    els.recalcFill.style.transform = "scaleX(0)";
  }
  if (els.recalcBar) {
    els.recalcBar.hidden = true;
    els.recalcBar.setAttribute("aria-valuenow", "0");
  }
}

async function recalculateHints() {
  if (state.busy || state.recalcHints || state.recalcUsedThisTurn || !playerIsSideToMove() || state.game.game_over()) return;
  if (!state.hintPool.length) return;
  const gameId = state.gameId;
  const fen = state.game.fen();
  const prevPool = state.hintPool.slice();
  const prevPage = state.hintPage;
  const prevBest = state.hintBestScore;
  const prevEval = state.gameEval;
  state.recalcHints = true;
  state.busy = true;
  stopMoveClock();
  els.hints?.classList.add("is-recalc");
  syncRecalcButton();
  startRecalcProgress(HINT_RECALC_MS);
  try {
    const pool = await computeHintPool(state.game, { movetime: HINT_RECALC_MS, freezeStand: true });
    if (gameId !== state.gameId || state.game.fen() !== fen) return;
    state.recalcUsedThisTurn = true;
    adoptHintPool(pool, { freezeStand: true });
    state.hintPage = 0;
    state.hintsUnlocked = 0;
    prepareHintTalks();
    renderKingLives();
    renderHints();
    if (state.aids.moves) showHintArrows(null, { reveal: true });
    els.hints.classList.remove("is-reveal");
    void els.hints.offsetWidth;
    els.hints.classList.add("is-reveal");
  } catch (err) {
    if (err.message === "aborted" || gameId !== state.gameId) return;
    console.error(err);
    state.hintPool = prevPool;
    state.hintPage = prevPage;
    state.hintBestScore = prevBest;
    state.gameEval = prevEval;
    state.nextStandEval = null;
    renderHints();
  } finally {
    stopRecalcProgress();
    els.hints?.classList.remove("is-recalc");
    if (gameId === state.gameId) {
      state.busy = false;
      state.recalcHints = false;
      syncHintNav();
      startMoveClock();
    }
  }
}

els.recalcHints?.addEventListener("click", () => {
  if (els.recalcHints.disabled) return;
  recalculateHints();
});

function openingOptionLabel(opening) {
  const name = t(`opening.${opening.id}`);
  const n = opening.sans.length;
  if (!n) return name;
  return t("opening.moves", { name, n });
}

function fillModeSelect() {
  const select = els.playMode;
  if (!select) return;
  const current = select.value || "engine";
  select.innerHTML = ["engine", "local"]
    .map((mode) => `<option value="${mode}"${mode === current ? " selected" : ""}>${t(`mode.${mode}`)}</option>`)
    .join("");
}

function fillFriendWhereSelect() {
  const select = els.friendWhere;
  if (!select) return;
  const current = select.value || "local";
  select.innerHTML = ["local", "online"]
    .map((where) => `<option value="${where}"${where === current ? " selected" : ""}>${t(`friend.${where}`)}</option>`)
    .join("");
}

function fillColorSelect() {
  const select = els.playColor;
  if (!select) return;
  const current = select.value || "random";
  select.innerHTML = ["random", "w", "b"]
    .map((color) => {
      const label = color === "random" ? t("newgame.random") : t(color === "w" ? "newgame.white" : "newgame.black");
      return `<option value="${color}"${color === current ? " selected" : ""}>${label}</option>`;
    })
    .join("");
}

function fillStartKindSelect() {
  const select = els.startKind;
  if (!select) return;
  const current = select.value || "custom";
  select.innerHTML = ["standard", "custom"]
    .map((kind) => `<option value="${kind}"${kind === current ? " selected" : ""}>${t(`start.${kind}`)}</option>`)
    .join("");
}

function previewOpeningLine() {
  if (!els.openingLine) return;
  if (els.startKind?.value !== "custom") {
    els.openingLine.textContent = t("opening.startPos");
    return;
  }
  const id = els.startOpening?.value || "random";
  if (id === "random") {
    els.openingLine.textContent = t("opening.randomHint");
    return;
  }
  const opening = START_OPENINGS.find((item) => item.id === id);
  if (!opening?.sans?.length) {
    els.openingLine.textContent = t("opening.startPos");
    return;
  }
  const probe = new Chess();
  for (const san of opening.sans) {
    if (!probe.move(san)) break;
  }
  els.openingLine.textContent = formatOpeningLine(probe);
}

function currentNewGameTab() {
  return els.newGameTabs?.querySelector("button.is-on")?.dataset.tab || "train";
}

function canStartNewGame() {
  const tab = currentNewGameTab();
  if (tab === "train") return true;
  return tab === "friend" && els.friendWhere?.value === "local";
}

function syncPlayModeFromTab() {
  if (!els.playMode) return;
  els.playMode.value = currentNewGameTab() === "friend" && els.friendWhere?.value === "local" ? "local" : "engine";
}

function syncNewGameTabUi() {
  const tab = currentNewGameTab();
  els.newGame?.querySelectorAll(".new-game-panel").forEach((panel) => {
    panel.hidden = panel.dataset.panel !== tab;
  });
  if (els.newGameTitle) els.newGameTitle.textContent = t(`tab.${tab}`);
  if (els.friendSoon) els.friendSoon.hidden = !(tab === "friend" && els.friendWhere?.value === "online");
  if (els.btnNewStart) els.btnNewStart.hidden = !canStartNewGame();
  syncPlayModeFromTab();
  syncNewGameForm();
}

function setNewGameTab(tab) {
  const next = ["train", "online", "friend", "settings"].includes(tab) ? tab : "train";
  els.newGameTabs?.querySelectorAll("[data-tab]").forEach((btn) => {
    const on = btn.dataset.tab === next;
    btn.classList.toggle("is-on", on);
    btn.setAttribute("aria-selected", on ? "true" : "false");
  });
  syncNewGameTabUi();
}

function syncNewGameForm() {
  const local = els.playMode?.value === "local";
  const custom = els.startKind?.value === "custom";
  if (els.skillRow) els.skillRow.hidden = local;
  if (els.colorRow) els.colorRow.hidden = local;
  if (els.customOpeningRow) els.customOpeningRow.hidden = !custom;
  previewOpeningLine();
}

function openNewGameDialog() {
  fillModeSelect();
  fillFriendWhereSelect();
  fillSkillSelect();
  fillColorSelect();
  fillStartKindSelect();
  fillHintLayoutSelect();
  fillClockSelect();
  fillRoundEvalSelect();
  fillStoryIconsSelect();
  fillStartOpeningSelect();
  if (els.skill) els.skill.value = String(state.skill || 2);
  if (els.playColor) els.playColor.value = state.playColorPref || "random";
  if (els.startKind) els.startKind.value = state.startKind || "custom";
  if (els.startOpening) els.startOpening.value = state.startOpeningId || "random";
  if (els.hintLayout) els.hintLayout.value = HINT_LAYOUTS[state.hintLayout] ? state.hintLayout : "6x1";
  if (els.moveClockSelect) els.moveClockSelect.value = String(moveClockSec());
  if (els.roundEval) els.roundEval.value = state.roundEval ? "1" : "0";
  if (els.storyIcons) els.storyIcons.value = state.storyIcons ? "1" : "0";
  if (els.btnNewCancel) els.btnNewCancel.hidden = !state.hasGame;
  setNewGameTab("train");
  if (els.newGame) els.newGame.hidden = false;
}

function closeNewGameDialog() {
  if (els.newGame) els.newGame.hidden = true;
}

function confirmNewGame() {
  if (!canStartNewGame()) return;
  syncPlayModeFromTab();
  const local = els.playMode?.value === "local";
  applyHintLayout(els.hintLayout?.value || "6x1");
  applyMoveClock(els.moveClockSelect?.value ?? 0);
  state.playColorPref = els.playColor?.value || "random";
  state.startKind = els.startKind?.value === "standard" ? "standard" : "custom";
  state.startOpeningId = els.startOpening?.value || "random";
  let color = "w";
  if (!local) {
    if (state.playColorPref === "b") color = "b";
    else if (state.playColorPref !== "w") color = Math.random() < 0.5 ? "w" : "b";
  }
  closeNewGameDialog();
  startGame(color);
}

function pickOpeningByMoves(n) {
  const pool = START_OPENINGS.filter((opening) => opening.sans.length === n);
  return pool[Math.floor(Math.random() * Math.max(pool.length, 1))] || START_OPENINGS[0];
}

function applyQuickTrainSettings(moves = 0) {
  fillSkillSelect();
  fillColorSelect();
  fillStartKindSelect();
  fillHintLayoutSelect();
  fillClockSelect();
  fillStartOpeningSelect();
  if (els.playMode) els.playMode.value = "engine";
  if (els.skill) els.skill.value = "1";
  if (els.playColor) els.playColor.value = "random";
  if (els.hintLayout) els.hintLayout.value = "6x1";
  if (els.moveClockSelect) els.moveClockSelect.value = "0";
  applyHintLayout("6x1");
  applyMoveClock(0);
  state.mode = "engine";
  state.skill = 1;
  state.playColorPref = "random";
  if (moves > 0) {
    const opening = pickOpeningByMoves(moves);
    state.startKind = "custom";
    state.startOpeningId = opening?.id || "random";
    if (els.startKind) els.startKind.value = "custom";
    if (els.startOpening) els.startOpening.value = state.startOpeningId;
  } else {
    state.startKind = "standard";
    state.startOpeningId = "start";
    if (els.startKind) els.startKind.value = "standard";
  }
}

function startQuickTraining(moves = 0) {
  setAppMenuOpen(false);
  applyQuickTrainSettings(moves);
  closeNewGameDialog();
  startGame(Math.random() < 0.5 ? "w" : "b");
}

function openQuickOnline() {
  setAppMenuOpen(false);
  openNewGameDialog();
  setNewGameTab("online");
}

function fillSkillSelect() {
  const select = els.skill;
  if (!select) return;
  const current = select.value || "2";
  select.innerHTML = [1, 2, 3, 4, 5, 6, 7, 8, 9]
    .map((n) => `<option value="${n}"${String(n) === current ? " selected" : ""}>${t(`skill.${n}`)}</option>`)
    .join("");
}

function fillHintLayoutSelect() {
  const select = els.hintLayout;
  if (!select) return;
  const current = HINT_LAYOUTS[state.hintLayout] ? state.hintLayout : "6x1";
  select.innerHTML = Object.keys(HINT_LAYOUTS)
    .map((id) => `<option value="${id}"${id === current ? " selected" : ""}>${t(`hints.layout.${id}`)}</option>`)
    .join("");
}

function fillClockSelect() {
  const select = els.moveClockSelect;
  if (!select) return;
  const current = String(moveClockSec());
  select.innerHTML = CLOCK_OPTIONS
    .map((n) => `<option value="${n}"${String(n) === current ? " selected" : ""}>${t(`clock.${n}`)}</option>`)
    .join("");
}

function fillRoundEvalSelect() {
  const select = els.roundEval;
  if (!select) return;
  const current = state.roundEval ? "1" : "0";
  select.innerHTML = [
    `<option value="0"${current === "0" ? " selected" : ""}>${t("settings.no")}</option>`,
    `<option value="1"${current === "1" ? " selected" : ""}>${t("settings.yes")}</option>`,
  ].join("");
}

function fillStoryIconsSelect() {
  const select = els.storyIcons;
  if (!select) return;
  const current = state.storyIcons ? "1" : "0";
  select.innerHTML = [
    `<option value="0"${current === "0" ? " selected" : ""}>${t("settings.storyIcons.standard")}</option>`,
    `<option value="1"${current === "1" ? " selected" : ""}>${t("settings.storyIcons.images")}</option>`,
  ].join("");
}

function applyRoundEval(value) {
  state.roundEval = value === "1" || value === true || value === 1;
  try {
    localStorage.setItem(ROUND_EVAL_KEY, state.roundEval ? "1" : "0");
  } catch {
    /* ignore */
  }
  if (els.roundEval) els.roundEval.value = state.roundEval ? "1" : "0";
  renderHints();
}

function applyStoryIcons(value) {
  state.storyIcons = value === "1" || value === true || value === 1;
  try {
    localStorage.setItem(STORY_ICONS_KEY, state.storyIcons ? "1" : "0");
  } catch {
    /* ignore */
  }
  if (els.storyIcons) els.storyIcons.value = state.storyIcons ? "1" : "0";
  syncStoryIconsButton();
  syncHintLayoutUi();
  renderHints();
}

function applyMoveClock(value) {
  const next = CLOCK_OPTIONS.includes(Number(value)) ? Number(value) : 0;
  state.moveClockSec = next;
  try {
    localStorage.setItem(CLOCK_KEY, String(next));
  } catch {
    /* ignore */
  }
  if (els.moveClockSelect) els.moveClockSelect.value = String(next);
  if (els.moveClock && !els.moveClock.hidden && playerIsSideToMove() && state.hintPool.length) {
    startMoveClock();
  }
}

function applyHintLayout(id) {
  const next = HINT_LAYOUTS[id] ? id : "6x1";
  state.hintLayout = next;
  try {
    localStorage.setItem(HINT_LAYOUT_KEY, next);
  } catch {
    /* ignore */
  }
  if (els.hintLayout) els.hintLayout.value = next;
  syncHintLayoutUi();
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
  if (replay.type === "feedback" && replay.key) {
    showKingReact(rankReactBand(replay.rankKind || "normal"));
    speakKing(playerFeedbackTalk(replay.key, replay.replyKey, replay.rankKind), { html: true });
    return;
  }
  if (replay.type === "opponent" && replay.move && replay.beforeFen) {
    if (replay.reactBand) showKingReact(replay.reactBand);
    const before = new Chess(replay.beforeFen);
    const after = new Chess(replay.afterFen || state.game.fen());
    speakKing(narrateOpponentMove(before, replay.move, after, replay.feedbackKey, replay.beforeEval), { calculating: true, html: true });
    return;
  }
  if (replay.type === "resign") {
    speakKing(isLocalVsHuman() ? t("king.resignLocal", { color: sideName() }) : t("king.resign"));
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
  fillModeSelect();
  fillFriendWhereSelect();
  fillSkillSelect();
  fillColorSelect();
  fillStartKindSelect();
  fillHintLayoutSelect();
  fillClockSelect();
  fillRoundEvalSelect();
  fillStoryIconsSelect();
  fillStartOpeningSelect();
  if (!els.newGame?.hidden) syncNewGameTabUi();
  renderKingLegend();
  syncCoach();
  syncStoryIconsButton();
  if (els.openingLine) {
    els.openingLine.textContent = state.startOpening?.sans?.length
      ? formatOpeningLine(state.game)
      : t("opening.startPos");
  }
  renderHistory();
  renderHints();
  syncTrainingModeUi();
  syncAutoContinueUi();
  replayKingTalk();
}

function fillStartOpeningSelect() {
  const select = els.startOpening;
  if (!select) return;
  const current = select.value || "random";
  const named = START_OPENINGS.filter((opening) => opening.id !== "start");
  select.innerHTML = [
    `<option value="random"${current === "random" ? " selected" : ""}>${t("opening.random")}</option>`,
    ...named.map((opening) => (
      `<option value="${opening.id}"${opening.id === current ? " selected" : ""}>${openingOptionLabel(opening)}</option>`
    )),
  ].join("");
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
  if (els.startKind?.value !== "custom") {
    return START_OPENINGS.find((opening) => opening.id === "start") || START_OPENINGS[0];
  }
  const id = els.startOpening?.value || "random";
  if (id === "random") return pickRandomStartOpening();
  return START_OPENINGS.find((opening) => opening.id === id) || pickRandomStartOpening();
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
  const next = isLocalVsHuman()
    ? t("king.yourMoveNamed", { color: sideName() })
    : playerIsSideToMove() ? t("king.yourMove") : t("king.waitTurn");
  return `${start} ${next}`;
}

function pickRandomStartOpening() {
  const playable = START_OPENINGS.filter((opening) => opening.sans.length);
  return playable[Math.floor(Math.random() * playable.length)] || START_OPENINGS[0];
}

function startFirstVisitGame() {
  startQuickTraining(0);
}

function startGame(playerColor = state.playerColor) {
  state.hasGame = true;
  state.gameId += 1;
  state.speakToken += 1;
  state.kingSpeaking = false;
  state.engine.stop();
  state.game.reset();
  state.mode = els.playMode?.value === "local" ? "local" : "engine";
  state.skill = Number(els.skill?.value || state.skill || 1);
  state.busy = false;
  state.reviewPly = null;
  document.body.classList.remove("is-review");
  state.recalcHints = false;
  state.recalcUsedThisTurn = false;
  stopRecalcProgress();
  state.lastHintMix = "";
  hideKingFinale();
  if (els.hintMix) {
    els.hintMix.innerHTML = "";
    els.hintMix.hidden = true;
  }
  state.gameEval = 0;
  state.standEval = 0;
  state.nextStandEval = null;
  state.livesForced = null;
  thawKingLives();
  stopLivesAnim();
  state.shownLives = null;
  clearKingReact();
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
  if (!isLocalVsHuman()) {
    state.playerColor = playerColor;
    state.board.setOrientation(playerColor === "w" ? "white" : "black");
  }
  applyStartOpening();
  if (isLocalVsHuman()) state.playerColor = state.game.turn();
  syncCoach();
  renderHints();
  renderHistory();
  syncBoard({ keepArrows: true });
  setStatus(
    isLocalVsHuman() || playerIsSideToMove() ? t("turn.you") : t("turn.opp"),
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
  if (!isLocalVsHuman() && state.game.turn() !== state.playerColor && state.game.history().length > state.openingPly) {
    state.game.undo();
  }
  const hist = state.game.history({ verbose: true });
  const last = hist[hist.length - 1];
  state.board.setLastMove(last ? last.from : null, last ? last.to : null);
  thawKingLives();
  clearHints();
  renderHistory();
  syncCoach();
  syncBoard();
  computerMove();
}

function setAppMenuOpen(open) {
  const btn = document.getElementById("btn-menu");
  const panel = document.getElementById("app-menu-panel");
  if (!btn || !panel) return;
  panel.hidden = !open;
  btn.setAttribute("aria-expanded", open ? "true" : "false");
}

document.getElementById("btn-menu")?.addEventListener("click", (event) => {
  event.stopPropagation();
  const panel = document.getElementById("app-menu-panel");
  setAppMenuOpen(Boolean(panel?.hidden));
});
document.getElementById("btn-menu-new")?.addEventListener("click", () => {
  setAppMenuOpen(false);
  openNewGameDialog();
});
document.getElementById("quick-train")?.addEventListener("click", () => startQuickTraining(0));
document.getElementById("quick-train-12")?.addEventListener("click", () => startQuickTraining(12));
document.getElementById("quick-train-24")?.addEventListener("click", () => startQuickTraining(24));
document.getElementById("quick-online")?.addEventListener("click", () => openQuickOnline());
document.addEventListener("click", (event) => {
  const menu = event.target.closest(".app-menu");
  if (!menu) setAppMenuOpen(false);
});
document.getElementById("btn-new").addEventListener("click", () => openNewGameDialog());
document.getElementById("btn-flip").addEventListener("click", () => {
  const next = state.board.orientation === "white" ? "black" : "white";
  state.board.setOrientation(next);
  syncCoach();
  renderGraveyard();
});
document.getElementById("btn-undo").addEventListener("click", undoFullTurn);
els.reviewBack?.addEventListener("click", () => stepReview(-1));
els.reviewFwd?.addEventListener("click", () => stepReview(1));
els.reviewLive?.addEventListener("click", () => exitReview());
els.moves?.addEventListener("click", (event) => {
  const cell = event.target.closest("[data-ply]");
  if (!cell) return;
  const ply = Number(cell.dataset.ply);
  if (!Number.isFinite(ply)) return;
  if (ply >= livePly()) exitReview();
  else showReviewPly(ply);
});
document.getElementById("btn-resign").addEventListener("click", () => {
  if (state.game.game_over() || !state.game.history().length) {
    openNewGameDialog();
    return;
  }
  state.engine.stop();
  state.busy = false;
  thawKingLives();
  state.livesForced = 1;
  clearHints();
  renderHints();
  renderKingLives();
  if (isLocalVsHuman()) {
    const color = sideName();
    setStatus(t("end.resignTitle"), t("end.resignLocal", { color }), "lose");
    state.kingReplay = { type: "resign" };
    speakKing(t("king.resignLocal", { color }), { calculating: false });
  } else {
    setStatus(t("end.resignTitle"), t("end.resign"), "lose");
    state.kingReplay = { type: "resign" };
    speakKing(t("king.resign"), { calculating: false });
  }
  state.board.setInteractive(false);
});
els.newGameTabs?.addEventListener("click", (event) => {
  const tab = event.target.closest("[data-tab]");
  if (!tab) return;
  setNewGameTab(tab.dataset.tab);
});
els.friendWhere?.addEventListener("change", () => syncNewGameTabUi());
els.playMode?.addEventListener("change", () => syncNewGameForm());
els.startKind?.addEventListener("change", () => syncNewGameForm());
els.startOpening?.addEventListener("change", () => previewOpeningLine());
els.roundEval?.addEventListener("change", () => applyRoundEval(els.roundEval.value));
els.storyIcons?.addEventListener("change", () => applyStoryIcons(els.storyIcons.value));
els.btnNewStart?.addEventListener("click", () => confirmNewGame());
els.btnNewCancel?.addEventListener("click", () => {
  if (state.hasGame) closeNewGameDialog();
});
els.newGame?.addEventListener("click", (event) => {
  if (event.target === els.newGame && state.hasGame) closeNewGameDialog();
});
document.addEventListener("keydown", (event) => {
  if (event.key !== "Escape" || els.newGame?.hidden || !state.hasGame) return;
  closeNewGameDialog();
});
els.aidMoves.addEventListener("click", () => showAid("moves"));
els.aidThreats.addEventListener("click", () => showAid("threats"));
els.aidIcons?.addEventListener("click", () => applyStoryIcons(!state.storyIcons));
els.trainingMode?.addEventListener("click", () => setTrainingMode(!state.trainingMode));
els.autoContinue?.addEventListener("change", () => setAutoContinue(els.autoContinue.checked));
els.trainContinue?.addEventListener("click", () => {
  if (els.trainContinue.disabled) return;
  continueTrainMove();
});

state.board = new Board(els.boardRoot, {
  onMove: (from, to) => playHintMove(from, to),
  onSelect: (square) => {
    if (!square) {
      if (isTrainHold()) return;
      if (hintPanelOpen() && state.aids.moves) showHintArrows(null, { reveal: true });
      else if (hintPanelOpen()) state.board.setArrows([]);
      return;
    }
    state.kbdHint = null;
    paintKbdHint();
    previewHintsFromSquare(square);
  },
});

document.addEventListener("pointerdown", (event) => {
  if (event.button != null && event.button !== 0) return;
  if (!state.board?.getSelected()) return;
  if (event.target.closest("#board-root") || event.target.closest("#promo")) return;
  state.board.clearPlayFocus();
  state.kbdHint = null;
  paintKbdHint();
  if (isTrainHold() || event.target.closest(".hint-btn")) return;
  if (hintPanelOpen() && state.aids.moves) showHintArrows(null, { reveal: true });
  else state.board.setArrows([]);
});

applyStaticI18n();
fillModeSelect();
fillFriendWhereSelect();
fillSkillSelect();
fillColorSelect();
fillStartKindSelect();
fillHintLayoutSelect();
fillClockSelect();
fillRoundEvalSelect();
fillStoryIconsSelect();
fillStartOpeningSelect();
syncHintLayoutUi();
syncStoryIconsButton();
syncTrainingModeUi();
syncAutoContinueUi();
renderKingLives();
renderKingLegend();
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
