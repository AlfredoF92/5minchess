import { t } from "./i18n.js?v=20260822defaults";

const FILES = "abcdefgh";
const PIECE_SRC = {
  wp: "pieces/wP.svg",
  wn: "pieces/wN.svg",
  wb: "pieces/wB.svg",
  wr: "pieces/wR.svg",
  wq: "pieces/wQ.svg",
  wk: "pieces/wK.svg",
  bp: "pieces/bP.svg",
  bn: "pieces/bN.svg",
  bb: "pieces/bB.svg",
  br: "pieces/bR.svg",
  bq: "pieces/bQ.svg",
  bk: "pieces/bK.svg",
};

function parseFenPieces(fen) {
  const board = {};
  const rows = fen.split(" ")[0].split("/");
  rows.forEach((row, r) => {
    let file = 0;
    for (const ch of row) {
      if (/\d/.test(ch)) {
        file += Number(ch);
        continue;
      }
      const color = ch === ch.toUpperCase() ? "w" : "b";
      const square = FILES[file] + (8 - r);
      board[square] = color + ch.toLowerCase();
      file += 1;
    }
  });
  return board;
}

function squareFromPoint(boardEl, clientX, clientY, orientation) {
  const rect = boardEl.getBoundingClientRect();
  const x = (clientX - rect.left) / rect.width;
  const y = (clientY - rect.top) / rect.height;
  if (x < 0 || y < 0 || x >= 1 || y >= 1) return null;
  let file = Math.floor(x * 8);
  let rank = 7 - Math.floor(y * 8);
  if (orientation === "black") {
    file = 7 - file;
    rank = 7 - rank;
  }
  return FILES[file] + (rank + 1);
}

export class Board {
  constructor(root, options = {}) {
    this.root = root;
    this.orientation = options.orientation || "white";
    this.onMove = options.onMove || (() => {});
    this.onSelect = options.onSelect || (() => {});
    this.pieces = {};
    this.dests = {};
    this.selected = null;
    this.cursor = null;
    this.lastFen = "";
    this.lastMove = null;
    this.check = null;
    this.danger = new Set();
    this.flash = new Set();
    this.arrows = [];
    this.showDests = true;
    this.interactive = false;
    this.turnColor = "w";
    this.playerColor = "w";
    this.drag = null;
    this.hoverDest = null;

    this.root.innerHTML = `
      <div class="board-frame">
        <div class="board-stack">
          <div class="board frozen" tabindex="0" aria-label="${t("board.aria")}"></div>
          <svg class="board-arrows" viewBox="0 0 8 8" preserveAspectRatio="none">
            <g class="arrow-lines"></g>
          </svg>
        </div>
        <ol class="coords-ranks"></ol>
        <ol class="coords-files"></ol>
      </div>
    `;

    this.boardEl = this.root.querySelector(".board");
    this.arrowGroup = this.root.querySelector(".arrow-lines");
    this.ranksEl = this.root.querySelector(".coords-ranks");
    this.filesEl = this.root.querySelector(".coords-files");

    this.#buildSquares();
    this.#bind();
    this.#renderCoords();
  }

