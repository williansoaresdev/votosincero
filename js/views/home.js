import { el } from "../utils.js";
import { STATUS, contarPorStatus, formatarData } from "../data.js";
import { badge, esferaLabel, meter } from "./common.js";

// Filtros ficam em memória para sobreviver à ida e volta ao detalhe.
const filtros = { busca: "", esfera: null, status: null };

export function renderHome(container, { db }) {
  const { objetivos, esferas } = db;
  const contagem = contarPorStatus(objetivos);
  const apurados = objetivos.length - contagem.nao_avaliado;

  const lista = el("ul", { class: "obj-list" });
  const contador = el("p", { class: "result-count", "aria-live": "polite" });

  function atualizarLista() {
    const termo = filtros.busca.trim().toLowerCase();
    const itens = objetivos.filter(
      (o) =>
        (!filtros.esfera || o.esfera === filtros.esfera) &&
        (!filtros.status || o.status === filtros.status) &&
        (!termo || `${o.titulo} ${o.descricao}`.toLowerCase().includes(termo))
    );
    lista.innerHTML = "";
    if (!itens.length) {
      lista.appendChild(el("li", { class: "empty-note" }, "Nenhum objetivo encontrado com esses filtros."));
    }
    for (const o of itens) lista.appendChild(cartao(o));
    contador.textContent = `${itens.length} de ${objetivos.length} objetivos`;
  }

  // Resumo (barra empilhada + legenda clicável que funciona como filtro)
  const stack = el(
    "div",
    { class: "stack", role: "img", "aria-label": "Distribuição dos objetivos por status" },
    Object.keys(STATUS)
      .filter((k) => contagem[k] > 0)
      .map((k) => el("span", { class: `bg-${k}`, style: `width:${(contagem[k] / objetivos.length) * 100}%` }))
  );
  const legendBtns = Object.entries(STATUS).map(([k, s]) => {
    const btn = el(
      "button",
      {
        class: "legend-btn",
        type: "button",
        "aria-pressed": String(filtros.status === k),
        onClick: () => {
          filtros.status = filtros.status === k ? null : k;
          legendBtns.forEach((b) => b.setAttribute("aria-pressed", String(b.dataset.k === filtros.status)));
          atualizarLista();
        },
      },
      [el("span", { class: `dot bg-${k}` }), s.label, el("b", {}, String(contagem[k]))]
    );
    btn.dataset.k = k;
    return btn;
  });

  // Filtro por esfera
  const chipTodas = chip("Todas", () => filtros.esfera === null, () => (filtros.esfera = null));
  const chipsEsfera = esferas.map((e) => chip(esferaLabel(e), () => filtros.esfera === e, () => (filtros.esfera = filtros.esfera === e ? null : e)));
  const allChips = [chipTodas, ...chipsEsfera];
  function chip(texto, ativo, aplicar) {
    const b = el("button", { class: "chip", type: "button", "aria-pressed": String(ativo()) }, texto);
    b.addEventListener("click", () => {
      aplicar();
      allChips.forEach((c) => c.sync());
      atualizarLista();
    });
    b.sync = () => b.setAttribute("aria-pressed", String(ativo()));
    return b;
  }

  const busca = el("input", {
    class: "search",
    type: "search",
    placeholder: "Buscar objetivo (ex.: 6x1, saúde, INSS)",
    "aria-label": "Buscar objetivo",
    value: filtros.busca,
  });
  busca.addEventListener("input", () => {
    filtros.busca = busca.value;
    atualizarLista();
  });

  const view = el("div", { class: "screen" }, [
    el("section", { class: "hero" }, [
      el("span", { class: "hero-tag" }, "Monitor do plano de governo"),
      el("h1", { class: "hero-title" }, "O que foi prometido está saindo do papel?"),
      el(
        "p",
        { class: "hero-sub" },
        "Acompanhamos, com fontes públicas, cada objetivo do plano de governo do presidente reeleito (Lula, 13) para o mandato 2027–2030."
      ),
      el(
        "p",
        { class: "hero-meta" },
        `Atualizado em ${formatarData(db.atualizado_em)} · ${apurados} de ${objetivos.length} objetivos já apurados · `
      ),
    ]),
    el("section", { class: "card", "aria-labelledby": "resumo-h" }, [
      el("h2", { id: "resumo-h" }, "Panorama do mandato"),
      stack,
      el("div", { class: "legend" }, legendBtns),
      apurados === 0
        ? el("p", { class: "hero-meta" }, "O mandato começa em 01/01/2027. A primeira apuração mensal com fontes será publicada em breve.")
        : null,
    ]),
    el("section", { class: "screen", style: "gap:10px" }, [busca, el("div", { class: "chips", role: "group", "aria-label": "Filtrar por área" }, allChips), contador]),
    lista,
    el("footer", { class: "app-footer" }, [
      el("a", { href: "#/sobre" }, "Como apuramos e o que cada status significa"),
      el("a", { href: db.governo.plano_pdf, target: "_blank", rel: "noopener" }, "📄 Ler o plano de governo original (PDF)"),
    ]),
  ]);

  // "Atualizado" acrescenta link para a metodologia
  const meta = view.querySelector(".hero-meta");
  meta.appendChild(el("a", { href: "#/sobre" }, "metodologia"));

  container.appendChild(view);
  atualizarLista();
}

function cartao(o) {
  return el("li", {}, [
    el("a", { class: "obj-card", href: `#/o/${o.id}` }, [
      el("div", { class: "obj-top" }, [el("span", { class: "obj-esfera" }, esferaLabel(o.esfera)), badge(o.status)]),
      el("h3", { class: "obj-title" }, o.titulo),
      el("p", { class: "obj-desc" }, o.descricao),
      meter(o),
      el("div", { class: "obj-foot" }, [
        el("span", {}, o.ultimaAtualizacao ? `Última checagem: ${formatarData(o.ultimaAtualizacao)}` : ""),
        el("span", {}, `Plano (PDF), p. ${o.plano_pagina}`),
      ]),
    ]),
  ]);
}
