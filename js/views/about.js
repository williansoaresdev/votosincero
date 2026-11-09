import { el } from "../utils.js";
import { STATUS } from "../data.js";
import { badge } from "./common.js";

export function renderAbout(container, { db }) {
  container.appendChild(
    el("div", { class: "screen prose" }, [
      el("a", { class: "back-link", href: "#/" }, "← Voltar ao painel"),
      el("h1", { class: "detail-title" }, "Como funciona o Voto Sincero"),
      el(
        "p",
        {},
        "O Voto Sincero nasceu como um teste cego de planos de governo nas eleições de 2026. Terminada a eleição, ele passou a acompanhar o que o governo eleito prometeu e o que está de fato saindo do papel."
      ),

      el("h2", {}, "De onde vêm os objetivos"),
      el("p", {}, [
        "Os ",
        String(db.objetivos.length),
        " objetivos foram extraídos do ",
        el("a", { href: db.governo.plano_pdf, target: "_blank", rel: "noopener" }, "programa de governo registrado no TSE"),
        ". Cada objetivo aponta a página do PDF em que aparece. Escolhemos compromissos verificáveis (metas numéricas, leis, órgãos e políticas novas, e programas a manter ou ampliar). Frases genéricas, sem meta ou ação concreta, ficaram de fora.",
      ]),
      el("p", {}, "Números marcados como \"declarado no plano\" são a linha de base apresentada pelo próprio governo e ainda não foram verificados de forma independente."),

      el("h2", {}, "Como apuramos"),
      el("ul", {}, [
        el("li", {}, "Uma vez por mês, pesquisamos fontes públicas para cada objetivo e registramos uma nova entrada no histórico."),
        el("li", {}, "Priorizamos fontes oficiais (Diário Oficial, Portal da Transparência, Câmara, Senado, IBGE, ministérios) e, em segundo lugar, imprensa profissional."),
        el("li", {}, "Toda mudança de status traz ao menos uma fonte com link. Sem fonte, o objetivo continua como \"Aguardando apuração\"."),
        el("li", {}, "Quando há resultado numérico, mostramos o progresso entre a base e a meta."),
      ]),

      el("h2", {}, "O que cada status significa"),
      el(
        "ul",
        { class: "status-defs" },
        Object.entries(STATUS).map(([k, s]) => el("li", {}, [badge(k), " ", s.ajuda]))
      ),

      el("h2", {}, "Independência"),
      el(
        "p",
        {},
        "O Voto Sincero não é um órgão oficial, não tem vínculo com partido, governo ou campanha, e não recebe financiamento político. Trata-se de um projeto cidadão. Encontrou um erro ou uma fonte melhor? Avise-nos para corrigirmos."
      ),
      el("p", {}, [
        "O teste cego de 2026 continua preservado no ",
        el(
          "a",
          { href: "https://github.com/williansoaresdev/votosincero/tree/quiz-eleicoes-2026-backup", target: "_blank", rel: "noopener" },
          "repositório do projeto"
        ),
        ".",
      ]),
    ])
  );
}
