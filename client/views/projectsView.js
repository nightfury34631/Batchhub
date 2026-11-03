import { api } from "../assets/js/api.js";
import { escapeHTML, formatDate, showToast, confirmDialog } from "../assets/js/uiUtils.js";

export function ProjectsView(navigate = null) {
  const container = document.createElement("div");
  container.className = "view-container";

  const user = JSON.parse(localStorage.getItem("user")) || {
    id: 1,
    department: "CSE",
  };

  container.innerHTML = `
    <!-- Header -->
    <div class="view-header">
      <div class="view-title-group">
        <h2>Batch Projects & Collaboration</h2>
        <p>Showcase semester projects, repositories, find teammates, and manage project collaboration requests.</p>
      </div>
      <div class="view-actions">
        <button class="btn-primary" id="btnOpenAddProjectModal">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5">
            <polygon points="12 2 2 7 12 12 22 7 12 2"></polygon>
            <polyline points="2 17 12 22 22 17"></polyline>
            <polyline points="2 12 12 17 22 12"></polyline>
          </svg>
          <span>Publish Project</span>
        </button>
      </div>
    </div>

    <!-- Incoming Join Requests Section (Only visible when user has pending requests on their projects) -->
    <div id="incomingRequestsSection" style="display: none; background: var(--card-bg); border: 1px solid var(--primary-mint-border); border-radius: var(--radius-card); padding: 20px 24px;">
      <div style="display: flex; align-items: center; justify-content: space-between; margin-bottom: 14px;">
        <div style="display: flex; align-items: center; gap: 8px;">
          <span class="app-badge badge-warning">Action Required</span>
          <h3 style="font-size: 15px; font-weight: 700; color: var(--text-primary);">Incoming Team Join Requests</h3>
        </div>
      </div>
      <div id="requestsList" style="display: flex; flex-direction: column; gap: 10px;"></div>
    </div>

    <!-- Toolbar -->
    <div class="filter-toolbar">
      <div class="filter-search-box">
        <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" style="color: var(--text-dim); flex-shrink: 0;">
          <circle cx="11" cy="11" r="8"></circle>
          <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
        </svg>
        <input type="text" id="projectSearchInput" placeholder="Search projects by title, tech stack (e.g. Node, MySQL), or creator...">
      </div>
    </div>

    <!-- Projects Grid -->
    <div id="projectsGrid" class="app-cards-grid">
      <div class="skeleton-card"></div>
      <div class="skeleton-card"></div>
      <div class="skeleton-card"></div>
    </div>

    <!-- Publish Project Modal -->
    <div id="addProjectModal" class="app-modal-overlay">
      <div class="app-modal-dialog">
        <div class="app-modal-header">
          <h3>Publish Batch Project</h3>
          <button class="app-modal-close" id="closeProjectModalBtn">✕</button>
        </div>
        <form id="addProjectForm">
          <div class="app-modal-body">
            <div class="form-group">
              <label class="form-label">Project Title *</label>
              <input type="text" id="pTitle" class="form-input" required placeholder="e.g., PeerShare - Academic Notes Exchange">
            </div>

            <div class="form-group">
              <label class="form-label">Tech Stack (comma separated) *</label>
              <input type="text" id="pTech" class="form-input" required placeholder="e.g., Node.js, Express, MySQL, CSS">
            </div>

            <div class="form-group">
              <label class="form-label">Current Team Members *</label>
              <input type="text" id="pMembers" class="form-input" required placeholder="e.g., ${escapeHTML(user.name || "Nokib")}, Mahathir">
            </div>

            <div class="form-group">
              <label class="form-label">Repository / Live Demo URL *</label>
              <input type="url" id="pRepo" class="form-input" required placeholder="https://github.com/username/project">
            </div>

            <div class="form-group">
              <label class="form-label">Project Description & Collaboration Goals</label>
              <textarea id="pDesc" class="form-textarea" rows="3" placeholder="Explain the project scope and what roles you are looking to recruit..."></textarea>
            </div>
          </div>
          <div class="app-modal-footer">
            <button type="button" class="btn-secondary" id="cancelProjectModalBtn">Cancel</button>
            <button type="submit" class="btn-primary" id="btnSubmitProject">Publish Project</button>
          </div>
        </form>
      </div>
    </div>
  `;

  let allProjects = [];
  let searchQuery = "";

  async function fetchProjectsData() {
    try {
      const token = localStorage.getItem("token");
      const res = await api.get("/projects", token);
      if (res.success) {
        allProjects = res.projects || [];
        renderProjects();
        renderIncomingRequests(res.incomingRequests || []);
      }
    } catch (err) {
      renderError("Failed to fetch project listings: " + err.message);
    }
  }

  function renderIncomingRequests(requests) {
    const section = container.querySelector("#incomingRequestsSection");
    const list = container.querySelector("#requestsList");
    if (!section || !list) return;
    list.innerHTML = "";

    if (!requests || requests.length === 0) {
      section.style.display = "none";
      return;
    }

    section.style.display = "block";
    requests.forEach((req) => {
      const item = document.createElement("div");
      item.style.cssText =
        "display: flex; justify-content: space-between; align-items: center; background: var(--card-inner); padding: 12px 16px; border-radius: var(--radius-sm); border: 1px solid var(--card-border); gap: 14px; flex-wrap: wrap;";
      item.innerHTML = `
        <div style="font-size: 13.5px; color: var(--text-primary);">
          <strong>${escapeHTML(req.requester_name)}</strong> requested to join 
          <span style="color: var(--primary-mint); font-weight: 600;">${escapeHTML(req.project_title)}</span>
        </div>
        <div style="display: flex; gap: 8px;">
          <button class="btn-primary btn-sm approve-req-btn" data-id="${req.request_id}">Approve</button>
          <button class="btn-danger btn-sm reject-req-btn" data-id="${req.request_id}">Decline</button>
        </div>
      `;

      item.querySelector(".approve-req-btn").onclick = async () => {
        try {
          const token = localStorage.getItem("token");
          const res = await api.put(`/projects/requests/${req.request_id}/approve`, {}, token);
          showToast(res.message || "Request approved and member added!", "success");
          fetchProjectsData();
        } catch (err) {
          showToast(err.message, "error");
        }
      };

      item.querySelector(".reject-req-btn").onclick = async () => {
        const confirmed = await confirmDialog({
          title: "Decline Request",
          message: `Decline join request from ${req.requester_name}?`,
          confirmText: "Yes, Decline",
          isDanger: true,
        });
        if (!confirmed) return;

        try {
          const token = localStorage.getItem("token");
          const res = await api.delete(`/projects/requests/${req.request_id}/reject`, token);
          showToast(res.message || "Request declined.", "info");
          fetchProjectsData();
        } catch (err) {
          showToast(err.message, "error");
        }
      };

      list.appendChild(item);
    });
  }

  function renderProjects() {
    const grid = container.querySelector("#projectsGrid");
    if (!grid) return;
    grid.innerHTML = "";

    const filtered = allProjects.filter((p) => {
      return (
        searchQuery === "" ||
        (p.title && p.title.toLowerCase().includes(searchQuery)) ||
        (p.tech_stack && p.tech_stack.toLowerCase().includes(searchQuery)) ||
        (p.publisher_name && p.publisher_name.toLowerCase().includes(searchQuery)) ||
        (p.description && p.description.toLowerCase().includes(searchQuery))
      );
    });

    if (filtered.length === 0) {
      renderEmpty(
        searchQuery
          ? "No projects match your search query."
          : "No projects published yet. Click Publish Project to showcase your team's work!"
      );
      return;
    }

    filtered.forEach((p) => {
      const card = document.createElement("div");
      card.className = "app-card";

      const isOwner = p.created_by === user.id;

      // Tech stack badges
      const techPills = p.tech_stack
        ? p.tech_stack
            .split(",")
            .map((t) => t.trim())
            .filter(Boolean)
            .map(
              (t) =>
                `<span class="app-badge badge-emerald" style="font-size: 11px;">${escapeHTML(t)}</span>`
            )
            .join(" ")
        : "";

      card.innerHTML = `
        <div class="app-card-header">
          <div style="display: flex; flex-direction: column; gap: 4px; flex-grow: 1;">
            <div style="display: flex; gap: 8px; align-items: center; flex-wrap: wrap;">
              <span class="app-badge badge-muted">${escapeHTML(p.department || "CSE")}</span>
              ${isOwner ? '<span class="app-badge badge-info">Your Project</span>' : ""}
            </div>
            <h3 class="app-card-title">${escapeHTML(p.title)}</h3>
          </div>
        </div>

        <div class="app-card-body">
          <p>${escapeHTML(p.description || "No project description provided.")}</p>
          
          <div style="margin-top: 10px; display: flex; flex-direction: column; gap: 8px;">
            <div style="display: flex; flex-wrap: wrap; gap: 6px;">
              ${techPills}
            </div>

            <div style="font-size: 12.5px; color: var(--text-muted); background: var(--card-inner); padding: 8px 12px; border-radius: var(--radius-sm); border: 1px solid var(--card-border);">
              👥 <strong>Team:</strong> ${escapeHTML(p.team_members || "Solo")}
            </div>
          </div>
        </div>

        <div class="app-card-footer" style="padding-top: 14px; gap: 10px;">
          <a href="${escapeHTML(p.repo_url)}" target="_blank" rel="noopener noreferrer" class="btn-secondary btn-sm" style="flex-grow: 1; justify-content: center; text-decoration: none;">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <path d="M9 19c-5 1.5-5-2.5-7-3m14 6v-3.87a3.37 3.37 0 0 0-.94-2.61c3.14-.35 6.44-1.54 6.44-7A5.44 5.44 0 0 0 20 4.77 5.07 5.07 0 0 0 19.91 1S18.73.65 16 2.48a13.38 13.38 0 0 0-7 0C6.27.65 5.09 1 5.09 1A5.07 5.07 0 0 0 5 4.77a5.44 5.44 0 0 0-1.5 3.78c0 5.42 3.3 6.61 6.44 7A3.37 3.37 0 0 0 9 18.13V22"></path>
            </svg>
            <span>GitHub / Repo</span>
          </a>

          ${
            !isOwner
              ? `<button class="btn-primary btn-sm join-project-btn" data-id="${p.id}">
                  <span>Join Team</span>
                 </button>`
              : ""
          }
        </div>
      `;

      const joinBtn = card.querySelector(".join-project-btn");
      if (joinBtn) {
        joinBtn.onclick = async () => {
          try {
            const token = localStorage.getItem("token");
            joinBtn.disabled = true;
            joinBtn.textContent = "Sending...";
            const res = await api.post(`/projects/${p.id}/join`, {}, token);
            showToast(res.message || "Join request sent to project owner!", "success");
            joinBtn.textContent = "Requested";
          } catch (err) {
            showToast(err.message, "error");
            joinBtn.disabled = false;
            joinBtn.textContent = "Join Team";
          }
        };
      }

      grid.appendChild(card);
    });
  }

  function renderEmpty(message) {
    const grid = container.querySelector("#projectsGrid");
    if (!grid) return;
    grid.innerHTML = `
      <div class="empty-state-box" style="grid-column: 1 / -1;">
        <div class="empty-state-icon">
          <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <polygon points="12 2 2 7 12 12 22 7 12 2"></polygon>
            <polyline points="2 17 12 22 22 17"></polyline>
            <polyline points="2 12 12 17 22 12"></polyline>
          </svg>
        </div>
        <h4 class="empty-state-title">No Projects Listed</h4>
        <p class="empty-state-desc">${escapeHTML(message)}</p>
      </div>
    `;
  }

  function renderError(message) {
    const grid = container.querySelector("#projectsGrid");
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
        <h4 class="empty-state-title" style="color: var(--danger-red);">Error Loading Projects</h4>
        <p class="empty-state-desc">${escapeHTML(message)}</p>
      </div>
    `;
  }

  setTimeout(() => {
    fetchProjectsData();

    // Search
    const searchInput = container.querySelector("#projectSearchInput");
    if (searchInput) {
      searchInput.oninput = (e) => {
        searchQuery = e.target.value.trim().toLowerCase();
        renderProjects();
      };
    }

    // Modal
    const modal = container.querySelector("#addProjectModal");
    const openBtn = container.querySelector("#btnOpenAddProjectModal");
    const closeBtn = container.querySelector("#closeProjectModalBtn");
    const cancelBtn = container.querySelector("#cancelProjectModalBtn");
    const form = container.querySelector("#addProjectForm");

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
        const submitBtn = container.querySelector("#btnSubmitProject");

        const payload = {
          title: container.querySelector("#pTitle").value.trim(),
          tech_stack: container.querySelector("#pTech").value.trim(),
          team_members: container.querySelector("#pMembers").value.trim(),
          repo_url: container.querySelector("#pRepo").value.trim(),
          description: container.querySelector("#pDesc").value.trim(),
          department: user.department || "CSE",
        };

        try {
          if (submitBtn) {
            submitBtn.disabled = true;
            submitBtn.textContent = "Publishing...";
          }

          const res = await api.post("/projects", payload, token);
          if (res.success) {
            showToast(res.message || "Project published successfully!", "success");
            closeModal();
            form.reset();
            fetchProjectsData();
          }
        } catch (err) {
          showToast(err.message, "error");
        } finally {
          if (submitBtn) {
            submitBtn.disabled = false;
            submitBtn.textContent = "Publish Project";
          }
        }
      };
    }
  }, 0);

  return container;
}
