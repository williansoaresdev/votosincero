import { el } from "../utils.js";
import { STATUS, ESFERA_ICONS, progresso, formatarValor } from "../data.js";

export function badge(status) {
  const s = STATUS[status] || STATUS.nao_avaliado;
  return el("span", { class: `badge s-${status}` }, [el("span", { "aria-hidden": "true" }, s.icon), s.label]);
}

export function esferaLabel(esfera) {
  return `${ESFERA_ICONS[esfera] || "•"} ${esfera}`;
}

export function meter(obj) {
  const ind = obj.indicador;
  if (!ind) return null;
  const p = progresso(ind, obj.valorAtual);
  if (p === null) return null;
  const pct = Math.round(p * 100);
  return el("div", { class: "meter" }, [
    el(
      "div",
      { class: "meter-track", role: "progressbar", "aria-valuemin": "0", "aria-valuemax": "100", "aria-valuenow": String(pct), "aria-label": `Progresso até a meta: ${pct}%` },
      [el("div", { class: "meter-fill", style: `width:${pct}%` })]
    ),
    el("div", { class: "meter-labels" }, [
      el("span", {}, `Ponto de partida: ${formatarValor(ind, ind.base)}`),
      obj.temValor ? el("span", {}, `Atual: ${formatarValor(ind, obj.valorAtual)}`) : null,
      el("span", {}, `Meta: ${formatarValor(ind, ind.meta)}`),
    ]),
  ]);
}
