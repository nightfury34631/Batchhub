/**
 * BatchHub UI Utilities
 * Safe DOM rendering, date formatting, modal dialogs, and toast notifications.
 */

export function escapeHTML(str) {
  if (str === null || str === undefined) return "";
  return String(str)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}

export function formatDate(dateStr, includeTime = false) {
  if (!dateStr) return "N/A";
  try {
    const d = new Date(dateStr);
    if (isNaN(d.getTime())) return String(dateStr);
    const options = {
      month: "short",
      day: "numeric",
      year: "numeric",
    };
    if (includeTime) {
      options.hour = "numeric";
      options.minute = "2-digit";
    }
    return d.toLocaleDateString("en-US", options);
  } catch (e) {
    return String(dateStr);
  }
}

export function formatTime(dateStr) {
  if (!dateStr) return "";
  try {
    const d = new Date(dateStr);
    if (isNaN(d.getTime())) return "";
    return d.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
  } catch (e) {
    return "";
  }
}

/**
 * Toast Notification System
 * type: 'success' | 'error' | 'info' | 'warning'
 */
export function showToast(message, type = "info", duration = 3200) {
  let container = document.getElementById("toastContainer");
  if (!container) {
    container = document.createElement("div");
    container.id = "toastContainer";
    container.className = "toast-container";
    document.body.appendChild(container);
  }

  const toast = document.createElement("div");
  toast.className = `toast-pill toast-${type}`;

  const iconSvg =
    type === "success"
      ? `<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><polyline points="20 6 9 17 4 12"/></svg>`
      : type === "error"
      ? `<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><circle cx="12" cy="12" r="10"/><line x1="15" y1="9" x2="9" y2="15"/><line x1="9" y1="9" x2="15" y2="15"/></svg>`
      : `<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><circle cx="12" cy="12" r="10"/><line x1="12" y1="16" x2="12" y2="12"/><line x1="12" y1="8" x2="12.01" y2="8"/></svg>`;

  toast.innerHTML = `
    <span class="toast-icon">${iconSvg}</span>
    <span class="toast-text">${escapeHTML(message)}</span>
  `;

  container.appendChild(toast);

  // Trigger enter animation
  requestAnimationFrame(() => {
    toast.classList.add("toast-show");
  });

  setTimeout(() => {
    toast.classList.remove("toast-show");
    toast.classList.add("toast-hide");
    setTimeout(() => {
      if (toast.parentNode) toast.parentNode.removeChild(toast);
    }, 280);
  }, duration);
}

/**
 * Modern Confirmation Dialog (replaces alert() / confirm())
 */
export function confirmDialog({
  title = "Confirm Action",
  message = "Are you sure you want to proceed?",
  confirmText = "Confirm",
  cancelText = "Cancel",
  isDanger = false,
}) {
  return new Promise((resolve) => {
    const overlay = document.createElement("div");
    overlay.className = "app-modal-overlay";
    overlay.innerHTML = `
      <div class="app-modal-dialog" style="max-width: 420px;">
        <div class="app-modal-header">
          <h3 style="font-size: 16px; font-weight: 700; color: var(--text-primary);">${escapeHTML(title)}</h3>
        </div>
        <div style="padding: 16px 20px; color: var(--text-secondary); font-size: 13.5px; line-height: 1.5;">
          ${escapeHTML(message)}
        </div>
        <div class="app-modal-footer">
          <button id="cancelConfirmBtn" class="btn-secondary">${escapeHTML(cancelText)}</button>
          <button id="okConfirmBtn" class="${isDanger ? "btn-danger" : "btn-primary"}">${escapeHTML(confirmText)}</button>
        </div>
      </div>
    `;

    document.body.appendChild(overlay);

    const close = (result) => {
      overlay.classList.remove("app-modal-open");
      setTimeout(() => {
        if (overlay.parentNode) overlay.parentNode.removeChild(overlay);
        resolve(result);
      }, 150);
    };

    requestAnimationFrame(() => overlay.classList.add("app-modal-open"));

    overlay.querySelector("#cancelConfirmBtn").onclick = () => close(false);
    overlay.querySelector("#okConfirmBtn").onclick = () => close(true);
    overlay.onclick = (e) => {
      if (e.target === overlay) close(false);
    };
  });
}

