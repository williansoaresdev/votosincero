// Suporte ao prompt nativo de instalação do PWA (disponível principalmente no
// Chrome/Edge para Android e desktop; Safari/iOS não dispara este evento).

let deferredPrompt = null;
let listeners = [];

function notify() {
  const available = canInstall();
  listeners.forEach((cb) => cb(available));
}

window.addEventListener("beforeinstallprompt", (e) => {
  e.preventDefault();
  deferredPrompt = e;
  notify();
});

window.addEventListener("appinstalled", () => {
  deferredPrompt = null;
  try {
    sessionStorage.setItem("vs_install_dismissed", "1");
  } catch (_) {
    /* ignore */
  }
  notify();
});

export function canInstall() {
  return !!deferredPrompt;
}

export function isStandalone() {
  return (
    window.matchMedia("(display-mode: standalone)").matches ||
    window.navigator.standalone === true
  );
}

export function isDismissedThisSession() {
  try {
    return sessionStorage.getItem("vs_install_dismissed") === "1";
  } catch (_) {
    return false;
  }
}

export function dismissForSession() {
  try {
    sessionStorage.setItem("vs_install_dismissed", "1");
  } catch (_) {
    /* ignore */
  }
}

// Retorna uma função de cancelamento da inscrição.
export function onInstallAvailabilityChange(callback) {
  listeners.push(callback);
  return () => {
    listeners = listeners.filter((cb) => cb !== callback);
  };
}

export async function promptInstall() {
  if (!deferredPrompt) return "unavailable";
  const promptEvent = deferredPrompt;
  deferredPrompt = null;
  promptEvent.prompt();
  const choice = await promptEvent.userChoice;
  notify();
  return choice.outcome; // "accepted" | "dismissed"
}
