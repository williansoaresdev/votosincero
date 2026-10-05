import { el, letraOpcao, shuffle } from "../utils.js";
import { opcoesPorEsfera, ESFERA_ICONS } from "../data.js";
import { isSelected, toggleAnswer } from "../state.js";
import { openModal } from "../modal.js";
import { playSelect, playDeselect, playTap } from "../audio.js";
import { trackEvent } from "../analytics.js";

let optionOrderCache = {};

export function resetOptionOrderCache() {
  optionOrderCache = {};
}

function getOrderedOptions(esfera, options) {
  if (!optionOrderCache[esfera]) {
    optionOrderCache[esfera] = shuffle(options.map((o) => o.numero));
  }
  const order = optionOrderCache[esfera];
  return order
    .map((numero) => options.find((o) => o.numero === numero))
    .filter(Boolean);
}

// 2º turno: só há 2 candidatos, então o eleitor escolhe 1 plano por esfera.
const MAX_SELECTIONS = 1;

export function renderQuiz(container, { db, esfera, index, total, onNext, onBack }) {
  const options = getOrderedOptions(esfera, opcoesPorEsfera(db, esfera));

  const progressFill = el("div", { class: "progress-fill" });
  progressFill.style.width = `${((index + 1) / total) * 100}%`;

  const list = el("div", { class: "option-list" });
  const counter = el("span", { class: "quiz-counter" });

  const refreshCardStates = () => {
    const count = list.querySelectorAll(".option-card.selected").length;
    counter.textContent = `${count} de ${MAX_SELECTIONS} selecionado${MAX_SELECTIONS === 1 ? "" : "s"}`;
  };

  if (options.length === 0) {
    list.appendChild(
      el("p", { class: "empty-note" }, "Nenhuma proposta cadastrada para esta esfera nos planos analisados.")
    );
  }

  options.forEach((opt, i) => {
    const letra = letraOpcao(i);
    const selected = isSelected(esfera, opt.numero);

    const card = el(
      "div",
      {
        class: `option-card${selected ? " selected" : ""}`,
        role: "button",
        tabindex: "0",
        "data-numero": opt.numero,
      },
      [
        el("div", { class: "option-badge" }, letra),
        el("p", { class: "option-text" }, opt.tweet),
        el("div", { class: "option-actions" }, [
          el(
            "button",
            {
              class: "link-btn",
              onClick: (e) => {
                e.stopPropagation();
                trackEvent("ver_plano_completo", {
                  esfera,
                  candidato_numero: opt.numero,
                  candidato_nome: opt.nome,
                });
                openModal({
                  title: `Proposta ${letra}`,
                  letra,
                  body: el("p", {}, opt.macro),
                });
              },
            },
            "Ver plano completo"
          ),
          el("span", { class: "option-check", "aria-hidden": "true" }, "✓"),
        ]),
      ]
    );

    const toggle = () => {
      const alreadySelected = card.classList.contains("selected");
      // Ao atingir o limite, a nova escolha substitui a anterior.
      if (!alreadySelected) {
        const selecionados = [...list.querySelectorAll(".option-card.selected")];
        if (selecionados.length >= MAX_SELECTIONS) {
          const excedentes = selecionados.slice(0, selecionados.length - MAX_SELECTIONS + 1);
          excedentes.forEach((c) => {
            toggleAnswer(esfera, c.dataset.numero);
            c.classList.remove("selected");
          });
        }
      }
      const nowSelected = toggleAnswer(esfera, opt.numero);
      card.classList.toggle("selected", nowSelected);
      if (nowSelected) playSelect();
      else playDeselect();
      trackEvent("selecionar_proposta", {
        esfera,
        candidato_numero: opt.numero,
        candidato_nome: opt.nome,
        selecionado: nowSelected,
      });
      refreshCardStates();
    };

    card.addEventListener("click", toggle);
    card.addEventListener("keydown", (e) => {
      if (e.key === "Enter" || e.key === " ") {
        e.preventDefault();
        toggle();
      }
    });
    card.addEventListener("animationend", () => card.classList.remove("shake"));

    list.appendChild(card);
  });

  refreshCardStates();

  const view = el("div", { class: "screen screen-quiz" }, [
    el("div", { class: "quiz-progress" }, [
      el("div", { class: "progress-track" }, progressFill),
      el("span", { class: "progress-label" }, `Esfera ${index + 1} de ${total}`),
    ]),
    el("div", { class: "quiz-heading" }, [
      el("span", { class: "quiz-icon", "aria-hidden": "true" }, ESFERA_ICONS[esfera] || "🗳️"),
      el("h2", {}, esfera),
    ]),
    el("div", { class: "quiz-instruction-row" }, [
      el("p", { class: "quiz-instruction" }, `Selecione ${MAX_SELECTIONS === 1 ? "o plano que mais combina" : `até ${MAX_SELECTIONS} planos que mais combinam`} com você.`),
      counter,
    ]),
    list,
    el("div", { class: "quiz-footer" }, [
      el(
        "button",
        {
          class: "btn btn-secondary",
          onClick: () => {
            playTap();
            onBack();
          },
        },
        "Voltar"
      ),
      el(
        "button",
        {
          class: "btn btn-primary",
          onClick: () => onNext(),
        },
        index + 1 === total ? "Ver resultado" : "Avançar"
      ),
    ]),
  ]);

  container.appendChild(view);
}
