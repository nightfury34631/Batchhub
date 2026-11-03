import { api } from "../assets/js/api.js";
import { escapeHTML, formatDate, showToast } from "../assets/js/uiUtils.js";

export function AnnouncementsView(navigate = null) {
  const container = document.createElement("div");
  container.className = "view-container";

  const user = JSON.parse(localStorage.getItem("user")) || { role: "student" };
  const canCreate = user.role === "cr" || user.role === "admin" || true; // All students / contributors or CR/Admin can post notices per noticeController

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
      <!-- Loading skeletons -->
      <div class="skeleton-card"></div>
      <div class="skeleton-card"></div>
      <div class="skeleton-card"></div>
    </div>

    <!-- Create Announcement Modal -->
    <div id="createNoticeModal" class="app-modal-overlay">
      <div class="app-modal-dialog">
        <div class="app-modal-header">
          <h3>Create New Announcement</h3>
          <button class="app-modal-close" id="closeNoticeModalBtn">✕</button>
        </div>
        <form id="createNoticeForm">
          <div class="app-modal-body">
            <div class="form-group">
              <label class="form-label">Announcement Title *</label>
              <input type="text" id="noticeTitleInput" class="form-input" required placeholder="e.g., Final-Year Project Proposal Guidelines">
            </div>

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
              <label class="form-label">Target Audience</label>
              <input type="text" id="noticeAudienceInput" class="form-input" value="all" placeholder="e.g., all, 3rd Year, Section A">
            </div>

            <div class="form-group">
              <label class="form-label">Description / Announcement Body *</label>
              <textarea id="noticeDescInput" class="form-textarea" rows="4" required placeholder="Provide clear instructions, links, or submission details..."></textarea>
            </div>
          </div>
          <div class="app-modal-footer">
            <button type="button" class="btn-secondary" id="cancelNoticeModalBtn">Cancel</button>
            <button type="submit" class="btn-primary" id="submitNoticeBtn">Publish Notice</button>
          </div>
        </form>
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

    filtered.forEach((notice, index) => {
      const card = document.createElement("div");
      card.className = "app-card";

      const catBadgeClass =
        notice.category === "academic"
          ? "badge-emerald"
          : notice.category === "examination"
          ? "badge-danger"
          : notice.category === "event"
          ? "badge-info"
          : "badge-muted";

      const isFirst = index === 0;

      card.innerHTML = `
        <div class="app-card-header">
          <div style="display: flex; flex-direction: column; gap: 6px; flex-grow: 1;">
            <div style="display: flex; gap: 8px; align-items: center; flex-wrap: wrap;">
              <span class="app-badge ${catBadgeClass}">${escapeHTML(notice.category || "general").toUpperCase()}</span>
              ${
                isFirst
                  ? '<span class="app-badge badge-warning">📌 Pinned</span>'
                  : ""
              }
              <span class="app-badge badge-muted">Audience: ${escapeHTML(notice.target_audience || "all")}</span>
            </div>
            <h3 class="app-card-title">${escapeHTML(notice.title)}</h3>
          </div>
        </div>

        <div class="app-card-body" style="white-space: pre-line;">
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

      grid.appendChild(card);
    });
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

  // Interactivity Handlers
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

    const openModal = () => {
      if (modal) modal.classList.add("app-modal-open");
    };
    const closeModal = () => {
      if (modal) modal.classList.remove("app-modal-open");
    };

    if (openBtn) openBtn.onclick = openModal;
    if (closeBtn) closeBtn.onclick = closeModal;
    if (cancelBtn) cancelBtn.onclick = closeModal;
    if (modal) {
      modal.onclick = (e) => {
        if (e.target === modal) closeModal();
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
          target_audience: container.querySelector("#noticeAudienceInput").value.trim() || "all",
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
            submitBtn.textContent = "Publish Notice";
          }
        }
      };
    }
  }, 0);

  return container;
}

