import { api } from "../assets/js/api.js";
import { escapeHTML, showToast } from "../assets/js/uiUtils.js";

export function MembersView(navigate = null) {
  const container = document.createElement("div");
  container.className = "view-container";

  const currentUser = JSON.parse(localStorage.getItem("user")) || {
    batch: "2024",
    department: "CSE",
  };

  container.innerHTML = `
    <!-- Header -->
    <div class="view-header">
      <div class="view-title-group">
        <h2>Students & Batch Directory</h2>
        <p>Explore your peers, search batchmates by technical skill, and collaborate on semester projects.</p>
      </div>
      <div class="view-actions">
        <span class="app-badge badge-emerald">Batch: ${escapeHTML(currentUser.batch || "All")}</span>
        <span class="app-badge badge-muted">Dept: ${escapeHTML(currentUser.department || "CSE")}</span>
      </div>
    </div>

    <!-- Filter & Search Toolbar -->
    <div class="filter-toolbar">
      <div class="filter-search-box">
        <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" style="color: var(--text-dim); flex-shrink: 0;">
          <circle cx="11" cy="11" r="8"></circle>
          <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
        </svg>
        <input type="text" id="memberSearchInput" placeholder="Search by student name, ID, or skill (e.g. Python, React)...">
      </div>

      <div class="filter-tabs" id="memberFilterTabs">
        <button class="filter-tab active" data-filter="my-batch">My Batch</button>
        <button class="filter-tab" data-filter="all">All Students</button>
        <button class="filter-tab" data-filter="cr">CRs & Admins</button>
      </div>
    </div>

    <!-- Directory Grid -->
    <div id="membersGrid" class="app-cards-grid">
      <div class="skeleton-card"></div>
      <div class="skeleton-card"></div>
      <div class="skeleton-card"></div>
    </div>
  `;

  let allMembers = [];
  let filterScope = "my-batch";
  let searchQuery = "";

  async function fetchMembers() {
    try {
      const token = localStorage.getItem("token");
      const res = await api.get("/members", token);
      if (res.success && res.members) {
        allMembers = res.members;
        renderMembers();
      } else {
        renderEmpty("No students registered in the directory.");
      }
    } catch (err) {
      renderError("Failed to fetch students directory: " + err.message);
    }
  }

  function renderMembers() {
    const grid = container.querySelector("#membersGrid");
    if (!grid) return;
    grid.innerHTML = "";

    const filtered = allMembers.filter((m) => {
      // Scope filter
      let matchScope = true;
      if (filterScope === "my-batch") {
        matchScope = !currentUser.batch || m.batch === currentUser.batch;
      } else if (filterScope === "cr") {
        matchScope = m.role === "cr" || m.role === "admin";
      }

      // Search query
      const matchSearch =
        searchQuery === "" ||
        (m.name && m.name.toLowerCase().includes(searchQuery)) ||
        (m.student_id && m.student_id.toLowerCase().includes(searchQuery)) ||
        (m.skills && m.skills.toLowerCase().includes(searchQuery)) ||
        (m.email && m.email.toLowerCase().includes(searchQuery));

      return matchScope && matchSearch;
    });

    if (filtered.length === 0) {
      renderEmpty(
        searchQuery || filterScope !== "my-batch"
          ? "No students match your filter or search query."
          : "No students found in your batch directory."
      );
      return;
    }

    filtered.forEach((member) => {
      const card = document.createElement("div");
      card.className = "app-card";

      const defaultAvatar =
        "https://api.dicebear.com/7.x/bottts/svg?seed=" +
        encodeURIComponent(member.name || "Student");
      const avatar =
        member.profile_picture && member.profile_picture.trim() !== ""
          ? member.profile_picture
          : defaultAvatar;

      const roleBadgeClass =
        member.role === "admin"
          ? "badge-danger"
          : member.role === "cr"
          ? "badge-warning"
          : "badge-muted";

      // Split skills
      const skillPills = member.skills
        ? member.skills
            .split(",")
            .map((s) => s.trim())
            .filter(Boolean)
            .slice(0, 5)
            .map(
              (s) =>
                `<span class="app-badge badge-emerald" style="font-size: 11px; padding: 2px 7px;">${escapeHTML(s)}</span>`
            )
            .join(" ")
        : '<span style="color: var(--text-dim); font-size: 12px;">No skills listed</span>';

      card.innerHTML = `
        <div style="display: flex; gap: 14px; align-items: center;">
          <img src="${avatar}" alt="${escapeHTML(member.name)}" style="width: 50px; height: 50px; border-radius: 50%; object-fit: cover; background: #1a2f37; border: 2px solid var(--card-border); flex-shrink: 0;">
          <div style="display: flex; flex-direction: column; gap: 2px; flex-grow: 1; min-width: 0;">
            <div style="display: flex; align-items: center; justify-content: space-between; gap: 8px;">
              <h3 class="app-card-title" style="white-space: nowrap; overflow: hidden; text-overflow: ellipsis;">${escapeHTML(member.name)}</h3>
              <span class="app-badge ${roleBadgeClass}">${escapeHTML(member.role || "student").toUpperCase()}</span>
            </div>
            <p style="font-size: 12px; color: var(--text-muted);">${escapeHTML(member.department || "CSE")} • Batch: ${escapeHTML(member.batch || "N/A")}</p>
          </div>
        </div>

        <div style="display: flex; flex-direction: column; gap: 6px; font-size: 12.5px; color: var(--text-secondary); background: var(--card-inner); padding: 10px 12px; border-radius: var(--radius-sm); border: 1px solid var(--card-border);">
          <div><strong style="color: var(--text-muted);">ID:</strong> ${escapeHTML(member.student_id || "Not Assigned")}</div>
          <div style="white-space: nowrap; overflow: hidden; text-overflow: ellipsis;"><strong style="color: var(--text-muted);">Email:</strong> ${escapeHTML(member.email || "N/A")}</div>
        </div>

        <div style="display: flex; flex-direction: column; gap: 6px; flex-grow: 1;">
          <span style="font-size: 11.5px; font-weight: 600; color: var(--text-dim); text-transform: uppercase; letter-spacing: 0.5px;">Skills & Competencies</span>
          <div style="display: flex; flex-wrap: wrap; gap: 6px;">
            ${skillPills}
          </div>
        </div>

        <div class="app-card-footer" style="padding-top: 12px;">
          <button class="btn-secondary btn-sm select-teammate-btn" data-name="${escapeHTML(member.name)}" style="width: 100%; justify-content: center;">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <path d="M16 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path>
              <circle cx="8.5" cy="7" r="4"></circle>
              <line x1="20" y1="8" x2="20" y2="14"></line>
              <line x1="23" y1="11" x2="17" y2="11"></line>
            </svg>
            <span>Invite to Project</span>
          </button>
        </div>
      `;

      const selectBtn = card.querySelector(".select-teammate-btn");
      if (selectBtn) {
        selectBtn.onclick = () => {
          showToast(`Selected ${member.name}. Open Projects to invite them to a team!`, "info");
          if (navigate) navigate("projects");
        };
      }

      grid.appendChild(card);
    });
  }

  function renderEmpty(message) {
    const grid = container.querySelector("#membersGrid");
    if (!grid) return;
    grid.innerHTML = `
      <div class="empty-state-box" style="grid-column: 1 / -1;">
        <div class="empty-state-icon">
          <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path>
            <circle cx="9" cy="7" r="4"></circle>
          </svg>
        </div>
        <h4 class="empty-state-title">No Students Found</h4>
        <p class="empty-state-desc">${escapeHTML(message)}</p>
      </div>
    `;
  }

  function renderError(message) {
    const grid = container.querySelector("#membersGrid");
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
        <h4 class="empty-state-title" style="color: var(--danger-red);">Directory Error</h4>
        <p class="empty-state-desc">${escapeHTML(message)}</p>
      </div>
    `;
  }

  setTimeout(() => {
    fetchMembers();

    // Tabs
    container.querySelectorAll("#memberFilterTabs .filter-tab").forEach((tab) => {
      tab.onclick = () => {
        container
          .querySelectorAll("#memberFilterTabs .filter-tab")
          .forEach((t) => t.classList.remove("active"));
        tab.classList.add("active");
        filterScope = tab.getAttribute("data-filter");
        renderMembers();
      };
    });

    // Search
    const searchInput = container.querySelector("#memberSearchInput");
    if (searchInput) {
      searchInput.oninput = (e) => {
        searchQuery = e.target.value.trim().toLowerCase();
        renderMembers();
      };
    }
  }, 0);

  return container;
}
