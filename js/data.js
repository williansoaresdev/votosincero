// Camada de dados do monitor: carrega objetivos.json (atualizado mensalmente à mão)
// e deriva o status atual de cada objetivo a partir do último registro do histórico.

export const STATUS = {
  nao_avaliado: { label: "Aguardando apuração", icon: "…", ajuda: "Objetivo extraído do plano, ainda sem apuração com fontes independentes." },
  nao_iniciado: { label: "Não iniciado", icon: "○", ajuda: "Apurado: ainda não há ação concreta registrada nas fontes." },
  em_andamento: { label: "Em andamento", icon: "◔", ajuda: "Há ação concreta em curso (projeto enviado, programa executado, obra em execução)." },
  mantido: { label: "Mantido", icon: "↻", ajuda: "Programa ou regra que já existia e continua em vigor, sem expansão nem mudança relevante apurada. Cobre promessas de \"manter\"." },
  atrasado: { label: "Atrasado / travado", icon: "⚠", ajuda: "Iniciado, mas parado, sem avanço no ritmo previsto ou barrado no Congresso ou na Justiça." },
  cumprido: { label: "Cumprido", icon: "✔", ajuda: "A meta ou medida prometida foi entregue, conforme as fontes." },
  descumprido: { label: "Descumprido", icon: "✖", ajuda: "O governo abandonou ou contrariou o que foi prometido, ou o prazo venceu sem entrega." },
};

export const ESFERA_ICONS = {
  "Educação": "📚",
  "Economia": "💰",
  "Saúde": "🏥",
  "Segurança": "🛡️",
  "Transporte": "🚌",
  "Meio Ambiente": "🌳",
  "Desenvolvimento Social": "🤝",
  "Relações Internacionais": "🌎",
  "Ciência e Tecnologia": "🔬",
  "Trabalho e Previdência": "👷",
  "Gestão Pública": "🏛️",
  "Agricultura": "🌾",
};

export const TIPOS = {
  meta: "Meta numérica",
  medida: "Medida, lei ou política nova",
  continuidade: "Continuidade de programa",
};

export function formatarData(iso) {
  if (!iso) return "";
  const [y, m, d] = iso.split("-");
  return `${d}/${m}/${y}`;
}

// Progresso (0..1) de um indicador numérico, da linha de base até a meta.
export function progresso(ind, valor) {
  if (!ind || ind.base == null || ind.meta == null || valor == null) return null;
  const span = ind.meta - ind.base;
  if (span === 0) return 1;
  return Math.max(0, Math.min(1, (valor - ind.base) / span));
}

export function formatarValor(ind, v) {
  const casas = ind.casas ?? 0;
  const num = Number(v).toLocaleString("pt-BR", { minimumFractionDigits: casas, maximumFractionDigits: casas });
  return `${num}${ind.unidade && ind.unidade.startsWith("%") ? "%" : ""}`;
}

let cache = null;

export async function loadDatabase() {
  if (cache) return cache;
  const res = await fetch("./objetivos.json", { cache: "no-cache" });
  if (!res.ok) throw new Error("Não foi possível carregar objetivos.json");
  const raw = await res.json();

  const objetivos = raw.objetivos.map((o) => {
    const historico = (o.historico || []).slice().sort((a, b) => a.data.localeCompare(b.data));
    const ultimo = historico[historico.length - 1];
    const comValor = historico.filter((h) => h.valor != null);
    const valorAtual = comValor.length ? comValor[comValor.length - 1].valor : o.indicador ? o.indicador.base : null;
    return {
      ...o,
      historico,
      status: ultimo && STATUS[ultimo.status] ? ultimo.status : "nao_avaliado",
      ultimaAtualizacao: ultimo ? ultimo.data : null,
      valorAtual,
      temValor: comValor.length > 0,
    };
  });

  const esferas = [...new Set(objetivos.map((o) => o.esfera))].sort((a, b) => a.localeCompare(b, "pt-BR"));
  cache = { ...raw, objetivos, esferas };
  return cache;
}

export function contarPorStatus(objetivos) {
  const c = Object.fromEntries(Object.keys(STATUS).map((k) => [k, 0]));
  for (const o of objetivos) c[o.status] += 1;
  return c;
}
