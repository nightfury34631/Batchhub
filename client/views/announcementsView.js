import { api } from "../assets/js/api.js";
import { escapeHTML, formatDate, showToast, confirmDialog } from "../assets/js/uiUtils.js";

export function AnnouncementsView(navigate = null) {
  const container = document.createElement("div");
  container.className = "view-container";

  const user = JSON.parse(localStorage.getItem("user")) || {
    id: 0,
    role: "student",
  };
  const isCRorAdmin = user.role === "cr" || user.role === "admin";

  container.innerHTML = `
    <!-- Page Header -->
    <div class="view-header">
      <div class="view-title-group">
        <h2>Batch Announcements & Notices</h2>
        <p>Official batch updates, exam schedules, academic notifications, and campus news.</p>
      </div>
      <div class="view-actions">
        <button class="btn-primary" id="btnOpenCreateNoticeModal">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5">
            <line x1="12" y1="5" x2="12" y2="19"></line>
            <line x1="5" y1="12" x2="19" y2="12"></line>
          </svg>
          <span>New Announcement</span>
        </button>
      </div>
    </div>

    <!-- Filter & Search Toolbar -->
    <div class="filter-toolbar">
      <div class="filter-search-box">
        <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" style="color: var(--text-dim); flex-shrink: 0;">
          <circle cx="11" cy="11" r="8"></circle>
          <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
        </svg>
        <input type="text" id="noticeSearchInput" placeholder="Search notices by title, content, or author...">
      </div>

      <div class="filter-tabs" id="noticeCategoryTabs">
        <button class="filter-tab active" data-cat="all">All Notices</button>
        <button class="filter-tab" data-cat="academic">Academic</button>
        <button class="filter-tab" data-cat="examination">Exam</button>
        <button class="filter-tab" data-cat="event">Events</button>
        <button class="filter-tab" data-cat="general">General</button>
      </div>
    </div>

    <!-- Announcements Cards Grid -->
    <div id="noticesGrid" class="app-cards-grid">
      <div class="skeleton-card"></div>
      <div class="skeleton-card"></div>
      <div class="skeleton-card"></div>
    </div>

    <!-- Create Announcement Modal -->
    <div id="createNoticeModal" class="app-modal-overlay">
      <div class="app-modal-dialog">
        <div class="app-modal-header">
          <h3>Post New Announcement</h3>
          <button class="app-modal-close" id="closeNoticeModalBtn">✕</button>
        </div>
        <form id="createNoticeForm">
          <div class="app-modal-body">
            <div class="form-group">
              <label class="form-label">Announcement Title *</label>
              <input type="text" id="noticeTitleInput" class="form-input" required placeholder="e.g., Final-Year Project Proposal Guidelines">
            </div>

            <div class="form-row">
              <div class="form-group">
                <label class="form-label">Category *</label>
                <select id="noticeCategoryInput" class="form-select">
                  <option value="academic">Academic</option>
                  <option value="examination">Examination</option>
                  <option value="event">Event</option>
                  <option value="general" selected>General Announcement</option>
                </select>
              </div>

              <div class="form-group">
                <label class="form-label">Priority</label>
                <select id="noticePriorityInput" class="form-select">
                  <option value="Normal" selected>Normal</option>
                  <option value="Important">Important 🟡</option>
                  <option value="Urgent">Urgent 🔴</option>
                </select>
              </div>
            </div>

            <div class="form-group">
              <label class="form-label">Target Audience</label>
              <input type="text" id="noticeAudienceInput" class="form-input" value="all" placeholder="e.g., all, 3rd Year, Section A">
            </div>

            <div class="form-group">
              <label class="form-label">Description / Announcement Body *</label>
              <textarea id="noticeDescInput" class="form-textarea" rows="4" required placeholder="Provide clear instructions, links, or submission details..."></textarea>
            </div>

            ${
              isCRorAdmin
                ? `
                <div style="display: flex; align-items: center; gap: 8px; margin-top: 4px;">
                  <input type="checkbox" id="noticePinInput" style="width: 16px; height: 16px; accent-color: var(--primary-mint); cursor: pointer;">
                  <label for="noticePinInput" style="font-size: 13px; color: var(--text-primary); cursor: pointer;">Pin this announcement to the top</label>
                </div>
                `
                : ""
            }
          </div>
          <div class="app-modal-footer">
            <button type="button" class="btn-secondary" id="cancelNoticeModalBtn">Cancel</button>
            <button type="submit" class="btn-primary" id="submitNoticeBtn">Publish Announcement</button>
          </div>
        </form>
      </div>
    </div>

    <!-- Announcement Detail Modal -->
    <div id="noticeDetailModal" class="app-modal-overlay">
      <div class="app-modal-dialog" style="max-width: 620px;">
        <div class="app-modal-header">
          <div style="display: flex; align-items: center; gap: 8px;">
            <span id="detailCatBadge" class="app-badge badge-emerald">ACADEMIC</span>
            <span id="detailPriorityBadge" class="app-badge badge-warning" style="display: none;">Important</span>
            <span id="detailPinBadge" class="app-badge badge-warning" style="display: none;">📌 Pinned</span>
          </div>
          <button class="app-modal-close" id="closeNoticeDetailBtn">✕</button>
        </div>
        <div class="app-modal-body" style="display: flex; flex-direction: column; gap: 14px;">
          <h2 id="detailTitle" style="font-size: 18px; font-weight: 700; color: var(--text-primary); line-height: 1.3;"></h2>
          
          <div style="display: flex; gap: 16px; font-size: 12.5px; color: var(--text-muted); background: var(--card-inner); padding: 10px 14px; border-radius: var(--radius-sm); border: 1px solid var(--card-border); flex-wrap: wrap;">
            <div><strong>Author:</strong> <span id="detailAuthor"></span></div>
            <div><strong>Date:</strong> <span id="detailDate"></span></div>
            <div><strong>Audience:</strong> <span id="detailAudience"></span></div>
          </div>

          <div id="detailDescription" style="font-size: 14px; line-height: 1.6; color: var(--text-secondary); white-space: pre-line; padding-top: 6px;"></div>
        </div>
        <div class="app-modal-footer">
          <button type="button" class="btn-secondary" id="dismissDetailBtn">Close</button>
        </div>
      </div>
    </div>
  `;

  let allNotices = [];
  let currentCategory = "all";
  let searchQuery = "";

  async function fetchNotices() {
    try {
      const token = localStorage.getItem("token");
      const res = await api.get("/notices", token);
      if (res.success && res.notices) {
        allNotices = res.notices;
        renderNotices();
      } else {
        renderEmpty("No announcements found.");
      }
    } catch (err) {
      renderError("Failed to load announcements from server: " + err.message);
    }
  }

  function renderNotices() {
    const grid = container.querySelector("#noticesGrid");
    if (!grid) return;
    grid.innerHTML = "";

    const filtered = allNotices.filter((n) => {
      const matchCat = currentCategory === "all" || n.category === currentCategory;
      const matchSearch =
        searchQuery === "" ||
        (n.title && n.title.toLowerCase().includes(searchQuery)) ||
        (n.description && n.description.toLowerCase().includes(searchQuery)) ||
        (n.author_name && n.author_name.toLowerCase().includes(searchQuery));
      return matchCat && matchSearch;
    });

    if (filtered.length === 0) {
      renderEmpty(
        searchQuery || currentCategory !== "all"
          ? "No notices match your current search/filter."
          : "No batch announcements posted yet. Be the first to share one!"
      );
      return;
    }

    filtered.forEach((notice) => {
      const card = document.createElement("div");
      card.className = "app-card";
      card.style.cursor = "pointer";

      const catBadgeClass =
        notice.category === "academic"
          ? "badge-emerald"
          : notice.category === "examination"
          ? "badge-danger"
          : notice.category === "event"
          ? "badge-info"
          : "badge-muted";

      const isPinned = Number(notice.is_pinned) === 1;
      const canManage = isCRorAdmin || (user.id && notice.created_by === user.id);

      const priorityBadge =
        notice.priority === "Urgent"
          ? '<span class="app-badge badge-danger">🔴 Urgent</span>'
          : notice.priority === "Important"
          ? '<span class="app-badge badge-warning">🟡 Important</span>'
          : "";

      card.innerHTML = `
        <div class="app-card-header">
          <div style="display: flex; flex-direction: column; gap: 6px; flex-grow: 1;">
            <div style="display: flex; gap: 8px; align-items: center; flex-wrap: wrap;">
              <span class="app-badge ${catBadgeClass}">${escapeHTML(notice.category || "general").toUpperCase()}</span>
              ${isPinned ? '<span class="app-badge badge-warning">📌 Pinned</span>' : ""}
              ${priorityBadge}
              <span class="app-badge badge-muted">Audience: ${escapeHTML(notice.target_audience || "all")}</span>
            </div>
            <h3 class="app-card-title">${escapeHTML(notice.title)}</h3>
          </div>
          ${
            canManage
              ? `
              <div style="display: flex; align-items: center; gap: 4px;" class="card-mgmt-actions">
                ${
                  isCRorAdmin
                    ? `<button class="pin-notice-btn" title="${isPinned ? "Unpin Notice" : "Pin Notice"}" data-id="${notice.id}" style="background: none; border: none; color: ${isPinned ? "var(--warning-orange)" : "var(--text-dim)"}; cursor: pointer; padding: 4px; border-radius: 4px;">
                        📌
                       </button>`
                    : ""
                }
                <button class="delete-notice-btn" title="Delete Notice" data-id="${notice.id}" style="background: none; border: none; color: var(--text-dim); cursor: pointer; padding: 4px; border-radius: 4px;">
                  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <polyline points="3 6 5 6 21 6"></polyline>
                    <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path>
                  </svg>
                </button>
              </div>
              `
              : ""
          }
        </div>

        <div class="app-card-body" style="white-space: pre-line; max-height: 120px; overflow: hidden; position: relative;">
          ${escapeHTML(notice.description)}
        </div>

        <div class="app-card-footer">
          <div style="display: flex; align-items: center; gap: 6px;">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path>
              <circle cx="12" cy="7" r="4"></circle>
            </svg>
            <span>${escapeHTML(notice.author_name || "Batch Representative")}</span>
          </div>
          <div style="display: flex; align-items: center; gap: 6px;">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect>
              <line x1="16" y1="2" x2="16" y2="6"></line>
              <line x1="8" y1="2" x2="8" y2="6"></line>
              <line x1="3" y1="10" x2="21" y2="10"></line>
            </svg>
            <span>${formatDate(notice.created_at)}</span>
          </div>
        </div>
      `;

      // Open detail view on card click
      card.onclick = (e) => {
        if (e.target.closest(".card-mgmt-actions")) return;
        openDetailModal(notice);
      };

      // Pin / Unpin button
      const pinBtn = card.querySelector(".pin-notice-btn");
      if (pinBtn) {
        pinBtn.onclick = async (e) => {
          e.stopPropagation();
          try {
            const token = localStorage.getItem("token");
            const res = await api.put(`/notices/${notice.id}/pin`, {}, token);
            showToast(res.message || "Pin status updated.", "success");
            fetchNotices();
          } catch (err) {
            showToast(err.message, "error");
          }
        };
      }

      // Delete Notice button
      const delBtn = card.querySelector(".delete-notice-btn");
      if (delBtn) {
        delBtn.onclick = async (e) => {
          e.stopPropagation();
          const confirmed = await confirmDialog({
            title: "Delete Announcement",
            message: `Are you sure you want to delete "${notice.title}"?`,
            confirmText: "Yes, Delete",
            isDanger: true,
          });
          if (!confirmed) return;

          try {
            const token = localStorage.getItem("token");
            const res = await api.delete(`/notices/${notice.id}`, token);
            showToast(res.message || "Announcement deleted.", "info");
            fetchNotices();
          } catch (err) {
            showToast(err.message, "error");
          }
        };
      }

      grid.appendChild(card);
    });
  }

  function openDetailModal(notice) {
    const modal = container.querySelector("#noticeDetailModal");
    if (!modal) return;

    container.querySelector("#detailTitle").textContent = notice.title;
    container.querySelector("#detailDescription").textContent = notice.description;
    container.querySelector("#detailAuthor").textContent = notice.author_name || "Batch Representative";
    container.querySelector("#detailDate").textContent = formatDate(notice.created_at);
    container.querySelector("#detailAudience").textContent = notice.target_audience || "all";

    const catBadge = container.querySelector("#detailCatBadge");
    catBadge.textContent = (notice.category || "general").toUpperCase();

    const priorityBadge = container.querySelector("#detailPriorityBadge");
    if (notice.priority && notice.priority !== "Normal") {
      priorityBadge.style.display = "inline-block";
      priorityBadge.textContent = notice.priority;
    } else {
      priorityBadge.style.display = "none";
    }

    const pinBadge = container.querySelector("#detailPinBadge");
    pinBadge.style.display = Number(notice.is_pinned) === 1 ? "inline-block" : "none";

    modal.classList.add("app-modal-open");
  }

  function renderEmpty(message) {
    const grid = container.querySelector("#noticesGrid");
    if (!grid) return;
    grid.innerHTML = `
      <div class="empty-state-box" style="grid-column: 1 / -1;">
        <div class="empty-state-icon">
          <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <path d="M18 8a3 3 0 0 0-3-3H5a2 2 0 0 0-2 2v8a2 2 0 0 0 2 2h10a3 3 0 0 0 3-3V8z"></path>
            <path d="M21 15V9"></path>
          </svg>
        </div>
        <h4 class="empty-state-title">No Announcements</h4>
        <p class="empty-state-desc">${escapeHTML(message)}</p>
      </div>
    `;
  }

  function renderError(message) {
    const grid = container.querySelector("#noticesGrid");
    if (!grid) return;
    grid.innerHTML = `
      <div class="empty-state-box" style="grid-column: 1 / -1; border-color: rgba(248, 113, 113, 0.4);">
        <div class="empty-state-icon" style="background: var(--danger-soft); color: var(--danger-red);">
          <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <circle cx="12" cy="12" r="10"></circle>
            <line x1="12" y1="8" x2="12" y2="12"></line>
            <line x1="12" y1="16" x2="12.01" y2="16"></line>
          </svg>
        </div>
        <h4 class="empty-state-title" style="color: var(--danger-red);">Error Loading Data</h4>
        <p class="empty-state-desc">${escapeHTML(message)}</p>
      </div>
    `;
  }

  setTimeout(() => {
    fetchNotices();

    // Category Tabs Filter
    container.querySelectorAll("#noticeCategoryTabs .filter-tab").forEach((tab) => {
      tab.onclick = () => {
        container
          .querySelectorAll("#noticeCategoryTabs .filter-tab")
          .forEach((t) => t.classList.remove("active"));
        tab.classList.add("active");
        currentCategory = tab.getAttribute("data-cat");
        renderNotices();
      };
    });

    // Search Input
    const searchInput = container.querySelector("#noticeSearchInput");
    if (searchInput) {
      searchInput.oninput = (e) => {
        searchQuery = e.target.value.trim().toLowerCase();
        renderNotices();
      };
    }

    // Modal open / close
    const modal = container.querySelector("#createNoticeModal");
    const openBtn = container.querySelector("#btnOpenCreateNoticeModal");
    const closeBtn = container.querySelector("#closeNoticeModalBtn");
    const cancelBtn = container.querySelector("#cancelNoticeModalBtn");
    const form = container.querySelector("#createNoticeForm");

    const openModal = () => modal && modal.classList.add("app-modal-open");
    const closeModal = () => modal && modal.classList.remove("app-modal-open");

    if (openBtn) openBtn.onclick = openModal;
    if (closeBtn) closeBtn.onclick = closeModal;
    if (cancelBtn) cancelBtn.onclick = closeModal;
    if (modal) {
      modal.onclick = (e) => {
        if (e.target === modal) closeModal();
      };
    }

    // Detail modal close
    const detailModal = container.querySelector("#noticeDetailModal");
    const closeDetailBtn = container.querySelector("#closeNoticeDetailBtn");
    const dismissDetailBtn = container.querySelector("#dismissDetailBtn");
    const closeDetail = () => detailModal && detailModal.classList.remove("app-modal-open");

    if (closeDetailBtn) closeDetailBtn.onclick = closeDetail;
    if (dismissDetailBtn) dismissDetailBtn.onclick = closeDetail;
    if (detailModal) {
      detailModal.onclick = (e) => {
        if (e.target === detailModal) closeDetail();
      };
    }

    // Submit Notice Form
    if (form) {
      form.onsubmit = async (e) => {
        e.preventDefault();
        const token = localStorage.getItem("token");
        const submitBtn = container.querySelector("#submitNoticeBtn");

        const payload = {
          title: container.querySelector("#noticeTitleInput").value.trim(),
          description: container.querySelector("#noticeDescInput").value.trim(),
          category: container.querySelector("#noticeCategoryInput").value,
          priority: container.querySelector("#noticePriorityInput").value,
          target_audience: container.querySelector("#noticeAudienceInput").value.trim() || "all",
          is_pinned: container.querySelector("#noticePinInput")?.checked ? 1 : 0,
        };

        try {
          if (submitBtn) {
            submitBtn.disabled = true;
            submitBtn.textContent = "Publishing...";
          }

          const res = await api.post("/notices", payload, token);
          if (res.success) {
            showToast("Announcement published successfully!", "success");
            closeModal();
            form.reset();
            fetchNotices();
          }
        } catch (err) {
          showToast(err.message, "error");
        } finally {
          if (submitBtn) {
            submitBtn.disabled = false;
            submitBtn.textContent = "Publish Announcement";
          }
        }
      };
    }
  }, 0);

  return container;
}
