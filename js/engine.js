/** Stockfish UCI wrapper: analysis (top 4 moves) vs weakened play. */

function parseInfo(line) {
  if (!line.startsWith("info ") || !line.includes(" pv ")) return null;
  if (line.includes("lowerbound") || line.includes("upperbound")) return null;
  const score = / score (cp|mate) (-?\d+)/.exec(line);
  const pv = / pv ([a-h][1-8][a-h][1-8][qrbn]?(?: [a-h][1-8][a-h][1-8][qrbn]?)*)/.exec(line);
  if (!score || !pv) return null;
  const multipv = /(?:^| )multipv (\d+)/.exec(line);
  const depth = /(?:^| )depth (\d+)/.exec(line);
  const moves = pv[1].trim().split(/\s+/);
  return {
    multipv: multipv ? Number(multipv[1]) : 1,
    depth: depth ? Number(depth[1]) : 0,
    scoreType: score[1],
    score: Number(score[2]),
    uci: moves[0],
    pv: moves,
  };
}

export class Engine {
  #currentAbort = null;
  #booted = false;

  constructor() {
    this.worker = new Worker(new URL("./stockfish.js", import.meta.url));
    this.listeners = new Set();
    this.ready = this.#boot();
    this.chain = this.ready;

    this.worker.onmessage = (event) => {
      const line = typeof event.data === "string" ? event.data : "";
      if (!line) return;
      this.listeners.forEach((fn) => fn(line));
    };

    this.worker.onerror = (err) => {
      console.error("Stockfish worker error", err);
    };
  }

  post(command) {
    this.worker.postMessage(command);
  }

  #waitFor(predicate, start, timeoutMs = 25000) {
    return new Promise((resolve, reject) => {
      const cleanup = () => {
        clearTimeout(timer);
        this.listeners.delete(onLine);
        if (this.#currentAbort === abort) this.#currentAbort = null;
      };
      const abort = () => {
        cleanup();
        reject(new Error("aborted"));
      };
      const timer = setTimeout(() => {
        cleanup();
        reject(new Error("Motore: timeout"));
      }, timeoutMs);

      const onLine = (line) => {
        if (!predicate(line)) return;
        cleanup();
        resolve(line);
      };

      this.#currentAbort = abort;
      this.listeners.add(onLine);
      if (start) start();
    });
  }

  async #boot() {
    await this.#waitFor((line) => line === "uciok", () => this.post("uci"));
    this.post("setoption name Hash value 64");
    this.post("setoption name Ponder value false");
    await this.#waitFor((line) => line === "readyok", () => this.post("isready"));
    this.#booted = true;
  }

  #enqueue(work) {
    const run = this.chain.then(work, work);
    this.chain = run.catch(() => {});
    return run;
  }

  stop() {
    this.post("stop");
    if (this.#booted) this.#currentAbort?.();
  }

  async #flush() {
    this.post("stop");
    try {
      await this.#waitFor((line) => line === "readyok", () => this.post("isready"), 4000);
    } catch (err) {
      if (err.message === "aborted") throw err;
    }
  }

  analyze(fen, { depth = 11, multipv = 12, movetime = 3000 } = {}) {
    return this.#enqueue(async () => {
      await this.ready;
      await this.#flush();
      this.post("setoption name UCI_LimitStrength value false");
      this.post("setoption name Skill Level value 20");
      this.post(`setoption name MultiPV value ${multipv}`);
      this.post(`position fen ${fen}`);

      const pvs = new Map();
      try {
        await this.#waitFor(
          (line) => {
            const info = parseInfo(line);
            if (info) pvs.set(info.multipv, info);
            return line.startsWith("bestmove");
          },
          () => this.post(movetime ? `go movetime ${movetime}` : `go depth ${depth}`),
          (movetime || 4000) + 4000
        );
      } catch (err) {
        this.post("stop");
        if (err.message === "aborted") throw err;
      }
      return [...pvs.values()].sort((a, b) => a.multipv - b.multipv);
    });
  }

  play(fen, { elo = 1300, unlimited = false, movetime = 1200, skill = 1 } = {}) {
    return this.#enqueue(async () => {
      await this.ready;
      await this.#flush();
      this.post("setoption name MultiPV value 1");
      if (unlimited) {
        this.post("setoption name UCI_LimitStrength value false");
        this.post("setoption name Skill Level value 20");
      } else if (Number(elo) < 1320) {
        const weak = Math.max(0, Math.min(3, Number.isFinite(skill) ? skill : 0));
        this.post("setoption name UCI_LimitStrength value false");
        this.post(`setoption name Skill Level value ${weak}`);
      } else {
        const clamped = Math.max(1320, Math.min(3190, Number(elo) || 1600));
        this.post("setoption name Skill Level value 20");
        this.post("setoption name UCI_LimitStrength value true");
        this.post(`setoption name UCI_Elo value ${clamped}`);
      }
      this.post(`position fen ${fen}`);

      let lastPv = null;
      let bestLine = "";

      try {
        bestLine = await this.#waitFor(
          (line) => {
            const info = parseInfo(line);
            if (info) lastPv = info;
            return line.startsWith("bestmove");
          },
          () => this.post(`go movetime ${movetime}`),
          (movetime || 1200) + 4000
        );
      } catch (err) {
        this.post("stop");
        if (err.message === "aborted") throw err;
      }

      const uci = /^bestmove ([a-h][1-8][a-h][1-8][qrbn]?)/.exec(bestLine || "");
      return {
        uci: uci ? uci[1] : lastPv?.uci,
        info: lastPv,
      };
    });
  }
}
