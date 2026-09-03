import { ESFERAS } from "./data.js";
import { shuffle } from "./utils.js";

const STORAGE_KEY = "vs_state_v1";

function empty() {
  return {
    started: false,
    finished: false,
    order: [],
    currentIndex: 0,
    answers: {}, // { [esfera]: string[] numero }
  };
}

let state = empty();

export function getState() {
  return state;
}

export function startQuiz() {
  state = {
    started: true,
    finished: false,
    order: shuffle(ESFERAS),
    currentIndex: 0,
    answers: {},
  };
  persist();
  return state;
}

export function currentEsfera() {
  return state.order[state.currentIndex];
}

export function isFirst() {
  return state.currentIndex <= 0;
}

export function isLast() {
  return state.currentIndex >= state.order.length - 1;
}

export function toggleAnswer(esfera, numero) {
  const list = state.answers[esfera] ? state.answers[esfera].slice() : [];
  const idx = list.indexOf(numero);
  let selected;
  if (idx >= 0) {
    list.splice(idx, 1);
    selected = false;
  } else {
    list.push(numero);
    selected = true;
  }
  state.answers[esfera] = list;
  persist();
  return selected;
}

export function isSelected(esfera, numero) {
  return !!(state.answers[esfera] && state.answers[esfera].includes(numero));
}

export function goNext() {
  if (!isLast()) {
    state.currentIndex += 1;
    persist();
    return "quiz";
  }
  state.finished = true;
  persist();
  return "resultado";
}

export function goBack() {
  if (state.finished) {
    state.finished = false;
    persist();
    return "quiz";
  }
  if (!isFirst()) {
    state.currentIndex -= 1;
    persist();
    return "quiz";
  }
  return "home";
}

export function resetState() {
  state = empty();
  persist();
}

export function computeRanking(db) {
  const counts = new Map();
  const matches = new Map(); // numero -> [{esfera, tweet}]

  for (const esfera of Object.keys(state.answers)) {
    const numeros = state.answers[esfera];
    for (const numero of numeros) {
      counts.set(numero, (counts.get(numero) || 0) + 1);
      const cand = db.candidatos.find((c) => c.numero === numero);
      const info = cand && cand.esferas[esfera];
      if (!matches.has(numero)) matches.set(numero, []);
      matches.get(numero).push({ esfera, tweet: info ? info.tweet : "" });
    }
  }

  const ranking = db.candidatos.map((c) => ({
    candidato: c,
    total: counts.get(c.numero) || 0,
    matches: matches.get(c.numero) || [],
  }));

  ranking.sort((a, b) => b.total - a.total || Number(a.candidato.numero) - Number(b.candidato.numero));
  return ranking;
}

function persist() {
  try {
    sessionStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  } catch (_) {
    /* ignore quota / privacy-mode errors */
  }
}

export function restore() {
  try {
    const raw = sessionStorage.getItem(STORAGE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (parsed && parsed.started) {
        state = parsed;
        return true;
      }
    }
  } catch (_) {
    /* ignore */
  }
  return false;
}
