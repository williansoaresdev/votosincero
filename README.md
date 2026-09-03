# Voto Sincero

Aplicativo web (PWA) que ajuda o eleitor a descobrir, de forma **cega** (sem saber de quem são as propostas), quais candidatos a presidente do Brasil nas eleições de 2026 mais combinam com os seus valores — a partir do conteúdo real dos planos de governo registrados.

🔗 Site: **votosincero.com.br**

## Como funciona

1. **Home** — o eleitor lê uma provocação ("Vamos descobrir qual candidato representa os seus valores?") e clica em **Começar**.
2. **Teste cego por esfera de assunto** — o app apresenta, uma de cada vez e em ordem aleatória, 12 esferas temáticas (Educação, Economia, Saúde, Segurança, Transporte, Meio Ambiente, Desenvolvimento Social, Relações Internacionais, Ciência e Tecnologia, Trabalho e Previdência, Gestão Pública e Agricultura). Para cada esfera, as propostas dos candidatos aparecem **sem identificação e em ordem aleatória**; o eleitor pode marcar **até 3 propostas** que mais combinam com ele, e ver o texto completo do plano em um pop-up ("Ver plano completo").
3. **Resultado** — ao final, o app mostra o ranking dos candidatos por número de propostas escolhidas que coincidem com cada um, com foto, partido, número de urna, a lista das propostas aceitas e um botão para baixar o PDF do plano de governo completo do candidato. A tela também traz o link oficial de consulta de planos de governo do TSE e um contato por e-mail.

## Estrutura do projeto

```
├── index.html                 # shell da aplicação (SPA)
├── manifest.webmanifest       # manifesto do PWA
├── service-worker.js          # cache do app shell + cache em runtime de imagens/PDFs
├── css/
│   └── styles.css             # tema visual (paleta verde, componentes, animações)
├── js/
│   ├── app.js                 # bootstrap, navegação e histórico do navegador
│   ├── router.js              # transições entre telas (efeito "slide" estilo Duolingo)
│   ├── state.js                # estado da sessão do teste (respostas, progresso)
│   ├── data.js                 # carregamento de planos_governo.json e metadados
│   ├── audio.js                # efeitos sonoros sintetizados (Web Audio API)
│   ├── utils.js                 # helpers (shuffle, criação de elementos DOM)
│   ├── modal.js                 # pop-up "ver plano completo"
│   └── views/
│       ├── home.js              # tela inicial
│       ├── quiz.js              # tela de cada esfera (seleção cega, limite de 3)
│       └── result.js            # tela de resultado / ranking
├── icons/                      # ícones do PWA em todos os tamanhos (gerados do logo)
├── scripts/
│   └── generate_icons.py       # gera os ícones em icons/ a partir do logo
├── src/assets/
│   ├── imagens/                # LogoFull.png + fotos dos candidatos (CandidatoNN.png)
│   └── planos_pdf/              # PDFs originais dos planos de governo (NN_NOME.pdf)
├── planos_governo.json         # banco de dados dos planos de governo (usado pelo app)
├── planos_governo.xlsx         # mesma base em formato Excel, para conferência manual
└── esferas.txt                 # lista de referência das 12 esferas temáticas
```

## Base de dados dos planos de governo

`planos_governo.json` foi extraído a partir dos PDFs oficiais em `src/assets/planos_pdf/` e tem o formato:

```json
{
  "candidatos": [
    {
      "numero": "13",
      "nome": "Luiz Inácio Lula da Silva (Lula)",
      "partido": "PT (coligação com PSB, PV, PCdoB, PDT, PSOL e Rede)",
      "esferas": {
        "Educação": { "macro": "texto completo da proposta...", "tweet": "resumo com até 140 caracteres" },
        "...": { "...": "..." }
      }
    }
  ],
  "registros": [
    { "Numero_Urna": "13", "Candidato": "...", "Partido": "...", "Esfera": "Educação", "Descricao_Macro": "...", "Descricao_Resumida_Tweet": "..." }
  ]
}
```

- Campos vazios (`""`) indicam que o plano do candidato não trazia proposta identificável para aquela esfera — nesse caso a proposta não aparece como opção no teste cego.
- `planos_governo.xlsx` traz a mesma informação em formato de planilha (uma linha por candidato × esfera), útil para revisão manual.
- O app associa cada candidato ao seu PDF (`src/assets/planos_pdf/NN_NOME.pdf`) e à sua foto (`src/assets/imagens/CandidatoNN.png`) através do **número de urna**, mapeado em [`js/data.js`](js/data.js).

Para atualizar a base (novo candidato, correção de texto, etc.), edite `planos_governo.json` diretamente — o app lê o arquivo em tempo de execução (`fetch('./planos_governo.json')`), sem passo de build.

## Rodando localmente

O projeto é um **PWA estático** (HTML/CSS/JS puro, sem framework nem etapa de build). Basta servir a pasta por HTTP — abrir `index.html` direto do disco (`file://`) não funciona, pois o navegador bloqueia o `fetch` do JSON e o service worker.

Com Python instalado:

```bash
python -m http.server 8765
```

Depois acesse `http://localhost:8765`.

> Para instalar como app (PWA) e testar o funcionamento offline, o site precisa ser servido via **HTTPS** (ou `localhost`), requisito dos navegadores para Service Workers.

## Ícones do PWA

Os ícones em `icons/` (todos os tamanhos, incluindo as versões *maskable*) são gerados a partir de `src/assets/imagens/LogoFull.png` pelo script:

```bash
python scripts/generate_icons.py
```

Rode-o novamente sempre que o logo for atualizado.

## Atualizando o cache do Service Worker

Ao alterar `index.html`, `css/styles.css` ou qualquer arquivo em `js/`, incremente a constante `VERSION` em [`service-worker.js`](service-worker.js). Isso invalida o cache antigo nos navegadores dos usuários e força o download dos arquivos novos na próxima visita.

## Tecnologias

- HTML, CSS e JavaScript puro (ES Modules), sem build/bundler.
- PWA: `manifest.webmanifest` + `service-worker.js` (cache do app shell e cache em runtime de imagens/PDFs).
- Efeitos sonoros sintetizados via **Web Audio API** (sem arquivos de áudio externos).
- Sem dependências de backend: toda a lógica roda no navegador do usuário.

## Licença

Distribuído sob a licença Apache 2.0 — veja [LICENSE](LICENSE).
