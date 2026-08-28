import { Chess, SQUARES } from "./chess.min.js";
import { Engine } from "./engine.js?v=20260827elo13";
import { Board } from "./board.js?v=20260828num2";
import { loadOpenings, describePosition, START_OPENINGS } from "./openings.js";
import { applyStaticI18n, getLang, t } from "./i18n.js?v=20260828barh";

const PIECE_VALUE = { p: 1, n: 3, b: 3, r: 5, q: 9, k: 0 };
const HINT_LAYOUT_KEY = "5minchess.hintLayout";
const TRAIN_MODE_KEY = "5minchess.trainingMode";
const AUTO_CONTINUE_KEY = "5minchess.autoContinue";
const ADMIN_SOLUTIONS_KEY = "5minchess.adminSolutions";
const AID_THREATS_KEY = "5minchess.aidThreats";
const AID_MOVES_KEY = "5minchess.aidMoves";
const CARD_CLICK_KEY = "5minchess.cardClick";
const REVIEW_ARROWS_KEY = "5minchess.reviewArrows";
const REVIEW_ARROW_LABELS_KEY = "5minchess.reviewArrowLabels";
const EVAL_BAR_HIDE_DIFF_KEY = "5minchess.evalBarHideDiff";
const EVAL_BAR_BLOCK_ONLY_KEY = "5minchess.evalBarBlockOnly";
const EVAL_BAR_STYLE_KEY = "5minchess.evalBarStyle";
const HINT_FAKE_LOAD_MS = 3000;
const OPP_REPLY_MIN_MS = 10000;
const KING_TALK_HIDE = {
  hintMix: true,
  oppMoveDetail: true,
  hanging: true,
  talkAfterRank: true,
};
const HINT_LAYOUTS = {
  "4x1": { perPage: 4, pages: 1 },
  "6x1": { perPage: 6, pages: 1 },
  "4x2": { perPage: 8, pages: 1 },
  "6x2": { perPage: 12, pages: 1 },
  "4x3": { perPage: 12, pages: 1 },
};
const HINT_LAYOUT_ORDER = ["4x1", "6x1", "4x2", "6x2"];
const CLOCK_KEY = "5minchess.moveClock";
const ROUND_EVAL_KEY = "5minchess.roundEval";
const STORY_ICONS_KEY = "5minchess.pieceCards";
const EVAL_VIEW_KEY = "5minchess.evalView";
const HINT_INFO_KEY = "5minchess.hintInfo";
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
const FUMETTO_W_KNIGHT_DIR = "immagini-stile-fumetto/cavallobianco";
const FUMETTO_W_PAWN_DIR = "immagini-stile-fumetto/pedonebianco";
const FUMETTO_W_BISHOP_DIR = "immagini-stile-fumetto/alfierobianco";
const FUMETTO_W_ROOK_DIR = "immagini-stile-fumetto/torrebianca";
const FUMETTO_W_QUEEN_DIR = "immagini-stile-fumetto/reginabianca";
const FUMETTO_W_KING_DIR = "immagini-stile-fumetto/rebianco";
const FUMETTO_W_CASTLE_DIR = "immagini-stile-fumetto/arroccobianco";
const FUMETTO_KNIGHT_DIR = "immagini-stile-fumetto/cavallonero";
const FUMETTO_PAWN_DIR = "immagini-stile-fumetto/pedonennero";
const FUMETTO_BISHOP_DIR = "immagini-stile-fumetto/alfierennero";
const FUMETTO_ROOK_DIR = "immagini-stile-fumetto/torrenera";
const FUMETTO_QUEEN_DIR = "immagini-stile-fumetto/reginanera";
const FUMETTO_KING_DIR = "immagini-stile-fumetto/renero";
const FUMETTO_CASTLE_DIR = "immagini-stile-fumetto/arrocconero";
const FUMETTO_W_ROOK_ART = {
  ...WAR_W_ROOK_ART,
  captureQ: { file: "Torre Bianca Cattura Regina.png", title: "art.wrook.captureQ" },
};
const FUMETTO_W_KING_ART = {
  ...WAR_W_KING_ART,
  check: { file: "Re Bianco Fa scacco al RE.png", title: "art.wking.check" },
};
const CLOCK_OPTIONS = [0, 10, 30, 45, 60];
const CLOCK_AUTO_BEST = new Set([10]);
const HINT_RECALC_MS = 8000;

