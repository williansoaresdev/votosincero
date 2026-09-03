import { el } from "../utils.js";
import { playTap } from "../audio.js";
import {
  canInstall,
  isStandalone,
  isDismissedThisSession,
  dismissForSession,
  onInstallAvailabilityChange,
  promptInstall,
} from "../install.js";

export function renderHome(container, { onStart }) {
  const view = el("div", { class: "screen screen-home" }, [
    el("div", { class: "home-hero" }, [
      el("img", {
        src: "icons/icon-192.png",
        alt: "Voto Sincero",
        class: "home-logo",
        width: "128",
        height: "128",
      }),
      el("h1", { class: "home-title" }, "Vamos descobrir qual candidato representa os seus valores?"),
      el("p", { class: "home-subtitle" }, "Selecione as ideias de plano de governo que mais lhe interessam e veja o resultado."),
    ]),
    el("div", { class: "home-actions" }, [
      el(
        "button",
        {
          class: "btn btn-primary btn-block",
          onClick: () => {
            playTap();
            onStart();
          },
        },
        "Começar"
      ),
      el("p", { class: "home-note" }, ""),
    ]),
  ]);
  container.appendChild(view);

  if (!isStandalone() && !isDismissedThisSession()) {
    const toast = buildInstallToast();
    container.appendChild(toast);
    if (canInstall()) requestAnimationFrame(() => toast.classList.add("visible"));

    const unsubscribe = onInstallAvailabilityChange((available) => {
      if (!document.body.contains(toast)) {
        unsubscribe();
        return;
      }
      toast.classList.toggle("visible", available && !isDismissedThisSession());
    });
  }
}

function buildInstallToast() {
  const hide = () => toast.classList.remove("visible");

  const toast = el("div", { class: "install-toast", role: "status" }, [
    el("img", { src: "icons/icon-96.png", alt: "", class: "install-toast-icon" }),
    el("div", { class: "install-toast-text" }, [
      el("strong", {}, "Instale o Voto Sincero"),
      "Acesso rápido direto na tela inicial do seu aparelho.",
    ]),
    el("div", { class: "install-toast-actions" }, [
      el(
        "button",
        {
          class: "install-toast-btn",
          onClick: async () => {
            playTap();
            await promptInstall();
            hide();
          },
        },
        "Instalar"
      ),
      el(
        "button",
        {
          class: "install-toast-close",
          "aria-label": "Fechar",
          onClick: () => {
            hide();
            dismissForSession();
          },
        },
        "✕"
      ),
    ]),
  ]);

  return toast;
}
