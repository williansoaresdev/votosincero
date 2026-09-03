import { el } from "../utils.js";
import { playTap } from "../audio.js";

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
}