function readHintLayout() {
  try {
    const saved = localStorage.getItem(HINT_LAYOUT_KEY);
    if (saved === "4x3") return "6x2";
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

function readAdminSolutions() {
  try {
    return localStorage.getItem(ADMIN_SOLUTIONS_KEY) === "1";
  } catch {
    return false;
  }
}

function readAidThreats() {
  try {
    return localStorage.getItem(AID_THREATS_KEY) === "1";
  } catch {
    return false;
  }
}

function readAidMoves() {
  try {
    return localStorage.getItem(AID_MOVES_KEY) !== "0";
  } catch {
    return true;
  }
}

function readCardClick() {
  try {
    return localStorage.getItem(CARD_CLICK_KEY) !== "0";
  } catch {
    return true;
  }
}

function readReviewArrows() {
  try {
    return localStorage.getItem(REVIEW_ARROWS_KEY) === "1";
  } catch {
    return false;
  }
}

function readReviewArrowLabels() {
  try {
    return localStorage.getItem(REVIEW_ARROW_LABELS_KEY) === "1";
  } catch {
    return false;
  }
}

function readEvalBarHideDiff() {
  try {
    return localStorage.getItem(EVAL_BAR_HIDE_DIFF_KEY) === "1";
  } catch {
    return false;
  }
}

function readEvalBarBlockOnly() {
  try {
    return localStorage.getItem(EVAL_BAR_BLOCK_ONLY_KEY) === "1";
  } catch {
    return false;
  }
}

function readEvalBarStyle() {
  try {
    const saved = localStorage.getItem(EVAL_BAR_STYLE_KEY);
    if (saved === "standard" || saved === "blocks" || saved === "icons" || saved === "hearts") return saved;
  } catch {
    /* ignore */
  }
  return "blocks";
}

function evalBarStyle() {
  const value = state.evalBarStyle;
  if (value === "standard" || value === "blocks" || value === "icons" || value === "hearts") return value;
  return "blocks";
}

function readRoundEval() {
  try {
    return localStorage.getItem(ROUND_EVAL_KEY) === "1";
  } catch {
    return false;
  }
}

function readEvalView() {
  try {
    const saved = localStorage.getItem(EVAL_VIEW_KEY);
    if (saved === "abs" || saved === "prevOpp" || saved === "sword" || saved === "twentieths") return saved;
    return "delta";
  } catch {
    return "delta";
  }
}

function normalizeEvalView(value) {
  if (value === "abs" || value === "prevOpp" || value === "sword" || value === "twentieths") return value;
  return "delta";
}

function isPrevOppEval() {
  return state.evalView === "prevOpp";
}

function isSwordEval() {
  return state.evalView === "sword";
}

function isTwentiethsEval() {
  return state.evalView === "twentieths";
}

function evalBarHoldActive() {
  return (isTwentiethsEval() || isPrevOppEval()) && !isLocalVsHuman();
}

function isAbsLikeEval() {
  return state.evalView === "abs";
}

function evalViewShortKey() {
  if (state.evalView === "abs") return "tools.hintInfo.eval.abs";
  if (state.evalView === "prevOpp") return "tools.hintInfo.eval.prevOpp";
  if (isSwordEval()) return "tools.hintInfo.eval.sword";
  if (isTwentiethsEval()) return "tools.hintInfo.eval.twentieths";
  return "tools.hintInfo.eval.delta";
}

function hintOverlayShortKey() {
  return isHintOverlayInternal() ? "tools.hintInfo.overlay.internal" : "tools.hintInfo.overlay.external";
}

function readHintInfo() {
  const fallback = {
    place: true,
    sign: "arrow",
    arrow: true,
    score: "number",
    overlay: "external",
  };
  try {
    const raw = JSON.parse(localStorage.getItem(HINT_INFO_KEY) || "null");
    if (!raw || typeof raw !== "object") return fallback;
    const sign = raw.sign === "icons" || raw.sign === "off" || raw.sign === "arrow"
      ? raw.sign
      : raw.arrow === false ? "off" : "arrow";
    return {
      place: raw.place !== false,
      sign,
      arrow: sign !== "off",
      score: raw.score === "hearts" ? "hearts" : "number",
      overlay: raw.overlay === "internal" ? "internal" : "external",
    };
  } catch {
    return fallback;
  }
}

function hintInfoSign() {
  const value = state.hintInfo?.sign;
  if (value === "icons" || value === "off" || value === "arrow") return value;
  return state.hintInfo?.arrow === false ? "off" : "arrow";
}

function readCardStyle() {
  try {
    const saved = localStorage.getItem(STORY_ICONS_KEY);
    if (saved === "0" || saved === "icons") return "icons";
    if (saved === "fumetto") return "fumetto";
    return "war";
  } catch {
    return "war";
  }
}

function normalizeCardStyle(value) {
  if (value === "0" || value === "icons" || value === false || value === 0) return "icons";
  if (value === "fumetto") return "fumetto";
  return "war";
}

function cardStyleShortKey() {
  if (state.cardStyle === "fumetto") return "settings.storyIcons.fumettoShort";
  if (state.cardStyle === "icons") return "settings.storyIcons.standardShort";
  return "settings.storyIcons.warShort";
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
  "inaccuracy", "mistake", "blunder", "mateMiss", "mateRisk",
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
  if (deltaHalves > LIFE_EPS) bucket = "gain";
  else if (deltaHalves < -LIFE_EPS) {
    const lost = Math.min(5, Math.max(1, Math.round(-deltaHalves)));
    bucket = ["", "lose05", "lose10", "lose15", "lose20", "lose25"][lost];
  }
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
  const head = `<strong>${escapeHtml(opener)}</strong>`;
  if (KING_TALK_HIDE.talkAfterRank) {
    const wait = replyKey ? t("king.waiting") : "";
    return wait ? `${head}<br><br>${escapeHtml(wait)}` : head;
  }
  const body = t(lifeKey);
  const wait = replyKey ? t(replyKey) : "";
  const line = `${head} ${escapeHtml(body)}`.trim();
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
const ARROW_GRAY_LIGHT = "#d8d8d8";
const ARROW_GOLD = "#c6cc3a";
const REVIEW_NEAR_BEST = 50;

const SKILL_LEVELS = {
  1: { elo: 1300, skill: 1, movetime: 380 },
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
  return SKILL_LEVELS[Number(skill)] || SKILL_LEVELS[2];
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
  const nowHalves = isTrainHold() && Number.isFinite(state.trainLives) && !isPrevOppEval()
    ? state.trainLives
    : isPrevOppEval()
      ? livesFromCp(hintBaselineEval())
      : kingLifeHalves();
  const now = displayLifeHalves(nowHalves);
  const game = isTrainHold() && state.trainFen ? new Chess(state.trainFen) : state.game;
  const after = displayLifeHalves(livesFromCp(evalForPlayer(score, game)));
  const delta = after - now;
  return Math.abs(delta) < LIFE_EPS ? 0 : delta;
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
  if (place === 1) return t("hint.tag.best");
  return t("hint.tag.variant");
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

function positionEvalNow() {
  const game = hintEvalGame();
  if (Number.isFinite(state.hintBestScore) && state.hintBestScore > -Infinity) {
    return evalForPlayer(state.hintBestScore, game);
  }
  return Number.isFinite(state.gameEval) ? state.gameEval : 0;
}

function evalShownPoints(cp) {
  if (!Number.isFinite(cp)) return null;
  return state.roundEval ? Math.round(cp / 10) * 10 : Math.round(cp);
}

function formatSignedPawns(cp) {
  const shown = evalShownPoints(cp);
  if (shown == null) return "—";
  if (!shown) return "0";
  return shown > 0 ? `+${shown}` : `${shown}`;
}

function pawnCommaParts(cp) {
  const shown = evalShownPoints(cp);
  if (shown == null) return null;
  const abs = Math.abs(shown);
  const tenths = Math.floor(abs / 10);
  if (tenths > 99) {
    return {
      sign: shown < 0 ? "-" : "",
      int: "10",
      frac: "+",
      cap: true,
    };
  }
  return {
    sign: shown > 0 ? "+" : shown < 0 ? "-" : "",
    int: String(Math.floor(tenths / 10)),
    frac: String(tenths % 10),
    cap: false,
  };
}

function formatPawnCommaText(cp) {
  const parts = pawnCommaParts(cp);
  if (!parts) return "—";
  if (parts.cap) return `${parts.sign}${parts.int}${parts.frac}`;
  return `${parts.sign}${parts.int},${parts.frac}`;
}

function formatPawnCommaHtml(cp) {
  const parts = pawnCommaParts(cp);
  if (!parts) return "—";
  const frac = parts.cap ? escapeHtml(parts.frac) : `,${escapeHtml(parts.frac)}`;
  return `<span class="eval-pawn">${escapeHtml(parts.sign)}<span class="eval-pawn-int">${escapeHtml(parts.int)}</span><span class="eval-pawn-frac">${frac}</span></span>`;
}

function hintEvalShownCp(info) {
  if (!info || info.synthetic) return null;
  if (info.scoreType === "mate") return null;
  const moveEval = hintMoveEval(info);
  if (moveEval == null) return null;
  return isAbsLikeEval() ? moveEval : moveEval - hintBaselineEval();
}

function hintEvalDir(info) {
  if (!info || info.synthetic) return "";
  if (info.scoreType === "mate") return info.score < 0 ? "down" : "up";
  if (isSwordEval()) {
    const next = hintMoveEval(info);
    if (next == null) return "";
    const shownNext = evalShownPoints(next) || 0;
    const shownPrev = evalShownPoints(positionEvalNow()) || 0;
    return shownNext < shownPrev ? "down" : "up";
  }
  if (isTwentiethsEval()) {
    const parts = twentiethsSwingParts(info);
    if (!parts) return "";
    if (parts.recovery > 0 || parts.damage > 0) return "up";
    if (parts.heartLoss > 0 || parts.swordLoss > 0) return "down";
    return "";
  }
  const cp = hintEvalShownCp(info);
  if (cp == null) return "";
  const shown = evalShownPoints(cp);
  if (shown == null) return "";
  return shown < 0 ? "down" : "up";
}

function formatHintEval(info) {
  if (!info || info.synthetic) return "—";
  if (info.scoreType === "mate") {
    if (info.score > 0) return t("eval.mateIn", { n: info.score });
    if (info.score < 0) return t("eval.mateIn", { n: Math.abs(info.score) });
    return t("eval.mate");
  }
  const moveEval = hintMoveEval(info);
  if (moveEval == null) return "—";
  return formatSignedPawns(moveEval);
}

function hintBaselineEval() {
  if (isPrevOppEval() || isTwentiethsEval()) {
    return Number.isFinite(state.beforeOppEval) ? state.beforeOppEval : 0;
  }
  return positionEvalNow();
}

function formatHintDelta(info) {
  if (!info || info.synthetic) return "—";
  if (info.scoreType === "mate") {
    if (info.score > 0) return t("eval.mateIn", { n: info.score });
    if (info.score < 0) return t("eval.mateIn", { n: Math.abs(info.score) });
    return t("eval.mate");
  }
  const moveEval = hintMoveEval(info);
  if (moveEval == null) return "—";
  const cp = moveEval - hintBaselineEval();
  return isPrevOppEval() ? formatPawnCommaText(cp) : formatSignedPawns(cp);
}

function hintEvalArrowSvg(dir) {
  const path = dir === "down"
    ? "M12 20 4 12h5V4h6v8h5Z"
    : "M12 4l8 8h-5v8h-6v-8H4Z";
  return `<svg class="hint-eval-dir is-${dir}" viewBox="0 0 24 24" aria-hidden="true"><path fill="currentColor" d="${path}"/></svg>`;
}

function evalBarPawnBlock(cp) {
  if (!Number.isFinite(cp)) return 0;
  if (Math.abs(cp) >= 50000) return cp > 0 ? 10 : -10;
  return Math.trunc(Math.max(-10, Math.min(10, cp / 100)));
}

function evalBarHeartCount(cp) {
  return Math.max(0, Math.min(9, evalBarPawnBlock(cp) + 9));
}

function evalBarSwordCount(cp) {
  return Math.max(0, Math.min(9, evalBarPawnBlock(cp)));
}

function hintBarMeterShift(info) {
  if (!info || info.synthetic) return { hearts: 0, swords: 0 };
  const nextCp = hintMoveEval(info);
  const prevCp = Number.isFinite(state.gameEval) ? state.gameEval : 0;
  if (!Number.isFinite(nextCp)) return { hearts: 0, swords: 0 };
  return {
    hearts: evalBarHeartCount(nextCp) - evalBarHeartCount(prevCp),
    swords: evalBarSwordCount(nextCp) - evalBarSwordCount(prevCp),
  };
}

function hintSignHtml(info) {
  const mode = hintInfoSign();
  if (mode === "off") return "";
  if (mode === "icons") {
    const { hearts, swords } = hintBarMeterShift(info);
    const bits = [];
    if (hearts !== 0) {
      bits.push(`<span class="hint-sign-icon is-heart">${hintEvalHeartHtml()}</span>`);
    }
    if (swords > 0) {
      bits.push(`<span class="hint-sign-icon is-sword">${evalSwordSvg()}</span>`);
    }
    return bits.join("");
  }
  const dir = hintEvalDir(info);
  return dir ? hintEvalArrowSvg(dir) : "";
}

function evalSwordSvg() {
  return `<img class="eval-sword" src="img/eval-sword.svg" alt="" aria-hidden="true">`;
}

function hintEvalHeartHtml() {
  return `<span class="hint-eval-heart" aria-hidden="true">♥</span>`;
}

function oppKingPieceSrc() {
  const me = isLocalVsHuman() ? (hintEvalGame()?.turn() || "w") : (state.playerColor || "w");
  return `pieces/${me === "w" ? "b" : "w"}K.svg`;
}

function hintEvalOppKingHtml() {
  return `<img class="eval-opp-king" src="${oppKingPieceSrc()}" alt="" aria-hidden="true">`;
}

function swordSwingParts(info) {
  const next = hintMoveEval(info);
  if (next == null) return null;
  const prev = positionEvalNow();
  if (next > 0) {
    return {
      recovery: Math.max(0, -Math.min(0, prev)),
      damage: next,
      heartLoss: 0,
      swordLoss: 0,
    };
  }
  if (next < 0) {
    return {
      recovery: 0,
      damage: 0,
      heartLoss: prev > 0 ? prev - next : -next,
      swordLoss: 0,
    };
  }
  return {
    recovery: Math.max(0, -prev),
    damage: 0,
    heartLoss: 0,
    swordLoss: Math.max(0, prev),
  };
}

function hintSwordRowHtml(value, iconHtml, up) {
  const n = evalShownPoints(value) || 0;
  const score = n ? `${up ? "+" : "−"}${n}` : "0";
  return `<span class="hint-sword-row">${score}${iconHtml}</span>`;
}

function hintSwordEvalHtml(info) {
  if (info.scoreType === "mate") return escapeHtml(formatHintDelta(info));
  const parts = swordSwingParts(info);
  if (!parts) return "—";
  const rec = evalShownPoints(parts.recovery) || 0;
  const dmg = evalShownPoints(parts.damage) || 0;
  const hLoss = evalShownPoints(parts.heartLoss) || 0;
  const sLoss = evalShownPoints(parts.swordLoss) || 0;
  const rows = [];
  if (hLoss > 0 && sLoss > 0) {
    rows.push(hintSwordRowHtml(hLoss + sLoss, hintEvalHeartHtml(), false));
  } else {
    if (rec > 0) rows.push(hintSwordRowHtml(rec, hintEvalHeartHtml(), true));
    else if (hLoss > 0) rows.push(hintSwordRowHtml(hLoss, hintEvalHeartHtml(), false));
    if (dmg > 0) rows.push(hintSwordRowHtml(dmg, evalSwordSvg(), true));
    else if (sLoss > 0) rows.push(hintSwordRowHtml(sLoss, evalSwordSvg(), false));
  }
  if (!rows.length) return "";
  return `<span class="hint-sword-rows">${rows.join("")}</span>`;
}

function twentiethsSwingParts(info) {
  const nextCp = hintMoveEval(info);
  if (nextCp == null) return null;
  const next = signedTwentieths(nextCp);
  const prev = signedTwentieths(Number.isFinite(state.beforeOppEval) ? state.beforeOppEval : 0);
  return {
    recovery: Math.max(0, Math.min(0, next) - Math.min(0, prev)),
    damage: Math.max(0, Math.max(0, next) - Math.max(0, prev)),
    heartLoss: Math.max(0, Math.min(0, prev) - Math.min(0, next)),
    swordLoss: Math.max(0, Math.max(0, prev) - Math.max(0, next)),
  };
}

function hintTwentiethsRowHtml(n, iconHtml, up) {
  if (!n) return "";
  return `<span class="hint-sword-row">${up ? "+" : "−"}${n}${iconHtml}</span>`;
}

function hintTwentiethsEvalHtml(info) {
  if (info.scoreType === "mate") return escapeHtml(formatHintDelta(info));
  const parts = twentiethsSwingParts(info);
  if (!parts) return "—";
  const rows = [];
  if (parts.recovery > 0) rows.push(hintTwentiethsRowHtml(parts.recovery, hintEvalHeartHtml(), true));
  else if (parts.heartLoss > 0) rows.push(hintTwentiethsRowHtml(parts.heartLoss, hintEvalHeartHtml(), false));
  if (parts.damage > 0) rows.push(hintTwentiethsRowHtml(parts.damage, evalSwordSvg(), true));
  if (parts.swordLoss > 0) rows.push(hintTwentiethsRowHtml(parts.swordLoss, hintEvalOppKingHtml(), true));
  if (!rows.length) return "";
  return `<span class="hint-sword-rows">${rows.join("")}</span>`;
}

function hintEvalHtml(info) {
  if (!info || info.synthetic) return "—";
  const sign = hintSignHtml(info);
  if (isTwentiethsEval()) {
    const html = hintTwentiethsEvalHtml(info);
    if (!html) return "";
    return `${sign}${html}`;
  }
  if (isSwordEval()) return `${sign}${hintSwordEvalHtml(info)}`;
  if (state.hintInfo?.score === "hearts") {
    const hearts = isAbsLikeEval() ? hintLivesRowHtml(info) : hintHeartsHtml(info);
    return `${sign}${hearts}`;
  }
  if (isPrevOppEval()) {
    if (info.scoreType === "mate") return `${sign}${escapeHtml(formatHintDelta(info))}`;
    const cp = hintEvalShownCp(info);
    const score = cp == null ? "—" : formatPawnCommaHtml(cp);
    return `${sign}${score}`;
  }
  const score = escapeHtml(isAbsLikeEval() ? formatHintEval(info) : formatHintDelta(info));
  return `${sign}${score}${hintEvalHeartHtml()}`;
}

function isHintOverlayInternal() {
  return state.hintInfo?.overlay === "internal";
}

function hintCardPlaceOverlayHtml(hint) {
  if (!state.hintInfo?.place) return "";
  const place = hintPlaceMap().get(hint?.uci);
  if (!place) return "";
  const text = formatPlace(place);
  const fontSize = 40;
  const strokeW = 5.2;
  const pad = strokeW + 2;
  const w = Math.ceil(text.length * fontSize * 0.72 + pad * 2);
  const h = Math.ceil(fontSize + pad * 2);
  const star = place === 1 ? `<span class="hint-in-place-star" aria-hidden="true">★</span>` : "";
  return `<span class="hint-in-place"><svg class="hint-in-place-num" width="${w}" height="${h}" viewBox="0 0 ${w} ${h}" aria-hidden="true">
    <text x="${pad.toFixed(1)}" y="${(h / 2).toFixed(1)}" text-anchor="start" dominant-baseline="middle" dy="0.08" fill="#fff" stroke="#111" stroke-width="${strokeW.toFixed(2)}" stroke-linejoin="round" paint-order="stroke" font-size="${fontSize}" font-weight="800" font-family='"Segoe UI", "Trebuchet MS", Arial, sans-serif'>${escapeHtml(text)}</text>
  </svg>${star}</span>`;
}

function hintCardEvalOverlayHtml(hint) {
  if (!hint || hint.synthetic) return "";
  const inner = hintEvalHtml(hint);
  if (!inner || inner === "—") return "";
  return `<span class="hint-in-eval">${inner}</span>`;
}

function hintCardOverlayHtml(hint) {
  return `${hintCardPlaceOverlayHtml(hint)}${hintCardEvalOverlayHtml(hint)}`;
}

function hintVerdictHtml(hint) {
  const place = state.hintInfo?.place ? hintPlaceHtml(hint) : "";
  const evalHtml = hintEvalHtml(hint);
  const evalPart = evalHtml && evalHtml !== "—" ? `<span class="hint-eval">${evalHtml}</span>` : "";
  return `${place}${hintTagHtml(hint)}${evalPart}`;
}

function hintPlaceHtml(hint, pool = state.hintPool) {
  const place = hintPlaceMap(pool).get(hint?.uci);
  if (!place) return "";
  return `<span class="hint-place">${escapeHtml(formatPlace(place))}</span>`;
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
  if (side !== "b" && side !== "w") return map;
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

function whiteCastlePoseArt(n) {
  const pose = ((Number(n || 1) - 1) % 9 + 9) % 9 + 1;
  return {
    file: `Re Bianco Arrocco ${pose}.png`,
    title: "art.wcastle.pose",
    n: pose,
  };
}

function whiteIllustratedDir(piece) {
  if (state.cardStyle === "fumetto") {
    return {
      n: FUMETTO_W_KNIGHT_DIR,
      p: FUMETTO_W_PAWN_DIR,
      b: FUMETTO_W_BISHOP_DIR,
      r: FUMETTO_W_ROOK_DIR,
      q: FUMETTO_W_QUEEN_DIR,
      k: FUMETTO_W_KING_DIR,
      castle: FUMETTO_W_CASTLE_DIR,
    }[piece];
  }
  return {
    n: WAR_W_KNIGHT_DIR,
    p: WAR_W_PAWN_DIR,
    b: WAR_W_BISHOP_DIR,
    r: WAR_W_ROOK_DIR,
    q: WAR_W_QUEEN_DIR,
    k: WAR_W_KING_DIR,
    castle: WAR_W_KING_DIR,
  }[piece];
}

function blackIllustratedDir(piece) {
  if (state.cardStyle === "fumetto") {
    return {
      n: FUMETTO_KNIGHT_DIR,
      p: FUMETTO_PAWN_DIR,
      b: FUMETTO_BISHOP_DIR,
      r: FUMETTO_ROOK_DIR,
      q: FUMETTO_QUEEN_DIR,
      k: FUMETTO_KING_DIR,
      castle: FUMETTO_CASTLE_DIR,
    }[piece];
  }
  return {
    n: WAR_KNIGHT_DIR,
    p: WAR_PAWN_DIR,
    b: WAR_BISHOP_DIR,
    r: WAR_ROOK_DIR,
    q: WAR_QUEEN_DIR,
    k: WAR_KING_DIR,
    castle: WAR_CASTLE_DIR,
  }[piece];
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
  const fontSize = 26;
  const strokeW = (0.07 / 0.36) * fontSize;
  const pad = strokeW + 2;
  const w = Math.ceil(n * fontSize * 0.74 + pad * 2);
  const h = Math.ceil(fontSize + pad * 2);
  return `<svg class="hint-card-san" width="${w}" height="${h}" viewBox="0 0 ${w} ${h}" aria-hidden="true">
    <text x="${(w - pad).toFixed(1)}" y="${(h / 2).toFixed(1)}" text-anchor="end" dominant-baseline="middle" dy="0.08" fill="#1f1f1f" fill-opacity="0.92" stroke="#fff" stroke-width="${strokeW.toFixed(2)}" stroke-linejoin="round" paint-order="stroke" font-size="${fontSize}" font-weight="700" font-family='"Segoe UI", "Trebuchet MS", Arial, sans-serif'>${escapeHtml(text)}</text>
  </svg>`;
}

function hintCardMediaHtml(art, san, overlay = "") {
  return `<span class="hint-card-media">${art}${hintCardSanHtml(san)}${overlay}</span>`;
}

function iconArtHtml(move, color) {
  const src = pieceIcon(move, color) || `pieces/${color || "w"}N.svg`;
  const title = escapeHtml(move ? pieceName(move.piece || "p") : t("hints.move"));
  return `<span class="hint-card-art is-icon"><img src="${src}" alt="${title}" title="${title}"></span>`;
}

function hintArtHtml(move, color, poses = {}) {
  if (state.cardStyle !== "icons") return storyArtHtml(move || { piece: "n", san: "" }, color, poses);
  return iconArtHtml(move, color);
}

function storyArtHtml(move, color, poses = {}) {
  if (color === "b" && move?.piece === "n") return warCardHtml(blackIllustratedDir("n"), blackKnightWarArt(move, poses.n));
  if (color === "b" && move?.piece === "p") return warCardHtml(blackIllustratedDir("p"), blackPawnWarArt(move, poses.p));
  if (color === "b" && move?.piece === "b") return warCardHtml(blackIllustratedDir("b"), blackBishopWarArt(move, poses.b));
  if (color === "b" && move?.piece === "r") return warCardHtml(blackIllustratedDir("r"), blackRookWarArt(move, poses.r));
  if (color === "b" && move?.piece === "q") return warCardHtml(blackIllustratedDir("q"), blackQueenWarArt(move, poses.q));
  if (color === "b" && move?.piece === "k") {
    if (String(move?.san || "").startsWith("O-O")) {
      return warCardHtml(blackIllustratedDir("castle"), blackCastlePoseArt(poses.castle));
    }
    return warCardHtml(blackIllustratedDir("k"), blackKingWarArt(move, poses.k));
  }
  if (color === "w" && move?.piece === "n") {
    return warCardHtml(whiteIllustratedDir("n"), pickWarArt(WAR_W_KNIGHT_ART, whiteKnightPoseArt, move, poses.n));
  }
  if (color === "w" && move?.piece === "p") {
    return warCardHtml(whiteIllustratedDir("p"), pickWarArt(WAR_W_PAWN_ART, whitePawnPoseArt, move, poses.p));
  }
  if (color === "w" && move?.piece === "b") {
    return warCardHtml(whiteIllustratedDir("b"), pickWarArt(WAR_W_BISHOP_ART, whiteBishopPoseArt, move, poses.b));
  }
  if (color === "w" && move?.piece === "r") {
    const rookPack = state.cardStyle === "fumetto" ? FUMETTO_W_ROOK_ART : WAR_W_ROOK_ART;
    return warCardHtml(whiteIllustratedDir("r"), pickWarArt(rookPack, whiteRookPoseArt, move, poses.r));
  }
  if (color === "w" && move?.piece === "q") {
    return warCardHtml(whiteIllustratedDir("q"), pickWarArt(WAR_W_QUEEN_ART, whiteQueenPoseArt, move, poses.q));
  }
  if (color === "w" && move?.piece === "k") {
    if (String(move?.san || "").startsWith("O-O")) {
      if (state.cardStyle === "fumetto") {
        return warCardHtml(whiteIllustratedDir("castle"), whiteCastlePoseArt(poses.castle || moveHash(move) + 1));
      }
      return warCardHtml(whiteIllustratedDir("k"), whiteKingPoseArt(poses.castle || poses.k || moveHash(move) + 1));
    }
    const kingPack = state.cardStyle === "fumetto" ? FUMETTO_W_KING_ART : WAR_W_KING_ART;
    return warCardHtml(whiteIllustratedDir("k"), pickWarArt(kingPack, whiteKingPoseArt, move, poses.k));
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

function squareBoardKey(square, color) {
  const sq = String(square || "").toLowerCase();
  const file = sq.charCodeAt(0) - 97;
  const rank = Number(sq[1]);
  if (!sq || file < 0 || file > 7 || rank < 1 || rank > 8) return 999;
  if (color === "b") return (7 - file) * 8 + (8 - rank);
  return file * 8 + (rank - 1);
}

function sortHintsByBoard(hints, color) {
  return [...hints].sort((a, b) => {
    const aFrom = String(a?.uci || "").slice(0, 2);
    const bFrom = String(b?.uci || "").slice(0, 2);
    const fromCmp = squareBoardKey(aFrom, color) - squareBoardKey(bFrom, color);
    if (fromCmp) return fromCmp;
    const aTo = String(a?.uci || "").slice(2, 4);
    const bTo = String(b?.uci || "").slice(2, 4);
    return squareBoardKey(aTo, color) - squareBoardKey(bTo, color);
  });
}

function layoutHintPool(ranked, color) {
  const perPage = hintsPerPage();
  const pages = hintLayout().pages;
  if (pages <= 1) return sortHintsByBoard(ranked, color);
  const shuffled = shuffle(ranked);
  const ordered = [];
  for (let page = 0; page < pages; page += 1) {
    const block = shuffled.slice(page * perPage, (page + 1) * perPage);
    ordered.push(...sortHintsByBoard(block, color));
  }
  return ordered;
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
  return layoutHintPool(ranked, game.turn());
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

const HEART_PARTS = 200;
const HEART_COUNT = 3;
const LIFE_MAX_HALVES = HEART_COUNT * 2;
const LIFE_PARTS = HEART_COUNT * HEART_PARTS;
const LIFE_EPS = LIFE_MAX_HALVES / LIFE_PARTS / 2;
const LIFE_FLASH_HALVES = 1;
const TWENTIETHS = 20;
const TWENTIETHS_CP = 1000;
const TWENTIETHS_STEP = TWENTIETHS_CP / TWENTIETHS;
const LIFE_BANDS = [
  { cp: 0, halves: 6 },
  { cp: -100, halves: 5 },
  { cp: -150, halves: 4 },
  { cp: -200, halves: 3 },
  { cp: -300, halves: 2 },
  { cp: -1000, halves: 0 },
];

function signedTwentieths(cp) {
  if (!Number.isFinite(cp)) return 0;
  if (Math.abs(cp) >= 50000) return cp > 0 ? TWENTIETHS : -TWENTIETHS;
  return Math.max(-TWENTIETHS, Math.min(TWENTIETHS, Math.round(cp / TWENTIETHS_STEP)));
}

function formatTwentiethsSigned(n) {
  if (!n) return "0";
  return n > 0 ? `+${n}` : `${n}`;
}

function playerTwentiethsCount(cp) {
  if (state.game?.in_checkmate()) {
    return state.game.turn() !== state.playerColor ? TWENTIETHS : 0;
  }
  const n = signedTwentieths(Number.isFinite(cp) ? cp : 0);
  return Math.max(0, Math.min(TWENTIETHS, n >= 0 ? TWENTIETHS : TWENTIETHS + n));
}

function oppTwentiethsCount(cp) {
  if (state.game?.in_checkmate()) {
    return state.game.turn() === state.playerColor ? TWENTIETHS : 0;
  }
  const n = signedTwentieths(Number.isFinite(cp) ? cp : 0);
  return Math.max(0, Math.min(TWENTIETHS, n <= 0 ? TWENTIETHS : TWENTIETHS - n));
}

function twentiethsHeartsFromCp(cp) {
  return playerTwentiethsCount(cp);
}

function visibleTwentiethsHearts() {
  if (Number.isFinite(state.livesHold)) return Math.max(0, Math.min(TWENTIETHS, state.livesHold));
  if (state.game?.game_over() && !state.game?.in_checkmate()) return TWENTIETHS;
  return playerTwentiethsCount(Number.isFinite(state.gameEval) ? state.gameEval : 0);
}

function oppTwentiethsNow() {
  return oppTwentiethsCount(evalBarSourceCp());
}

function livesFromCp(cp) {
  if (!Number.isFinite(cp) || cp >= 0) return LIFE_MAX_HALVES;
  if (cp <= -1000) return 0;
  for (let i = 1; i < LIFE_BANDS.length; i += 1) {
    const from = LIFE_BANDS[i - 1];
    const to = LIFE_BANDS[i];
    if (cp >= to.cp) {
      const t = (cp - from.cp) / (to.cp - from.cp);
      return from.halves + t * (to.halves - from.halves);
    }
  }
  return 0;
}

function swordsFromCp(cp) {
  if (!Number.isFinite(cp) || cp <= 0) return 0;
  return LIFE_MAX_HALVES - livesFromCp(-cp);
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
  if (lost > LIFE_EPS) return "heartMany";
  return "";
}

function opponentSwingTalk(beforeEval, feedbackKey) {
  if (!Number.isFinite(beforeEval) || !Number.isFinite(state.gameEval)) return "";
  const visDelta = displayLifeHalves(livesFromCp(state.gameEval)) - displayLifeHalves(livesFromCp(beforeEval));
  if (visDelta < -LIFE_EPS) return t(pickLifeFeedbackKey(visDelta));
  if (opponentRankKind(feedbackKey) === "worst") return "";
  if (beforeEval - state.gameEval >= 40) return t(pickKey(OPP_ADV_KEYS, "lastOppAdvKey"));
  return "";
}

function displayLifeHalves(halves = kingLifeHalves()) {
  if (!Number.isFinite(halves)) return LIFE_MAX_HALVES;
  const clamped = Math.max(0, Math.min(LIFE_MAX_HALVES, halves));
  return Math.round((clamped / LIFE_MAX_HALVES) * LIFE_PARTS) / LIFE_PARTS * LIFE_MAX_HALVES;
}

function visibleLifeHalves() {
  if (Number.isFinite(state.livesHold)) return displayLifeHalves(state.livesHold);
  return displayLifeHalves();
}

function freezeKingLives(halves) {
  if (!Number.isFinite(halves)) return;
  state.livesHold = halves;
}

function thawKingLives() {
  state.livesHold = null;
}

function thawKingLivesAfterOpp() {
  if (isPrevOppEval() && Number.isFinite(state.livesHold)) return;
  thawKingLives();
}

function heartFill(halves, i) {
  const left = displayLifeHalves(halves) - i * 2;
  return Math.max(0, Math.min(1, left / 2));
}

function heartKind(halves, i) {
  const fill = heartFill(halves, i);
  if (fill >= 1 - 1 / HEART_PARTS) return "full";
  if (fill <= 1 / HEART_PARTS) return "empty";
  return "partial";
}

function heartPieceHtml(halves, i, extraClass = "") {
  const fill = heartFill(halves, i);
  const kind = heartKind(halves, i);
  const cls = extraClass ? ` ${extraClass}` : "";
  return `<span class="king-heart is-${kind}${cls}" aria-hidden="true"><span class="heart-bg">♥</span><span class="heart-fg" style="width:${(fill * 100).toFixed(2)}%">♥</span></span>`;
}

function kingSwordHalves() {
  if (state.game.in_checkmate()) {
    return state.game.turn() !== state.playerColor ? LIFE_MAX_HALVES : 0;
  }
  return swordsFromCp(Number.isFinite(state.gameEval) ? state.gameEval : 0);
}

function visibleSwordHalves() {
  return displayLifeHalves(kingSwordHalves());
}

function swordPieceHtml(halves, i) {
  const fill = heartFill(halves, i);
  const kind = heartKind(halves, i);
  return `<span class="king-sword-piece is-${kind}" aria-hidden="true"><img class="sword-bg" src="img/eval-sword.svg" alt=""><span class="sword-fg" style="width:${(fill * 100).toFixed(2)}%"><img src="img/eval-sword.svg" alt=""></span></span>`;
}

function swordsMarkup(halves) {
  const shown = displayLifeHalves(halves);
  return [0, 1, 2].map((i) => swordPieceHtml(shown, i)).join("");
}

function hintHeartPiece(fill, tone) {
  const f = Math.max(0, Math.min(1, Number(fill) || 0));
  const kind = f >= 1 - 1 / HEART_PARTS ? "full" : f <= 1 / HEART_PARTS ? "empty" : "partial";
  return `<span class="king-heart hint-heart is-${kind} is-${tone}" aria-hidden="true"><span class="heart-bg">♥</span><span class="heart-fg" style="width:${(f * 100).toFixed(2)}%">♥</span></span>`;
}

function hintDeltaHeartPieces(halves, tone) {
  const parts = [];
  let left = Math.abs(halves);
  for (let i = 0; i < HEART_COUNT && left > LIFE_EPS; i += 1) {
    parts.push(hintHeartPiece(Math.min(1, left / 2), tone));
    left -= 2;
  }
  return parts.join("");
}

function hintLivesRowHtml(hint) {
  if (!hint || hint.synthetic) return "—";
  const score = hintScore(hint);
  if (!Number.isFinite(score)) return "—";
  const halves = displayLifeHalves(livesFromCp(evalForPlayer(score, hintEvalGame())));
  const label = t(hintLifeDelta(hint) < 0 ? "hint.lives.lose" : hintLifeDelta(hint) > 0 ? "hint.lives.gain" : "hint.lives.hold");
  const hearts = [0, 1, 2].map((i) => hintHeartPiece(heartFill(halves, i), "hold")).join("");
  return `<span class="hint-hearts is-hold" title="${escapeHtml(label)}" aria-label="${escapeHtml(label)}">${hearts}</span>`;
}

function hintHeartsHtml(hint) {
  if (!hint || hint.synthetic) return "—";
  const score = hintScore(hint);
  if (!Number.isFinite(score)) return "—";
  const delta = hintLifeDelta(hint);
  if (!delta) {
    const label = t("hint.lives.hold");
    return `<span class="hint-hearts is-hold" title="${escapeHtml(label)}" aria-label="${escapeHtml(label)}"><span class="hint-hearts-mark">(</span><span class="hint-hearts-sign">=</span><span class="hint-hearts-mark">)</span></span>`;
  }
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
  stopOppTwentiethsAnim();
}

function stopOppTwentiethsAnim() {
  clearTimeout(state.oppTwentiethsTimer);
  state.oppTwentiethsTimer = 0;
  state.oppTwentiethsAnimating = false;
  state.pendingOppTwentieths = null;
  els.oppLives?.classList.remove("is-flash");
  els.twentiethsOppMeter?.classList.remove("is-flash");
}

function heartsMarkup(halves) {
  const shown = displayLifeHalves(halves);
  return [0, 1, 2].map((i) => heartPieceHtml(shown, i)).join("");
}

function oppLifeHalves() {
  if (state.game.in_checkmate()) {
    return state.game.turn() === state.playerColor ? 6 : 0;
  }
  if (state.game.game_over()) return 6;
  const cp = Number.isFinite(state.gameEval) ? -state.gameEval : 0;
  return livesFromCp(cp);
}

function paintOppHearts() {
  if (isTwentiethsEval()) {
    renderOppTwentieths();
    return;
  }
  const root = els.oppLives;
  if (!root) return;
  root.classList.remove("is-twentieths-count", "is-flash");
  root.innerHTML = heartsMarkup(oppLifeHalves());
}

function syncTwentiethsMeterUi() {
  const on = isTwentiethsEval();
  if (els.twentiethsLives) els.twentiethsLives.hidden = !on;
  if (els.kingLives) {
    els.kingLives.hidden = on;
    if (on) els.kingLives.classList.remove("is-twentieths");
  }
  const meters = els.kingLives?.closest(".king-meters");
  if (meters) meters.hidden = on;
}

function twentiethsCountHtml(n) {
  const shown = Math.max(0, Math.min(TWENTIETHS, Math.round(n)));
  return `${shown}<span class="twentieths-heart" aria-hidden="true">♥</span>`;
}

function paintYouTwentiethsNumber(n) {
  const shown = Math.max(0, Math.min(TWENTIETHS, Math.round(n)));
  if (els.twentiethsYouCount) els.twentiethsYouCount.innerHTML = twentiethsCountHtml(shown);
  state.shownTwentieths = shown;
}

function paintOppTwentiethsNumber(n) {
  const shown = Math.max(0, Math.min(TWENTIETHS, Math.round(n)));
  const html = twentiethsCountHtml(shown);
  if (els.twentiethsOppCount) els.twentiethsOppCount.innerHTML = html;
  if (els.oppLives) {
    els.oppLives.classList.add("is-twentieths-count");
    els.oppLives.innerHTML = `<span class="twentieths-count">${html}</span>`;
  }
  state.shownOppTwentieths = shown;
}

function oppTwentiethsFlashNodes() {
  return [els.oppLives, els.twentiethsOppMeter].filter(Boolean);
}

function queueOppTwentiethsLoss(next) {
  const target = Math.max(0, Math.min(TWENTIETHS, Math.round(next)));
  state.pendingOppTwentieths = Number.isFinite(state.pendingOppTwentieths)
    ? Math.min(state.pendingOppTwentieths, target)
    : target;
  if (state.oppTwentiethsAnimating) return;
  state.oppTwentiethsAnimating = true;
  const nodes = oppTwentiethsFlashNodes();
  nodes.forEach((el) => {
    el.classList.remove("is-flash");
    void el.offsetWidth;
    el.classList.add("is-flash");
  });
  clearTimeout(state.oppTwentiethsTimer);
  state.oppTwentiethsTimer = setTimeout(() => {
    nodes.forEach((el) => el.classList.remove("is-flash"));
    const to = Number.isFinite(state.pendingOppTwentieths) ? state.pendingOppTwentieths : target;
    state.pendingOppTwentieths = null;
    paintOppTwentiethsNumber(to);
    state.oppTwentiethsAnimating = false;
    state.oppTwentiethsTimer = 0;
    const latest = oppTwentiethsNow();
    if (latest < to - 0.02) queueOppTwentiethsLoss(latest);
    else if (latest > to + 0.02) paintOppTwentiethsNumber(latest);
  }, 900);
}

function renderOppTwentieths() {
  const next = oppTwentiethsNow();
  if (state.oppTwentiethsAnimating) {
    if (next < (state.pendingOppTwentieths ?? state.shownOppTwentieths ?? TWENTIETHS) - 0.02) {
      state.pendingOppTwentieths = next;
    }
    return;
  }
  if (!Number.isFinite(state.shownOppTwentieths)) {
    paintOppTwentiethsNumber(next);
    return;
  }
  if (next < state.shownOppTwentieths - 0.02) {
    queueOppTwentiethsLoss(next);
    return;
  }
  paintOppTwentiethsNumber(next);
}

function paintTwentiethsHearts(count) {
  paintYouTwentiethsNumber(count);
}

function renderTwentiethsHearts() {
  paintYouTwentiethsNumber(visibleTwentiethsHearts());
  renderOppTwentieths();
}

function paintKingHearts(halves) {
  const root = els.kingLives;
  if (!root) return;
  if (isTwentiethsEval()) {
    paintTwentiethsHearts(visibleTwentiethsHearts());
    paintOppHearts();
    return;
  }
  root.classList.remove("is-twentieths");
  root.hidden = false;
  const shown = displayLifeHalves(halves);
  root.classList.remove("is-flash");
  root.innerHTML = heartsMarkup(shown);
  state.shownLives = shown;
  paintOppHearts();
}

function applyHeartKinds(halves, { drop = false } = {}) {
  const root = els.kingLives;
  const shown = displayLifeHalves(halves);
  if (!root?.children.length) {
    paintKingHearts(shown);
    return;
  }
  [...root.children].forEach((el, i) => {
    const fill = heartFill(shown, i);
    const kind = heartKind(shown, i);
    const fg = el.querySelector(".heart-fg");
    const prev = Math.max(0, Math.min(1, parseFloat(fg?.style.width) / 100 || (el.classList.contains("is-full") ? 1 : el.classList.contains("is-half") ? 0.5 : 0)));
    el.classList.remove("is-full", "is-half", "is-empty", "is-partial", "is-drop");
    el.classList.add(`is-${kind}`);
    if (fg) fg.style.width = `${(fill * 100).toFixed(2)}%`;
    if (drop && fill < prev - 1 / HEART_PARTS) {
      el.classList.add("is-drop");
      el.addEventListener("animationend", () => el.classList.remove("is-drop"), { once: true });
    }
  });
  state.shownLives = shown;
  paintOppHearts();
}

function queueLifeLoss(next) {
  next = displayLifeHalves(next);
  state.pendingLives = Number.isFinite(state.pendingLives) ? Math.min(state.pendingLives, next) : next;
  if (state.livesAnimating) return;
  const root = els.kingLives;
  if (!root) return;
  state.livesAnimating = true;
  root.classList.remove("is-flash");
  void root.offsetWidth;
  root.classList.add("is-flash");
  state.livesAnimTimer = setTimeout(() => {
    root.classList.remove("is-flash");
    const to = Number.isFinite(state.pendingLives) ? state.pendingLives : next;
    state.pendingLives = null;
    applyHeartKinds(to, { drop: true });
    state.livesAnimTimer = setTimeout(() => {
      state.livesAnimating = false;
      const latest = visibleLifeHalves();
      if (latest < state.shownLives - LIFE_EPS) queueLifeLoss(latest);
      else if (Math.abs(latest - state.shownLives) > LIFE_EPS) paintKingHearts(latest);
    }, 480);
  }, 900);
}

function evalBarSourceCp() {
  if (evalBarHoldActive()) {
    return Number.isFinite(state.evalBarHold) ? state.evalBarHold : 0;
  }
  return Number.isFinite(state.gameEval) ? state.gameEval : 0;
}

function evalCpForWhite() {
  const cp = evalBarSourceCp();
  let from = state.playerColor;
  if (isLocalVsHuman()) {
    const hist = state.game.history({ verbose: true });
    from = hist.length ? hist[hist.length - 1].color : "w";
  }
  return from === "w" ? cp : -cp;
}

function evalBarShownCp() {
  if (isLocalVsHuman()) {
    const cpWhite = evalCpForWhite();
    return state.board?.orientation === "black" ? -cpWhite : cpWhite;
  }
  return evalBarSourceCp();
}

function formatEvalBarScore(cp, { ignoreMate = false } = {}) {
  if (!ignoreMate && state.game?.in_checkmate()) {
    if (isLocalVsHuman()) {
      const whiteWon = state.game.turn() === "b";
      const bottomWon = state.board?.orientation === "black" ? !whiteWon : whiteWon;
      return bottomWon ? "M1" : "-M1";
    }
    return state.game.turn() !== state.playerColor ? "M1" : "-M1";
  }
  if (Math.abs(cp) >= 50000) {
    const n = Math.max(1, Math.round(100000 - Math.abs(cp)));
    return cp > 0 ? `M${n}` : `-M${n}`;
  }
  return formatSignedPawns(cp);
}

function formatEvalBarDisplay(cp, opts = {}) {
  const raw = formatEvalBarScore(cp, opts);
  if (!isTwentiethsEval()) return raw;
  if (!opts.ignoreMate && state.game?.in_checkmate()) {
    const n = state.game.turn() !== state.playerColor ? TWENTIETHS : -TWENTIETHS;
    if (isLocalVsHuman()) {
      const whiteWon = state.game.turn() === "b";
      const bottomWon = state.board?.orientation === "black" ? !whiteWon : whiteWon;
      return `${bottomWon ? `+${TWENTIETHS}` : `−${TWENTIETHS}`} (${raw}p)`;
    }
    return `${formatTwentiethsSigned(n)} (${raw}p)`;
  }
  return `${formatTwentiethsSigned(signedTwentieths(cp))} (${raw}p)`;
}

function evalCpForWhiteFromPlayer(playerCp) {
  const cp = Number.isFinite(playerCp) ? playerCp : 0;
  if (isLocalVsHuman()) {
    const hist = state.game.history({ verbose: true });
    const from = hist.length ? hist[hist.length - 1].color : "w";
    return from === "w" ? cp : -cp;
  }
  return state.playerColor === "w" ? cp : -cp;
}

function evalBarShownFromPlayer(playerCp) {
  const cp = Number.isFinite(playerCp) ? playerCp : 0;
  if (isLocalVsHuman()) {
    const cpWhite = evalCpForWhiteFromPlayer(cp);
    return state.board?.orientation === "black" ? -cpWhite : cpWhite;
  }
  return cp;
}

function rememberEvalBarPrev(now) {
  const next = Number.isFinite(now) ? now : 0;
  if (!Number.isFinite(state.evalBarPainted) || Math.round(state.evalBarPainted) !== Math.round(next)) {
    if (Number.isFinite(state.evalBarPainted)) state.evalBarBefore = state.evalBarPainted;
    state.evalBarPainted = next;
  }
}

function resetEvalBarHistory() {
  state.evalBarPainted = null;
  state.evalBarBefore = null;
}

const EVAL_BAR_CELLS = 20;
const EVAL_BAR_TICKS = [
  { pawn: -10, text: "−10", edge: "start" },
  { pawn: -5, text: "−5" },
  { pawn: -3, text: "−3" },
  { pawn: -1, text: "−1" },
  { pawn: 0, text: "0", zero: true },
  { pawn: 1, text: "+1" },
  { pawn: 3, text: "+3" },
  { pawn: 5, text: "+5" },
  { pawn: 10, text: "10+", edge: "end" },
];
const EVAL_BAR_TICKS_HEARTS = [
  { pawn: -10, text: "−10", edge: "start" },
  { pawn: -5, text: "−5" },
  { pawn: -3, text: "−3" },
  { pawn: -1, text: "−1" },
  { pawn: 0, text: "0", zero: true, edge: "end" },
];

function evalBarCellKind(i) {
  const style = evalBarStyle();
  if (style === "hearts") return i < 10 ? "heart" : "off";
  if (style !== "icons") return "block";
  if (i === 0) return "skull";
  if (i < 10) return "heart";
  if (i < 19) return "sword";
  return "cup";
}

function evalBarIconMarkup(kind) {
  if (kind === "heart" || kind === "cup") {
    const glyph = kind === "heart" ? "♥" : "🏆";
    return `<span class="eval-bar-glyph is-${kind}" aria-hidden="true"><span class="eb-bg">${glyph}</span><span class="eb-fg">${glyph}</span></span>`;
  }
  if (kind === "sword" || kind === "skull") {
    const src = kind === "skull" ? "img/eval-skull.png" : "img/eval-sword.svg";
    return `<span class="eval-bar-glyph is-${kind}" aria-hidden="true"><img class="eb-bg" src="${src}" alt=""><span class="eb-fg"><img src="${src}" alt=""></span></span>`;
  }
  return "";
}

function evalBarScaleTicks() {
  if (evalBarStyle() === "hearts") {
    return EVAL_BAR_TICKS_HEARTS.map((tick) => ({
      ...tick,
      left: ((tick.pawn + 10) / 10) * 100,
    }));
  }
  return EVAL_BAR_TICKS.map((tick) => ({
    ...tick,
    left: ((tick.pawn + 10) / 20) * 100,
  }));
}

function ensureEvalBarChrome() {
  const style = evalBarStyle();
  const cells = els.evalBarCells;
  if (cells) {
    if (!cells.childElementCount) {
      for (let i = 0; i < EVAL_BAR_CELLS; i += 1) {
        cells.appendChild(document.createElement("span"));
      }
    }
    [...cells.children].forEach((cell, i) => {
      const kind = evalBarCellKind(i);
      if (cell.dataset.kind === kind && cell.dataset.barStyle === style) return;
      cell.dataset.kind = kind;
      cell.dataset.barStyle = style;
      cell.innerHTML = evalBarIconMarkup(kind);
    });
  }
  const scale = els.evalBarScale;
  if (scale && scale.dataset.barStyle !== style) {
    scale.dataset.barStyle = style;
    scale.innerHTML = "";
    for (const tick of evalBarScaleTicks()) {
      const el = document.createElement("span");
      el.className = "eval-bar-tick";
      if (tick.zero) el.classList.add("is-zero");
      if (tick.edge === "start") el.classList.add("is-start");
      if (tick.edge === "end") el.classList.add("is-end");
      el.textContent = tick.text;
      el.style.left = `${tick.left}%`;
      scale.appendChild(el);
    }
  }
}

function paintEvalBarCells(pct) {
  const cells = els.evalBarCells?.children;
  if (!cells?.length) return;
  const n = cells.length;
  const value = Math.max(0, Math.min(100, pct));
  for (let i = 0; i < n; i += 1) {
    const start = (i / n) * 100;
    const end = ((i + 1) / n) * 100;
    let cut = 0;
    if (value >= end) cut = 100;
    else if (value > start) cut = ((value - start) / (end - start)) * 100;
    cells[i].style.setProperty("--cut", `${cut.toFixed(2)}%`);
  }
}

function evalBarPlayerShare(playerCp, { ignoreMate = false } = {}) {
  if (!ignoreMate && state.game?.in_checkmate()) {
    if (isLocalVsHuman()) {
      const whiteWon = state.game.turn() === "b";
      const bottomWon = state.board?.orientation === "black" ? !whiteWon : whiteWon;
      return bottomWon ? 100 : 0;
    }
    return state.game.turn() !== state.playerColor ? 100 : 0;
  }
  const cp = Number.isFinite(playerCp) ? playerCp : 0;
  if (Math.abs(cp) >= 50000) return cp > 0 ? 100 : 0;
  const pawn = Math.max(-10, Math.min(10, cp / 100));
  return 50 + pawn * 5;
}

function evalBarBlockCp(playerCp) {
  if (!Number.isFinite(playerCp)) return 0;
  if (Math.abs(playerCp) >= 50000) return playerCp;
  const pawn = Math.max(-10, Math.min(10, playerCp / 100));
  return Math.trunc(pawn) * 100;
}

function evalBarSnapCp(playerCp) {
  if (!state.evalBarBlockOnly) return playerCp;
  if (state.game?.in_checkmate()) return playerCp;
  return evalBarBlockCp(playerCp);
}

function paintEvalBar() {
  const fill = els.evalBarFill;
  const label = els.evalBarScore;
  const deltaEl = els.evalBarDelta;
  const prevLabel = els.evalBarPrev;
  const prevWrap = els.evalBarPrevWrap;
  if (!fill && !label && !els.evalBarCells) return;
  ensureEvalBarChrome();
  const hideDiff = Boolean(state.evalBarHideDiff);
  const blackBottom = state.board?.orientation === "black";
  rememberEvalBarPrev(evalBarSourceCp());
  const shown = evalBarSnapCp(evalBarShownCp());
  const pct = Math.max(0, Math.min(100, evalBarPlayerShare(shown)));
  const text = formatEvalBarDisplay(shown);
  const before = hideDiff ? null : state.evalBarBefore;
  const beforeShown = Number.isFinite(before) ? evalBarSnapCp(evalBarShownFromPlayer(before)) : null;
  const nowPts = evalShownPoints(shown) || 0;
  const beforePts = Number.isFinite(beforeShown) ? (evalShownPoints(beforeShown) || 0) : nowPts;
  const dir = hideDiff ? "" : nowPts > beforePts ? "up" : nowPts < beforePts ? "down" : "";
  const style = evalBarStyle();
  const hideIconsDiff = style === "icons" || style === "hearts";
  els.evalBar?.classList.toggle("is-black-bottom", blackBottom);
  els.evalBar?.classList.toggle("is-twentieths", isTwentiethsEval());
  els.evalBar?.classList.toggle("is-prev-opp", isPrevOppEval());
  els.evalBar?.classList.toggle("is-standard", style === "standard");
  els.evalBar?.classList.toggle("is-blocks", style === "blocks");
  els.evalBar?.classList.toggle("is-icons", style === "icons");
  els.evalBar?.classList.toggle("is-hearts", style === "hearts");
  paintEvalBarCells(pct);
  if (fill) {
    fill.style.height = "100%";
    fill.style.width = `${pct.toFixed(2)}%`;
  }
  if (label) {
    const pawn = isPrevOppEval() && Number.isFinite(shown) && Math.abs(shown) < 50000 && !state.game?.in_checkmate();
    if (pawn) label.innerHTML = formatPawnCommaHtml(shown);
    else label.textContent = text;
    label.classList.toggle("is-up", dir === "up");
    label.classList.toggle("is-down", dir === "down");
  }
  if (prevLabel || prevWrap) {
    const showPrev = !hideDiff && Number.isFinite(beforeShown) && beforePts !== nowPts;
    if (prevWrap) prevWrap.hidden = !showPrev;
    if (prevLabel) {
      prevLabel.hidden = !showPrev;
      if (showPrev) {
        const pawnPrev = isPrevOppEval() && Number.isFinite(beforeShown) && Math.abs(beforeShown) < 50000;
        if (pawnPrev) prevLabel.innerHTML = formatPawnCommaHtml(beforeShown);
        else prevLabel.textContent = formatEvalBarDisplay(beforeShown, { ignoreMate: true });
      }
    }
    if (els.evalBarPrevLabel) els.evalBarPrevLabel.textContent = t("eval.bar.prev");
  }
  if (deltaEl) {
    if (hideIconsDiff || !dir || !Number.isFinite(before)) {
      deltaEl.hidden = true;
    } else {
      const prevPct = Math.max(0, Math.min(100, evalBarPlayerShare(beforeShown, { ignoreMate: true })));
      const width = Math.abs(pct - prevPct);
      if (width < 0.8) {
        deltaEl.hidden = true;
      } else {
        const left = Math.min(pct, prevPct);
        deltaEl.hidden = false;
        deltaEl.style.left = `${left.toFixed(2)}%`;
        deltaEl.style.width = `${width.toFixed(2)}%`;
        deltaEl.classList.toggle("is-up", dir === "up");
        deltaEl.classList.toggle("is-down", dir === "down");
      }
    }
  }
  if (els.evalBar) {
    els.evalBar.setAttribute("aria-valuenow", String(Math.round(pct)));
    els.evalBar.setAttribute("title", showPrevTitle(text, beforeShown, dir));
  }
}

function showPrevTitle(text, beforeShown, dir) {
  if (!Number.isFinite(beforeShown) || !dir) return text;
  return `${text} · ${formatEvalBarDisplay(beforeShown, { ignoreMate: true })}`;
}

function stopSwordFlash() {
  clearTimeout(state.swordFlashTimer);
  state.swordFlashTimer = 0;
  els.kingSword?.classList.remove("is-flash");
}

function paintKingSword({ flash = false } = {}) {
  const root = els.kingSword;
  if (!root) return;
  if (!isSwordEval()) {
    stopSwordFlash();
    state.swordFlashPending = false;
    root.hidden = true;
    root.setAttribute("aria-hidden", "true");
    root.innerHTML = "";
    state.shownSwords = null;
    return;
  }
  const doFlash = flash || state.swordFlashPending;
  state.swordFlashPending = false;
  const next = visibleSwordHalves();
  const prev = Number.isFinite(state.shownSwords) ? state.shownSwords : 0;
  const grew = next > prev + LIFE_EPS;
  root.hidden = false;
  root.setAttribute("aria-hidden", "false");
  if (!root.children.length) {
    root.innerHTML = swordsMarkup(next);
  } else {
    [...root.children].forEach((el, i) => {
      const fill = heartFill(next, i);
      const kind = heartKind(next, i);
      const fg = el.querySelector(".sword-fg");
      el.classList.remove("is-full", "is-empty", "is-partial");
      el.classList.add(`is-${kind}`);
      if (fg) fg.style.width = `${(fill * 100).toFixed(2)}%`;
    });
  }
  state.shownSwords = next;
  if (!doFlash || !grew) return;
  stopSwordFlash();
  void root.offsetWidth;
  root.classList.add("is-flash");
  state.swordFlashTimer = setTimeout(() => {
    root.classList.remove("is-flash");
    state.swordFlashTimer = 0;
  }, 950);
}

function renderKingLives() {
  paintEvalBar();
  paintOppHearts();
  paintKingSword();
  syncTwentiethsMeterUi();
  if (isTwentiethsEval()) {
    renderTwentiethsHearts();
    return;
  }
  const root = els.kingLives;
  if (!root) return;
  root.classList.remove("is-twentieths");
  const next = visibleLifeHalves();
  if (!root.children.length || root.children.length === TWENTIETHS || !Number.isFinite(state.shownLives)) {
    paintKingHearts(next);
    return;
  }
  if (Math.abs(next - state.shownLives) <= LIFE_EPS && !state.livesAnimating) return;
  if (next + LIFE_EPS >= state.shownLives) {
    stopLivesAnim();
    applyHeartKinds(next);
    return;
  }
  if (state.shownLives - next < LIFE_FLASH_HALVES) {
    stopLivesAnim();
    applyHeartKinds(next);
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
  return state.hintPool.slice(0, hintPoolSize());
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
    && !isHintFakeLoad()
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
  if (!hint?.uci) {
    showBoardPickNote();
    return;
  }
  const promo = uciToMove(hint.uci).promotion;
  applyUserMove(from, to, promo, hint);
}

function showBoardPickNote() {
  const el = els.boardPickNote;
  if (!el) return;
  el.hidden = false;
  el.textContent = t("board.pickHint");
  el.classList.remove("is-in");
  void el.offsetWidth;
  el.classList.add("is-in");
  clearTimeout(state.boardPickNoteTimer);
  state.boardPickNoteTimer = setTimeout(() => {
    hideBoardPickNote();
  }, 2200);
}

function hideBoardPickNote() {
  clearTimeout(state.boardPickNoteTimer);
  if (!els.boardPickNote) return;
  els.boardPickNote.classList.remove("is-in");
  els.boardPickNote.hidden = true;
}

function syncHintBoardPlay() {
  if (!state.board) return;
  if (!boardHintPlayReady()) {
    state.board.setDests({});
    state.board.setInteractive(false);
    return;
  }
  state.board.setShowDests(Boolean(state.aids.moves));
  state.board.setDests(destsFromGame(state.game));
  state.board.setInteractive(true);
}

function syncHintLayoutUi() {
  const n = hintPoolSize();
  els.hints?.classList.toggle("is-four", n === 4);
  els.hints?.classList.toggle("is-six", n === 6);
  els.hints?.classList.toggle("is-eight", n === 8);
  els.hints?.classList.toggle("is-twelve", n >= 12);
  els.hints?.classList.toggle("is-cols-4", n === 4 || n === 8 || n >= 12);
  els.hints?.classList.toggle("is-cols-3", n === 6);
  els.hints?.classList.add("is-cards");
}

function syncHintNav() {
  const hidden = waitingForHints() && !isTrainHold();
  els.hints?.classList.toggle("is-waiting", hidden);
  if (els.hintNav) els.hintNav.hidden = true;
  syncRecalcButton();
  syncHintMix();
}

function currentHintMixLine() {
  const text = formatHintMix();
  if (text) state.lastHintMix = text;
  return text || state.lastHintMix || "";
}

function kingFinaleAllowed() {
  if (KING_TALK_HIDE.hintMix) return false;
  if (isReviewing() || isTrainHold()) return false;
  if (state.game.game_over()) return false;
  if (!currentHintMixLine()) return false;
  return playerIsSideToMove();
}

function paintKingFinaleContent() {
  if (!els.hintMix) return;
  if (KING_TALK_HIDE.hintMix) {
    els.hintMix.innerHTML = "";
    els.hintMix.hidden = true;
    return;
  }
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

function switchLabel(on) {
  return t(on ? "toggle.on" : "toggle.off");
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
    && !isHintFakeLoad()
    && state.hintPool.length;
  const busy = Boolean(state.recalcHints);
  const label = busy ? t("hints.recalcing") : t("hints.recalc");
  els.recalcHints.textContent = busy ? "…" : t("hints.recalcGo");
  els.recalcHints.title = label;
  els.recalcHints.setAttribute("aria-label", label);
  els.recalcHints.disabled = !canRecalc;
  els.recalcHints.classList.toggle("is-on", busy);
  els.recalcWrap?.classList.toggle("is-busy", busy);
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
  if (isTrainHold()) paintHoldArrows();
  else if (state.aids.moves) showHintArrows(null, { reveal: true });
}

function isTrainHold() {
  return Boolean(state.trainHold);
}

function isTrainQuiz() {
  return Boolean(state.trainingMode) && !state.trainHold;
}

function clearTrainHold() {
  clearAutoContinueTimer();
  state.trainHold = false;
  state.trainPickedUci = "";
  state.trainFen = "";
  state.trainColor = "";
  state.trainLives = null;
  state.continueArmed = false;
  state.pendingOpp = null;
  state.trainNext = null;
  state.reviewArrowSnap = null;
  state.oppWaitStartedAt = 0;
  state.oppSearchToken += 1;
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
  const hasNext = Boolean(state.trainNext);
  const local = isLocalVsHuman();
  const over = isTrainHold() && state.game.game_over();
  const showReply = isTrainHold() && hasNext && !state.autoContinue;
  const showContinue = isTrainHold() && (local || over) && !hasNext;
  const show = showReply || showContinue;
  if (els.trainReply) {
    const appear = show && els.trainReply.hidden;
    els.trainReply.hidden = !show;
    if (!show) els.trainReply.classList.remove("is-enter");
    else if (appear) {
      els.trainReply.classList.remove("is-enter");
      void els.trainReply.offsetWidth;
      els.trainReply.classList.add("is-enter");
    }
  }
  if (els.trainContinue) {
    els.trainContinue.disabled = !show || state.busy;
    els.trainContinue.classList.toggle("is-reply", showReply);
    els.trainContinue.textContent = showReply ? t("train.reply") : t("train.continue");
  }
  syncOppWait();
}

function syncOppWait() {
  const show = isTrainHold()
    && !state.trainNext
    && !isLocalVsHuman()
    && !state.game.game_over();
  els.hints?.classList.toggle("is-wait-opp", show);
  els.hintNav?.classList.toggle("is-wait-opp", show);
  const replied = isTrainHold() && Boolean(state.trainNext);
  els.hints?.classList.toggle("is-opp-replied", replied);
  els.hintPanel?.classList.toggle("is-opp-replied", replied);
  if (isTrainHold()) els.hints?.classList.remove("is-reveal");
}

function syncAutoContinueUi() {
  if (!els.autoContinue) return;
  const on = Boolean(state.autoContinue);
  els.autoContinue.textContent = switchLabel(on);
  els.autoContinue.classList.toggle("is-on", on);
  els.autoContinue.setAttribute("aria-pressed", on ? "true" : "false");
}

let autoContinueTimer = 0;

function clearAutoContinueTimer() {
  if (autoContinueTimer) {
    clearTimeout(autoContinueTimer);
    autoContinueTimer = 0;
  }
}

function scheduleAutoContinue() {
  clearAutoContinueTimer();
  if (!state.autoContinue || !isTrainHold() || state.busy || !state.trainNext) return;
  autoContinueTimer = setTimeout(() => {
    autoContinueTimer = 0;
    if (state.autoContinue && isTrainHold() && !state.busy && state.trainNext) revealTrainNext();
  }, 900);
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
  if (state.autoContinue && isTrainHold() && !state.busy && state.trainNext) {
    revealTrainNext();
  } else {
    clearAutoContinueTimer();
  }
}

function syncAdminSolutionsUi() {
  if (!els.adminSolutionsBtn) return;
  const on = Boolean(state.adminSolutions);
  els.adminSolutionsBtn.textContent = switchLabel(on);
  els.adminSolutionsBtn.classList.toggle("is-on", on);
  els.adminSolutionsBtn.setAttribute("aria-pressed", on ? "true" : "false");
}

function setAdminSolutions(on) {
  state.adminSolutions = Boolean(on);
  try {
    localStorage.setItem(ADMIN_SOLUTIONS_KEY, state.adminSolutions ? "1" : "0");
  } catch {
    /* ignore */
  }
  syncAdminSolutionsUi();
  renderAdminSolutions();
}

function adminSolutionScoreText(hint) {
  if (!hint || hint.synthetic) return "—";
  const abs = formatHintEval(hint);
  if (isAbsLikeEval()) return abs;
  return `${formatHintDelta(hint)} · ${abs}`;
}

function renderAdminSolutions() {
  const box = els.adminSolutions;
  const list = els.adminSolutionsList;
  if (!box || !list) return;
  if (!state.adminSolutions) {
    box.hidden = true;
    list.innerHTML = "";
    return;
  }
  box.hidden = false;
  const placeMap = hintPlaceMap();
  const items = (state.hintPool || [])
    .filter((hint) => hint && !hint.synthetic && placeMap.has(hint.uci))
    .sort((a, b) => placeMap.get(a.uci) - placeMap.get(b.uci));
  if (!items.length) {
    list.innerHTML = `<li class="admin-solutions-empty">${escapeHtml(t("admin.solutions.empty"))}</li>`;
    return;
  }
  list.innerHTML = items.map((hint) => {
    const place = placeMap.get(hint.uci);
    const played = playedFromHint(hint);
    const san = played ? localizeSan(played.san) : hint.uci;
    const kind = hintRankKind(hint);
    const best = kind === "best" ? " is-best" : "";
    return `<li class="${best.trim()}">
      <span class="admin-place">${escapeHtml(formatPlace(place))}</span>
      <span class="admin-san">${escapeHtml(san)}</span>
      <span class="admin-score">${escapeHtml(adminSolutionScoreText(hint))}</span>
    </li>`;
  }).join("");
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
  if (!keepSpeaking) {
    state.speakToken += 1;
    state.kingSpeaking = false;
  }
  hideKingFinale();
  if (gameOver) {
    state.busy = true;
    syncTrainContinue();
    clearTrainHold();
    hideHintPanel();
    finishGame();
    return;
  }
  if (local) {
    state.busy = true;
    syncTrainContinue();
    clearTrainHold();
    hideHintPanel();
    syncCoach();
    await refreshHints({ reveal: false });
    state.busy = false;
    state.pendingHintReveal = true;
    revealHintsIfReady();
    return;
  }
  if (state.trainNext) {
    revealTrainNext();
    return;
  }
  state.continueArmed = true;
  syncTrainContinue();
}

function clearHints() {
  stopMoveClock();
  stopHintFakeLoad();
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
  const hits = KING_TALK_HIDE.oppMoveDetail ? [] : threatsFromMove(after, move, state.playerColor).slice(0, 3);
  const hanging = KING_TALK_HIDE.hanging ? [] : hits.filter((hit) => !isSquareDefended(after, hit.to, state.playerColor));
  const action = KING_TALK_HIDE.oppMoveDetail ? "" : opponentActionLine(move, hits, hanging);
  const swing = opponentSwingTalk(beforeEval, feedbackKey);
  const bits = [];
  if (feedbackKey) {
    const rank = opponentRankKind(feedbackKey);
    const opener = t(
      rank === "best" ? "ofb.open.best" : rank === "worst" ? "ofb.open.worst" : "ofb.open.normal"
    );
    if (KING_TALK_HIDE.talkAfterRank) bits.push(`<strong>${escapeHtml(opener)}</strong>`);
    else bits.push(`<strong>${escapeHtml(opener)}</strong> ${escapeHtml(swing || t(feedbackKey))}`);
  } else if (swing && !KING_TALK_HIDE.talkAfterRank) {
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
  if (!KING_TALK_HIDE.hanging) {
    const loss = worstImmediateLoss(after, state.playerColor);
    if (loss === "q") parts.push(t("king.hangQueen"));
    else if (loss === "r") parts.push(t("king.hangRook"));
    else if (loss === "n") parts.push(t("king.hangKnight"));
    else if (loss === "b") parts.push(t("king.hangBishop"));
    else parts.push(explainMove(before, move, after, null));
  }
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
  if (KING_TALK_HIDE.hanging) return t("turn.make");
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
  if (state.board) {
    state.board.setArrows([]);
    paintActiveThreats();
  }
  syncAidButtons();
}

function syncAidButtons() {
  if (els.aidMoves) {
    const on = Boolean(state.aids.moves);
    els.aidMoves.textContent = switchLabel(on);
    els.aidMoves.classList.toggle("is-on", on);
    els.aidMoves.setAttribute("aria-pressed", on ? "true" : "false");
  }
  if (els.aidThreats) {
    const on = Boolean(state.aids.threats);
    els.aidThreats.textContent = switchLabel(on);
    els.aidThreats.classList.toggle("is-on", on);
    els.aidThreats.setAttribute("aria-pressed", on ? "true" : "false");
  }
  syncCardClickUi();
  syncReviewArrowsUi();
  syncReviewArrowLabelsUi();
  syncEvalBarHideDiffUi();
  syncEvalBarBlockOnlyUi();
  syncEvalBarStyleUi();
  syncStoryIconsButton();
}

function syncCardClickUi() {
  const on = state.cardClick !== false;
  if (els.cardClick) {
    els.cardClick.textContent = switchLabel(on);
    els.cardClick.classList.toggle("is-on", on);
    els.cardClick.setAttribute("aria-pressed", on ? "true" : "false");
  }
  els.hints?.classList.toggle("is-no-click", !on);
}

function setCardClick(on) {
  state.cardClick = Boolean(on);
  try {
    localStorage.setItem(CARD_CLICK_KEY, state.cardClick ? "1" : "0");
  } catch {
    /* ignore */
  }
  syncCardClickUi();
}

function syncReviewArrowsUi() {
  const on = Boolean(state.reviewArrows);
  if (els.reviewArrows) {
    els.reviewArrows.textContent = switchLabel(on);
    els.reviewArrows.classList.toggle("is-on", on);
    els.reviewArrows.setAttribute("aria-pressed", on ? "true" : "false");
  }
}

function setReviewArrows(on) {
  state.reviewArrows = Boolean(on);
  try {
    localStorage.setItem(REVIEW_ARROWS_KEY, state.reviewArrows ? "1" : "0");
  } catch {
    /* ignore */
  }
  syncReviewArrowsUi();
  paintHoldArrows();
}

function syncReviewArrowLabelsUi() {
  const on = Boolean(state.reviewArrowLabels);
  if (els.reviewArrowLabels) {
    els.reviewArrowLabels.textContent = switchLabel(on);
    els.reviewArrowLabels.classList.toggle("is-on", on);
    els.reviewArrowLabels.setAttribute("aria-pressed", on ? "true" : "false");
  }
}

function setReviewArrowLabels(on) {
  state.reviewArrowLabels = Boolean(on);
  try {
    localStorage.setItem(REVIEW_ARROW_LABELS_KEY, state.reviewArrowLabels ? "1" : "0");
  } catch {
    /* ignore */
  }
  syncReviewArrowLabelsUi();
  if (isTrainHold() && !state.trainNext) state.reviewArrowSnap = null;
  paintHoldArrows();
}

function syncEvalBarHideDiffUi() {
  const on = Boolean(state.evalBarHideDiff);
  if (els.evalBarHideDiff) {
    els.evalBarHideDiff.textContent = switchLabel(on);
    els.evalBarHideDiff.classList.toggle("is-on", on);
    els.evalBarHideDiff.setAttribute("aria-pressed", on ? "true" : "false");
  }
}

function setEvalBarHideDiff(on) {
  state.evalBarHideDiff = Boolean(on);
  try {
    localStorage.setItem(EVAL_BAR_HIDE_DIFF_KEY, state.evalBarHideDiff ? "1" : "0");
  } catch {
    /* ignore */
  }
  syncEvalBarHideDiffUi();
  paintEvalBar();
}

function syncEvalBarBlockOnlyUi() {
  const on = Boolean(state.evalBarBlockOnly);
  if (els.evalBarBlockOnly) {
    els.evalBarBlockOnly.textContent = switchLabel(on);
    els.evalBarBlockOnly.classList.toggle("is-on", on);
    els.evalBarBlockOnly.setAttribute("aria-pressed", on ? "true" : "false");
  }
}

function setEvalBarBlockOnly(on) {
  state.evalBarBlockOnly = Boolean(on);
  try {
    localStorage.setItem(EVAL_BAR_BLOCK_ONLY_KEY, state.evalBarBlockOnly ? "1" : "0");
  } catch {
    /* ignore */
  }
  syncEvalBarBlockOnlyUi();
  paintEvalBar();
}

function evalBarStyleShortKey() {
  const style = evalBarStyle();
  if (style === "standard") return "tools.evalBar.style.standard";
  if (style === "icons") return "tools.evalBar.style.icons";
  if (style === "hearts") return "tools.evalBar.style.hearts";
  return "tools.evalBar.style.blocks";
}

function fillEvalBarStyleMenu() {
  if (!els.evalBarStyleList) return;
  const current = evalBarStyle();
  const items = [
    { id: "standard", key: "tools.evalBar.style.standard" },
    { id: "blocks", key: "tools.evalBar.style.blocks" },
    { id: "icons", key: "tools.evalBar.style.icons" },
    { id: "hearts", key: "tools.evalBar.style.hearts" },
  ];
  els.evalBarStyleList.innerHTML = items
    .map(
      (item) =>
        `<button type="button" role="menuitem" class="style-menu-item${item.id === current ? " is-on" : ""}" data-eval-bar-style="${item.id}">${t(item.key)}</button>`
    )
    .join("");
}

function syncEvalBarStyleUi() {
  fillEvalBarStyleMenu();
  if (els.evalBarStyleBtn) els.evalBarStyleBtn.textContent = t(evalBarStyleShortKey());
}

function applyEvalBarStyle(value) {
  state.evalBarStyle = value === "standard" || value === "icons" || value === "hearts" ? value : "blocks";
  try {
    localStorage.setItem(EVAL_BAR_STYLE_KEY, state.evalBarStyle);
  } catch {
    /* ignore */
  }
  if (els.evalBarScale) els.evalBarScale.dataset.barStyle = "";
  if (els.evalBarCells) {
    [...els.evalBarCells.children].forEach((cell) => {
      cell.dataset.kind = "";
      cell.dataset.barStyle = "";
    });
  }
  syncEvalBarStyleUi();
  paintEvalBar();
}

function syncStoryIconsButton() {
  fillCardStyleMenu();
  if (els.cardStyleBtn) {
    els.cardStyleBtn.textContent = t(cardStyleShortKey());
  }
}

function persistHintInfo() {
  try {
    localStorage.setItem(HINT_INFO_KEY, JSON.stringify({
      place: Boolean(state.hintInfo.place),
      sign: hintInfoSign(),
      arrow: hintInfoSign() !== "off",
      score: state.hintInfo.score === "hearts" ? "hearts" : "number",
      overlay: state.hintInfo.overlay === "internal" ? "internal" : "external",
    }));
  } catch {
    /* ignore */
  }
}

function applyHintPlace(on) {
  state.hintInfo.place = Boolean(on);
  persistHintInfo();
  syncHintInfoUi();
  renderHints();
}

function applyHintArrow(on) {
  applyHintSign(on ? "arrow" : "off");
}

function applyHintSign(value) {
  const sign = value === "icons" || value === "off" ? value : "arrow";
  state.hintInfo.sign = sign;
  state.hintInfo.arrow = sign !== "off";
  persistHintInfo();
  syncHintInfoUi();
  renderHints();
}

function hintSignShortKey() {
  const sign = hintInfoSign();
  if (sign === "icons") return "tools.hintInfo.sign.icons";
  if (sign === "off") return "tools.hintInfo.sign.off";
  return "tools.hintInfo.sign.arrow";
}

function fillHintSignMenu() {
  if (!els.hintSignList) return;
  const current = hintInfoSign();
  const items = [
    { id: "arrow", key: "tools.hintInfo.sign.arrow" },
    { id: "icons", key: "tools.hintInfo.sign.icons" },
    { id: "off", key: "tools.hintInfo.sign.off" },
  ];
  els.hintSignList.innerHTML = items
    .map(
      (item) =>
        `<button type="button" role="menuitem" class="style-menu-item${item.id === current ? " is-on" : ""}" data-hint-sign="${item.id}">${t(item.key)}</button>`
    )
    .join("");
}

function applyHintScoreMode(value) {
  state.hintInfo.score = value === "hearts" ? "hearts" : "number";
  persistHintInfo();
  syncHintInfoUi();
  renderHints();
}

function syncHintSwitch(btn, on) {
  if (!btn) return;
  btn.textContent = switchLabel(on);
  btn.classList.toggle("is-on", on);
  btn.setAttribute("aria-pressed", on ? "true" : "false");
}

function fillHintEvalViewMenu() {
  if (!els.evalViewList) return;
  const current = normalizeEvalView(state.evalView);
  const items = [
    { id: "abs", key: "settings.evalView.abs" },
    { id: "delta", key: "settings.evalView.delta" },
    { id: "prevOpp", key: "settings.evalView.prevOpp" },
    { id: "sword", key: "settings.evalView.sword" },
    { id: "twentieths", key: "settings.evalView.twentieths" },
  ];
  els.evalViewList.innerHTML = items
    .map(
      (item) =>
        `<button type="button" role="menuitem" class="style-menu-item${item.id === current ? " is-on" : ""}" data-eval-view="${item.id}">${t(item.key)}</button>`
    )
    .join("");
}

function applyHintOverlay(value) {
  state.hintInfo.overlay = value === "internal" ? "internal" : "external";
  persistHintInfo();
  syncHintInfoUi();
  renderHints();
}

function fillHintOverlayMenu() {
  if (!els.hintOverlayList) return;
  const current = isHintOverlayInternal() ? "internal" : "external";
  const items = [
    { id: "external", key: "tools.hintInfo.overlay.external" },
    { id: "internal", key: "tools.hintInfo.overlay.internal" },
  ];
  els.hintOverlayList.innerHTML = items
    .map(
      (item) =>
        `<button type="button" role="menuitem" class="style-menu-item${item.id === current ? " is-on" : ""}" data-hint-overlay="${item.id}">${t(item.key)}</button>`
    )
    .join("");
}

function fillHintScoreModeMenu() {
  if (!els.scoreModeList) return;
  const current = state.hintInfo.score === "hearts" ? "hearts" : "number";
  const items = [
    { id: "number", key: "tools.hintInfo.score.number" },
    { id: "hearts", key: "tools.hintInfo.score.hearts" },
  ];
  els.scoreModeList.innerHTML = items
    .map(
      (item) =>
        `<button type="button" role="menuitem" class="style-menu-item${item.id === current ? " is-on" : ""}" data-score-mode="${item.id}">${t(item.key)}</button>`
    )
    .join("");
}

function syncHintInfoUi() {
  syncHintSwitch(els.hintPlace, Boolean(state.hintInfo.place));
  fillHintSignMenu();
  fillHintEvalViewMenu();
  fillHintScoreModeMenu();
  fillHintOverlayMenu();
  if (els.hintSignBtn) els.hintSignBtn.textContent = t(hintSignShortKey());
  if (els.evalViewBtn) {
    els.evalViewBtn.textContent = t(evalViewShortKey());
  }
  if (els.scoreModeBtn) {
    els.scoreModeBtn.textContent = t(state.hintInfo.score === "hearts" ? "tools.hintInfo.score.hearts" : "tools.hintInfo.score.number");
  }
  if (els.hintOverlayBtn) {
    els.hintOverlayBtn.textContent = t(hintOverlayShortKey());
  }
}

function valueMenus() {
  return [
    { list: els.cardStyleList, btn: els.cardStyleBtn, root: els.cardStyleMenu },
    { list: els.hintSignList, btn: els.hintSignBtn, root: els.hintSignMenu },
    { list: els.evalViewList, btn: els.evalViewBtn, root: els.evalViewMenu },
    { list: els.scoreModeList, btn: els.scoreModeBtn, root: els.scoreModeMenu },
    { list: els.hintOverlayList, btn: els.hintOverlayBtn, root: els.hintOverlayMenu },
    { list: els.evalBarStyleList, btn: els.evalBarStyleBtn, root: els.evalBarStyleMenu },
  ];
}

function closeValueMenus(except) {
  valueMenus().forEach(({ list, btn }) => {
    if (!list || list === except) return;
    list.hidden = true;
    btn?.setAttribute("aria-expanded", "false");
  });
}

function valueMenuOpen() {
  return valueMenus().some(({ list }) => list && !list.hidden);
}

function toggleValueMenu(list, btn, fill) {
  if (!list) return;
  const open = list.hidden;
  closeValueMenus(list);
  if (fill) fill();
  list.hidden = !open;
  btn?.setAttribute("aria-expanded", open ? "true" : "false");
}

function fillCardStyleMenu() {
  if (!els.cardStyleList) return;
  const current = state.cardStyle || "war";
  const items = [
    { id: "icons", key: "settings.storyIcons.standard" },
    { id: "war", key: "settings.storyIcons.war" },
    { id: "fumetto", key: "settings.storyIcons.fumetto" },
  ];
  els.cardStyleList.innerHTML = items
    .map(
      (item) =>
        `<button type="button" role="menuitem" class="style-menu-item${item.id === current ? " is-on" : ""}" data-card-style="${item.id}">${t(item.key)}</button>`
    )
    .join("");
}

function cardStyleMenuOpen() {
  return Boolean(els.cardStyleList && !els.cardStyleList.hidden);
}

function closeCardStyleMenu() {
  closeValueMenus();
}

function toggleCardStyleMenu() {
  toggleValueMenu(els.cardStyleList, els.cardStyleBtn, fillCardStyleMenu);
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
    try {
      localStorage.setItem(AID_MOVES_KEY, state.aids.moves ? "1" : "0");
    } catch {
      /* ignore */
    }
    state.board?.setShowDests(Boolean(state.aids.moves));
    if (state.aids.moves) showHintArrows(null, { reveal: true });
    else if (!paintHoldArrows()) state.board.setArrows([]);
    syncAidButtons();
    return;
  }
  state.aids.threats = !state.aids.threats;
  try {
    localStorage.setItem(AID_THREATS_KEY, state.aids.threats ? "1" : "0");
  } catch {
    /* ignore */
  }
  paintActiveThreats();
  syncAidButtons();
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
  boardPickNote: document.getElementById("board-pick-note"),
  hints: document.getElementById("hints"),
  statusTitle: document.getElementById("status-title"),
  statusText: document.getElementById("status-text"),
  statusIcon: document.getElementById("status-icon"),
  engineLabel: document.getElementById("engine-label"),
  gameInfo: document.getElementById("game-info"),
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
  twentiethsLives: document.getElementById("twentieths-lives"),
  twentiethsYouCount: document.getElementById("twentieths-you-count"),
  twentiethsOppCount: document.getElementById("twentieths-opp-count"),
  twentiethsOppMeter: document.getElementById("twentieths-opp-meter"),
  kingSword: document.getElementById("king-sword"),
  oppLives: document.getElementById("opp-lives"),
  evalBar: document.getElementById("eval-bar"),
  evalBarFill: document.getElementById("eval-bar-fill"),
  evalBarCells: document.getElementById("eval-bar-cells"),
  evalBarScale: document.getElementById("eval-bar-scale"),
  evalBarScore: document.getElementById("eval-bar-score"),
  evalBarDelta: document.getElementById("eval-bar-delta"),
  evalBarPrev: document.getElementById("eval-bar-prev"),
  evalBarPrevWrap: document.getElementById("eval-bar-prev-wrap"),
  evalBarPrevLabel: document.getElementById("eval-bar-prev-label"),
  openingIntro: document.getElementById("opening-intro"),
  openingIntroBar: document.getElementById("opening-intro-bar"),
  openingIntroFill: document.getElementById("opening-intro-fill"),
  openingIntroName: document.getElementById("opening-intro-name"),
  openingIntroLuck: document.getElementById("opening-intro-luck"),
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
  cardClick: document.getElementById("btn-card-click"),
  reviewArrows: document.getElementById("btn-review-arrows"),
  reviewArrowLabels: document.getElementById("btn-review-arrow-labels"),
  evalBarHideDiff: document.getElementById("btn-eval-bar-hide-diff"),
  evalBarBlockOnly: document.getElementById("btn-eval-bar-block-only"),
  evalBarStyleBtn: document.getElementById("btn-eval-bar-style"),
  evalBarStyleList: document.getElementById("eval-bar-style-list"),
  evalBarStyleMenu: document.getElementById("eval-bar-style-menu"),
  cardStyleBtn: document.getElementById("btn-card-style"),
  cardStyleList: document.getElementById("card-style-list"),
  cardStyleMenu: document.getElementById("card-style-menu"),
  hintPlace: document.getElementById("btn-hint-place"),
  hintSignBtn: document.getElementById("btn-hint-sign"),
  hintSignList: document.getElementById("hint-sign-list"),
  hintSignMenu: document.getElementById("hint-sign-menu"),
  evalViewBtn: document.getElementById("btn-hint-eval-view"),
  evalViewList: document.getElementById("hint-eval-view-list"),
  evalViewMenu: document.getElementById("hint-eval-view-menu"),
  scoreModeBtn: document.getElementById("btn-hint-score-mode"),
  scoreModeList: document.getElementById("hint-score-mode-list"),
  scoreModeMenu: document.getElementById("hint-score-mode-menu"),
  hintOverlayBtn: document.getElementById("btn-hint-overlay"),
  hintOverlayList: document.getElementById("hint-overlay-list"),
  hintOverlayMenu: document.getElementById("hint-overlay-menu"),
  quickTools: document.getElementById("quick-tools"),
  quickToolsOpen: document.getElementById("btn-quick-tools"),
  quickToolsClose: document.getElementById("btn-quick-tools-close"),
  trainingMode: document.getElementById("btn-training-mode"),
  trainContinue: document.getElementById("btn-train-continue"),
  trainReply: document.getElementById("train-reply"),
  autoContinue: document.getElementById("btn-auto-continue"),
  adminSolutions: document.getElementById("admin-solutions"),
  adminSolutionsList: document.getElementById("admin-solutions-list"),
  adminSolutionsBtn: document.getElementById("btn-admin-solutions"),
  roundEval: document.getElementById("round-eval"),
  evalView: document.getElementById("eval-view"),
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
  pendingOpeningIntro: false,
  openingIntro: false,
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
  beforeOppEval: 0,
  evalBarPainted: null,
  evalBarBefore: null,
  evalBarHold: 0,
  standEval: 0,
  nextStandEval: null,
  livesForced: null,
  shownLives: null,
  shownTwentieths: null,
  shownOppTwentieths: null,
  shownSwords: null,
  livesHold: null,
  livesAnimating: false,
  livesAnimTimer: null,
  oppTwentiethsAnimating: false,
  oppTwentiethsTimer: 0,
  pendingOppTwentieths: null,
  swordFlashTimer: 0,
  swordFlashPending: false,
  pendingLives: null,
  hintLayout: readHintLayout(),
  moveClockSec: readMoveClock(),
  roundEval: readRoundEval(),
  evalView: readEvalView(),
  hintInfo: readHintInfo(),
  cardStyle: readCardStyle(),
  hasGame: false,
  openingPly: 0,
  startOpening: START_OPENINGS[0],
  aids: { moves: readAidMoves(), threats: readAidThreats() },
  cardClick: readCardClick(),
  reviewArrows: readReviewArrows(),
  reviewArrowLabels: readReviewArrowLabels(),
  evalBarHideDiff: readEvalBarHideDiff(),
  evalBarBlockOnly: readEvalBarBlockOnly(),
  evalBarStyle: readEvalBarStyle(),
  aidTimer: null,
  aidToken: 0,
  flashToken: 0,
  pipUntil: 0,
  flashSquares: [],
  boardPickNoteTimer: 0,
  lastKingTalk: "",
  speakToken: 0,
  kingSpeaking: false,
  pendingHintReveal: false,
  hintFakeLoad: false,
  hintFakeLoadTimer: 0,
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
  adminSolutions: readAdminSolutions(),
  trainHold: false,
  reviewArrowSnap: null,
  continueArmed: false,
  pendingOpp: null,
  trainNext: null,
  oppWaitStartedAt: 0,
  oppSearchToken: 0,
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

function syncGameInfo() {
  if (!els.gameInfo) return;
  const n = hintPoolSize();
  const sec = moveClockSec();
  const clock = sec ? t("game.info.clock.sec", { n: sec }) : t("game.info.clock.0");
  const mode = t("game.info.mode", { name: t("game.info.mode.best") });
  els.gameInfo.textContent = `${t("game.info.best", { n })} | ${clock} | ${mode}`;
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
  syncGameInfo();
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
  paintHoldArrows();
  showHintPanel();
  syncHintNav();
  syncTrainContinue();
  state.kbdHint = null;
  paintKbdHint();
  syncHintBoardPlay();
}

function hideHintPanel() {
  stopMoveClock();
  stopHintFakeLoad();
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

function isHintFakeLoad() {
  return Boolean(state.hintFakeLoad);
}

function stopHintFakeLoad() {
  if (state.hintFakeLoadTimer) {
    clearTimeout(state.hintFakeLoadTimer);
    state.hintFakeLoadTimer = 0;
  }
  state.hintFakeLoad = false;
  els.hints?.classList.remove("is-fake-load");
}

function finishHintFakeLoad() {
  state.hintFakeLoadTimer = 0;
  state.hintFakeLoad = false;
  els.hints?.classList.remove("is-fake-load");
  syncHintNav();
  syncHintBoardPlay();
  if (state.aids.moves) showHintArrows(null, { reveal: true });
  startMoveClock();
}

function startHintFakeLoad() {
  if (state.hintFakeLoadTimer) {
    clearTimeout(state.hintFakeLoadTimer);
    state.hintFakeLoadTimer = 0;
  }
  state.hintFakeLoad = true;
  els.hints?.classList.add("is-fake-load");
  state.board?.setArrows([]);
  syncHintNav();
  syncHintBoardPlay();
  const gameId = state.gameId;
  state.hintFakeLoadTimer = setTimeout(() => {
    if (gameId !== state.gameId || !state.hintFakeLoad) return;
    finishHintFakeLoad();
  }, HINT_FAKE_LOAD_MS);
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
  els.hints?.classList.add("is-fake-load");
  renderHints();
  els.hints.classList.remove("is-reveal");
  void els.hints.offsetWidth;
  els.hints.classList.add("is-reveal");
  state.pendingHintReveal = false;
  startHintFakeLoad();
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
    if (!options.keepArrows) paintHoldArrows();
  } else if (state.aids.moves && hintPanelOpen() && !waitingForHints()) showHintArrows(null, { reveal: true });
  else if (!options.keepArrows) state.board.setArrows([]);
  paintActiveThreats();
  syncCoach();
}

function renderHints() {
  const hold = isTrainHold();
  const internal = hold && isHintOverlayInternal();
  els.hints?.classList.toggle("is-hold", hold);
  els.hints?.classList.toggle("is-inlay", internal);
  els.hints?.classList.toggle("is-opp-replied", hold && Boolean(state.trainNext));
  els.hintPanel?.classList.toggle("is-opp-replied", hold && Boolean(state.trainNext));
  if (hold) els.hints?.classList.remove("is-reveal");
  if (waitingForHints() && !isTrainHold()) {
    state.hints = [];
    els.hints.innerHTML = "";
    syncHintNav();
    state.board?.setArrows([]);
    syncTrainContinue();
    syncHintBoardPlay();
    renderAdminSolutions();
    return;
  }
  state.hints = visibleHints();
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
    const picked = hold && hint.uci === state.trainPickedUci;
    const desc = played ? moveHeadline(played) : "";
    const overlay = internal ? hintCardOverlayHtml(hint) : "";
    const verdict = hold && !internal ? hintVerdictHtml(hint) : "";
    const hideRank = internal && Boolean(state.hintInfo.place);
    const media = hintCardMediaHtml(hintArtHtml(played || { piece: "n", san: "" }, side, {
      n: knightPoses.get(hint.uci),
      p: pawnPoses.get(hint.uci),
      b: bishopPoses.get(hint.uci),
      r: rookPoses.get(hint.uci),
      q: queenPoses.get(hint.uci),
      k: kingPoses.get(hint.uci),
      castle: castlePoses.get(hint.uci),
    }), san, overlay);
    const btn = `
      <button class="hint-btn is-card${picked ? " is-picked" : ""}${internal ? " is-inlay" : ""}${hideRank ? " is-inlay-place" : ""}" data-index="${i}" type="button">
        ${media}
        <span class="hint-body">
          <span class="hint-rank">${rank}</span>
          ${desc ? `<span class="hint-desc">${escapeHtml(desc)}</span>` : ""}
        </span>
        <span class="hint-load-label">${escapeHtml(t("hints.calc"))}</span>
        <span class="hint-load" aria-hidden="true"><i></i></span>
      </button>`;
    buttons.push(wrapHintSlot(btn, verdict));
  }
  els.hints.innerHTML = buttons.join("");
  syncHintNav();
  syncTrainContinue();
  paintKbdHint();
  syncHintBoardPlay();
  renderAdminSolutions();
  if (hold) paintHoldArrows();
}

function reviewArrowKind(hint) {
  if (!hint?.uci || hint.synthetic) return "plain";
  const best = state.hintBestScore;
  const drop = Number.isFinite(best) ? best - hintScore(hint) : Infinity;
  if (drop <= 0) return "best";
  if (hintEvalDir(hint) === "up") return "good";
  if (Number.isFinite(drop) && drop <= REVIEW_NEAR_BEST) return "good";
  return "plain";
}

function reviewArrowLabel(hint) {
  if (!state.reviewArrowLabels || !hint?.uci || hint.synthetic) return { text: "", parts: null };
  if (hint.scoreType === "mate") {
    if (hint.score > 0) return { text: `+M${hint.score}`, parts: null };
    if (hint.score < 0) return { text: `-M${Math.abs(hint.score)}`, parts: null };
    return { text: "", parts: null };
  }
  const cp = hintEvalShownCp(hint);
  if (isPrevOppEval()) {
    if (cp == null || !evalShownPoints(cp)) return { text: "", parts: null };
    return { text: formatPawnCommaText(cp), parts: pawnCommaParts(cp) };
  }
  let shown = evalShownPoints(cp);
  if (!shown && isTwentiethsEval()) {
    const parts = twentiethsSwingParts(hint);
    shown = (parts?.recovery || 0) + (parts?.damage || 0) - (parts?.heartLoss || 0) - (parts?.swordLoss || 0);
  }
  if (!shown) return { text: "", parts: null };
  return { text: shown > 0 ? `+${shown}` : `${shown}`, parts: null };
}

function buildHoldArrowSnap() {
  const rank = { plain: 0, good: 1, best: 2 };
  return (state.hintPool || [])
    .map((hint, i) => {
      if (!hint?.uci || hint.synthetic) return null;
      const kind = reviewArrowKind(hint);
      const isBest = kind === "best";
      const color = kind === "plain" ? ARROW_GRAY_LIGHT : ARROW_GREEN;
      const { text: label, parts: labelParts } = reviewArrowLabel(hint);
      return {
        from: hint.uci.slice(0, 2),
        to: hint.uci.slice(2, 4),
        uci: hint.uci,
        color,
        stroke: isBest ? ARROW_GOLD : color,
        strokeWidth: isBest ? 0.085 : 0.02,
        strokeOpacity: isBest ? 0.95 : 0.72,
        opacity: 0.78,
        width: "0.22",
        label,
        labelParts,
        labelAt: "to",
        labelColor: label.startsWith("-") ? "#a61e1e" : "#2a6b1a",
        hintIndex: i,
        _rank: rank[kind],
      };
    })
    .filter(Boolean)
    .sort((a, b) => a._rank - b._rank)
    .map(({ _rank, ...arrow }) => arrow);
}

function holdArrowActiveUcis(highlight) {
  if (highlight == null) return null;
  const indexes = (Array.isArray(highlight) ? highlight : [highlight]).filter((i) => Number.isInteger(i));
  const ucis = indexes.map((i) => state.hints[i]?.uci).filter(Boolean);
  return ucis.length ? new Set(ucis) : null;
}

function paintHoldArrows(highlight = null) {
  if (!isTrainHold() || isHintFakeLoad()) {
    return false;
  }
  if (!state.reviewArrows) {
    state.board?.setArrows([]);
    return true;
  }
  if (!state.reviewArrowSnap) {
    if (state.trainNext) {
      state.board?.setArrows([]);
      return true;
    }
    state.reviewArrowSnap = buildHoldArrowSnap();
  }
  const activeUcis = holdArrowActiveUcis(highlight);
  state.board?.setArrows(
    state.reviewArrowSnap.map((arrow) => {
      const active = Boolean(activeUcis && activeUcis.has(arrow.uci));
      return {
        ...arrow,
        opacity: active ? 0.9 : 0.78,
        width: active ? "0.28" : "0.22",
      };
    })
  );
  return true;
}

function showHintArrows(index = null, { reveal = false, onlyActive = false } = {}) {
  if (isTrainHold() && state.reviewArrows && !isHintFakeLoad()) {
    paintHoldArrows(index);
    return;
  }
  if (isHintFakeLoad() || !state.aids.moves && !onlyActive) {
    state.board?.setArrows([]);
    return;
  }
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

function waitForOppReplyMin() {
  const started = state.oppWaitStartedAt;
  if (!started) return Promise.resolve();
  return waitAtLeast(OPP_REPLY_MIN_MS, started);
}

function isFirstEngineMove() {
  if (isLocalVsHuman() || state.playerColor !== "b") return false;
  if (state.game.turn() !== "w" || state.game.game_over()) return false;
  return state.game.history().length === (state.openingPly || 0);
}

async function resolveOppMove(fen) {
  const firstEngine = isFirstEngineMove();
  const settings = skillSettings(state.skill);
  let uci = "";
  try {
    const played = await state.engine.play(fen, settings);
    uci = played?.uci || "";
  } catch (err) {
    if (err.message === "aborted") throw err;
  }
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
  const prevBest = state.hintBestScore;
  const prevEval = state.gameEval;
  const prevNext = state.nextStandEval;
  let pool = [];
  if (!preview.game_over()) {
    pool = await computeHintPool(preview, { freezeStand: true });
  }
  const nextBest = state.hintBestScore;
  const nextEval = state.gameEval;
  state.hintBestScore = prevBest;
  state.gameEval = prevEval;
  state.nextStandEval = prevNext;
  const oppKey = pickOpponentKeyFromEval(state.lastPlayerScore, prevBest);
  const oppBand = opponentReactBand(preview, beforeEval, oppKey);

  return { fen, move, pool, oppKey, oppBand, beforeEval, firstEngine, nextBest, nextEval };
}

async function applyOppMove(resolved) {
  const gameId = state.gameId;
  const { fen, move, pool, oppKey, oppBand, beforeEval, firstEngine } = resolved;
  if (state.game.fen() !== fen) return;

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
  thawKingLivesAfterOpp();
  state.board.setPosition(state.game.fen());
  flashThreatenedPieces(played);
  renderHistory();

  if (state.game.game_over()) {
    state.busy = false;
    finishGame();
    return;
  }

  adoptHintPool(pool);
  if (Number.isFinite(resolved.nextBest)) state.hintBestScore = resolved.nextBest;
  state.beforeOppEval = Number.isFinite(state.gameEval) ? state.gameEval : 0;
  if (Number.isFinite(resolved.nextEval)) state.gameEval = resolved.nextEval;
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
}

async function playTrainOppOnBoard(resolved) {
  const gameId = state.gameId;
  const { fen, move, pool, oppKey, oppBand, beforeEval, firstEngine, nextBest, nextEval } = resolved;
  if (state.game.fen() !== fen) return;

  state.busy = true;
  syncTrainContinue();
  if (!state.reviewArrows) state.board.setArrows([]);
  if (!firstEngine) await sleep(300);
  if (gameId !== state.gameId || state.game.fen() !== fen) {
    state.busy = false;
    return;
  }

  const played = state.game.move({
    from: move.from,
    to: move.to,
    promotion: move.promotion || "q",
  });
  if (!played) throw new Error("Mossa motore illegale");

  state.board.setLastMove(played.from, played.to);
  await state.board.animateMove(played.from, played.to);
  if (gameId !== state.gameId) {
    state.busy = false;
    return;
  }
  thawKingLivesAfterOpp();
  state.trainLives = null;
  state.beforeOppEval = Number.isFinite(state.gameEval) ? state.gameEval : 0;
  state.board.setPosition(state.game.fen());
  flashThreatenedPieces(played);
  renderHistory();
  renderKingLives();

  if (state.game.game_over()) {
    clearTrainHold();
    hideHintPanel();
    state.busy = false;
    finishGame();
    return;
  }

  state.trainNext = { pool, nextBest, nextEval };
  state.continueArmed = false;
  state.pendingOpp = null;
  state.busy = false;
  syncTrainContinue();
  if (oppBand && !firstEngine) showKingReact(oppBand);
  const talk = kingComment(fen, played, true, oppKey, beforeEval);
  state.lastKingTalk = talk;
  state.kingReplay = { type: "opponent", beforeFen: fen, afterFen: state.game.fen(), move: { ...played }, feedbackKey: oppKey, reactBand: oppBand, beforeEval };
  setStatus(t("turn.you"), `${youLabel()}. ${t("turn.make")}`, "play");
  speakKing(talk, { calculating: false, html: true });
  syncBoard({ keepArrows: true });
}

function revealTrainNext() {
  if (!state.trainNext || state.busy) return;
  clearAutoContinueTimer();
  const next = state.trainNext;
  state.trainNext = null;
  state.continueArmed = false;
  clearTrainHold();
  hideHintPanel();
  state.board?.setArrows([]);
  adoptHintPool(next.pool);
  if (Number.isFinite(next.nextBest)) state.hintBestScore = next.nextBest;
  if (Number.isFinite(next.nextEval)) state.gameEval = next.nextEval;
  state.hintPage = 0;
  state.hintsUnlocked = 0;
  prepareHintTalks();
  state.pendingHintReveal = true;
  state.allowHintsWhileSpeaking = true;
  state.busy = false;
  syncTrainContinue();
  revealHintsIfReady();
  syncBoard({ keepArrows: true });
}

async function startTrainOppReply({ afterTalk } = {}) {
  const token = ++state.oppSearchToken;
  const gameId = state.gameId;
  const fen = state.game.fen();
  try {
    const resolved = await resolveOppMove(fen);
    if (token !== state.oppSearchToken || gameId !== state.gameId || state.game.fen() !== fen) return;
    if (!resolved.firstEngine) await waitForOppReplyMin();
    if (afterTalk) await afterTalk;
    if (token !== state.oppSearchToken || gameId !== state.gameId || state.game.fen() !== fen) return;
    await playTrainOppOnBoard(resolved);
    if (token !== state.oppSearchToken || gameId !== state.gameId) return;
    if (state.autoContinue && state.trainNext) scheduleAutoContinue();
  } catch (err) {
    if (err.message === "aborted" || gameId !== state.gameId || token !== state.oppSearchToken) return;
    console.error(err);
    setStatus(t("error"), t("king.engineFail"), "lose");
    if (isTrainHold()) {
      clearTrainHold();
      hideHintPanel();
      syncTrainContinue();
    }
    thawKingLives();
    state.busy = false;
    syncBoard();
  }
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
  try {
    const resolved = await resolveOppMove(fen);
    if (gameId !== state.gameId || state.game.fen() !== fen) return;
    if (!resolved.firstEngine) await waitForOppReplyMin();
    if (afterTalk) await afterTalk;
    if (gameId !== state.gameId || state.game.fen() !== fen) return;
    await applyOppMove(resolved);
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
  const halvesBefore = kingLifeHalves();
  const twBefore = twentiethsHeartsFromCp(Number.isFinite(state.gameEval) ? state.gameEval : 0);
  state.lastPlayerScore = chosen && !chosen.synthetic ? hintScore(chosen) : -Infinity;
  if (Number.isFinite(state.lastPlayerScore)) {
    state.gameEval = evalForPlayer(state.lastPlayerScore, state.game);
  }
  if (evalBarHoldActive()) {
    state.evalBarHold = Number.isFinite(state.gameEval) ? state.gameEval : 0;
  }
  if (isPrevOppEval() || isSwordEval()) freezeKingLives(kingLifeHalves());
  else if (!isLocalVsHuman()) freezeKingLives(isTwentiethsEval() ? twBefore : halvesBefore);
  const lifeKey = pickLifeFeedbackKey(kingLifeHalves() - halvesBefore);
  const visDelta = displayLifeHalves(kingLifeHalves()) - displayLifeHalves(halvesBefore);
  state.busy = true;
  syncHintBoardPlay();
  const fen = state.game.fen();
  const trainReview = Boolean(state.trainingMode);
  if (trainReview) {
    state.trainHold = true;
    state.trainPickedUci = chosen?.uci || `${from}${to}${promotion || ""}`;
    state.trainFen = fen;
    state.trainColor = state.game.turn();
    state.trainLives = halvesBefore;
    hideKingFinale();
    state.kbdHint = null;
    paintKbdHint();
  }
  showKingReact(visDelta < -LIFE_EPS ? "heartMany" : band);
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
  if (!isLocalVsHuman() && !state.game.game_over()) {
    state.oppWaitStartedAt = Date.now();
  }
  const replyKey = state.game.game_over() ? "" : pickSeeReplyKey();
  state.kingReplay = { type: "feedback", key: lifeKey, replyKey, rankKind };
  const feedbackTalk = speakKing(playerFeedbackTalk(lifeKey, replyKey, rankKind), { html: true });
  if (trainReview && !state.game.game_over() && !isLocalVsHuman()) {
    void startTrainOppReply({ afterTalk: feedbackTalk });
  }
  state.board.setLastMove(played.from, played.to);
  await state.board.animateMove(played.from, played.to);
  state.board.setPosition(state.game.fen());
  flashThreatenedPieces(played);
  renderHistory();
  if (isSwordEval()) state.swordFlashPending = true;
  renderKingLives();
  if (trainReview) {
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
  return !isReviewing() && playerIsSideToMove() && !state.busy && !state.trainHold && !isHintFakeLoad() && !state.game.game_over() && state.hints.length;
}

function hintsAreSelectable() {
  return !isReviewing() && !isTrainHold() && !isHintFakeLoad() && !state.game.game_over() && hintPanelOpen() && state.hints.some(Boolean);
}

function moreHintsHotkeyReady() {
  return false;
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
  if (!btn || btn.disabled || isTrainHold() || isHintFakeLoad() || !state.cardClick) return;
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
  if (isTrainHold() || !state.aids.moves) showHintArrows(index, { reveal: true, onlyActive: true });
  else showHintArrows(index, { reveal: true });
});

els.hints.addEventListener("pointerout", (event) => {
  if (event.relatedTarget && els.hints.contains(event.relatedTarget)) return;
  if (isTrainHold()) {
    paintHoldArrows();
    return;
  }
  if (Number.isInteger(state.kbdHint)) {
    selectHintAt(state.kbdHint);
    return;
  }
  if (state.aids.moves) showHintArrows(null, { reveal: true });
  else state.board.setArrows([]);
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
    startHintFakeLoad();
    renderHints();
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
      if (!isHintFakeLoad()) startMoveClock();
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

function openNewGameDialog(tab = "train") {
  closeQuickTools();
  fillModeSelect();
  fillFriendWhereSelect();
  fillSkillSelect();
  fillColorSelect();
  fillStartKindSelect();
  fillHintLayoutSelect();
  fillClockSelect();
  fillRoundEvalSelect();
  fillEvalViewSelect();
  fillStoryIconsSelect();
  fillStartOpeningSelect();
  if (els.skill) els.skill.value = String(state.skill || 2);
  if (els.playColor) els.playColor.value = state.playColorPref || "random";
  if (els.startKind) els.startKind.value = state.startKind || "custom";
  if (els.startOpening) els.startOpening.value = state.startOpeningId || "random";
  if (els.hintLayout) els.hintLayout.value = HINT_LAYOUTS[state.hintLayout] ? state.hintLayout : "6x1";
  if (els.moveClockSelect) els.moveClockSelect.value = String(moveClockSec());
  if (els.roundEval) els.roundEval.value = state.roundEval ? "1" : "0";
  if (els.evalView) els.evalView.value = normalizeEvalView(state.evalView);
  if (els.storyIcons) els.storyIcons.value = state.cardStyle || "war";
  if (els.btnNewCancel) els.btnNewCancel.hidden = !state.hasGame;
  setNewGameTab(tab);
  if (els.newGame) els.newGame.hidden = false;
}

function openSettingsDialog() {
  setAppMenuOpen(false);
  openNewGameDialog("settings");
}

function closeNewGameDialog() {
  if (els.newGame) els.newGame.hidden = true;
}

function isQuickToolsOpen() {
  return Boolean(els.quickTools && !els.quickTools.hidden);
}

function openQuickTools() {
  closeNewGameDialog();
  closeCardStyleMenu();
  syncAidButtons();
  syncRecalcButton();
  syncAutoContinueUi();
  syncHintInfoUi();
  if (els.quickTools) els.quickTools.hidden = false;
  els.quickToolsOpen?.setAttribute("aria-expanded", "true");
}

function closeQuickTools() {
  closeCardStyleMenu();
  if (els.quickTools) els.quickTools.hidden = true;
  els.quickToolsOpen?.setAttribute("aria-expanded", "false");
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
  if (els.skill) els.skill.value = "2";
  if (els.playColor) els.playColor.value = "random";
  if (els.hintLayout) els.hintLayout.value = "6x1";
  if (els.moveClockSelect) els.moveClockSelect.value = "0";
  applyHintLayout("6x1");
  applyMoveClock(0);
  state.mode = "engine";
  state.skill = 2;
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
  state.pendingOpeningIntro = moves === 12;
  startGame(Math.random() < 0.5 ? "w" : "b");
}

function openQuickOnline() {
  setAppMenuOpen(false);
  openNewGameDialog("online");
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
  select.innerHTML = HINT_LAYOUT_ORDER
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

function fillEvalViewSelect() {
  const select = els.evalView;
  if (!select) return;
  const current = normalizeEvalView(state.evalView);
  select.innerHTML = [
    `<option value="abs"${current === "abs" ? " selected" : ""}>${t("settings.evalView.abs")}</option>`,
    `<option value="delta"${current === "delta" ? " selected" : ""}>${t("settings.evalView.delta")}</option>`,
    `<option value="prevOpp"${current === "prevOpp" ? " selected" : ""}>${t("settings.evalView.prevOpp")}</option>`,
    `<option value="sword"${current === "sword" ? " selected" : ""}>${t("settings.evalView.sword")}</option>`,
    `<option value="twentieths"${current === "twentieths" ? " selected" : ""}>${t("settings.evalView.twentieths")}</option>`,
  ].join("");
}

function applyEvalView(value) {
  const wasPrev = isPrevOppEval();
  const wasTwentieths = isTwentiethsEval();
  const wasHold = (wasPrev || wasTwentieths) && !isLocalVsHuman();
  state.evalView = normalizeEvalView(value);
  try {
    localStorage.setItem(EVAL_VIEW_KEY, state.evalView);
  } catch {
    /* ignore */
  }
  if (els.evalView) els.evalView.value = state.evalView;
  if (wasPrev && !isPrevOppEval()) thawKingLives();
  if (wasTwentieths !== isTwentiethsEval()) {
    thawKingLives();
    stopLivesAnim();
    state.shownLives = null;
    state.shownTwentieths = null;
    state.shownOppTwentieths = null;
  }
  if (evalBarHoldActive() && !wasHold) {
    state.evalBarHold = Number.isFinite(state.gameEval) ? state.gameEval : 0;
    resetEvalBarHistory();
  }
  syncHintInfoUi();
  renderHints();
  renderKingLives();
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
  const current = state.cardStyle || "war";
  select.innerHTML = [
    `<option value="icons"${current === "icons" ? " selected" : ""}>${t("settings.storyIcons.standard")}</option>`,
    `<option value="war"${current === "war" ? " selected" : ""}>${t("settings.storyIcons.war")}</option>`,
    `<option value="fumetto"${current === "fumetto" ? " selected" : ""}>${t("settings.storyIcons.fumetto")}</option>`,
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
  paintEvalBar();
}

function applyStoryIcons(value) {
  state.cardStyle = normalizeCardStyle(value);
  try {
    localStorage.setItem(STORY_ICONS_KEY, state.cardStyle);
  } catch {
    /* ignore */
  }
  if (els.storyIcons) els.storyIcons.value = state.cardStyle;
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
  syncGameInfo();
}

function applyHintLayout(id) {
  const mapped = id === "4x3" ? "6x2" : id;
  const next = HINT_LAYOUTS[mapped] ? mapped : "6x1";
  state.hintLayout = next;
  try {
    localStorage.setItem(HINT_LAYOUT_KEY, next);
  } catch {
    /* ignore */
  }
  if (els.hintLayout) els.hintLayout.value = next;
  syncHintLayoutUi();
  syncGameInfo();
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
  fillEvalViewSelect();
  fillStoryIconsSelect();
  fillStartOpeningSelect();
  if (!els.newGame?.hidden) syncNewGameTabUi();
  renderKingLegend();
  syncCoach();
  syncGameInfo();
  syncAidButtons();
  syncHintInfoUi();
  syncRecalcButton();
  if (els.openingLine) {
    els.openingLine.textContent = state.startOpening?.sans?.length
      ? formatOpeningLine(state.game)
      : t("opening.startPos");
  }
  renderHistory();
  renderHints();
  syncTrainingModeUi();
  syncAutoContinueUi();
  syncAdminSolutionsUi();
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
  paintStartOpeningState(opening);
}

function paintStartOpeningState(opening = state.startOpening) {
  state.openingPly = state.game.history().length;
  const hist = state.game.history({ verbose: true });
  const last = hist[hist.length - 1];
  state.board.setLastMove(last ? last.from : null, last ? last.to : null);
  if (els.openingLine) {
    els.openingLine.textContent = opening?.sans?.length
      ? formatOpeningLine(state.game)
      : t("opening.startPos");
  }
}

function openingIntroTitle(opening) {
  const info = describePosition(state.game.history(), state.game);
  if (info?.title && info.title !== t("opening.choose")) {
    return info.variant ? `${info.title} (${info.variant})` : info.title;
  }
  if (opening?.id && opening.id !== "start") return t(`opening.${opening.id}`);
  return opening?.name || "";
}

function setOpeningIntroProgress(done, total) {
  const max = Math.max(1, total);
  const pct = Math.max(0, Math.min(100, (done / max) * 100));
  if (els.openingIntroFill) els.openingIntroFill.style.width = `${pct}%`;
  if (els.openingIntroBar) {
    els.openingIntroBar.setAttribute("aria-valuemax", String(max));
    els.openingIntroBar.setAttribute("aria-valuenow", String(done));
  }
}

function startOpeningIntroBar(ms) {
  const fill = els.openingIntroFill;
  if (!fill) return;
  fill.style.transition = "none";
  fill.style.width = "0%";
  void fill.offsetWidth;
  fill.style.transition = `width ${Math.max(400, ms)}ms linear`;
  fill.style.width = "100%";
}

function resetOpeningIntroBar() {
  const fill = els.openingIntroFill;
  if (!fill) return;
  fill.style.transition = "none";
  fill.style.width = "0%";
}

function paintOpeningIntroName(text) {
  const el = els.openingIntroName;
  if (!el || el.textContent === text) return;
  el.textContent = text;
  el.classList.remove("is-in");
  void el.offsetWidth;
  el.classList.add("is-in");
}

function hideOpeningIntro() {
  const root = els.openingIntro;
  if (!root) return;
  root.hidden = true;
  root.classList.remove("is-out");
  if (els.openingIntroFill) resetOpeningIntroBar();
  if (els.openingIntroName) {
    els.openingIntroName.classList.remove("is-in");
    els.openingIntroName.textContent = "";
  }
  if (els.openingIntroLuck) {
    els.openingIntroLuck.hidden = true;
    els.openingIntroLuck.classList.remove("is-in");
    els.openingIntroLuck.textContent = "";
  }
  document.body.classList.remove("is-opening-intro");
  state.openingIntro = false;
}

function showOpeningIntro(opening) {
  const root = els.openingIntro;
  if (!root) return;
  root.hidden = false;
  root.classList.remove("is-out");
  document.body.classList.add("is-opening-intro");
  resetOpeningIntroBar();
  setOpeningIntroProgress(0, opening?.sans?.length || 12);
  if (els.openingIntroName) {
    els.openingIntroName.classList.remove("is-in");
    els.openingIntroName.textContent = "";
  }
  if (els.openingIntroLuck) {
    els.openingIntroLuck.hidden = true;
    els.openingIntroLuck.classList.remove("is-in");
    els.openingIntroLuck.textContent = "";
  }
}

async function showOpeningIntroLuck() {
  const el = els.openingIntroLuck;
  if (!el) {
    await sleep(400);
    return;
  }
  el.hidden = false;
  el.textContent = t("king.hello");
  el.classList.remove("is-in");
  void el.offsetWidth;
  el.classList.add("is-in");
  await sleep(1600);
}

async function hideOpeningIntroAnimated() {
  const root = els.openingIntro;
  if (!root || root.hidden) return;
  root.classList.add("is-out");
  await sleep(450);
  hideOpeningIntro();
}

async function playOpeningIntro(opening) {
  const gameId = state.gameId;
  const sans = opening?.sans || [];
  state.openingIntro = true;
  state.busy = true;
  hideHintPanel();
  clearHints();
  renderHints();
  if (els.kingNote) {
    els.kingNote.classList.remove("is-typing");
    els.kingNote.innerHTML = "";
  }
  hideKingFinale();
  setStatus(t("status.preparing"), t("opening.intro.aria"), "think");
  state.board.setInteractive(false);
  state.board.setArrows([]);
  state.board.setLastMove(null, null);
  state.board.setPosition(state.game.fen());
  syncCoach();
  renderHistory();
  renderGraveyard();
  showOpeningIntro(opening);
  await sleep(350);
  if (gameId !== state.gameId) return;
  startOpeningIntroBar(sans.length * 1000);

  for (let i = 0; i < sans.length; i += 1) {
    if (gameId !== state.gameId) return;
    const started = Date.now();
    const played = state.game.move(sans[i]);
    if (!played) break;
    state.board.setLastMove(played.from, played.to);
    await state.board.animateMove(played.from, played.to);
    if (gameId !== state.gameId) return;
    state.board.setPosition(state.game.fen());
    renderHistory();
    renderGraveyard();
    const wait = 1000 - (Date.now() - started);
    if (wait > 0) await sleep(wait);
  }

  if (gameId !== state.gameId) return;
  paintStartOpeningState(opening);
  if (els.openingIntroFill) {
    els.openingIntroFill.style.transition = "width 0.35s linear";
    els.openingIntroFill.style.width = "100%";
  }
  setOpeningIntroProgress(sans.length, sans.length);
  paintOpeningIntroName(openingIntroTitle(opening));
  await showOpeningIntroLuck();
  if (gameId !== state.gameId) return;
  await hideOpeningIntroAnimated();
  if (gameId !== state.gameId) return;
  state.openingIntro = false;
  finishStartGame();
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

function finishStartGame() {
  if (isLocalVsHuman()) state.playerColor = state.game.turn();
  state.busy = false;
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

function startGame(playerColor = state.playerColor) {
  const animateIntro = Boolean(state.pendingOpeningIntro);
  state.pendingOpeningIntro = false;
  state.hasGame = true;
  state.gameId += 1;
  state.oppWaitStartedAt = 0;
  state.speakToken += 1;
  state.kingSpeaking = false;
  state.engine.stop();
  state.game.reset();
  state.mode = els.playMode?.value === "local" ? "local" : "engine";
  state.skill = Number(els.skill?.value || state.skill || 2);
  state.busy = false;
  state.reviewPly = null;
  document.body.classList.remove("is-review");
  state.recalcHints = false;
  state.recalcUsedThisTurn = false;
  stopRecalcProgress();
  hideOpeningIntro();
  hideBoardPickNote();
  state.lastHintMix = "";
  hideKingFinale();
  if (els.hintMix) {
    els.hintMix.innerHTML = "";
    els.hintMix.hidden = true;
  }
  state.gameEval = 0;
  state.beforeOppEval = 0;
  state.evalBarHold = 0;
  resetEvalBarHistory();
  state.standEval = 0;
  state.nextStandEval = null;
  state.livesForced = null;
  thawKingLives();
  stopLivesAnim();
  state.shownLives = null;
  state.shownTwentieths = null;
  state.shownOppTwentieths = null;
  state.shownSwords = null;
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
  if (animateIntro) {
    const opening = selectedStartOpening();
    state.startOpening = opening;
    if (opening?.sans?.length) {
      void playOpeningIntro(opening);
      return;
    }
  }
  applyStartOpening();
  finishStartGame();
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
document.getElementById("btn-menu-settings")?.addEventListener("click", () => openSettingsDialog());
document.getElementById("quick-train")?.addEventListener("click", () => startQuickTraining(0));
document.getElementById("quick-train-12")?.addEventListener("click", () => startQuickTraining(12));
document.getElementById("quick-train-24")?.addEventListener("click", () => startQuickTraining(24));
document.getElementById("quick-online")?.addEventListener("click", () => openQuickOnline());
document.getElementById("quick-settings")?.addEventListener("click", () => openSettingsDialog());
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
els.evalView?.addEventListener("change", () => applyEvalView(els.evalView.value));
els.storyIcons?.addEventListener("change", () => applyStoryIcons(els.storyIcons.value));
els.btnNewStart?.addEventListener("click", () => confirmNewGame());
els.btnNewCancel?.addEventListener("click", () => {
  if (state.hasGame) closeNewGameDialog();
});
els.newGame?.addEventListener("click", (event) => {
  if (event.target === els.newGame && state.hasGame) closeNewGameDialog();
});
document.addEventListener("keydown", (event) => {
  if (event.key !== "Escape") return;
  if (valueMenuOpen()) {
    closeValueMenus();
    return;
  }
  if (isQuickToolsOpen()) {
    closeQuickTools();
    return;
  }
  if (!els.newGame?.hidden && state.hasGame) closeNewGameDialog();
});
els.quickToolsOpen?.addEventListener("click", () => {
  if (isQuickToolsOpen()) closeQuickTools();
  else openQuickTools();
});
els.quickToolsClose?.addEventListener("click", () => closeQuickTools());
els.quickTools?.addEventListener("click", (event) => {
  if (event.target === els.quickTools) closeQuickTools();
});
els.aidMoves.addEventListener("click", () => showAid("moves"));
els.aidThreats?.addEventListener("click", () => showAid("threats"));
els.cardClick?.addEventListener("click", () => setCardClick(!state.cardClick));
els.reviewArrows?.addEventListener("click", () => setReviewArrows(!state.reviewArrows));
els.reviewArrowLabels?.addEventListener("click", () => setReviewArrowLabels(!state.reviewArrowLabels));
els.evalBarHideDiff?.addEventListener("click", () => setEvalBarHideDiff(!state.evalBarHideDiff));
els.evalBarBlockOnly?.addEventListener("click", () => setEvalBarBlockOnly(!state.evalBarBlockOnly));
els.evalBarStyleBtn?.addEventListener("click", (event) => {
  event.stopPropagation();
  toggleValueMenu(els.evalBarStyleList, els.evalBarStyleBtn, fillEvalBarStyleMenu);
});
els.evalBarStyleList?.addEventListener("click", (event) => {
  const item = event.target.closest("[data-eval-bar-style]");
  if (!item) return;
  applyEvalBarStyle(item.getAttribute("data-eval-bar-style"));
  closeValueMenus();
});
els.cardStyleBtn?.addEventListener("click", (event) => {
  event.stopPropagation();
  toggleCardStyleMenu();
});
els.cardStyleList?.addEventListener("click", (event) => {
  const item = event.target.closest("[data-card-style]");
  if (!item) return;
  applyStoryIcons(item.getAttribute("data-card-style"));
  closeValueMenus();
});
els.hintPlace?.addEventListener("click", () => applyHintPlace(!state.hintInfo.place));
els.hintSignBtn?.addEventListener("click", (event) => {
  event.stopPropagation();
  toggleValueMenu(els.hintSignList, els.hintSignBtn, fillHintSignMenu);
});
els.hintSignList?.addEventListener("click", (event) => {
  const item = event.target.closest("[data-hint-sign]");
  if (!item) return;
  applyHintSign(item.getAttribute("data-hint-sign"));
  closeValueMenus();
});
els.evalViewBtn?.addEventListener("click", (event) => {
  event.stopPropagation();
  toggleValueMenu(els.evalViewList, els.evalViewBtn, fillHintEvalViewMenu);
});
els.evalViewList?.addEventListener("click", (event) => {
  const item = event.target.closest("[data-eval-view]");
  if (!item) return;
  applyEvalView(item.getAttribute("data-eval-view"));
  closeValueMenus();
});
els.scoreModeBtn?.addEventListener("click", (event) => {
  event.stopPropagation();
  toggleValueMenu(els.scoreModeList, els.scoreModeBtn, fillHintScoreModeMenu);
});
els.scoreModeList?.addEventListener("click", (event) => {
  const item = event.target.closest("[data-score-mode]");
  if (!item) return;
  applyHintScoreMode(item.getAttribute("data-score-mode"));
  closeValueMenus();
});
els.hintOverlayBtn?.addEventListener("click", (event) => {
  event.stopPropagation();
  toggleValueMenu(els.hintOverlayList, els.hintOverlayBtn, fillHintOverlayMenu);
});
els.hintOverlayList?.addEventListener("click", (event) => {
  const item = event.target.closest("[data-hint-overlay]");
  if (!item) return;
  applyHintOverlay(item.getAttribute("data-hint-overlay"));
  closeValueMenus();
});
els.trainingMode?.addEventListener("click", () => setTrainingMode(!state.trainingMode));
els.autoContinue?.addEventListener("click", () => setAutoContinue(!state.autoContinue));
els.adminSolutionsBtn?.addEventListener("click", () => setAdminSolutions(!state.adminSolutions));
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
  const insideMenu = valueMenus().some(({ root }) => root?.contains(event.target));
  if (!insideMenu) closeValueMenus();
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
fillEvalViewSelect();
fillStoryIconsSelect();
fillStartOpeningSelect();
syncHintLayoutUi();
syncAidButtons();
syncHintInfoUi();
syncRecalcButton();
syncTrainingModeUi();
syncAutoContinueUi();
syncAdminSolutionsUi();
syncGameInfo();
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
