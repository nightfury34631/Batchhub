import { api } from "../assets/js/api.js";
import { escapeHTML, formatDate, showToast } from "../assets/js/uiUtils.js";

export function Topbar(currentView = "Dashboard", navigate = null) {
  const user = JSON.parse(localStorage.getItem("user")) || {
    id: 0,
    name: "Student",
    role: "student",
    batch: "2024",
    department: "CSE",
  };

  const isStaff = user.role === "cr" || user.role === "admin";

  const randomDefaultAvatar =
    "https://api.dicebear.com/7.x/bottts/svg?seed=" +
    encodeURIComponent(user.name || "Student");
  const avatarUrl =
    user.profile_picture && user.profile_picture.trim() !== ""
      ? user.profile_picture
      : randomDefaultAvatar;

  const viewTitles = {
    dashboard: "Dashboard",
    members: "Students",
    events: "Events",
    announcements: "Announcements",
    resources: "Resources",
    tasks: "Tasks & Deadlines",
    projects: "Projects",
    profile: "Settings",
    "cr-panel": "CR Panel",
  };

  const title = viewTitles[currentView] || "Dashboard";

  const header = document.createElement("header");
  header.className = "topbar topbar-v2";
  header.innerHTML = `
    <!-- Left Section: Mobile Menu Toggle + Breadcrumb -->
    <div class="topbar-left">
      <button class="mobile-menu-btn" id="mobileMenuBtn" aria-label="Toggle Navigation Menu">
        <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
          <line x1="3" y1="12" x2="21" y2="12"></line>
          <line x1="3" y1="6" x2="21" y2="6"></line>
          <line x1="3" y1="18" x2="21" y2="18"></line>
        </svg>
      </button>

      <div class="topbar-breadcrumb" id="topbarHomeLink" style="cursor: pointer;">
        <div class="breadcrumb-header">
          <svg class="home-icon" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"></path>
            <polyline points="9 22 9 12 15 12 15 22"></polyline>
          </svg>
          <span class="breadcrumb-text">${escapeHTML(title)}</span>
        </div>
        <div class="breadcrumb-active-bar"></div>
      </div>
    </div>
    
    <!-- Center Section: Real Global Cross-Module Search -->
    <div class="topbar-center">
      <div class="topbar-search-box">
        <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="color: var(--text-dim); flex-shrink: 0;">
          <circle cx="11" cy="11" r="8"></circle>
          <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
        </svg>
        <input type="text" id="topbarSearchInput" placeholder="Search students, events, announcements..." aria-label="Global Search" autocomplete="off">
        <span class="kbd-badge">Ctrl + K</span>
      </div>

      <!-- Floating Live Search Dropdown -->
      <div id="topbarSearchDropdown" class="global-search-dropdown" style="display: none;">
        <div id="searchDropdownContent"></div>
      </div>
    </div>

    <!-- Right Section: Create Button + Calendar + Notifications + Profile -->
    <div class="topbar-right">
      <!-- + Create Button with Dropdown -->
      <div style="position: relative;">
        <button class="btn-create-pill" id="btnCreateAction" aria-haspopup="true" aria-expanded="false">
          <span style="font-size: 16px; font-weight: bold; line-height: 1;">+</span>
          <span>Create</span>
          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
            <polyline points="6 9 12 15 18 9"></polyline>
          </svg>
        </button>
        <div id="createDropdownMenu" class="create-dropdown" style="display: none;">
          <div class="create-dropdown-item" data-action="new-announcement">
            <span>📢 New Announcement</span>
          </div>
          <div class="create-dropdown-item" data-action="new-event">
            <span>📅 New Event</span>
          </div>
          <div class="create-dropdown-item" data-action="new-task">
            <span>📋 New Task / Deadline</span>
          </div>
          <div class="create-dropdown-item" data-action="new-resource">
            <span>🗄️ Upload Resource</span>
          </div>
          <div class="create-dropdown-item" data-action="new-project">
            <span>🚀 Publish Project</span>
          </div>
        </div>
      </div>

      <!-- Calendar Quick Shortcut -->
      <button class="icon-btn" id="calQuickBtn" title="Calendar & Events">
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
          <rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect>
          <line x1="16" y1="2" x2="16" y2="6"></line>
          <line x1="8" y1="2" x2="8" y2="6"></line>
          <line x1="3" y1="10" x2="21" y2="10"></line>
        </svg>
      </button>

      <!-- Real Notification Center Dropdown -->
      <div style="position: relative;">
        <button class="icon-btn" id="notifQuickBtn" title="Notification Center" aria-haspopup="true">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"></path>
            <path d="M13.73 21a2 2 0 0 1-3.46 0"></path>
          </svg>
          <span class="notification-count-badge" id="topbarNotifBadge" style="display: none;">0</span>
        </button>

        <!-- Notification Center Pane -->
        <div id="notificationsDropdownPane" class="notifications-dropdown" style="display: none;">
          <div class="notif-dropdown-header">
            <div class="notif-dropdown-title">
              <span>Notifications</span>
              <span id="notifUnreadBadge" class="app-badge badge-warning" style="display: none; padding: 2px 7px; font-size: 11px;">0 unread</span>
            </div>
            <button class="notif-mark-all-btn" id="btnMarkAllRead">Mark all read</button>
          </div>
          <div class="notif-dropdown-list" id="notifDropdownList">
            <div style="padding: 24px; text-align: center; color: var(--text-muted); font-size: 12.5px;">
              Loading notifications...
            </div>
          </div>
        </div>
      </div>

      <!-- User Profile Menu -->
      <div style="position: relative;">
        <div class="user-profile-badge" id="topbarProfileBtn" title="User Account Menu" tabindex="0">
          <img src="${avatarUrl}" alt="Avatar" id="topbarUserAvatar">
          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" style="color: var(--text-muted); margin-left: 2px;">
            <polyline points="6 9 12 15 18 9"></polyline>
          </svg>
        </div>
        <div id="userMenuDropdown" class="user-menu-dropdown" style="display: none;">
          <div class="user-menu-header">
            <div class="user-menu-name" id="topbarUserName">${escapeHTML(user.name || "Student")}</div>
            <div class="user-menu-role">${escapeHTML(user.role || "student")} • ${escapeHTML(user.batch || "Batch")}</div>
          </div>
          <div class="user-menu-item" id="menuItemProfile">
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <circle cx="12" cy="12" r="3"></circle>
              <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z"></path>
            </svg>
            <span>Settings & Profile</span>
          </div>
          <div class="user-menu-item logout" id="menuItemLogout">
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"></path>
              <polyline points="16 17 21 12 16 7"></polyline>
              <line x1="21" y1="12" x2="9" y2="12"></line>
            </svg>
            <span>Log Out</span>
          </div>
        </div>
      </div>
    </div>

    <!-- Quick Action Modal Container -->
    <div id="topbarActionModal" class="app-modal-overlay">
      <div class="app-modal-dialog">
        <div class="app-modal-header">
          <h3 id="topbarModalTitle">Quick Action</h3>
          <button class="app-modal-close" id="closeTopbarModalBtn">✕</button>
        </div>
        <div id="topbarModalBody"></div>
      </div>
    </div>
  `;

  setTimeout(() => {
    const token = localStorage.getItem("token");

    // Close all popups helper
    const searchDropdown = header.querySelector("#topbarSearchDropdown");
    const createMenu = header.querySelector("#createDropdownMenu");
    const notifPane = header.querySelector("#notificationsDropdownPane");
    const userMenu = header.querySelector("#userMenuDropdown");

    function closeAllDropdowns() {
      if (searchDropdown) searchDropdown.style.display = "none";
      if (createMenu) createMenu.style.display = "none";
      if (notifPane) notifPane.style.display = "none";
      if (userMenu) userMenu.style.display = "none";
    }

    document.addEventListener("click", () => {
      closeAllDropdowns();
    });

    // Prevent closing when clicking inside menus
    [createMenu, notifPane, userMenu, searchDropdown].forEach((el) => {
      if (el) el.onclick = (e) => e.stopPropagation();
    });

    // 1. MOBILE HAMBURGER
    const mobileBtn = header.querySelector("#mobileMenuBtn");
    if (mobileBtn) {
      mobileBtn.onclick = () => {
        const sidebar = document.getElementById("appSidebar");
        const backdrop = document.getElementById("sidebarBackdrop");
        if (sidebar) sidebar.classList.toggle("mobile-open");
        if (backdrop) backdrop.classList.toggle("active");
      };
    }

    // 2. BREADCRUMB / HOME LINK
    const homeLink = header.querySelector("#topbarHomeLink");
    if (homeLink && navigate) homeLink.onclick = () => navigate("dashboard");

    // 3. CALENDAR SHORTCUT
    const calBtn = header.querySelector("#calQuickBtn");
    if (calBtn && navigate) calBtn.onclick = () => navigate("events");

    // 4. REAL NOTIFICATION CENTER
    const notifBtn = header.querySelector("#notifQuickBtn");
    const notifBadge = header.querySelector("#topbarNotifBadge");
    const notifList = header.querySelector("#notifDropdownList");
    const notifUnread = header.querySelector("#notifUnreadBadge");
    const btnMarkAll = header.querySelector("#btnMarkAllRead");

    async function loadNotifications() {
      if (!token) return;
      try {
        const res = await api.get("/notifications", token);
        if (res.success) {
          const unreadCount = res.unreadCount || 0;
          if (unreadCount > 0) {
            notifBadge.style.display = "flex";
            notifBadge.textContent = unreadCount > 9 ? "9+" : unreadCount;
            notifUnread.style.display = "inline-block";
            notifUnread.textContent = `${unreadCount} unread`;
          } else {
            notifBadge.style.display = "none";
            notifUnread.style.display = "none";
          }
          renderNotifications(res.notifications || []);
        }
      } catch (e) {
        console.error("Notifications fetch error:", e);
      }
    }

    function renderNotifications(notifs) {
      if (!notifList) return;
      if (notifs.length === 0) {
        notifList.innerHTML = `
          <div style="padding: 28px; text-align: center; color: var(--text-muted); font-size: 13px;">
            <div style="font-size: 24px; margin-bottom: 6px;">🔔</div>
            <strong>All caught up!</strong>
            <p style="margin: 4px 0 0 0; font-size: 11.5px; color: var(--text-dim);">No new academic alerts or updates right now.</p>
          </div>
        `;
        return;
      }

      notifList.innerHTML = notifs
        .map((n) => {
          const icon =
            n.type === "announcement"
              ? "📢"
              : n.type === "event"
              ? "🗓️"
              : n.type === "task"
              ? "📋"
              : n.type === "resource"
              ? "📚"
              : n.type === "project"
              ? "🚀"
              : "🔔";

          const isUnread = Number(n.is_read) === 0;
          const timeAgo = formatTimeAgo(n.created_at);

          return `
            <div class="notif-item ${isUnread ? "unread" : ""}" data-id="${n.id}" data-type="${n.related_entity_type || n.type}">
              <div class="notif-icon-box">${icon}</div>
              <div class="notif-content">
                <div class="notif-title">${escapeHTML(n.title)}</div>
                <div class="notif-msg">${escapeHTML(n.message)}</div>
                <div class="notif-time">${timeAgo}</div>
              </div>
              ${isUnread ? '<span class="notif-unread-dot"></span>' : ""}
            </div>
          `;
        })
        .join("");

      // Click notification -> mark read and navigate
      notifList.querySelectorAll(".notif-item").forEach((item) => {
        item.onclick = async () => {
          const id = item.getAttribute("data-id");
          const targetType = item.getAttribute("data-type");
          try {
            await api.put(`/notifications/${id}/read`, {}, token);
            loadNotifications();
          } catch (e) {}

          closeAllDropdowns();
          if (navigate) {
            if (targetType === "announcement") navigate("announcements");
            else if (targetType === "event") navigate("events");
            else if (targetType === "task") navigate("tasks");
            else if (targetType === "resource") navigate("resources");
            else if (targetType === "project") navigate("projects");
          }
        };
      });
    }

    function formatTimeAgo(dateStr) {
      if (!dateStr) return "";
      const diff = (Date.now() - new Date(dateStr).getTime()) / 1000;
      if (diff < 60) return "Just now";
      if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
      if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`;
      return `${Math.floor(diff / 86400)}d ago`;
    }

    if (notifBtn && notifPane) {
      notifBtn.onclick = (e) => {
        e.stopPropagation();
        const isOpen = notifPane.style.display === "flex";
        closeAllDropdowns();
        notifPane.style.display = isOpen ? "none" : "flex";
        if (!isOpen) loadNotifications();
      };
    }

    if (btnMarkAll) {
      btnMarkAll.onclick = async () => {
        try {
          await api.put("/notifications/read-all", {}, token);
          loadNotifications();
          showToast("All notifications marked as read.", "info");
        } catch (err) {
          showToast(err.message, "error");
        }
      };
    }

    loadNotifications();

    // 5. REAL GLOBAL SEARCH
    const searchInput = header.querySelector("#topbarSearchInput");
    const searchContent = header.querySelector("#searchDropdownContent");
    let searchDebounceTimer = null;

    if (searchInput && searchDropdown && searchContent) {
      searchInput.oninput = (e) => {
        const query = e.target.value.trim();
        clearTimeout(searchDebounceTimer);

        if (query.length === 0) {
          searchDropdown.style.display = "none";
          return;
        }

        searchDebounceTimer = setTimeout(async () => {
          try {
            searchDropdown.style.display = "flex";
            searchContent.innerHTML = `
              <div style="padding: 16px; text-align: center; color: var(--text-dim); font-size: 12px;">
                Searching across BatchHub...
              </div>
            `;

            const res = await api.get(`/search?q=${encodeURIComponent(query)}`, token);
            if (res.success) {
              renderSearchResults(res.results, res.totalCount, query);
            }
          } catch (err) {
            searchContent.innerHTML = `
              <div class="search-empty-state">
                <span style="color: var(--danger-red);">Search failed: ${escapeHTML(err.message)}</span>
              </div>
            `;
          }
        }, 220);
      };

      searchInput.onfocus = () => {
        if (searchInput.value.trim().length > 0) {
          searchDropdown.style.display = "flex";
        }
      };

      searchInput.onkeydown = (e) => {
        if (e.key === "Escape") {
          searchDropdown.style.display = "none";
          searchInput.blur();
        }
      };
    }

    function renderSearchResults(results, totalCount, query) {
      if (!searchContent) return;
      if (totalCount === 0) {
        searchContent.innerHTML = `
          <div class="search-empty-state">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" style="color: var(--text-dim);">
              <circle cx="11" cy="11" r="8"></circle>
              <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
            </svg>
            <div>No results found for "<strong>${escapeHTML(query)}</strong>"</div>
            <span style="font-size: 11px; color: var(--text-dim);">Try searching for student names, course codes, deadlines, or topics.</span>
          </div>
        `;
        return;
      }

      let html = "";

      // Students
      if (results.students && results.students.length > 0) {
        html += `<div class="search-group-header">Students & Peers (${results.students.length})</div>`;
        results.students.forEach((s) => {
          html += `
            <div class="search-result-item" data-route="members">
              <div class="search-result-left">
                <div class="search-result-icon">👤</div>
                <div>
                  <div class="search-result-title">${escapeHTML(s.name)}</div>
                  <div class="search-result-sub">${escapeHTML(s.department || "CSE")} • ID: ${escapeHTML(s.student_id || "N/A")} • Batch: ${escapeHTML(s.batch || "")}</div>
                </div>
              </div>
              <span class="app-badge badge-muted" style="font-size: 10px;">${escapeHTML(s.role || "student").toUpperCase()}</span>
            </div>
          `;
        });
      }

      // Announcements
      if (results.announcements && results.announcements.length > 0) {
        html += `<div class="search-group-header">Announcements (${results.announcements.length})</div>`;
        results.announcements.forEach((a) => {
          html += `
            <div class="search-result-item" data-route="announcements">
              <div class="search-result-left">
                <div class="search-result-icon">📢</div>
                <div>
                  <div class="search-result-title">${escapeHTML(a.title)}</div>
                  <div class="search-result-sub">${escapeHTML(a.category)} • By ${escapeHTML(a.author_name || "CR")}</div>
                </div>
              </div>
              ${a.is_pinned ? '<span class="app-badge badge-warning" style="font-size: 10px;">📌 Pinned</span>' : ""}
            </div>
          `;
        });
      }

      // Events
      if (results.events && results.events.length > 0) {
        html += `<div class="search-group-header">Events & Activities (${results.events.length})</div>`;
        results.events.forEach((ev) => {
          html += `
            <div class="search-result-item" data-route="events">
              <div class="search-result-left">
                <div class="search-result-icon">🗓️</div>
                <div>
                  <div class="search-result-title">${escapeHTML(ev.title)}</div>
                  <div class="search-result-sub">${formatDate(ev.event_date)} • ${escapeHTML(ev.location)}</div>
                </div>
              </div>
              <span class="app-badge badge-emerald" style="font-size: 10px;">Event</span>
            </div>
          `;
        });
      }

      // Resources
      if (results.resources && results.resources.length > 0) {
        html += `<div class="search-group-header">Study Resources (${results.resources.length})</div>`;
        results.resources.forEach((r) => {
          html += `
            <div class="search-result-item" data-route="resources">
              <div class="search-result-left">
                <div class="search-result-icon">📚</div>
                <div>
                  <div class="search-result-title">${escapeHTML(r.title)}</div>
                  <div class="search-result-sub">${escapeHTML(r.course_code)} • ${escapeHTML(r.category)}</div>
                </div>
              </div>
              <span class="app-badge badge-info" style="font-size: 10px;">Download</span>
            </div>
          `;
        });
      }

      // Projects
      if (results.projects && results.projects.length > 0) {
        html += `<div class="search-group-header">Projects (${results.projects.length})</div>`;
        results.projects.forEach((p) => {
          html += `
            <div class="search-result-item" data-route="projects">
              <div class="search-result-left">
                <div class="search-result-icon">🚀</div>
                <div>
                  <div class="search-result-title">${escapeHTML(p.title)}</div>
                  <div class="search-result-sub">Stack: ${escapeHTML(p.tech_stack)}</div>
                </div>
              </div>
              <span class="app-badge badge-emerald" style="font-size: 10px;">Team</span>
            </div>
          `;
        });
      }

      // Tasks
      if (results.tasks && results.tasks.length > 0) {
        html += `<div class="search-group-header">Tasks & Deadlines (${results.tasks.length})</div>`;
        results.tasks.forEach((t) => {
          html += `
            <div class="search-result-item" data-route="tasks">
              <div class="search-result-left">
                <div class="search-result-icon">📋</div>
                <div>
                  <div class="search-result-title">${escapeHTML(t.title)}</div>
                  <div class="search-result-sub">Due: ${formatDate(t.due_date)} • Course: ${escapeHTML(t.course_code)}</div>
                </div>
              </div>
              <span class="app-badge badge-danger" style="font-size: 10px;">${escapeHTML(t.priority)}</span>
            </div>
          `;
        });
      }

      searchContent.innerHTML = html;

      // Handle clicking any search result
      searchContent.querySelectorAll(".search-result-item").forEach((item) => {
        item.onclick = () => {
          const targetRoute = item.getAttribute("data-route");
          searchDropdown.style.display = "none";
          if (searchInput) searchInput.value = "";
          if (navigate && targetRoute) navigate(targetRoute);
        };
      });
    }

    // Ctrl+K Global Shortcut
    window.addEventListener("keydown", (e) => {
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === "k") {
        e.preventDefault();
        if (searchInput) {
          searchInput.focus();
          searchInput.select();
        }
      }
    });

    // 6. CREATE DROPDOWN & QUICK-ACTION MODALS
    const createBtn = header.querySelector("#btnCreateAction");
    const modal = header.querySelector("#topbarActionModal");
    const modalTitle = header.querySelector("#topbarModalTitle");
    const modalBody = header.querySelector("#topbarModalBody");
    const modalClose = header.querySelector("#closeTopbarModalBtn");

    const openActionModal = (title, formHtml, onFormSubmit) => {
      if (!modal || !modalBody || !modalTitle) return;
      modalTitle.textContent = title;
      modalBody.innerHTML = formHtml;
      modal.classList.add("app-modal-open");

      const form = modalBody.querySelector("form");
      if (form) {
        form.onsubmit = async (e) => {
          e.preventDefault();
          const submitBtn = form.querySelector('button[type="submit"]');
          try {
            if (submitBtn) {
              submitBtn.disabled = true;
              submitBtn.textContent = "Submitting...";
            }
            await onFormSubmit(form);
            modal.classList.remove("app-modal-open");
            // If currently on relevant page, re-navigate to refresh
            if (navigate) navigate(currentView);
          } catch (err) {
            showToast(err.message, "error");
          } finally {
            if (submitBtn) {
              submitBtn.disabled = false;
              submitBtn.textContent = "Submit";
            }
          }
        };
      }
    };

    if (modalClose) {
      modalClose.onclick = () => modal && modal.classList.remove("app-modal-open");
    }
    if (modal) {
      modal.onclick = (e) => {
        if (e.target === modal) modal.classList.remove("app-modal-open");
      };
    }

    if (createBtn && createMenu) {
      createBtn.onclick = (e) => {
        e.stopPropagation();
        const isOpen = createMenu.style.display === "flex";
        closeAllDropdowns();
        createMenu.style.display = isOpen ? "none" : "flex";
      };

      createMenu.querySelectorAll("[data-action]").forEach((item) => {
        item.onclick = () => {
          const act = item.getAttribute("data-action");
          createMenu.style.display = "none";

          if (act === "new-announcement") {
            openActionModal(
              "Post New Batch Announcement",
              `
              <form>
                <div class="app-modal-body">
                  <div class="form-group">
                    <label class="form-label">Announcement Title *</label>
                    <input type="text" id="mNoticeTitle" class="form-input" required placeholder="e.g., Mid-Term Examination Routine Published">
                  </div>
                  <div class="form-row">
                    <div class="form-group">
                      <label class="form-label">Category *</label>
                      <select id="mNoticeCat" class="form-select">
                        <option value="academic">Academic</option>
                        <option value="examination">Examination</option>
                        <option value="event">Event</option>
                        <option value="general" selected>General</option>
                      </select>
                    </div>
                    <div class="form-group">
                      <label class="form-label">Priority</label>
                      <select id="mNoticePriority" class="form-select">
                        <option value="Normal">Normal</option>
                        <option value="Important">Important</option>
                        <option value="Urgent">Urgent</option>
                      </select>
                    </div>
                  </div>
                  <div class="form-group">
                    <label class="form-label">Description & Notice Details *</label>
                    <textarea id="mNoticeDesc" class="form-textarea" rows="4" required placeholder="Write the full announcement text..."></textarea>
                  </div>
                  ${isStaff ? `
                  <div style="display: flex; align-items: center; gap: 8px;">
                    <input type="checkbox" id="mNoticePin" style="width: 16px; height: 16px; accent-color: var(--primary-mint);">
                    <label for="mNoticePin" style="font-size: 13px; color: var(--text-primary); cursor: pointer;">Pin to top of announcements</label>
                  </div>` : ""}
                </div>
                <div class="app-modal-footer">
                  <button type="submit" class="btn-primary" style="width: 100%; justify-content: center;">Post Announcement</button>
                </div>
              </form>
              `,
              async (form) => {
                const payload = {
                  title: form.querySelector("#mNoticeTitle").value.trim(),
                  category: form.querySelector("#mNoticeCat").value,
                  priority: form.querySelector("#mNoticePriority").value,
                  description: form.querySelector("#mNoticeDesc").value.trim(),
                  is_pinned: form.querySelector("#mNoticePin")?.checked ? 1 : 0,
                  target_audience: "all",
                };
                const res = await api.post("/notices", payload, token);
                showToast(res.message || "Announcement posted successfully!", "success");
              }
            );
          } else if (act === "new-event") {
            openActionModal(
              "Schedule Campus Event",
              `
              <form>
                <div class="app-modal-body">
                  <div class="form-group">
                    <label class="form-label">Event Title *</label>
                    <input type="text" id="mEventTitle" class="form-input" required placeholder="e.g., CSE Project Showcase 2026">
                  </div>
                  <div class="form-row">
                    <div class="form-group">
                      <label class="form-label">Venue / Room *</label>
                      <input type="text" id="mEventLoc" class="form-input" required placeholder="e.g., Auditorium 2">
                    </div>
                    <div class="form-group">
                      <label class="form-label">Date & Time *</label>
                      <input type="datetime-local" id="mEventDate" class="form-input" required>
                    </div>
                  </div>
                  <div class="form-group">
                    <label class="form-label">Event Description & Agenda</label>
                    <textarea id="mEventDesc" class="form-textarea" rows="3" placeholder="Provide schedule, registration details..."></textarea>
                  </div>
                </div>
                <div class="app-modal-footer">
                  <button type="submit" class="btn-primary" style="width: 100%; justify-content: center;">Save Event</button>
                </div>
              </form>
              `,
              async (form) => {
                const payload = {
                  title: form.querySelector("#mEventTitle").value.trim(),
                  location: form.querySelector("#mEventLoc").value.trim(),
                  event_date: form.querySelector("#mEventDate").value,
                  description: form.querySelector("#mEventDesc").value.trim(),
                  department: user.department || "CSE",
                };
                const res = await api.post("/events", payload, token);
                showToast(res.message || "Event submitted successfully!", "success");
              }
            );
          } else if (act === "new-task") {
            openActionModal(
              "Add Task / Assignment Deadline",
              `
              <form>
                <div class="app-modal-body">
                  <div class="form-group">
                    <label class="form-label">Task Title *</label>
                    <input type="text" id="mTaskTitle" class="form-input" required placeholder="e.g., Operating Systems Lab Report 2">
                  </div>
                  <div class="form-row">
                    <div class="form-group">
                      <label class="form-label">Course Code *</label>
                      <input type="text" id="mTaskCourse" class="form-input" required placeholder="e.g., CSE-3201">
                    </div>
                    <div class="form-group">
                      <label class="form-label">Priority</label>
                      <select id="mTaskPriority" class="form-select">
                        <option value="Low">Low</option>
                        <option value="Medium" selected>Medium</option>
                        <option value="High">High</option>
                      </select>
                    </div>
                  </div>
                  <div class="form-group">
                    <label class="form-label">Due Date & Time *</label>
                    <input type="datetime-local" id="mTaskDue" class="form-input" required>
                  </div>
                  <div class="form-group">
                    <label class="form-label">Instructions / Description</label>
                    <textarea id="mTaskDesc" class="form-textarea" rows="3" placeholder="Submission portal link, PDF requirements..."></textarea>
                  </div>
                </div>
                <div class="app-modal-footer">
                  <button type="submit" class="btn-primary" style="width: 100%; justify-content: center;">Save Deadline</button>
                </div>
              </form>
              `,
              async (form) => {
                const payload = {
                  title: form.querySelector("#mTaskTitle").value.trim(),
                  course_code: form.querySelector("#mTaskCourse").value.trim() || "General",
                  priority: form.querySelector("#mTaskPriority").value,
                  due_date: form.querySelector("#mTaskDue").value,
                  description: form.querySelector("#mTaskDesc").value.trim(),
                  department: user.department || "CSE",
                };
                const res = await api.post("/tasks", payload, token);
                showToast(res.message || "Task saved successfully!", "success");
              }
            );
          } else if (act === "new-resource") {
            openActionModal(
              "Upload Academic Study Material",
              `
              <form>
                <div class="app-modal-body">
                  <div class="form-group">
                    <label class="form-label">Material Title *</label>
                    <input type="text" id="mResTitle" class="form-input" required placeholder="e.g., Algorithms Chapter 4 Slides">
                  </div>
                  <div class="form-row">
                    <div class="form-group">
                      <label class="form-label">Course Code *</label>
                      <input type="text" id="mResCourse" class="form-input" required placeholder="e.g., CSE-2201">
                    </div>
                    <div class="form-group">
                      <label class="form-label">Category</label>
                      <select id="mResCat" class="form-select">
                        <option value="Lecture Notes">Lecture Notes</option>
                        <option value="Assignment">Assignment Solution</option>
                        <option value="Book">Reference Book</option>
                        <option value="Question Bank">Question Bank</option>
                        <option value="Other">Other</option>
                      </select>
                    </div>
                  </div>
                  <div class="form-group">
                    <label class="form-label">File Link / Cloud Storage URL *</label>
                    <input type="url" id="mResUrl" class="form-input" required placeholder="https://drive.google.com/file/d/...">
                  </div>
                </div>
                <div class="app-modal-footer">
                  <button type="submit" class="btn-primary" style="width: 100%; justify-content: center;">Submit Resource</button>
                </div>
              </form>
              `,
              async (form) => {
                const payload = {
                  title: form.querySelector("#mResTitle").value.trim(),
                  course_code: form.querySelector("#mResCourse").value.trim() || "General",
                  category: form.querySelector("#mResCat").value,
                  file_url: form.querySelector("#mResUrl").value.trim(),
                };
                const res = await api.post("/resources", payload, token);
                showToast(res.message || "Resource submitted successfully!", "success");
              }
            );
          } else if (act === "new-project") {
            openActionModal(
              "Publish Batch Project",
              `
              <form>
                <div class="app-modal-body">
                  <div class="form-group">
                    <label class="form-label">Project Title *</label>
                    <input type="text" id="mProjTitle" class="form-input" required placeholder="e.g., PeerShare - Academic Notes Exchange">
                  </div>
                  <div class="form-group">
                    <label class="form-label">Tech Stack (comma separated) *</label>
                    <input type="text" id="mProjTech" class="form-input" required placeholder="e.g., Node.js, Express, MySQL, CSS">
                  </div>
                  <div class="form-group">
                    <label class="form-label">Current Team Members *</label>
                    <input type="text" id="mProjMembers" class="form-input" required value="${escapeHTML(user.name || "Owner")}">
                  </div>
                  <div class="form-group">
                    <label class="form-label">Repository / Live Demo URL *</label>
                    <input type="url" id="mProjRepo" class="form-input" required placeholder="https://github.com/username/project">
                  </div>
                  <div class="form-group">
                    <label class="form-label">Project Scope & Collaboration Goals</label>
                    <textarea id="mProjDesc" class="form-textarea" rows="3" placeholder="What are you building? Looking for teammates?"></textarea>
                  </div>
                </div>
                <div class="app-modal-footer">
                  <button type="submit" class="btn-primary" style="width: 100%; justify-content: center;">Publish Project</button>
                </div>
              </form>
              `,
              async (form) => {
                const payload = {
                  title: form.querySelector("#mProjTitle").value.trim(),
                  tech_stack: form.querySelector("#mProjTech").value.trim(),
                  team_members: form.querySelector("#mProjMembers").value.trim(),
                  repo_url: form.querySelector("#mProjRepo").value.trim(),
                  description: form.querySelector("#mProjDesc").value.trim(),
                  department: user.department || "CSE",
                };
                const res = await api.post("/projects", payload, token);
                showToast(res.message || "Project published successfully!", "success");
              }
            );
          }
        };
      });
    }

    // 7. USER PROFILE MENU
    const profileBtn = header.querySelector("#topbarProfileBtn");
    if (profileBtn && userMenu) {
      profileBtn.onclick = (e) => {
        e.stopPropagation();
        const isOpen = userMenu.style.display === "flex";
        closeAllDropdowns();
        userMenu.style.display = isOpen ? "none" : "flex";
      };

      const profItem = header.querySelector("#menuItemProfile");
      if (profItem && navigate) {
        profItem.onclick = () => {
          userMenu.style.display = "none";
          navigate("profile");
        };
      }

      const logoutItem = header.querySelector("#menuItemLogout");
      if (logoutItem && navigate) {
        logoutItem.onclick = () => {
          userMenu.style.display = "none";
          localStorage.removeItem("token");
          localStorage.removeItem("user");
          navigate("login");
        };
      }
    }
  }, 0);

  return header;
}
