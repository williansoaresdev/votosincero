import { el } from "../utils.js";
import { playTap } from "../audio.js";
import { shareApp } from "../share.js";
import { showToast } from "../toast.js";
import { trackEvent } from "../analytics.js";

const TSE_URL =
  "https://dadosabertos.tse.jus.br/pt_BR/dataset/candidatos-2026/resource/433ac1f4-07dc-44a2-bcbe-c87a2073721a";
const CONTACT_EMAIL = "contato@votosincero.com.br";

function renderCandidateCard(entry, rank) {
  const { candidato, total, matches } = entry;

  const details = el("div", { class: "result-details" });
  const detailsList = el(
    "ul",
    { class: "result-match-list" },
    matches.map((m) => el("li", {}, [el("strong", {}, m.esfera), ": " + m.tweet]))
  );
  details.appendChild(
    total > 0
      ? detailsList
      : el("p", { class: "empty-note" }, "Nenhuma proposta deste candidato foi selecionada.")
  );

  const card = el("article", { class: "result-card" }, [
    el("button", { class: "result-summary", "aria-expanded": "false" }, [
      el("span", { class: "result-rank" }, `#${rank}`),
      el("img", {
        src: candidato.imagem,
        alt: candidato.nome,
        class: "result-photo",
        loading: "lazy",
        onError: (e) => {
          e.target.style.visibility = "hidden";
        },
      }),
      el("div", { class: "result-info" }, [
        el("h3", {}, candidato.nome),
        el("p", { class: "result-party" }, `${candidato.partido} · nº ${candidato.numero}`),
        el("span", { class: "result-badge" }, `${total} de 12 ideias combinaram`),
      ]),
      el("span", { class: "result-chevron", "aria-hidden": "true" }, "⌄"),
    ]),
    details,
  ]);

  const summaryBtn = card.querySelector(".result-summary");
  summaryBtn.addEventListener("click", () => {
    playTap();
    const isOpen = card.classList.toggle("open");
    summaryBtn.setAttribute("aria-expanded", String(isOpen));
    if (isOpen) {
      trackEvent("expandir_candidato", {
        candidato_numero: candidato.numero,
        candidato_nome: candidato.nome,
        posicao_ranking: rank,
        total_matches: total,
      });
    }
  });

  if (candidato.pdf) {
    details.appendChild(
      el(
        "a",
        {
          class: "btn btn-outline btn-block",
          href: candidato.pdf,
          target: "_blank",
          rel: "noopener",
          download: "",
          onClick: () =>
            trackEvent("baixar_pdf", {
              candidato_numero: candidato.numero,
              candidato_nome: candidato.nome,
            }),
        },
        "Baixar plano de governo completo (PDF)"
      )
    );
  }

  return card;
}

export function renderResult(container, { ranking, onRestart }) {
  const list = el(
    "div",
    { class: "result-list" },
    ranking.map((entry, i) => renderCandidateCard(entry, i + 1))
  );

  const view = el("div", { class: "screen screen-result" }, [
    el("div", { class: "result-header" }, [
      el("h2", {}, "Seu resultado"),
      el("p", {}, "Veja os candidatos que mais combinaram com as suas escolhas."),
    ]),
    list,
    el(
      "button",
      {
        class: "btn btn-text",
        onClick: () => {
          playTap();
          onRestart();
        },
      },
      "Refazer o teste"
    ),
    el("div", { class: "farewell-banner" }, "🇧🇷 Desejamos a você uma ótima eleição!"),
    el(
      "button",
      {
        class: "btn btn-primary btn-block share-cta",
        onClick: async () => {
          playTap();
          const outcome = await shareApp();
          trackEvent("compartilhar", { local: "resultado_cta", resultado: outcome });
          if (outcome === "copied") showToast("Link copiado! Cole e envie para seus amigos.");
          else if (outcome === "failed")
            showToast("Não foi possível compartilhar. Copie o link da barra de endereço.");
        },
      },
      "📤 Compartilhar com amigos"
    ),
    el("footer", { class: "app-footer" }, [
      el(
        "a",
        { href: TSE_URL, target: "_blank", rel: "noopener" },
        "Consulte os planos de governo oficiais no TSE"
      ),
      el("a", { href: `mailto:${CONTACT_EMAIL}` }, "Fale com o criador do site"),
    ]),
  ]);

  container.appendChild(view);
}
