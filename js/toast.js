import { el } from "./utils.js";

let hideTimer = null;
let toastEl = null;

function ensureToast() {
  if (toastEl) return toastEl;
  toastEl = el("div", { class: "mini-toast", role: "status", "aria-live": "polite" });
  document.body.appendChild(toastEl);
  return toastEl;
}

export function showToast(message, duration = 2600) {
  const toast = ensureToast();
  toast.textContent = message;
  toast.classList.add("visible");
  if (hideTimer) clearTimeout(hideTimer);
  hideTimer = setTimeout(() => toast.classList.remove("visible"), duration);
}
