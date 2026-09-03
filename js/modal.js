import { el } from "./utils.js";
import { playTap } from "./audio.js";

let overlayEl = null;

function ensureOverlay() {
  if (overlayEl) return overlayEl;
  overlayEl = el("div", { class: "modal-overlay", id: "modal-overlay" });
  overlayEl.addEventListener("click", (e) => {
    if (e.target === overlayEl) closeModal();
  });
  document.body.appendChild(overlayEl);
  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape") closeModal();
  });
  return overlayEl;
}

export function openModal({ title, letra, body }) {
  playTap();
  const overlay = ensureOverlay();
  overlay.innerHTML = "";
  const card = el("div", { class: "modal-card", role: "dialog", "aria-modal": "true" }, [
    el("div", { class: "modal-header" }, [
      letra ? el("span", { class: "modal-badge" }, letra) : null,
      el("h3", {}, title),
      el("button", { class: "modal-close", "aria-label": "Fechar", onClick: () => closeModal() }, "✕"),
    ]),
    el("div", { class: "modal-body" }, body),
  ]);
  overlay.appendChild(card);
  overlay.classList.add("open");
  document.body.classList.add("modal-open");
}

export function closeModal() {
  if (!overlayEl) return;
  overlayEl.classList.remove("open");
  document.body.classList.remove("modal-open");
}
