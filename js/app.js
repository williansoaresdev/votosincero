import { loadDatabase } from "./data.js";
import * as state from "./state.js";
import { renderView } from "./router.js";
import { renderHome } from "./views/home.js";
import { renderQuiz, resetOptionOrderCache } from "./views/quiz.js";
import { renderResult } from "./views/result.js";
import { unlockAudio, playAdvance, playBack, playComplete, isMuted, toggleMuted, playTap } from "./audio.js";
import { closeModal } from "./modal.js";
import { shareApp } from "./share.js";
import { showToast } from "./toast.js";
import { trackPageView, trackEvent } from "./analytics.js";

let db = null;
let pushedAny = false;

function setupChrome() {
  const muteBtn = document.getElementById("mute-toggle");
  const updateMuteIcon = () => {
    muteBtn.textContent = isMuted() ? "🔇" : "🔊";
    muteBtn.setAttribute("aria-label", isMuted() ? "Ativar som" : "Silenciar som");
  };
  updateMuteIcon();
  muteBtn.addEventListener("click", () => {
    toggleMuted();
    updateMuteIcon();
  });

  const unlockOnce = () => {
    unlockAudio();
    document.removeEventListener("pointerdown", unlockOnce);
  };
  document.addEventListener("pointerdown", unlockOnce);

  const shareBtn = document.getElementById("share-toggle");
  shareBtn.addEventListener("click", async () => {
    playTap();
    const outcome = await shareApp();
    trackEvent("compartilhar", { local: "cabecalho", resultado: outcome });
    if (outcome === "copied") showToast("Link copiado! Cole e envie para seus amigos.");
    else if (outcome === "failed") showToast("Não foi possível compartilhar. Copie o link da barra de endereço.");
  });
}

function goHome(direction) {
  renderView((app) => renderHome(app, { onStart: startQuizFlow }), direction);
  trackPageView("/", "Home");
}

function goQuiz(direction) {
  const esfera = state.currentEsfera();
  const s = state.getState();
  renderView(
    (app) =>
      renderQuiz(app, {
        db,
        esfera,
        index: s.currentIndex,
        total: s.order.length,
        onNext: nextFlow,
        onBack: backFlow,
      }),
    direction
  );
  trackPageView(`/esfera/${encodeURIComponent(esfera)}`, `Esfera: ${esfera}`);
}

function goResult(direction) {
  const ranking = state.computeRanking(db);
  renderView((app) => renderResult(app, { ranking, onRestart: restartFlow }), direction);
  trackPageView("/resultado", "Resultado");
  const top = ranking[0];
  if (top) {
    trackEvent("concluir_teste", {
      candidato_numero: top.candidato.numero,
      candidato_nome: top.candidato.nome,
      total_matches: top.total,
    });
  }
}

function startQuizFlow() {
  closeModal();
  state.startQuiz();
  resetOptionOrderCache();
  pushState();
  trackEvent("iniciar_teste");
  goQuiz("forward");
}

function nextFlow() {
  closeModal();
  const target = state.goNext();
  pushState();
  if (target === "resultado") {
    playComplete();
    goResult("forward");
  } else {
    playAdvance();
    goQuiz("forward");
  }
}

function backFlow() {
  closeModal();
  if (pushedAny) {
    window.history.back();
  } else {
    handlePop();
  }
}

function restartFlow() {
  closeModal();
  trackEvent("refazer_teste");
  state.resetState();
  resetOptionOrderCache();
  pushState();
  goHome("forward");
}

function pushState() {
  pushedAny = true;
  try {
    window.history.pushState({ vs: true }, "", location.pathname + location.search);
  } catch (_) {
    /* ignore */
  }
}

function handlePop() {
  const target = state.goBack();
  playBack();
  if (target === "home") goHome("back");
  else goQuiz("back");
}

window.addEventListener("popstate", handlePop);

async function init() {
  setupChrome();
  try {
    db = await loadDatabase();
  } catch (err) {
    document.getElementById("app").innerHTML =
      '<div class="screen"><p class="empty-note">Não foi possível carregar os planos de governo. Verifique sua conexão e tente novamente.</p></div>';
    console.error(err);
    return;
  }

  const hadSession = state.restore();
  if (hadSession) {
    const s = state.getState();
    if (s.finished) {
      goResult("none");
    } else {
      goQuiz("none");
    }
  } else {
    goHome("none");
  }
}

if ("serviceWorker" in navigator) {
  window.addEventListener("load", () => {
    navigator.serviceWorker.register("./service-worker.js").catch((err) => {
      console.warn("Falha ao registrar service worker", err);
    });
  });
}

init();
