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
    this.pieces = {};
    this.dests = {};
    this.selected = null;
    this.lastMove = null;
    this.check = null;
    this.danger = new Set();
    this.protected = new Set();
    this.arrows = [];
    this.interactive = false;
    this.turnColor = "w";
    this.playerColor = "w";
    this.drag = null;

    this.root.innerHTML = `
      <div class="board-frame">
        <div class="board-stack">
          <div class="board frozen" tabindex="0" aria-label="Scacchiera"></div>
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
    this.pieces = parseFenPieces(fen);
    this.selected = null;
    this.render();
  }

  setTurn(turnColor, playerColor) {
    this.turnColor = turnColor;
    this.playerColor = playerColor;
  }

  setDests(dests) {
    this.dests = dests || {};
  }

  setLastMove(from, to) {
    this.lastMove = from && to ? { from, to } : null;
    this.#paintSquares();
  }

  setCheck(square) {
    this.check = square;
    this.#paintSquares();
  }

  setDanger(squares, paint = true, protectedSquares = []) {
    this.danger = new Set(squares || []);
    this.protected = new Set(protectedSquares || []);
    if (paint) this.#paintDanger();
  }

  setArrows(arrows) {
    this.arrows = arrows || [];
    this.#drawArrows();
  }

  setInteractive(value) {
    this.interactive = value;
    this.boardEl.classList.toggle("frozen", !value);
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
    this.#drawArrows();
  }

  #paintDanger() {
    Object.entries(this.squareEls).forEach(([square, el]) => {
      let pip = el.querySelector(".danger-pip");
      let shield = el.querySelector(".shield-pip");
      const threatened = this.danger.has(square);
      const guarded = threatened && this.protected.has(square);
      if (threatened && !pip) {
        pip = document.createElement("span");
        pip.className = "danger-pip";
        pip.title = "Sotto attacco";
        pip.setAttribute("aria-label", "Pezzo sotto attacco");
        el.appendChild(pip);
      } else if (!threatened && pip) {
        pip.remove();
      }
      if (guarded && !shield) {
        shield = document.createElement("span");
        shield.className = "shield-pip";
        shield.title = "Protetto da un altro pezzo";
        shield.setAttribute("aria-label", "Pezzo protetto");
        shield.innerHTML = `<svg viewBox="0 0 16 16" aria-hidden="true"><path d="M8 1.1 14.2 3.5v4.3c0 3.8-2.5 7.1-6.2 8.1-3.7-1-6.2-4.3-6.2-8.1V3.5L8 1.1z"/></svg>`;
        el.appendChild(shield);
      } else if (!guarded && shield) {
        shield.remove();
      }
    });
  }

  #paintSquares() {
    Object.values(this.squareEls).forEach((el) => {
      el.classList.remove("selected", "last", "check", "dest", "capture");
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
      });
    }
  }

  #drawArrows() {
    this.arrowGroup.innerHTML = "";
    const ns = "http://www.w3.org/2000/svg";
    const badges = [];
    for (const arrow of this.arrows) {
      const a = this.#squareCenter(arrow.from);
      const b = this.#squareCenter(arrow.to);
      const dx = b.x - a.x;
      const dy = b.y - a.y;
      const len = Math.hypot(dx, dy) || 1;
      const ux = dx / len;
      const uy = dy / len;
      const color = arrow.color || "#6aa329";
      const opacity = String(arrow.opacity ?? 0.85);
      const line = document.createElementNS(ns, "line");
      line.setAttribute("x1", String(a.x + ux * 0.18));
      line.setAttribute("y1", String(a.y + uy * 0.18));
      line.setAttribute("x2", String(b.x - ux * 0.32));
      line.setAttribute("y2", String(b.y - uy * 0.32));
      line.setAttribute("stroke", color);
      line.setAttribute("stroke-width", arrow.width || "0.18");
      line.setAttribute("stroke-opacity", opacity);
      line.setAttribute("stroke-linecap", "round");
      const head = document.createElementNS(ns, "polygon");
      const hx = b.x - ux * 0.12;
      const hy = b.y - uy * 0.12;
      const px = -uy * 0.16;
      const py = ux * 0.16;
      head.setAttribute(
        "points",
        `${b.x - ux * 0.04},${b.y - uy * 0.04} ${hx + px},${hy + py} ${hx - px},${hy - py}`
      );
      head.setAttribute("fill", color);
      head.setAttribute("fill-opacity", opacity);
      this.arrowGroup.appendChild(line);
      this.arrowGroup.appendChild(head);
      if (!arrow.label) continue;
      badges.push({ arrow, b, ux, uy, color, opacity });
    }
    badges.sort((left, right) => Number(left.opacity) - Number(right.opacity));
    for (const { arrow, b, ux, uy, color, opacity } of badges) {
      const emphasized = Number(opacity) >= 0.6;
      const label = String(arrow.label);
      const labelX = b.x + ux * 0.18;
      const labelY = b.y + uy * 0.18;
      const fontSize = label.length <= 2 ? 0.42 : label.length <= 3 ? 0.38 : label.length <= 4 ? 0.34 : 0.28;
      const text = document.createElementNS(ns, "text");
      text.setAttribute("x", String(labelX));
      text.setAttribute("y", String(labelY));
      text.setAttribute("text-anchor", "middle");
      text.setAttribute("dominant-baseline", "middle");
      text.setAttribute("dy", "0.12");
      text.setAttribute("fill", color);
      text.setAttribute("fill-opacity", emphasized ? "0.92" : "0.55");
      text.setAttribute("font-size", String(fontSize));
      text.setAttribute("font-weight", "800");
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
    const ghost = fromEl.cloneNode(true);
    ghost.classList.add("piece-ghost");
    ghost.style.width = `${fromRect.width}px`;
    ghost.style.height = `${fromRect.height}px`;
    ghost.style.left = `${fromRect.left}px`;
    ghost.style.top = `${fromRect.top}px`;
    document.body.appendChild(ghost);
    fromEl.style.opacity = "0";
    const captured = toSquare.querySelector(".piece");
    if (captured) captured.style.opacity = "0.35";
    await new Promise((r) => requestAnimationFrame(r));
    ghost.style.transform = `translate(${toRect.left - fromRect.left}px, ${toRect.top - fromRect.top}px)`;
    await new Promise((resolve) => {
      ghost.addEventListener("transitionend", resolve, { once: true });
      setTimeout(resolve, 280);
    });
    ghost.remove();
  }

  #canSelect(square) {
    if (!this.interactive) return false;
    const piece = this.pieces[square];
    if (!piece) return false;
    return piece[0] === this.playerColor && this.turnColor === this.playerColor;
  }

  #bind() {
    this.boardEl.addEventListener("pointerdown", (event) => {
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
        this.selected = null;
        this.#paintSquares();
        this.onMove(from, square);
        return;
      }

      if (this.#canSelect(square)) {
        this.selected = square;
        this.#paintSquares();
        const pieceEl = this.squareEls[square].querySelector(".piece");
        if (!pieceEl) return;
        this.boardEl.setPointerCapture(event.pointerId);
        const rect = pieceEl.getBoundingClientRect();
        this.drag = {
          from: square,
          pointerId: event.pointerId,
          ghost: null,
          dx: event.clientX - rect.left,
          dy: event.clientY - rect.top,
          moved: false,
        };
        event.preventDefault();
      } else {
        this.selected = null;
        this.#paintSquares();
      }
    });

    this.boardEl.addEventListener("pointermove", (event) => {
      if (!this.drag || event.pointerId !== this.drag.pointerId) return;
      const dist = Math.hypot(
        event.clientX - (this.drag.originX || event.clientX),
        event.clientY - (this.drag.originY || event.clientY)
      );
      if (!this.drag.originX) {
        this.drag.originX = event.clientX;
        this.drag.originY = event.clientY;
      }
      if (!this.drag.ghost && dist > 4) {
        const pieceEl = this.squareEls[this.drag.from].querySelector(".piece");
        if (!pieceEl) return;
        const rect = pieceEl.getBoundingClientRect();
        const ghost = pieceEl.cloneNode(true);
        ghost.classList.add("piece-ghost", "dragging");
        ghost.style.width = `${rect.width}px`;
        ghost.style.height = `${rect.height}px`;
        document.body.appendChild(ghost);
        pieceEl.classList.add("dragging-source");
        this.drag.ghost = ghost;
        this.drag.moved = true;
      }
      if (this.drag.ghost) {
        this.drag.ghost.style.left = `${event.clientX - this.drag.dx}px`;
        this.drag.ghost.style.top = `${event.clientY - this.drag.dy}px`;
      }
    });

    const endDrag = (event) => {
      if (!this.drag || event.pointerId !== this.drag.pointerId) return;
      const { from, ghost, moved } = this.drag;
      ghost?.remove();
      this.squareEls[from]?.querySelector(".piece")?.classList.remove("dragging-source");
      this.drag = null;
      const to = squareFromPoint(
        this.boardEl,
        event.clientX,
        event.clientY,
        this.orientation
      );
      if (moved && to && to !== from && (this.dests[from] || []).includes(to)) {
        this.selected = null;
        this.#paintSquares();
        this.onMove(from, to);
      }
    };

    this.boardEl.addEventListener("pointerup", endDrag);
    this.boardEl.addEventListener("pointercancel", endDrag);
  }
}
