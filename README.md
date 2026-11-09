# Voto Sincero — Monitor do plano de governo

Aplicativo web (PWA) estático que acompanha, com fontes públicas, o andamento de cada objetivo do plano de governo do presidente reeleito (Lula, 13) para o mandato **2027–2030**.

🔗 Site: **votosincero.com.br**

> O teste cego de planos de governo das eleições de 2026 (1º e 2º turno) está preservado na branch [`quiz-eleicoes-2026-backup`](https://github.com/williansoaresdev/votosincero/tree/quiz-eleicoes-2026-backup) e na tag `v-quiz-final-2026`. A branch `PrimeiroTurno2026` guarda a versão do 1º turno.

## Como funciona

- **Painel** — panorama por status (barra empilhada), busca, filtro por área e lista de objetivos.
- **Objetivo** — descrição, ponto de partida (declarado no plano), indicador numérico quando existe, link para a página do PDF e **histórico de apurações com fontes**.
- **Metodologia** — de onde vêm os objetivos, como apuramos e o que cada status significa.

Toda a informação vem de **`objetivos.json`**. Não há backend: atualizar o app é editar esse arquivo e fazer commit na `main` (o GitHub Actions publica por FTP no cPanel).

## Rotina mensal de atualização

1. Para cada objetivo, pesquise fontes (Diário Oficial, Portal da Transparência, Câmara/Senado, IBGE, ministérios, imprensa profissional).
2. Acrescente **uma nova entrada no fim de `historico`** do objetivo — nunca edite as antigas, o histórico é o registro:

   ```json
   {
     "data": "2027-02-05",
     "status": "em_andamento",
     "valor": 68,
     "resumo": "Frase curta e factual sobre o que mudou.",
     "fontes": [
       { "titulo": "Título da matéria/ato", "url": "https://...", "tipo": "oficial", "data": "2027-02-03" }
     ]
   }
   ```

   - `status`: `nao_avaliado`, `nao_iniciado`, `em_andamento`, `mantido`, `atrasado`, `cumprido` ou `descumprido`. O status mostrado no app é o da **entrada mais recente**. Use `mantido` quando a promessa é manter um programa ou regra que já existia e ele segue em vigor sem expansão nem mudança relevante; se houver ampliação ou ação nova, use `em_andamento`; se o programa for reduzido ou abandonado, `descumprido`.
   - `valor` (opcional): só para objetivos que têm `indicador` (`unidade`, `base`, `meta`); alimenta a barra de progresso.
   - `fontes`: obrigatória para qualquer status diferente de `nao_avaliado`. `tipo`: `oficial`, `imprensa`, `dados`, `plano` ou `outro`.
3. Atualize `atualizado_em` (raiz do JSON) com a data da apuração.
4. Rode a validação:

   ```bash
   python scripts/validar_objetivos.py
   ```

5. Commit e push na `main`. O workflow valida de novo e só publica se estiver tudo certo.

Para o app mostrar a versão nova mesmo a quem tem o PWA instalado, o service worker busca `objetivos.json` na rede primeiro (o cache só serve de fallback offline).

## Adicionar ou ajustar um objetivo

Inclua um item em `objetivos` com `id` único, `esfera` (uma das 12 áreas), `titulo`, `descricao`, `tipo` (`meta`, `medida` ou `continuidade`), `prazo`, `plano_pagina` (página do **PDF**, que é a numerada do leitor de PDF — uma a mais que a impressa), `linha_de_base` (opcional) e um `historico` inicial com status `nao_avaliado`. Veja os itens existentes como modelo.

## Estrutura

```
├── index.html               # shell da SPA
├── objetivos.json           # FONTE DE DADOS: objetivos + histórico de apurações
├── manifest.webmanifest     # manifesto do PWA
├── service-worker.js        # rede primeiro para shell e JSON; cache para PDF/imagens
├── css/styles.css           # tema visual
├── js/
│   ├── app.js               # bootstrap e rotas por hash (#/, #/o/<id>, #/sobre)
│   ├── data.js              # carga do JSON, status, cálculo de progresso
│   ├── analytics.js         # Google Analytics 4
│   ├── share.js, toast.js, utils.js
│   └── views/               # home.js (painel), detail.js, about.js, common.js
├── scripts/
│   ├── validar_objetivos.py # valida o JSON (roda também no deploy)
│   └── generate_icons.py    # gera os ícones do PWA
├── src/assets/planos_pdf/13_LULA.pdf   # plano de governo original (fonte primária)
└── .github/workflows/deploy.yml        # valida e publica por FTP no cPanel
```

## Desenvolvimento local

```bash
python -m http.server 8765
```

e abra `http://localhost:8765`.

## Licença

Veja [LICENSE](LICENSE).
