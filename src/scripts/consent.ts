import {
  CONSENT_KEY,
  createChoice,
  parseChoice,
  type ConsentChoice,
} from "../lib/consent";
const banner = document.querySelector<HTMLElement>(".consent-banner");
const dialog = document.querySelector<HTMLDialogElement>(".consent-dialog");
const checkbox = document.querySelector<HTMLInputElement>("#consent-maps");
const status = document.querySelector<HTMLElement>("#consent-status");
let opener: HTMLElement | null = null;
let memory: ConsentChoice | null = null;
let storageAvailable = true;
function readChoice() {
  if (!storageAvailable) return memory;
  try {
    return parseChoice(localStorage.getItem(CONSENT_KEY));
  } catch {
    storageAvailable = false;
    return memory;
  }
}
function apply(choice: ConsentChoice | null) {
  if (banner) banner.hidden = !!choice;
  document.querySelectorAll<HTMLElement>("[data-map-src]").forEach((map) => {
    const holder = map.querySelector<HTMLElement>("[data-map-content]");
    const placeholder = map.querySelector<HTMLElement>(
      "[data-map-placeholder]",
    );
    const mapStatus = map.querySelector<HTMLElement>("[data-map-status]");
    if (!holder || !placeholder) return;
    const allowed = choice?.maps === true;
    placeholder.hidden = allowed;
    if (allowed && !holder.querySelector("iframe")) {
      const url = new URL(map.dataset.mapSrc || "");
      if (
        url.origin !== "https://www.google.com" ||
        url.pathname !== "/maps/embed"
      )
        return;
      const frame = document.createElement("iframe");
      frame.title =
        "Mappa Google Maps: TurboMastin, Via Thomas Alva Edison 11, San Pietro in Cariano";
      frame.width = "1200";
      frame.height = "450";
      frame.loading = "lazy";
      frame.referrerPolicy = "strict-origin-when-cross-origin";
      frame.allowFullscreen = true;
      frame.src = url.href;
      holder.replaceChildren(frame);
    } else if (!allowed) holder.replaceChildren();
    if (mapStatus)
      mapStatus.textContent = allowed
        ? "Google Maps abilitato con il tuo consenso."
        : "Mappa non caricata: nessun collegamento a Google da questo riquadro.";
  });
}
function close() {
  if (dialog?.open) dialog.close();
}
function save(maps: boolean) {
  memory = createChoice(maps);
  try {
    localStorage.setItem(CONSENT_KEY, JSON.stringify(memory));
  } catch {
    storageAvailable = false;
  }
  apply(memory);
  close();
  if (status)
    status.textContent = maps
      ? "Preferenza salvata. Google Maps consentito."
      : "Preferenza salvata. Contenuti esterni rifiutati; la mappa è bloccata.";
  if (!opener || !opener.isConnected || opener.closest(".consent-banner")) {
    const fallback = document.querySelector<HTMLElement>("#contenuto");
    fallback?.focus({ preventScroll: true });
  }
}
function open(trigger: HTMLElement) {
  if (!dialog || !checkbox) return;
  opener = trigger;
  checkbox.checked = readChoice()?.maps === true;
  dialog.showModal();
  document.documentElement.classList.add("consent-open");
}
if (banner && dialog && checkbox) {
  document
    .querySelectorAll<HTMLElement>("[data-consent-open]")
    .forEach((trigger) => {
      trigger.hidden = false;
      trigger.addEventListener("click", (event) => {
        if (
          event instanceof MouseEvent &&
          (event.ctrlKey ||
            event.metaKey ||
            event.shiftKey ||
            event.altKey ||
            event.button !== 0)
        )
          return;
        event.preventDefault();
        open(trigger);
      });
    });
  document
    .querySelectorAll<HTMLElement>("[data-consent-accept]")
    .forEach((button) => button.addEventListener("click", () => save(true)));
  document
    .querySelectorAll<HTMLElement>("[data-consent-reject]")
    .forEach((button) => button.addEventListener("click", () => save(false)));
  document
    .querySelector("[data-consent-save]")
    ?.addEventListener("click", () => save(checkbox.checked));
  dialog.querySelector(".consent-close")?.addEventListener("click", close);
  dialog.addEventListener("close", () => {
    document.documentElement.classList.remove("consent-open");
    if (opener && !opener.closest("[hidden]"))
      opener.focus({ preventScroll: true });
  });
  window.addEventListener("storage", (event) => {
    if (event.key === CONSENT_KEY || event.key === null) apply(readChoice());
  });
  document.addEventListener("visibilitychange", () => {
    if (!document.hidden) apply(readChoice());
  });
  apply(readChoice());
}
