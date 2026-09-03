// Integração com Google Analytics 4 (gtag.js).
//
// Para ativar: crie (ou abra) uma Propriedade GA4 > Fluxos de dados > Web
// para votosincero.com.br, copie o "ID de mensuração" (formato G-XXXXXXXXXX)
// e cole abaixo. Enquanto o placeholder não for substituído, o app funciona
// normalmente e as funções de rastreamento apenas não fazem nada.
const MEASUREMENT_ID = "G-CWXPXD78Q4";

let ready = false;

function init() {
  if (!MEASUREMENT_ID || MEASUREMENT_ID === "G-XXXXXXXXXX") {
    console.warn(
      "[analytics] Google Analytics não configurado — defina MEASUREMENT_ID em js/analytics.js."
    );
    return;
  }

  window.dataLayer = window.dataLayer || [];
  window.gtag = function gtag() {
    window.dataLayer.push(arguments);
  };
  window.gtag("js", new Date());
  // send_page_view desligado: o app é uma SPA e envia page_view manualmente
  // a cada troca de tela (ver trackPageView), para refletir a navegação real.
  window.gtag("config", MEASUREMENT_ID, { send_page_view: false });

  const script = document.createElement("script");
  script.async = true;
  script.src = `https://www.googletagmanager.com/gtag/js?id=${MEASUREMENT_ID}`;
  document.head.appendChild(script);

  ready = true;
}

init();

// Registra o acesso/visualização de uma "tela" do app (Home, cada esfera do
// teste, Resultado) como um page_view virtual, já que é uma SPA sem recarregar
// a página a cada navegação.
export function trackPageView(pagePath, pageTitle) {
  if (!ready || typeof window.gtag !== "function") return;
  window.gtag("event", "page_view", {
    page_path: pagePath,
    page_title: pageTitle,
    page_location: `${location.origin}${pagePath}`,
  });
}

// Registra um evento customizado (cliques em propostas, downloads, etc.).
export function trackEvent(name, params = {}) {
  if (!ready || typeof window.gtag !== "function") return;
  window.gtag("event", name, params);
}
