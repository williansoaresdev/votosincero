// Camada de dados: carrega o banco de planos de governo e expõe metadados
// auxiliares (arquivo de PDF, imagem, ícone da esfera) que não fazem parte
// do JSON gerado a partir dos PDFs.

export const ESFERAS = [
  "Educação",
  "Economia",
  "Saúde",
  "Segurança",
  "Transporte",
  "Meio Ambiente",
  "Desenvolvimento Social",
  "Relações Internacionais",
  "Ciência e Tecnologia",
  "Trabalho e Previdência",
  "Gestão Pública",
  "Agricultura",
];

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

// Nome do PDF do plano de governo completo por número de urna.
const PDF_POR_NUMERO = {
  "13": "13_LULA.pdf",
  "14": "14_RENAN.pdf",
  "16": "16_HERTZ.pdf",
  "21": "21_EDMILSON.pdf",
  "22": "22_FLAVIO.pdf",
  "28": "28_PABLO.pdf",
  "29": "29_RUI.pdf",
  "30": "30_ZEMA.pdf",
  "35": "35_WILSON.pdf",
  "55": "55_RONALDO.pdf",
  "70": "70_AUGUSTO.pdf",
  "80": "80_SAMARA.pdf",
};

const ASSETS_BASE = "src/assets";

function pdfUrl(numero) {
  const file = PDF_POR_NUMERO[numero];
  return file ? `${ASSETS_BASE}/planos_pdf/${encodeURIComponent(file)}` : null;
}

function imagemUrl(numero) {
  return `${ASSETS_BASE}/imagens/Candidato${numero}.png`;
}

function nomeExibicao(c) {
  if (c.nome && c.nome.trim()) return c.nome.trim();
  if (c.partido && c.partido.trim()) return c.partido.trim();
  return `Candidato nº ${c.numero}`;
}

function partidoExibicao(c) {
  if (c.partido && c.partido.trim()) return c.partido.trim();
  return "Partido não informado no plano de governo";
}

// 2º turno: apenas Lula (13) e Flávio Bolsonaro (22) permanecem na disputa.
const CANDIDATOS_SEGUNDO_TURNO = ["13", "22"];

let cache = null;

export async function loadDatabase() {
  if (cache) return cache;
  const res = await fetch("./planos_governo.json", { cache: "force-cache" });
  if (!res.ok) throw new Error("Não foi possível carregar a base de planos de governo.");
  const raw = await res.json();

  const candidatos = raw.candidatos
    .filter((c) => CANDIDATOS_SEGUNDO_TURNO.includes(String(c.numero)))
    .map((c) => ({
    numero: c.numero,
    nome: nomeExibicao(c),
    partido: partidoExibicao(c),
    imagem: imagemUrl(c.numero),
    pdf: pdfUrl(c.numero),
    esferas: c.esferas || {},
  }));

  candidatos.sort((a, b) => Number(a.numero) - Number(b.numero));

  cache = { candidatos };
  return cache;
}

// Retorna, para uma esfera, a lista de opções de plano com conteúdo válido
// (algumas esferas podem não ter descrição para todos os candidatos).
export function opcoesPorEsfera(db, esfera) {
  return db.candidatos
    .filter((c) => {
      const info = c.esferas[esfera];
      return info && info.tweet && info.tweet.trim() && info.macro && info.macro.trim();
    })
    .map((c) => ({
      numero: c.numero,
      // "nome" não é exibido na tela do teste (que é cego) — serve apenas
      // para identificar o candidato nos eventos enviados ao analytics.
      nome: c.nome,
      tweet: c.esferas[esfera].tweet.trim(),
      macro: c.esferas[esfera].macro.trim(),
    }));
}
