import { api } from "../assets/js/api.js";
import { escapeHTML, formatDate, showToast } from "../assets/js/uiUtils.js";

export function ResourcesView(navigate = null) {
  const container = document.createElement("div");
  container.className = "view-container";

  const user = JSON.parse(localStorage.getItem("user")) || { role: "student" };
  const isCRorAdmin = user.role === "cr" || user.role === "admin";

  container.innerHTML = `
    <!-- Header -->
    <div class="view-header">
      <div class="view-title-group">
        <h2>Academic Resources & Study Materials</h2>
        <p>Curated course notes, slides, assignments, books, and previous examination questions.</p>
      </div>
      <div class="view-actions">
        <button class="btn-primary" id="btnOpenUploadModal">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5">
            <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path>
            <polyline points="17 8 12 3 7 8"></polyline>
            <line x1="12" y1="3" x2="12" y2="15"></line>
          </svg>
          <span>Upload Material</span>
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
        <input type="text" id="resourceSearchInput" placeholder="Search by title, course code (e.g. CSE-3201), or uploader...">
      </div>

      <div class="filter-tabs" id="resourceCategoryTabs">
        <button class="filter-tab active" data-cat="all">All</button>
        <button class="filter-tab" data-cat="Lecture Notes">Lecture Notes</button>
        <button class="filter-tab" data-cat="Assignment">Assignment</button>
        <button class="filter-tab" data-cat="Book">Books</button>
        <button class="filter-tab" data-cat="Question Bank">Question Bank</button>
      </div>
    </div>

    <!-- Resources Grid -->
    <div id="resourcesGrid" class="app-cards-grid">
      <div class="skeleton-card"></div>
      <div class="skeleton-card"></div>
      <div class="skeleton-card"></div>
    </div>

    <!-- Upload Resource Modal -->
    <div id="uploadResourceModal" class="app-modal-overlay">
      <div class="app-modal-dialog">
        <div class="app-modal-header">
          <h3>Upload Academic Resource</h3>
          <button class="app-modal-close" id="closeUploadModalBtn">✕</button>
        </div>
        <form id="uploadResourceForm">
          <div class="app-modal-body">
            <div class="form-group">
              <label class="form-label">Material Title *</label>
              <input type="text" id="resTitle" class="form-input" required placeholder="e.g., Operating Systems Chapter 3 - CPU Scheduling">
            </div>

            <div class="form-row">
              <div class="form-group">
                <label class="form-label">Course Code *</label>
                <input type="text" id="resCourse" class="form-input" required placeholder="e.g., CSE-3201 or General">
              </div>
              <div class="form-group">
                <label class="form-label">Category *</label>
                <select id="resCategory" class="form-select">
                  <option value="Lecture Notes">Lecture Notes</option>
                  <option value="Assignment">Assignment Solution</option>
                  <option value="Book">Reference Book</option>
                  <option value="Question Bank">Question Bank</option>
                  <option value="Other">Other Document</option>
                </select>
              </div>
            </div>

            <div class="form-group">
              <label class="form-label">File Link / Cloud Storage URL (Google Drive / GitHub / OneDrive) *</label>
              <input type="url" id="resUrl" class="form-input" required placeholder="https://drive.google.com/file/d/...">
            </div>

            ${
              !isCRorAdmin
                ? `<div style="font-size: 12px; color: var(--warning-orange); background: var(--warning-soft); padding: 8px 12px; border-radius: 8px; border: 1px solid rgba(251,191,36,0.25);">
                    Note: Student uploads require CR or Admin verification before appearing publicly.
                   </div>`
                : ""
            }
          </div>
          <div class="app-modal-footer">
            <button type="button" class="btn-secondary" id="cancelUploadModalBtn">Cancel</button>
            <button type="submit" class="btn-primary" id="btnSubmitResource">
              ${isCRorAdmin ? "Publish Resource" : "Submit for Verification"}
            </button>
          </div>
        </form>
      </div>
    </div>
  `;

  let allResources = [];
  let currentCategory = "all";
  let searchQuery = "";

  async function fetchResources() {
    try {
      const token = localStorage.getItem("token");
      const res = await api.get("/resources", token);
      if (res.success && res.materials) {
        allResources = res.materials;
        renderResources();
      } else {
        renderEmpty("No academic resources uploaded yet.");
      }
    } catch (err) {
      renderError("Failed to load study materials: " + err.message);
    }
  }

  function renderResources() {
    const grid = container.querySelector("#resourcesGrid");
    if (!grid) return;
    grid.innerHTML = "";

    const filtered = allResources.filter((m) => {
      const matchCat = currentCategory === "all" || m.category === currentCategory;
      const matchSearch =
        searchQuery === "" ||
        (m.title && m.title.toLowerCase().includes(searchQuery)) ||
        (m.course_code && m.course_code.toLowerCase().includes(searchQuery)) ||
        (m.uploader_name && m.uploader_name.toLowerCase().includes(searchQuery));
      return matchCat && matchSearch;
    });

    if (filtered.length === 0) {
      renderEmpty(
        searchQuery || currentCategory !== "all"
          ? "No materials match your current category or search."
          : "No study materials available yet."
      );
      return;
    }

    filtered.forEach((mat) => {
      const card = document.createElement("div");
      card.className = "app-card";

      const catBadge =
        mat.category === "Lecture Notes"
          ? "badge-emerald"
          : mat.category === "Book"
          ? "badge-info"
          : mat.category === "Question Bank"
          ? "badge-warning"
          : "badge-muted";

      card.innerHTML = `
        <div class="app-card-header">
          <div style="display: flex; gap: 8px; align-items: center; flex-wrap: wrap;">
            <span class="app-badge badge-muted">${escapeHTML(mat.course_code || "General")}</span>
            <span class="app-badge ${catBadge}">${escapeHTML(mat.category || "Lecture Notes")}</span>
            ${mat.status === "pending" ? '<span class="app-badge badge-warning">⏳ Pending</span>' : ""}
          </div>
        </div>

        <h3 class="app-card-title">${escapeHTML(mat.title)}</h3>

        <div class="app-card-body" style="font-size: 12.5px; color: var(--text-muted);">
          <div>Uploaded by: <strong style="color: var(--text-secondary);">${escapeHTML(mat.uploader_name || "Batch Member")}</strong></div>
          <div>Added on: ${formatDate(mat.created_at)}</div>
        </div>

        <div class="app-card-footer" style="padding-top: 14px;">
          <a href="${escapeHTML(mat.file_url)}" target="_blank" rel="noopener noreferrer" class="btn-primary btn-sm" style="width: 100%; justify-content: center; text-decoration: none;">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path>
              <polyline points="7 10 12 15 17 10"></polyline>
              <line x1="12" y1="15" x2="12" y2="3"></line>
            </svg>
            <span>Open & Download Document</span>
          </a>
        </div>
      `;

      grid.appendChild(card);
    });
  }

  function renderEmpty(message) {
    const grid = container.querySelector("#resourcesGrid");
    if (!grid) return;
    grid.innerHTML = `
      <div class="empty-state-box" style="grid-column: 1 / -1;">
        <div class="empty-state-icon">
          <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20"></path>
            <path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z"></path>
          </svg>
        </div>
        <h4 class="empty-state-title">No Resources Found</h4>
        <p class="empty-state-desc">${escapeHTML(message)}</p>
      </div>
    `;
  }

  function renderError(message) {
    const grid = container.querySelector("#resourcesGrid");
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
        <h4 class="empty-state-title" style="color: var(--danger-red);">Resource Library Error</h4>
        <p class="empty-state-desc">${escapeHTML(message)}</p>
      </div>
    `;
  }

  setTimeout(() => {
    fetchResources();

    // Category Tabs
    container.querySelectorAll("#resourceCategoryTabs .filter-tab").forEach((tab) => {
      tab.onclick = () => {
        container
          .querySelectorAll("#resourceCategoryTabs .filter-tab")
          .forEach((t) => t.classList.remove("active"));
        tab.classList.add("active");
        currentCategory = tab.getAttribute("data-cat");
        renderResources();
      };
    });

    // Search Input
    const searchInput = container.querySelector("#resourceSearchInput");
    if (searchInput) {
      searchInput.oninput = (e) => {
        searchQuery = e.target.value.trim().toLowerCase();
        renderResources();
      };
    }

    // Modal
    const modal = container.querySelector("#uploadResourceModal");
    const openBtn = container.querySelector("#btnOpenUploadModal");
    const closeBtn = container.querySelector("#closeUploadModalBtn");
    const cancelBtn = container.querySelector("#cancelUploadModalBtn");
    const form = container.querySelector("#uploadResourceForm");

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

    if (form) {
      form.onsubmit = async (e) => {
        e.preventDefault();
        const token = localStorage.getItem("token");
        const submitBtn = container.querySelector("#btnSubmitResource");

        const payload = {
          title: container.querySelector("#resTitle").value.trim(),
          course_code: container.querySelector("#resCourse").value.trim() || "General",
          category: container.querySelector("#resCategory").value,
          file_url: container.querySelector("#resUrl").value.trim(),
        };

        try {
          if (submitBtn) {
            submitBtn.disabled = true;
            submitBtn.textContent = "Uploading...";
          }

          const res = await api.post("/resources", payload, token);
          if (res.success) {
            showToast(res.message || "Resource uploaded successfully!", "success");
            closeModal();
            form.reset();
            fetchResources();
          }
        } catch (err) {
          showToast(err.message, "error");
        } finally {
          if (submitBtn) {
            submitBtn.disabled = false;
            submitBtn.textContent = isCRorAdmin ? "Publish Resource" : "Submit for Verification";
          }
        }
      };
    }
  }, 0);

  return container;
}
