import { loadDatabase } from "./data.js";
import { renderHome } from "./views/home.js";
import { renderDetail } from "./views/detail.js";
import { renderAbout } from "./views/about.js";
import { shareApp } from "./share.js";
import { showToast } from "./toast.js";
import { trackPageView, trackEvent } from "./analytics.js";

let db = null;

function setupChrome() {
  document.getElementById("share-toggle").addEventListener("click", async () => {
    const outcome = await shareApp();
    trackEvent("compartilhar", { local: "cabecalho", resultado: outcome });
    if (outcome === "copied") showToast("Link copiado! Cole e envie para seus amigos.");
    else if (outcome === "failed") showToast("Não foi possível compartilhar. Copie o link da barra de endereço.");
  });
}

// Rotas por hash: #/ (painel), #/o/<id> (objetivo), #/sobre (metodologia).
function route() {
  const app = document.getElementById("app");
  const hash = location.hash || "#/";
  app.innerHTML = "";

  let m;
  if ((m = hash.match(/^#\/o\/(.+)$/))) {
    const id = decodeURIComponent(m[1]);
    renderDetail(app, { db, id });
    const o = db.objetivos.find((x) => x.id === id);
    document.title = o ? `${o.titulo} — Voto Sincero` : "Voto Sincero";
    trackPageView(`/objetivo/${id}`, o ? o.titulo : "Objetivo");
  } else if (hash === "#/sobre") {
    renderAbout(app, { db });
    document.title = "Como funciona — Voto Sincero";
    trackPageView("/sobre", "Sobre");
  } else {
    renderHome(app, { db });
    document.title = "Voto Sincero — Monitor do plano de governo";
    trackPageView("/", "Painel");
  }
  window.scrollTo(0, 0);
}

async function init() {
  setupChrome();
  try {
    db = await loadDatabase();
  } catch (err) {
    document.getElementById("app").innerHTML =
      '<div class="screen"><p class="empty-note">Não foi possível carregar os dados. Verifique sua conexão e tente novamente.</p></div>';
    console.error(err);
    return;
  }
  window.addEventListener("hashchange", route);
  route();
}

if ("serviceWorker" in navigator) {
  window.addEventListener("load", () => {
    navigator.serviceWorker.register("./service-worker.js").catch((err) => {
      console.warn("Falha ao registrar service worker", err);
    });
  });
}

init();
