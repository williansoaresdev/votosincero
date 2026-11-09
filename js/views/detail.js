import { el } from "../utils.js";
import { TIPOS, formatarData, formatarValor } from "../data.js";
import { badge, esferaLabel, meter } from "./common.js";

const TIPO_FONTE = {
  plano: "Plano",
  oficial: "Oficial",
  imprensa: "Imprensa",
  dados: "Dados abertos",
  outro: "Fonte",
};

export function renderDetail(container, { db, id }) {
  const o = db.objetivos.find((x) => x.id === id);
  if (!o) {
    container.appendChild(
      el("div", { class: "screen" }, [
        el("a", { class: "back-link", href: "#/" }, "← Voltar ao painel"),
        el("p", { class: "empty-note" }, "Objetivo não encontrado."),
      ])
    );
    return;
  }

  const historico = o.historico.slice().reverse();

  container.appendChild(
    el("div", { class: "screen" }, [
      el("a", { class: "back-link", href: "#/" }, "← Voltar ao painel"),
      el("section", {}, [
        el("div", { class: "obj-top" }, [el("span", { class: "obj-esfera" }, esferaLabel(o.esfera)), badge(o.status)]),
        el("h1", { class: "detail-title" }, o.titulo),
        el("p", { class: "hero-sub" }, o.descricao),
      ]),
      el("section", { class: "card" }, [
        meter(o),
        el("dl", { class: "kv", style: o.indicador ? "margin-top:12px" : "" }, [
          el("dt", {}, "Tipo"),
          el("dd", {}, TIPOS[o.tipo] || o.tipo),
          el("dt", {}, "Prazo"),
          el("dd", {}, o.prazo),
          o.linha_de_base ? el("dt", {}, "Ponto de partida") : null,
          o.linha_de_base ? el("dd", {}, o.linha_de_base) : null,
          o.indicador ? el("dt", {}, "Indicador") : null,
          o.indicador ? el("dd", {}, o.indicador.unidade + (o.temValor ? "" : " (ainda sem medição)")) : null,
          el("dt", {}, "No plano"),
          el(
            "dd",
            {},
            el("a", { href: `${db.governo.plano_pdf}#page=${o.plano_pagina}`, target: "_blank", rel: "noopener" }, `PDF, p. ${o.plano_pagina}`)
          ),
        ]),
      ]),
      el("section", { class: "card" }, [
        el("h2", {}, "Histórico de apuração"),
        el(
          "ol",
          { class: "timeline" },
          historico.map((h) =>
            el("li", { class: "tl-item" }, [
              el("div", { class: "tl-date" }, [formatarData(h.data), badge(h.status)]),
              el("p", { class: "tl-text" }, h.resumo),
              h.valor != null && o.indicador ? el("p", { class: "tl-text" }, `Indicador na data: ${formatarValor(o.indicador, h.valor)}`) : null,
              h.fontes && h.fontes.length
                ? el(
                    "ul",
                    { class: "sources" },
                    h.fontes.map((f) =>
                      el("li", {}, [
                        el("span", { class: "src-type" }, TIPO_FONTE[f.tipo] || TIPO_FONTE.outro),
                        el("a", { href: f.url, target: "_blank", rel: "noopener noreferrer" }, f.titulo),
                        f.data ? ` (${formatarData(f.data)})` : "",
                      ])
                    )
                  )
                : null,
            ])
          )
        ),
      ]),
    ])
  );
}
