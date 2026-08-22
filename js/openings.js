/** Libro aperture ECO (Lichess) + descrizioni in italiano. */
import { getLang, t } from "./i18n.js?v=20260822defaults";

function normalizeSan(san) {
  return String(san).replace(/[+#?!]+$/g, "");
}

function pgnToSans(pgn) {
  return pgn
    .split(/\s+/)
    .map((token) => token.replace(/^\d+\.+\s*/, "").replace(/\d+\.+/g, ""))
    .filter(Boolean)
    .map(normalizeSan);
}

const root = { kids: Object.create(null), eco: null, name: null };
let loaded = false;

function insertLine(eco, name, sans) {
  let node = root;
  for (const san of sans) {
    if (!node.kids[san]) node.kids[san] = { kids: Object.create(null), eco: null, name: null };
    node = node.kids[san];
  }
  node.eco = eco;
  node.name = name;
}

export const START_OPENINGS = [
  { id: "start", name: "Posizione iniziale", sans: [] },
  { id: "italian", name: "Partita Italiana", sans: ["e4", "e5", "Nf3", "Nc6", "Bc4", "Bc5", "c3", "Nf6", "d4", "exd4", "cxd4", "Bb4+"] },
  { id: "spanish", name: "Partita Spagnola", sans: ["e4", "e5", "Nf3", "Nc6", "Bb5", "a6", "Ba4", "Nf6", "O-O", "Be7", "Re1", "b5"] },
  { id: "sicilian", name: "Difesa Siciliana", sans: ["e4", "c5", "Nf3", "d6", "d4", "cxd4", "Nxd4", "Nf6", "Nc3", "a6", "Be3", "e5"] },
  { id: "french", name: "Difesa Francese", sans: ["e4", "e6", "d4", "d5", "Nc3", "Nf6", "Bg5", "Be7", "e5", "Nfd7", "Bxe7", "Qxe7"] },
  { id: "caro", name: "Difesa Caro-Kann", sans: ["e4", "c6", "d4", "d5", "Nc3", "dxe4", "Nxe4", "Bf5", "Ng3", "Bg6", "h4", "h6"] },
  { id: "qgd", name: "Gambetto di Donna", sans: ["d4", "d5", "c4", "e6", "Nc3", "Nf6", "Bg5", "Be7", "Nf3", "O-O", "e3", "Nbd7"] },
  { id: "kid", name: "Difesa Est-Indiana", sans: ["d4", "Nf6", "c4", "g6", "Nc3", "Bg7", "e4", "d6", "Nf3", "O-O", "Be2", "e5"] },
  { id: "english", name: "Apertura Inglese", sans: ["c4", "e5", "Nc3", "Nf6", "Nf3", "Nc6", "g3", "Bb4", "Bg2", "O-O", "O-O", "Re8"] },
  { id: "london", name: "Sistema Londra", sans: ["d4", "d5", "Nf3", "Nf6", "Bf4", "e6", "e3", "c5", "c3", "Nc6", "Nbd2", "Bd6"] },
  { id: "scotch", name: "Partita Scozzese", sans: ["e4", "e5", "Nf3", "Nc6", "d4", "exd4", "Nxd4", "Nf6", "Nxc6", "bxc6", "e5", "Qe7"] },
  { id: "center", name: "Partita di Centro", sans: ["e4", "e5", "d4", "exd4", "Qxd4", "Nc6", "Qe3", "Nf6", "Nc3", "Bb4", "Bd2", "O-O", "O-O-O", "Re8", "Bc4", "d6", "Nf3", "Be6", "Bxe6", "Rxe6", "Ng5", "Re8", "f4", "h6"] },
  { id: "petrov", name: "Partita Russa", sans: ["e4", "e5", "Nf3", "Nf6", "Nxe5", "d6", "Nf3", "Nxe4", "d4", "d5", "Bd3", "Nc6", "O-O", "Be7", "c4", "Nb4", "Be2", "O-O", "Nc3", "Bf5", "a3", "Nxc3", "bxc3", "Nc6"] },
  { id: "vienna", name: "Partita Viennese", sans: ["e4", "e5", "Nc3", "Nf6", "f4", "d5", "fxe5", "Nxe4", "Nf3", "Be7", "Qe2", "Nxc3", "dxc3", "c5", "Bf4", "Nc6", "O-O-O", "Be6", "Kb1", "Qa5", "a3", "O-O-O", "g3", "h6"] },
  { id: "kgambit", name: "Gambetto di Re", sans: ["e4", "e5", "f4", "exf4", "Nf3", "g5", "Bc4", "Bg7", "O-O", "d6", "d4", "h6", "c3", "Nc6", "g3", "g4", "Nh4", "f3", "Nd2", "Bf6", "Ndxf3", "gxf3", "Qxf3", "Qe7"] },
  { id: "scandi", name: "Difesa Scandinava", sans: ["e4", "d5", "exd5", "Qxd5", "Nc3", "Qa5", "d4", "Nf6", "Nf3", "c6", "Bc4", "Bf5", "Bd2", "e6", "Qe2", "Bb4", "O-O-O", "Nbd7", "a3", "Bxc3", "Bxc3", "Qc7", "Nh4", "Bg6"] },
  { id: "pirc", name: "Difesa Pirc", sans: ["e4", "d6", "d4", "Nf6", "Nc3", "g6", "Nf3", "Bg7", "Be2", "O-O", "O-O", "c6", "a4", "Nbd7", "Be3", "e5", "dxe5", "dxe5", "Qd2", "Qc7", "Rad1", "Re8", "h3", "Nc5"] },
  { id: "slav", name: "Difesa Slava", sans: ["d4", "d5", "c4", "c6", "Nf3", "Nf6", "Nc3", "dxc4", "a4", "Bf5", "e3", "e6", "Bxc4", "Bb4", "O-O", "Nbd7", "Qe2", "Bg6", "e4", "O-O", "Bd3", "Bh5", "e5", "Nd5"] },
  { id: "nimzo", name: "Difesa Nimzo-Indiana", sans: ["d4", "Nf6", "c4", "e6", "Nc3", "Bb4", "e3", "O-O", "Bd3", "d5", "Nf3", "c5", "O-O", "Nc6", "a3", "Bxc3", "bxc3", "dxc4", "Bxc4", "Qc7", "Bd3", "e5", "Qc2", "Re8"] },
  { id: "grunfeld", name: "Difesa Grünfeld", sans: ["d4", "Nf6", "c4", "g6", "Nc3", "d5", "cxd5", "Nxd5", "e4", "Nxc3", "bxc3", "Bg7", "Nf3", "c5", "Rb1", "O-O", "Be2", "cxd4", "cxd4", "Nc6", "d5", "Ne5", "Nxe5", "Bxe5"] },
  { id: "catalan", name: "Apertura Catalana", sans: ["d4", "Nf6", "c4", "e6", "g3", "d5", "Bg2", "Be7", "Nf3", "O-O", "O-O", "dxc4", "Qc2", "a6", "a4", "Bd7", "Qxc4", "Bc6", "Bg5", "a5", "Nc3", "Nbd7", "Rfd1", "h6"] },
];

export async function loadOpenings() {
  if (loaded) return;
  const files = ["a", "b", "c", "d", "e"];
  await Promise.all(
    files.map(async (letter) => {
      const res = await fetch(`data/openings/${letter}.tsv`);
      if (!res.ok) throw new Error(`Aperture ${letter}.tsv`);
      const text = await res.text();
      text.split(/\r?\n/).forEach((line, index) => {
        if (!index || !line.trim()) return;
        const [eco, name, pgn] = line.split("\t");
        if (!eco || !name || !pgn) return;
        insertLine(eco.trim(), name.trim(), pgnToSans(pgn));
      });
    })
  );
  loaded = true;
}

export function lookupOpening(sans) {
  const moves = sans.map(normalizeSan);
  let node = root;
  let last = null;
  for (let i = 0; i < moves.length; i += 1) {
    const next = node.kids[moves[i]];
    if (!next) {
      return { match: last, followed: i, leftBook: Boolean(last) };
    }
    node = next;
    if (node.name) last = { eco: node.eco, name: node.name, ply: i + 1 };
  }
  return { match: last, followed: moves.length, leftBook: false };
}

const NAME_IT = [
  [/King's Indian Attack/gi, "Attacco Est-Indiano"],
  [/King's Indian Defense/gi, "Difesa Est-Indiana"],
  [/Queen's Indian Defense/gi, "Difesa Ovest-Indiana"],
  [/Nimzo-Indian Defense/gi, "Difesa Nimzo-Indiana"],
  [/Bogo-Indian Defense/gi, "Difesa Bogo-Indiana"],
  [/Old Indian Defense/gi, "Vecchia Difesa Indiana"],
  [/Grünfeld Defense/gi, "Difesa Grünfeld"],
  [/Gruenfeld Defense/gi, "Difesa Grünfeld"],
  [/Queen's Gambit Declined/gi, "Gambetto di Donna Rifiutato"],
  [/Queen's Gambit Accepted/gi, "Gambetto di Donna Accettato"],
  [/Queen's Gambit/gi, "Gambetto di Donna"],
  [/King's Gambit/gi, "Gambetto di Re"],
  [/Sicilian Defense/gi, "Difesa Siciliana"],
  [/French Defense/gi, "Difesa Francese"],
  [/Caro-Kann Defense/gi, "Difesa Caro-Kann"],
  [/Pirc Defense/gi, "Difesa Pirc"],
  [/Modern Defense/gi, "Difesa Moderna"],
  [/Scandinavian Defense/gi, "Difesa Scandinava"],
  [/Alekhine Defense/gi, "Difesa Alekhine"],
  [/Philidor Defense/gi, "Difesa Filidor"],
  [/Petrov's Defense/gi, "Difesa Petrov"],
  [/Russian Game/gi, "Partita Russa"],
  [/Two Knights Defense/gi, "Difesa dei Due Cavalli"],
  [/Four Knights Game/gi, "Partita dei Quattro Cavalli"],
  [/Three Knights Opening/gi, "Apertura dei Tre Cavalli"],
  [/Ruy Lopez/gi, "Partita Spagnola"],
  [/Spanish Opening/gi, "Partita Spagnola"],
  [/Italian Game/gi, "Partita Italiana"],
  [/Giuoco Pianissimo/gi, "Giuoco Pianissimo"],
  [/Giuoco Piano/gi, "Giuoco Piano"],
  [/Scotch Game/gi, "Partita Scozzese"],
  [/Vienna Game/gi, "Partita Viennese"],
  [/Bishop's Opening/gi, "Apertura di Alfiere"],
  [/Center Game/gi, "Partita di Centro"],
  [/English Opening/gi, "Apertura Inglese"],
  [/Réti Opening/gi, "Apertura Réti"],
  [/Reti Opening/gi, "Apertura Réti"],
  [/Zukertort Opening/gi, "Apertura Zukertort"],
  [/London System/gi, "Sistema Londra"],
  [/Catalan Opening/gi, "Apertura Catalana"],
  [/Trompowsky Attack/gi, "Attacco Trompowsky"],
  [/Dutch Defense/gi, "Difesa Olandese"],
  [/Benoni Defense/gi, "Difesa Benoni"],
  [/Benko Gambit/gi, "Gambetto Benko"],
  [/Budapest Defense/gi, "Gambetto di Budapest"],
  [/Budapest Gambit/gi, "Gambetto di Budapest"],
  [/Slav Defense/gi, "Difesa Slava"],
  [/Semi-Slav Defense/gi, "Difesa Semi-Slava"],
  [/Tarrasch Defense/gi, "Difesa Tarrasch"],
  [/Chigorin Defense/gi, "Difesa Chigorin"],
  [/Albin Countergambit/gi, "Controgambetto Albin"],
  [/King's Knight Opening/gi, "Apertura del Cavallo di Re"],
  [/King's Pawn Game/gi, "Apertura di Re"],
  [/Queen's Pawn Game/gi, "Apertura di Donna"],
  [/Nimzowitsch Defense/gi, "Difesa Nimzowitsch"],
  [/Owen Defense/gi, "Difesa Owen"],
  [/Pirc Defense/gi, "Difesa Pirc"],
  [/Evans Gambit/gi, "Gambetto Evans"],
  [/Fried Liver Attack/gi, "Attacco Fegatello"],
  [/Danish Gambit/gi, "Gambetto Danese"],
  [/Latvian Gambit/gi, "Gambetto Lettone"],
  [/Elephant Gambit/gi, "Gambetto Elefante"],
  [/Blackmar-Diemer Gambit/gi, "Gambetto Blackmar-Diemer"],
  [/Smith-Morra Gambit/gi, "Gambetto Smith-Morra"],
  [/Wing Gambit/gi, "Gambetto di Ala"],
  [/Polish Opening/gi, "Apertura Polacca"],
  [/Bird Opening/gi, "Apertura Bird"],
  [/Hungarian Opening/gi, "Apertura Ungherese"],
  [/Van't Kruijs Opening/gi, "Apertura Van't Kruijs"],
  [/Mieses Opening/gi, "Apertura Mieses"],
  [/Anderssen's Opening/gi, "Apertura Anderssen"],
  [/St\. George Defense/gi, "Difesa Saint George"],
  [/Horwitz Defense/gi, "Difesa Horwitz"],
  [/Englund Gambit/gi, "Gambetto Englund"],
  [/Countergambit/gi, "Controgambetto"],
  [/Defense/gi, "Difesa"],
  [/Opening/gi, "Apertura"],
  [/Gambit/gi, "Gambetto"],
  [/Attack/gi, "Attacco"],
  [/Variation/gi, "Variante"],
  [/Accepted/gi, "Accettato"],
  [/Declined/gi, "Rifiutato"],
  [/System/gi, "Sistema"],
  [/Game/gi, "Partita"],
  [/Fianchetto/gi, "Fianchetto"],
  [/Classical/gi, "Classica"],
  [/Exchange/gi, "di Cambio"],
  [/Advanced/gi, "d'Avanzata"],
  [/Closed/gi, "Chiusa"],
  [/Open /gi, "Aperta "],
  [/Accelerated/gi, "Accelerata"],
  [/Normal/gi, "Normale"],
];

export function translateOpeningName(name) {
  if (getLang() !== "it") return name;
  let out = name;
  NAME_IT.forEach(([re, itName]) => {
    out = out.replace(re, itName);
  });
  return out.replace(/\s{2,}/g, " ").trim();
}

const FAMILIES = [
  {
    re: /Sicilian/i,
    kind: "difesa",
    family: "Difesa Siciliana",
    blurb: "Il Nero combatte 1.e4 con c5: asimmetria, contropoco sull'ala di donna e grandi chance di vittoria. Idea: non simmetrico, gioco teso.",
  },
  {
    re: /French/i,
    kind: "difesa",
    family: "Difesa Francese",
    blurb: "Il Nero gioca e6 e poi d5. Struttura solida, catena di pedoni, spesso attacco sull'ala di re per il Bianco e contropoco su c5/f6 per il Nero.",
  },
  {
    re: /Caro-Kann/i,
    kind: "difesa",
    family: "Difesa Caro-Kann",
    blurb: "c6 e d5: il Nero tiene una struttura sana e l'alfiere campochiaro libero. Meno spazio, ma posizione robusta.",
  },
  {
    re: /Ruy Lopez|Spanish/i,
    kind: "apertura",
    family: "Partita Spagnola",
    blurb: "Dopo 1.e4 e5 il Bianco punta l'alfiere in b5. Pressione sul cavallo in c6 e sul centro. Classica: sviluppo, arrocco, poi piano lento.",
  },
  {
    re: /Italian Game|Giuoco/i,
    kind: "apertura",
    family: "Partita Italiana",
    blurb: "Alfiere in c4 verso f7. Sviluppo rapido e lotta per d4. Ideale per imparare: pezzi fuori, re al sicuro, centro.",
  },
  {
    re: /Two Knights/i,
    kind: "difesa",
    family: "Difesa dei Due Cavalli",
    blurb: "Il Nero sviluppa entrambi i cavalli. Può diventare tattica (Ng5, fegatello) o posizionale. Occhio al pedone f7.",
  },
  {
    re: /Fried Liver|Fegatello/i,
    kind: "attacco",
    family: "Attacco Fegatello",
    blurb: "Attacco diretto sul punto f7 con cavallo e alfiere. Molto tattica: calcola gli scacchi e le catture.",
  },
  {
    re: /Evans/i,
    kind: "gambetto",
    family: "Gambetto Evans",
    blurb: "Il Bianco sacrifica il pedone b per tempi e centro. Idea: sviluppo veloce e attacco mentre il Nero recupera materiale.",
  },
  {
    re: /Scotch/i,
    kind: "apertura",
    family: "Partita Scozzese",
    blurb: "Il Bianco apre subito il centro con d4. Pezzi liberi, gioco aperto, facile da capire: cattura, sviluppa, arrocca.",
  },
  {
    re: /Vienna/i,
    kind: "apertura",
    family: "Partita Viennese",
    blurb: "Cavallo in c3 prima di Nf3. Può restare posizionale o virare in attacco con f4 (gambetto viennese).",
  },
  {
    re: /Four Knights/i,
    kind: "apertura",
    family: "Partita dei Quattro Cavalli",
    blurb: "Sviluppo simmetrico dei cavalli. Solida, adatta a chi vuole evitare linee troppo teoriche.",
  },
  {
    re: /Petrov|Russian Game/i,
    kind: "difesa",
    family: "Difesa Petrov (Russa)",
    blurb: "Il Nero copia Nf6 su e4. Simmetrica e solida: spesso scambi nel centro e mediogioco calmo.",
  },
  {
    re: /Philidor/i,
    kind: "difesa",
    family: "Difesa Filidor",
    blurb: "d6 sostiene e5. Un po' passiva ma compatta. Sviluppa senza creare debolezze.",
  },
  {
    re: /King's Gambit/i,
    kind: "gambetto",
    family: "Gambetto di Re",
    blurb: "Il Bianco offre f4 per il centro e linee aperte verso il re nero. Romantico e tattica: sviluppo prima del materiale.",
  },
  {
    re: /Danish/i,
    kind: "gambetto",
    family: "Gambetto Danese",
    blurb: "Sacrificio di pedoni per sviluppo e diagonali verso f7. Attacco precoce, da calcolare con cura.",
  },
  {
    re: /Pirc/i,
    kind: "difesa",
    family: "Difesa Pirc",
    blurb: "Il Nero lascia il centro e fianchetta l'alfiere. Idea ipermoderna: colpire d4 più tardi con c5 o e5.",
  },
  {
    re: /Modern Defense/i,
    kind: "difesa",
    family: "Difesa Moderna",
    blurb: "g6 e Bg7: il Nero invita il Bianco a occupare il centro per poi minarlo. Flessibile e velenosa.",
  },
  {
    re: /Scandinavian/i,
    kind: "difesa",
    family: "Difesa Scandinava",
    blurb: "Risposta immediata d5 a e4. La donna nera esce presto: attenzione ai tempi, ma l'idea è chiara e diretta.",
  },
  {
    re: /Alekhine/i,
    kind: "difesa",
    family: "Difesa Alekhine",
    blurb: "Nf6 provoca l'avanzata dei pedoni bianchi. Il Nero vuole un centro troppo esteso da attaccare.",
  },
  {
    re: /Queen's Gambit Declined/i,
    kind: "difesa",
    family: "Gambetto di Donna Rifiutato",
    blurb: "Il Nero tiene d5 e gioca e6. Struttura classica, solida, piena di idee su c5 e lo sviluppo dell'alfiere campochiaro.",
  },
  {
    re: /Queen's Gambit Accepted/i,
    kind: "gambetto",
    family: "Gambetto di Donna Accettato",
    blurb: "Il Nero prende in c4 ma non tiene il pedone. Idea: sviluppare in libertà e poi colpire il centro bianco.",
  },
  {
    re: /Queen's Gambit/i,
    kind: "gambetto",
    family: "Gambetto di Donna",
    blurb: "Dopo 1.d4 d5 il Bianco gioca c4. Non è un vero sacrificio: vuole il centro e la colonna c. Base delle aperture chiuse.",
  },
  {
    re: /Semi-Slav/i,
    kind: "difesa",
    family: "Difesa Semi-Slava",
    blurb: "c6 più e6: struttura densissima. Può esplodere in linee tattiche (Merano, Botvinnik) o restare posizionale.",
  },
  {
    re: /Slav/i,
    kind: "difesa",
    family: "Difesa Slava",
    blurb: "c6 sostiene d5 e lascia libera la diagonale all'alfiere. Solida e molto giocata ad ogni livello.",
  },
  {
    re: /King's Indian Attack/i,
    kind: "sistema",
    family: "Attacco Est-Indiano",
    blurb: "Schema del Bianco con d3, g3, Bg2. Non è la difesa omonima: è un sistema flessibile, spesso contro Francese o Siciliana.",
  },
  {
    re: /King's Indian/i,
    kind: "difesa",
    family: "Difesa Est-Indiana",
    blurb: "Il Nero fianchetta e lascia il centro. Poi attacca con e5 o c5. Tipico: attacco sull'ala di re, il Bianco sull'ala di donna.",
  },
  {
    re: /Nimzo-Indian/i,
    kind: "difesa",
    family: "Difesa Nimzo-Indiana",
    blurb: "Bb4 inchioda il cavallo in c3. Controllo del centro con pezzi, spesso pedoni doppiati per il Bianco. Molto istruttiva.",
  },
  {
    re: /Grünfeld|Gruenfeld/i,
    kind: "difesa",
    family: "Difesa Grünfeld",
    blurb: "Il Nero colpisce d4 con c5 e l'alfiere fianchettato. Il Bianco ha un bel centro; il Nero lo attacca da lontano.",
  },
  {
    re: /Queen's Indian/i,
    kind: "difesa",
    family: "Difesa Ovest-Indiana",
    blurb: "b6 e Bb7: controllo di e4. Posizionale, solida, senza scontri immediati nel centro.",
  },
  {
    re: /Benoni/i,
    kind: "difesa",
    family: "Difesa Benoni",
    blurb: "c5 contro d4: il Bianco ottiene più spazio, il Nero colonne semiaperte e contropoco. Gioco vivace.",
  },
  {
    re: /Dutch/i,
    kind: "difesa",
    family: "Difesa Olandese",
    blurb: "f5 contro d4. Il Nero punta l'ala di re ma indebolisce un po' la propria. Non simmetrica e combativa.",
  },
  {
    re: /English Opening/i,
    kind: "apertura",
    family: "Apertura Inglese",
    blurb: "1.c4: controllo di d5 da fianco. Spesso transpone in strutture di donna o resta in schemi con fianchetto.",
  },
  {
    re: /Réti|Reti|Zukertort/i,
    kind: "apertura",
    family: "Apertura Réti / Zukertort",
    blurb: "Cavallo in f3 senza occupare subito il centro coi pedoni. Idea ipermoderna: controllare d4/e5 dai lati.",
  },
  {
    re: /London/i,
    kind: "sistema",
    family: "Sistema Londra",
    blurb: "Schema fisso: d4, Nf3, Bf4. Facile da imparare, solido, il Bianco sviluppa sempre allo stesso modo.",
  },
  {
    re: /Catalan/i,
    kind: "apertura",
    family: "Apertura Catalana",
    blurb: "d4, c4 e fianchetto in g2. Pressione lunga sulla grande diagonale. Posizionale e molto attuale.",
  },
  {
    re: /Trompowsky/i,
    kind: "attacco",
    family: "Attacco Trompowsky",
    blurb: "Bg5 subito su Nf6. Il Bianco evita le teorie indiane e crea subito una minaccia concreta.",
  },
  {
    re: /King's Knight Opening|King's Pawn Game|Open Game/i,
    kind: "apertura",
    family: "Apertura di Re",
    blurb: "Partita aperta: pedoni in e4 ed e5. Sviluppa i pezzi minori, arrocca e lotta per il centro (d4/d5).",
  },
  {
    re: /Queen's Pawn Game/i,
    kind: "apertura",
    family: "Apertura di Donna",
    blurb: "Partita di donna: d4 occupa il centro. Gioco più posizionale; spesso segue c4 o un sistema (Londra, Catalana).",
  },
  {
    re: /Bishop's Opening/i,
    kind: "apertura",
    family: "Apertura di Alfiere",
    blurb: "Bc4 già alla seconda mossa. Sviluppo verso f7, spesso transpone in Italiana o Viennese.",
  },
  {
    re: /Center Game/i,
    kind: "apertura",
    family: "Partita di Centro",
    blurb: "d4 immediato dopo e4 e5. Il centro si apre subito: attenzione allo sviluppo della donna bianca.",
  },
];

function familyOf(name) {
  return FAMILIES.find((f) => f.re.test(name)) || null;
}

function kindOf(name, family) {
  if (family) return family.kind;
  if (/Gambit|Controgambetto/i.test(name)) return "gambetto";
  if (/Attack|Attacco|Fried Liver/i.test(name)) return "attacco";
  if (/Defense|Difesa/i.test(name)) return "difesa";
  if (/System|Sistema|London/i.test(name)) return "sistema";
  return "apertura";
}

const KIND_LABEL = {
  apertura: "Apertura",
  difesa: "Difesa",
  gambetto: "Gambetto",
  attacco: "Attacco",
  sistema: "Sistema",
};

function structureOf(sans) {
  const w = sans[0];
  const b = sans[1];
  if (!w) {
    return {
      label: t("struct.wait"),
      text: "Scegli la prima mossa: 1.e4 (partita aperta), 1.d4 (partita chiusa) o 1.c4 (Inglese).",
    };
  }
  if (w === "e4" && b === "e5") {
    return {
      label: t("struct.open"),
      text: "Entrambi hanno spinto il pedone di re. Gioco libero, pezzi veloci, lotta per d4 e d5.",
    };
  }
  if (w === "e4" && b) {
    return {
      label: t("struct.semiopen"),
      text: "Il Bianco ha giocato e4, il Nero non ha risposto e5. Strutture asimmetriche, spesso con contropoco.",
    };
  }
  if (w === "e4") {
    return {
      label: t("struct.king"),
      text: "1.e4 occupa il centro e libera donna e alfiere. Il Nero può rispondere e5, c5 (Siciliana), e6, c6…",
    };
  }
  if (w === "d4" && b === "d5") {
    return {
      label: t("struct.closed"),
      text: "Pedoni di donna nel centro. Gioco più posizionale: catene, colonne c e e, piani lunghi.",
    };
  }
  if (w === "d4" && b) {
    return {
      label: t("struct.semiclosed"),
      text: "Il Bianco ha d4, il Nero non ha simmetrico d5 (spesso Nf6). Tipiche le difese indiane.",
    };
  }
  if (w === "d4") {
    return {
      label: t("struct.queen"),
      text: "1.d4 prende il centro e copre e5. Solida: poi c4, o un sistema (Londra, Catalana).",
    };
  }
  if (w === "c4") {
    return {
      label: t("struct.flank"),
      text: "1.c4 (Inglese): controlli d5 dal lato. Flessibile, spesso con fianchetto.",
    };
  }
  if (w === "Nf3") {
    return {
      label: t("struct.flank"),
      text: "Cavallo in f3: aspetti a spingere i pedoni. Può diventare Réti, Catalana o Inglese.",
    };
  }
  return {
    label: t("struct.irregular"),
    text: "Prima mossa inusuale. Sviluppa i pezzi, occupa o colpisci il centro, metti il re al sicuro.",
  };
}

function phaseOf(game, sans, leftBook) {
  const pieces = game.board().flat().filter(Boolean).length;
  if (pieces <= 12) return t("phase.end");
  if (leftBook && sans.length >= 16) return t("phase.middle");
  if (leftBook && sans.length >= 10) return t("phase.middle");
  return t("phase.opening");
}

export function describePosition(sans, game) {
  const moves = sans.map(normalizeSan);
  const { match, leftBook } = lookupOpening(moves);
  const structure = structureOf(moves);
  const phase = game ? phaseOf(game, moves, leftBook) : t("phase.opening");

  if (!moves.length) {
    return {
      phase: t("phase.opening"),
      kind: "apertura",
      kindLabel: t("kind.apertura"),
      eco: "",
      title: t("opening.choose"),
      variant: "",
      structure: structure.label,
      blurb: structure.text,
      leftBook: false,
    };
  }

  if (!match) {
    return {
      phase,
      kind: "apertura",
      kindLabel: t("kind.apertura"),
      eco: "",
      title: structure.label,
      variant: "",
      structure: structure.label,
      blurb: structure.text,
      leftBook: false,
    };
  }

  const family = familyOf(match.name);
  const kind = kindOf(match.name, family);
  const translated = translateOpeningName(match.name);
  const [main, ...rest] = translated.split(":");
  const variant = rest.join(":").trim();
  const name = getLang() === "it" && family ? family.family : main.trim();
  let blurb = family ? family.blurb : structure.text;
  if (leftBook && phase === t("phase.middle")) {
    blurb = t("opening.outBook", { name, blurb });
  } else if (leftBook) {
    blurb = t("opening.rareLine", { name, blurb });
  }

  return {
    phase,
    kind,
    kindLabel: t(`kind.${kind}`),
    eco: match.eco || "",
    title: name,
    variant: variant || (family && translated !== family.family ? translated : ""),
    structure: structure.label,
    blurb,
    leftBook,
  };
}
