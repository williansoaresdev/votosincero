// Transição de telas estilo "slide" (efeito Duolingo) entre as views do app.

const appEl = () => document.getElementById("app");

export function renderView(renderFn, direction = "forward") {
  const app = appEl();

  if (direction === "none") {
    app.innerHTML = "";
    renderFn(app);
    return;
  }

  const exitClass = direction === "back" ? "exit-right" : "exit-left";
  const enterClass = direction === "back" ? "enter-left" : "enter-right";

  app.classList.add(exitClass);

  const swap = () => {
    app.classList.remove(exitClass);
    app.innerHTML = "";
    renderFn(app);
    app.classList.add(enterClass);
    // força reflow antes de animar para a posição final
    void app.offsetWidth;
    requestAnimationFrame(() => {
      app.classList.add("enter-active");
      app.classList.remove(enterClass);
      window.setTimeout(() => app.classList.remove("enter-active"), 320);
    });
    window.scrollTo({ top: 0, behavior: "instant" in window ? "instant" : "auto" });
  };

  window.setTimeout(swap, 180);
}

export function renderViewInstant(renderFn) {
  const app = appEl();
  app.innerHTML = "";
  renderFn(app);
}