  #buildSquares() {
    this.boardEl.innerHTML = "";
    this.squareEls = {};
    for (let row = 0; row < 8; row += 1) {
      for (let col = 0; col < 8; col += 1) {
        const sq = document.createElement("div");
        sq.className = "square";
        const square = this.#visualToSquare(col, row);
        sq.dataset.square = square;
        if ((row + col) % 2 === 0) sq.classList.add("light");
        else sq.classList.add("dark");
        this.boardEl.appendChild(sq);
        this.squareEls[square] = sq;
      }
    }
  }

  #visualToSquare(col, row) {
    const file = this.orientation === "white" ? col : 7 - col;
    const rank = this.orientation === "white" ? 8 - row : row + 1;
    return FILES[file] + rank;
  }

  #squareCenter(square) {
    const file = square.charCodeAt(0) - 97;
    const rank = Number(square[1]) - 1;
    let x = file + 0.5;
    let y = 7.5 - rank;
    if (this.orientation === "black") {
      x = 7.5 - file;
      y = rank + 0.5;
    }
    return { x, y };
  }

  setOrientation(color) {
    this.orientation = color === "b" || color === "black" ? "black" : "white";
    this.#buildSquares();
    this.#renderCoords();
    this.render();
  }

  setPosition(fen) {
    const same = this.lastFen === fen;
    this.lastFen = fen;
    this.pieces = parseFenPieces(fen);
    if (!same) {
      this.selected = null;
      this.cursor = null;
    }
    this.render();
  }

  setTurn(turnColor, playerColor) {
    this.turnColor = turnColor;
    this.playerColor = playerColor;
  }

  setDests(dests) {
    this.dests = dests || {};
    if (this.selected && !this.dests[this.selected]?.length) this.selected = null;
    const allowed = this.#kbdSquares();
    if (this.cursor && !allowed.includes(this.cursor)) {
      this.cursor = this.selected || allowed[0] || null;
    }
    this.#paintSquares();
  }

  setLastMove(from, to) {
    this.lastMove = from && to ? { from, to } : null;
    this.#paintSquares();
  }

  setCheck(square) {
    this.check = square;
    this.#paintSquares();
  }

  setDanger(squares, paint = true) {
    this.danger = new Set(squares || []);
    if (paint) this.#paintDanger();
  }

  setFlash(squares) {
    this.flash = new Set(squares || []);
    this.#paintFlash();
  }

  setArrows(arrows) {
    this.arrows = arrows || [];
    this.#drawArrows();
  }

  setShowDests(on) {
    this.showDests = Boolean(on);
    this.#paintSquares();
  }

  setInteractive(value) {
    this.interactive = Boolean(value);
    this.boardEl.classList.toggle("frozen", !this.interactive);
    if (!this.interactive) {
      this.#dropGhost();
      this.selected = null;
      this.cursor = null;
      this.#paintSquares();
    }
  }

  getSelected() {
    return this.selected;
  }

  getCursor() {
    return this.cursor;
  }

  setCursor(square) {
    this.cursor = square || null;
    this.#paintSquares();
  }

  clearPlayFocus() {
    this.#dropGhost();
    this.selected = null;
    this.cursor = null;
    this.#paintSquares();
  }

  selectSquare(square) {
    if (!this.#canSelect(square)) return false;
    this.selected = square;
    this.cursor = square;
    this.#paintSquares();
    this.onSelect(square);
    return true;
  }

  activateCursor() {
    const square = this.cursor;
    if (!square || !this.interactive) return false;
    if (this.selected && (this.dests[this.selected] || []).includes(square)) {
      const from = this.selected;
      this.selected = null;
      this.#paintSquares();
      this.onSelect(null);
      this.onMove(from, square);
      return true;
    }
    if (this.selected === square) {
      this.selected = null;
      this.#paintSquares();
      this.onSelect(null);
      return true;
    }
    return this.selectSquare(square);
  }

  stepCursor(dx, dy) {
    const allowed = this.#kbdSquares();
    if (!allowed.length) return null;
    let cur = this.cursor || this.selected || allowed[0];
    if (!allowed.includes(cur)) cur = allowed[0];
    const start = this.#squareScreen(cur);
    let best = null;
    let bestKey = Infinity;
    for (const square of allowed) {
      if (square === cur) continue;
      const pos = this.#squareScreen(square);
      const along = (pos.x - start.x) * dx + (pos.y - start.y) * dy;
      if (along <= 0) continue;
      const side = Math.abs((pos.x - start.x) * dy - (pos.y - start.y) * dx);
      const key = side * 24 + along;
      if (key < bestKey) {
        bestKey = key;
        best = square;
      }
    }
    if (!best) {
      let wrapKey = Infinity;
      for (const square of allowed) {
        const pos = this.#squareScreen(square);
        const along = (pos.x - start.x) * dx + (pos.y - start.y) * dy;
        const side = Math.abs((pos.x - start.x) * dy - (pos.y - start.y) * dx);
        const key = along * 24 + side;
        if (key < wrapKey) {
          wrapKey = key;
          best = square;
        }
      }
    }
    this.cursor = best || cur;
    this.#paintSquares();
    return this.cursor;
  }

  #renderCoords() {
    const white = this.orientation === "white";
    this.ranksEl.innerHTML = (white ? [8, 7, 6, 5, 4, 3, 2, 1] : [1, 2, 3, 4, 5, 6, 7, 8])
      .map((n) => `<li>${n}</li>`)
      .join("");
    this.filesEl.innerHTML = (white ? FILES : "hgfedcba")
      .split("")
      .map((f) => `<li>${f}</li>`)
      .join("");
  }

  render() {
    Object.values(this.squareEls).forEach((el) => {
      el.querySelector(".piece")?.remove();
    });
    Object.entries(this.pieces).forEach(([square, piece]) => {
      const el = this.squareEls[square];
      if (!el) return;
      const img = document.createElement("img");
      img.className = "piece";
      img.draggable = false;
      img.alt = piece;
      img.src = PIECE_SRC[piece];
      img.dataset.square = square;
      img.dataset.piece = piece;
      el.appendChild(img);
    });
    this.#paintSquares();
    this.#paintDanger();
    this.#paintFlash();
    this.#drawArrows();
  }

  #paintFlash() {
    Object.entries(this.squareEls).forEach(([square, el]) => {
      el.classList.toggle("threat-flash", this.flash.has(square));
    });
  }

  #paintDanger() {
    Object.entries(this.squareEls).forEach(([square, el]) => {
      let pip = el.querySelector(".danger-pip");
      el.querySelector(".shield-pip")?.remove();
      const threatened = this.danger.has(square);
      if (threatened && !pip) {
        pip = document.createElement("span");
        pip.className = "danger-pip";
        pip.title = t("pip.attack");
        pip.setAttribute("aria-label", t("pip.aria"));
        el.appendChild(pip);
      } else if (!threatened && pip) {
        pip.remove();
      }
    });
  }

  #paintSquares() {
    Object.entries(this.squareEls).forEach(([square, el]) => {
      el.classList.remove("selected", "last", "check", "dest", "capture", "is-focus", "can-move", "is-drop");
      const destOfSel = Boolean(this.selected && (this.dests[this.selected] || []).includes(square));
      const origin = this.#canSelect(square);
      el.classList.toggle("can-move", Boolean(this.interactive && (destOfSel || origin)));
      el.classList.toggle("is-focus", this.cursor === square);
    });
    if (this.lastMove) {
      this.squareEls[this.lastMove.from]?.classList.add("last");
      this.squareEls[this.lastMove.to]?.classList.add("last");
    }
    if (this.check) this.squareEls[this.check]?.classList.add("check");
    if (this.selected) {
      this.squareEls[this.selected]?.classList.add("selected");
      (this.dests[this.selected] || []).forEach((dest) => {
        const target = this.squareEls[dest];
        if (!target) return;
        target.classList.add(this.pieces[dest] ? "capture" : "dest");
        if (dest === this.hoverDest) target.classList.add("is-drop");
      });
    }
  }

  #drawArrows() {
    this.arrowGroup.innerHTML = "";
    const ns = "http://www.w3.org/2000/svg";
    const drawn = [...this.arrows].sort(
      (left, right) => Number(left.opacity ?? 0) - Number(right.opacity ?? 0)
    );
    for (const arrow of drawn) {
      const a = this.#squareCenter(arrow.from);
      const b = this.#squareCenter(arrow.to);
      const dx = b.x - a.x;
      const dy = b.y - a.y;
      const len = Math.hypot(dx, dy) || 1;
      const ux = dx / len;
      const uy = dy / len;
      const px = -uy;
      const py = ux;
      const color = arrow.color || "#6aa329";
      const opacity = String(arrow.opacity ?? 0.85);
      const stroke = arrow.stroke || color;
      const strokeWidth = String(arrow.strokeWidth ?? 0.018);
      const strokeOpacity = String(arrow.strokeOpacity ?? opacity);
      const shaftHalf = (Number(arrow.width) || 0.15) / 2;
      const startPad = 0.3;
      const tipPad = 0.08;
      const usable = Math.max(0.42, len - startPad - tipPad);
      const headLen = Math.min(0.42, usable * 0.52);
      const headHalf = Math.max(shaftHalf * 2.35, 0.2);

      const sx = a.x + ux * startPad;
      const sy = a.y + uy * startPad;
      const tx = b.x - ux * tipPad;
      const ty = b.y - uy * tipPad;
      const hx = tx - ux * headLen;
      const hy = ty - uy * headLen;
      const path = document.createElementNS(ns, "polygon");
      path.setAttribute(
        "points",
        [
          [sx + px * shaftHalf, sy + py * shaftHalf],
          [sx - px * shaftHalf, sy - py * shaftHalf],
          [hx - px * shaftHalf, hy - py * shaftHalf],
          [hx - px * headHalf, hy - py * headHalf],
          [tx, ty],
          [hx + px * headHalf, hy + py * headHalf],
          [hx + px * shaftHalf, hy + py * shaftHalf],
        ]
          .map((point) => point.join(","))
          .join(" ")
      );
      path.setAttribute("fill", color);
      path.setAttribute("fill-opacity", opacity);
      path.setAttribute("stroke", stroke);
      path.setAttribute("stroke-opacity", strokeOpacity);
      path.setAttribute("stroke-width", strokeWidth);
      path.setAttribute("paint-order", "fill stroke");
      path.setAttribute("stroke-linejoin", "miter");
      path.setAttribute("stroke-miterlimit", "8");
      this.arrowGroup.appendChild(path);

      if (!arrow.label) continue;
      const label = String(arrow.label);
      const back = this.pieces[arrow.to] ? headLen + 0.16 : 0.02;
      const fontSize = label.length <= 2 ? 0.36 : label.length <= 3 ? 0.32 : label.length <= 4 ? 0.28 : 0.24;
      const text = document.createElementNS(ns, "text");
      text.setAttribute("x", String(tx - ux * back));
      text.setAttribute("y", String(ty - uy * back));
      text.setAttribute("text-anchor", "middle");
      text.setAttribute("dominant-baseline", "middle");
      text.setAttribute("dy", "0.08");
      text.setAttribute("fill", arrow.labelColor || "#1f1f1f");
      text.setAttribute("fill-opacity", "0.92");
      text.setAttribute("stroke", "#fff8e8");
      text.setAttribute("stroke-width", "0.07");
      text.setAttribute("stroke-linejoin", "round");
      text.setAttribute("paint-order", "stroke");
      text.setAttribute("font-size", String(fontSize));
      text.setAttribute("font-weight", "700");
      text.setAttribute("font-family", '"Segoe UI", "Trebuchet MS", Arial, sans-serif');
      text.setAttribute("style", "pointer-events:none;user-select:none;");
      text.textContent = label;
      this.arrowGroup.appendChild(text);
    }
  }

  async animateMove(from, to) {
    const fromEl = this.squareEls[from]?.querySelector(".piece");
    const toSquare = this.squareEls[to];
    if (!fromEl || !toSquare) {
      this.render();
      return;
    }
    const fromRect = fromEl.getBoundingClientRect();
    const toRect = toSquare.getBoundingClientRect();
    const destLeft = toRect.left + (toRect.width - fromRect.width) / 2;
    const destTop = toRect.top + (toRect.height - fromRect.height) / 2;
    const ghost = fromEl.cloneNode(true);
    ghost.classList.add("piece-ghost");
    ghost.style.width = `${fromRect.width}px`;
    ghost.style.height = `${fromRect.height}px`;
    ghost.style.left = `${fromRect.left}px`;
    ghost.style.top = `${fromRect.top}px`;
    ghost.style.transform = "translate3d(0,0,0)";
    ghost.style.transition = "none";
    document.body.appendChild(ghost);
    fromEl.style.opacity = "0";
    const captured = toSquare.querySelector(".piece");
    if (captured) captured.classList.add("is-captured");
    await new Promise((resolve) => requestAnimationFrame(() => requestAnimationFrame(resolve)));
    ghost.style.transition = "transform 0.42s cubic-bezier(0.22, 0.72, 0.28, 1)";
    ghost.style.transform = `translate3d(${destLeft - fromRect.left}px, ${destTop - fromRect.top}px, 0)`;
    await new Promise((resolve) => {
      let settled = false;
      const done = () => {
        if (settled) return;
        settled = true;
        resolve();
      };
      ghost.addEventListener("transitionend", (event) => {
        if (event.propertyName === "transform") done();
      });
      setTimeout(done, 480);
    });
    ghost.remove();
  }

  #squareScreen(square) {
    const file = square.charCodeAt(0) - 97;
    const rank = Number(square[1]) - 1;
    if (this.orientation === "white") return { x: file, y: 7 - rank };
    return { x: 7 - file, y: rank };
  }

  #kbdSquares() {
    const origins = Object.keys(this.dests).filter((square) => this.dests[square]?.length);
    if (!this.selected) return origins;
    return [...new Set([this.selected, ...(this.dests[this.selected] || []), ...origins])];
  }

  #canSelect(square) {
    if (!this.interactive) return false;
    const piece = this.pieces[square];
    if (!piece || piece[0] !== this.turnColor) return false;
    return Boolean(this.dests[square]?.length);
  }

  #liftPieceFromEvent(square, event) {
    this.#dropGhost();
    const pieceEl = this.squareEls[square]?.querySelector(".piece");
    if (!pieceEl) return;
    const rect = pieceEl.getBoundingClientRect();
    try {
      this.boardEl.setPointerCapture(event.pointerId);
    } catch {
      /* ignore */
    }
    const ghost = pieceEl.cloneNode(true);
    ghost.classList.add("piece-ghost", "dragging");
    ghost.style.width = `${rect.width}px`;
    ghost.style.height = `${rect.height}px`;
    document.body.appendChild(ghost);
    pieceEl.classList.add("dragging-source");
    this.boardEl.classList.add("is-dragging");
    this.drag = {
      from: square,
      pointerId: event.pointerId,
      ghost,
      dx: event.clientX - rect.left,
      dy: event.clientY - rect.top,
    };
    this.#moveGhost(event);
    event.preventDefault();
  }

  #moveGhost(event) {
    if (!this.drag?.ghost) return;
    this.drag.ghost.style.left = `${event.clientX - this.drag.dx}px`;
    this.drag.ghost.style.top = `${event.clientY - this.drag.dy}px`;
  }

  #dropGhost() {
    if (!this.drag) return;
    this.drag.ghost?.remove();
    this.squareEls[this.drag.from]?.querySelector(".piece")?.classList.remove("dragging-source");
    this.boardEl.classList.remove("is-dragging");
    try {
      if (this.drag.pointerId != null) this.boardEl.releasePointerCapture(this.drag.pointerId);
    } catch {
      /* ignore */
    }
    this.drag = null;
    this.#clearHoverDest();
  }

  #hoverFrom() {
    return this.drag?.from || this.selected || null;
  }

  #updateHoverDest(event) {
    const from = this.#hoverFrom();
    if (!from) {
      this.#clearHoverDest();
      return;
    }
    const square = squareFromPoint(this.boardEl, event.clientX, event.clientY, this.orientation);
    const next = square && square !== from && (this.dests[from] || []).includes(square) ? square : null;
    if (next === this.hoverDest) return;
    this.hoverDest = next;
    this.#paintSquares();
  }

  #clearHoverDest() {
    if (!this.hoverDest) return;
    this.hoverDest = null;
    this.#paintSquares();
  }

  #bind() {
    this.boardEl.addEventListener("pointerdown", (event) => {
      if (!this.interactive) return;
      if (event.button != null && event.button !== 0) return;
      const square = squareFromPoint(
        this.boardEl,
        event.clientX,
        event.clientY,
        this.orientation
      );
      if (!square) return;

      if (this.selected && (this.dests[this.selected] || []).includes(square)) {
        const from = this.selected;
        this.#dropGhost();
        this.selected = null;
        this.cursor = null;
        this.#paintSquares();
        this.onSelect(null);
        this.onMove(from, square);
        return;
      }

      if (this.#canSelect(square)) {
        if (this.selected === square) {
          this.#dropGhost();
          this.selected = null;
          this.cursor = null;
          this.#paintSquares();
          this.onSelect(null);
          return;
        }
        this.selected = square;
        this.cursor = null;
        this.#paintSquares();
        this.onSelect(square);
        this.#liftPieceFromEvent(square, event);
      } else {
        this.#dropGhost();
        this.selected = null;
        this.cursor = null;
        this.#paintSquares();
        this.onSelect(null);
      }
    });

    this.boardEl.addEventListener("pointermove", (event) => {
      if (this.drag && event.pointerId === this.drag.pointerId) this.#moveGhost(event);
      if (this.drag || this.selected) this.#updateHoverDest(event);
    });
    this.boardEl.addEventListener("pointerleave", () => {
      if (this.drag) return;
      this.#clearHoverDest();
    });

    const endDrag = (event) => {
      if (!this.drag || event.pointerId !== this.drag.pointerId) return;
      const from = this.drag.from;
      this.#dropGhost();
      const to = squareFromPoint(
        this.boardEl,
        event.clientX,
        event.clientY,
        this.orientation
      );
      if (to && to !== from && (this.dests[from] || []).includes(to)) {
        this.selected = null;
        this.cursor = to;
        this.#paintSquares();
        this.onSelect(null);
        this.onMove(from, to);
      }
    };

    this.boardEl.addEventListener("pointerup", endDrag);
    this.boardEl.addEventListener("pointercancel", endDrag);
  }
}
