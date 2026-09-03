// Compartilhamento do link do app: usa a Web Share API nativa quando
// disponível (celulares e boa parte dos navegadores desktop atuais) e cai
// para copiar o link para a área de transferência quando não há suporte.

const SHARE_TITLE = "Voto Sincero";
const SHARE_TEXT =
  "Fiz o teste cego do Voto Sincero e descobri quais candidatos mais combinam com meus valores. Faça o seu também:";

function appUrl() {
  return `${location.origin}${location.pathname}`;
}

// Retorna "shared", "copied", "cancelled" ou "failed".
export async function shareApp() {
  const url = appUrl();
  const shareData = { title: SHARE_TITLE, text: SHARE_TEXT, url };

  if (navigator.share) {
    if (!navigator.canShare || navigator.canShare(shareData)) {
      try {
        await navigator.share(shareData);
        return "shared";
      } catch (err) {
        if (err && err.name === "AbortError") return "cancelled";
        // continua para o fallback de copiar o link
      }
    }
  }

  try {
    await navigator.clipboard.writeText(url);
    return "copied";
  } catch (_) {
    try {
      // fallback para navegadores sem Clipboard API (contexto não seguro, permissão negada, etc.)
      const input = document.createElement("textarea");
      input.value = url;
      input.style.position = "fixed";
      input.style.opacity = "0";
      document.body.appendChild(input);
      input.select();
      document.execCommand("copy");
      document.body.removeChild(input);
      return "copied";
    } catch (err) {
      return "failed";
    }
  }
}
