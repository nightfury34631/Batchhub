import { api } from "../assets/js/api.js";
import { escapeHTML, formatDate, formatTime, showToast } from "../assets/js/uiUtils.js";

export function EventsView(navigate = null) {
  const container = document.createElement("div");
  container.className = "view-container";

  const user = JSON.parse(localStorage.getItem("user")) || {
    role: "student",
    department: "CSE",
  };
  const isCRorAdmin = user.role === "cr" || user.role === "admin";

  container.innerHTML = `
    <!-- Header -->
    <div class="view-header">
      <div class="view-title-group">
        <h2>Department & Campus Events</h2>
        <p>Explore upcoming seminars, coding hackathons, workshops, and student activities.</p>
      </div>
      <div class="view-actions">
        <button class="btn-primary" id="btnOpenCreateEventModal">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5">
            <line x1="12" y1="5" x2="12" y2="19"></line>
            <line x1="5" y1="12" x2="19" y2="12"></line>
          </svg>
          <span>${isCRorAdmin ? "Publish Event" : "Suggest Event"}</span>
        </button>
      </div>
    </div>

    <!-- Toolbar -->
    <div class="filter-toolbar">
      <div class="filter-search-box">
        <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" style="color: var(--text-dim); flex-shrink: 0;">
          <circle cx="11" cy="11" r="8"></circle>
          <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
        </svg>
        <input type="text" id="eventSearchInput" placeholder="Search events by title, location, or organizer...">
      </div>

      <div class="filter-tabs" id="eventFilterTabs">
        <button class="filter-tab active" data-filter="all">All Events</button>
        <button class="filter-tab" data-filter="approved">Approved</button>
        <button class="filter-tab" data-filter="pending">Pending</button>
      </div>
    </div>

    <!-- Events Grid -->
    <div id="eventsGrid" class="app-cards-grid">
      <div class="skeleton-card"></div>
      <div class="skeleton-card"></div>
      <div class="skeleton-card"></div>
    </div>

    <!-- Create Event Modal -->
    <div id="createEventModal" class="app-modal-overlay">
      <div class="app-modal-dialog">
        <div class="app-modal-header">
          <h3>${isCRorAdmin ? "Publish Campus Event" : "Suggest Event (Requires CR Approval)"}</h3>
          <button class="app-modal-close" id="closeEventModalBtn">✕</button>
        </div>
        <form id="createEventForm">
          <div class="app-modal-body">
            <div class="form-group">
              <label class="form-label">Event Title *</label>
              <input type="text" id="evTitle" class="form-input" required placeholder="e.g., Algorithmic Coding Contest 2026">
            </div>

            <div class="form-row">
              <div class="form-group">
                <label class="form-label">Location / Room *</label>
                <input type="text" id="evLocation" class="form-input" required placeholder="e.g., Lab-3, CSE Building">
              </div>
              <div class="form-group">
                <label class="form-label">Department *</label>
                <input type="text" id="evDept" class="form-input" value="${escapeHTML(user.department || "CSE")}" required>
              </div>
            </div>

            <div class="form-group">
              <label class="form-label">Event Date & Time *</label>
              <input type="datetime-local" id="evDate" class="form-input" required>
            </div>

            <div class="form-group">
              <label class="form-label">Event Description & Guidelines</label>
              <textarea id="evDesc" class="form-textarea" rows="3" placeholder="Provide registration details, eligibility, or event agenda..."></textarea>
            </div>
          </div>
          <div class="app-modal-footer">
            <button type="button" class="btn-secondary" id="cancelEventModalBtn">Cancel</button>
            <button type="submit" class="btn-primary" id="btnSubmitEvent">
              ${isCRorAdmin ? "Publish Event" : "Submit for Approval"}
            </button>
          </div>
        </form>
      </div>
    </div>
  `;

  let allEvents = [];
  let filterStatus = "all";
  let searchQuery = "";

  async function fetchEvents() {
    try {
      const token = localStorage.getItem("token");
      const res = await api.get("/events", token);
      if (res.success && res.events) {
        allEvents = res.events;
        renderEvents();
      } else {
        renderEmpty("No events scheduled at this time.");
      }
    } catch (err) {
      renderError("Failed to load events: " + err.message);
    }
  }

  function renderEvents() {
    const grid = container.querySelector("#eventsGrid");
    if (!grid) return;
    grid.innerHTML = "";

    const filtered = allEvents.filter((ev) => {
      const matchStatus =
        filterStatus === "all" ||
        (filterStatus === "approved" && ev.status === "approved") ||
        (filterStatus === "pending" && ev.status === "pending");

      const matchSearch =
        searchQuery === "" ||
        (ev.title && ev.title.toLowerCase().includes(searchQuery)) ||
        (ev.location && ev.location.toLowerCase().includes(searchQuery)) ||
        (ev.organizer_name && ev.organizer_name.toLowerCase().includes(searchQuery));

      return matchStatus && matchSearch;
    });

    if (filtered.length === 0) {
      renderEmpty(
        searchQuery || filterStatus !== "all"
          ? "No events match your current filter criteria."
          : "No upcoming campus events found."
      );
      return;
    }

    filtered.forEach((ev) => {
      const card = document.createElement("div");
      card.className = "app-card";

      const isPending = ev.status === "pending";
      const statusBadge = isPending
        ? '<span class="app-badge badge-warning">⏳ Pending Approval</span>'
        : '<span class="app-badge badge-emerald">✓ Approved</span>';

      let monthStr = "EVENT";
      let dayStr = "•";
      let timeStr = "";
      try {
        const d = new Date(ev.event_date);
        monthStr = d.toLocaleString("default", { month: "short" }).toUpperCase();
        dayStr = d.getDate();
        timeStr = d.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
      } catch (e) {}

      card.innerHTML = `
        <div class="app-card-header">
          <div style="display: flex; gap: 14px; align-items: flex-start; flex-grow: 1;">
            <div style="background: var(--card-inner); border: 1px solid var(--card-border); border-radius: var(--radius-sm); padding: 8px 12px; text-align: center; min-width: 52px; flex-shrink: 0;">
              <div style="font-size: 11px; font-weight: 700; color: var(--primary-mint);">${monthStr}</div>
              <div style="font-size: 20px; font-weight: 800; color: var(--text-primary);">${dayStr}</div>
            </div>
            <div style="display: flex; flex-direction: column; gap: 4px; flex-grow: 1;">
              <div style="display: flex; gap: 8px; align-items: center; flex-wrap: wrap;">
                ${statusBadge}
                <span class="app-badge badge-muted">${escapeHTML(ev.department || "CSE")}</span>
              </div>
              <h3 class="app-card-title">${escapeHTML(ev.title)}</h3>
            </div>
          </div>
        </div>

        <div class="app-card-body">
          <p>${escapeHTML(ev.description || "No specific guidelines provided for this event.")}</p>
          <div style="margin-top: 12px; display: flex; flex-direction: column; gap: 6px; font-size: 12.5px; color: var(--text-secondary);">
            <div style="display: flex; align-items: center; gap: 8px;">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" style="color: var(--primary-mint);">
                <circle cx="12" cy="12" r="10"></circle>
                <polyline points="12 6 12 12 16 14"></polyline>
              </svg>
              <span><strong>Time:</strong> ${escapeHTML(timeStr)}</span>
            </div>
            <div style="display: flex; align-items: center; gap: 8px;">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" style="color: var(--primary-mint);">
                <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"></path>
                <circle cx="12" cy="10" r="3"></circle>
              </svg>
              <span><strong>Venue:</strong> ${escapeHTML(ev.location)}</span>
            </div>
          </div>
        </div>

        <div class="app-card-footer">
          <div style="display: flex; align-items: center; gap: 6px;">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path>
              <circle cx="12" cy="7" r="4"></circle>
            </svg>
            <span>Organized by: ${escapeHTML(ev.organizer_name || "Faculty / CR")}</span>
          </div>
          <div>
            <span>${formatDate(ev.event_date)}</span>
          </div>
        </div>
      `;

      grid.appendChild(card);
    });
  }

  function renderEmpty(message) {
    const grid = container.querySelector("#eventsGrid");
    if (!grid) return;
    grid.innerHTML = `
      <div class="empty-state-box" style="grid-column: 1 / -1;">
        <div class="empty-state-icon">
          <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect>
            <line x1="16" y1="2" x2="16" y2="6"></line>
            <line x1="8" y1="2" x2="8" y2="6"></line>
            <line x1="3" y1="10" x2="21" y2="10"></line>
          </svg>
        </div>
        <h4 class="empty-state-title">No Events Found</h4>
        <p class="empty-state-desc">${escapeHTML(message)}</p>
      </div>
    `;
  }

  function renderError(message) {
    const grid = container.querySelector("#eventsGrid");
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
        <h4 class="empty-state-title" style="color: var(--danger-red);">Unable to Load Events</h4>
        <p class="empty-state-desc">${escapeHTML(message)}</p>
      </div>
    `;
  }

  // Interactivity Handlers
  setTimeout(() => {
    fetchEvents();

    // Status Filter Tabs
    container.querySelectorAll("#eventFilterTabs .filter-tab").forEach((tab) => {
      tab.onclick = () => {
        container
          .querySelectorAll("#eventFilterTabs .filter-tab")
          .forEach((t) => t.classList.remove("active"));
        tab.classList.add("active");
        filterStatus = tab.getAttribute("data-filter");
        renderEvents();
      };
    });

    // Search input
    const searchInput = container.querySelector("#eventSearchInput");
    if (searchInput) {
      searchInput.oninput = (e) => {
        searchQuery = e.target.value.trim().toLowerCase();
        renderEvents();
      };
    }

    // Modal
    const modal = container.querySelector("#createEventModal");
    const openBtn = container.querySelector("#btnOpenCreateEventModal");
    const closeBtn = container.querySelector("#closeEventModalBtn");
    const cancelBtn = container.querySelector("#cancelEventModalBtn");
    const form = container.querySelector("#createEventForm");

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
        const submitBtn = container.querySelector("#btnSubmitEvent");

        const payload = {
          title: container.querySelector("#evTitle").value.trim(),
          location: container.querySelector("#evLocation").value.trim(),
          department: container.querySelector("#evDept").value.trim() || "CSE",
          event_date: container.querySelector("#evDate").value,
          description: container.querySelector("#evDesc").value.trim(),
        };

        try {
          if (submitBtn) {
            submitBtn.disabled = true;
            submitBtn.textContent = "Submitting...";
          }

          const res = await api.post("/events", payload, token);
          if (res.success) {
            showToast(res.message || "Event saved successfully!", "success");
            closeModal();
            form.reset();
            fetchEvents();
          }
        } catch (err) {
          showToast(err.message, "error");
        } finally {
          if (submitBtn) {
            submitBtn.disabled = false;
            submitBtn.textContent = isCRorAdmin ? "Publish Event" : "Submit for Approval";
          }
        }
      };
    }
  }, 0);

  return container;
}
