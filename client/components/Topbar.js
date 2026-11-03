import { api } from "../assets/js/api.js";
import { escapeHTML } from "../assets/js/uiUtils.js";

export function Topbar(currentView = "Dashboard", navigate = null) {
  const user = JSON.parse(localStorage.getItem("user")) || {
    name: "Tripto",
    role: "student",
  };

  const randomDefaultAvatar =
    "https://api.dicebear.com/7.x/bottts/svg?seed=" +
    encodeURIComponent(user.name || "Tripto");
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
    
    <!-- Center Section: Search Bar with Ctrl+K shortcut -->
    <div class="topbar-center">
      <div class="topbar-search-box">
        <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="color: var(--text-dim); flex-shrink: 0;">
          <circle cx="11" cy="11" r="8"></circle>
          <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
        </svg>
        <input type="text" id="topbarSearchInput" placeholder="Search students, events, announcements..." aria-label="Global Search">
        <span class="kbd-badge">Ctrl + K</span>
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

      <!-- Notifications Icon Button -->
      <button class="icon-btn" id="notifQuickBtn" title="Announcements & Notices">
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
          <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"></path>
          <path d="M13.73 21a2 2 0 0 1-3.46 0"></path>
        </svg>
        <span class="notification-dot" id="topbarNotifDot" style="display: none;"></span>
      </button>

      <!-- User Profile Menu -->
      <div style="position: relative;">
        <div class="user-profile-badge" id="topbarProfileBtn" title="User Account Menu" tabindex="0">
          <img src="${avatarUrl}" alt="Avatar">
          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" style="color: var(--text-muted); margin-left: 2px;">
            <polyline points="6 9 12 15 18 9"></polyline>
          </svg>
        </div>
        <div id="userMenuDropdown" class="user-menu-dropdown" style="display: none;">
          <div class="user-menu-header">
            <div class="user-menu-name">${escapeHTML(user.name || "Student")}</div>
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
  `;

  setTimeout(() => {
    // Mobile Hamburger Toggle
    const mobileBtn = header.querySelector("#mobileMenuBtn");
    if (mobileBtn) {
      mobileBtn.onclick = () => {
        const sidebar = document.getElementById("appSidebar");
        const backdrop = document.getElementById("sidebarBackdrop");
        if (sidebar) sidebar.classList.toggle("mobile-open");
        if (backdrop) backdrop.classList.toggle("active");
      };
    }

    // Home breadcrumb click
    const homeLink = header.querySelector("#topbarHomeLink");
    if (homeLink && navigate) homeLink.onclick = () => navigate("dashboard");

    // Calendar shortcut
    const calBtn = header.querySelector("#calQuickBtn");
    if (calBtn && navigate) calBtn.onclick = () => navigate("events");

    // Notifications shortcut -> Announcements
    const notifBtn = header.querySelector("#notifQuickBtn");
    if (notifBtn && navigate) notifBtn.onclick = () => navigate("announcements");

    // Check notifications count to show/hide dot
    const checkNotices = async () => {
      try {
        const token = localStorage.getItem("token");
        if (!token) return;
        const res = await api.get("/notices", token);
        const dot = header.querySelector("#topbarNotifDot");
        if (dot && res.success && res.notices && res.notices.length > 0) {
          dot.style.display = "block";
        }
      } catch (e) {}
    };
    checkNotices();

    // Create Action Dropdown
    const createBtn = header.querySelector("#btnCreateAction");
    const createMenu = header.querySelector("#createDropdownMenu");
    if (createBtn && createMenu) {
      createBtn.onclick = (e) => {
        e.stopPropagation();
        closeAllDropdowns();
        createMenu.style.display = createMenu.style.display === "none" ? "flex" : "none";
      };

      createMenu.querySelectorAll("[data-action]").forEach((item) => {
        item.onclick = () => {
          const act = item.getAttribute("data-action");
          createMenu.style.display = "none";
          if (!navigate) return;
          if (act === "new-announcement") navigate("announcements");
          else if (act === "new-event") navigate("events");
          else if (act === "new-task") navigate("tasks");
          else if (act === "new-resource") navigate("resources");
          else if (act === "new-project") navigate("projects");
        };
      });
    }

    // Profile Menu Dropdown
    const profileBtn = header.querySelector("#topbarProfileBtn");
    const userMenu = header.querySelector("#userMenuDropdown");
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

    // Global click listener to dismiss dropdowns
    document.addEventListener("click", () => {
      closeAllDropdowns();
    });

    function closeAllDropdowns() {
      if (createMenu) createMenu.style.display = "none";
      if (userMenu) userMenu.style.display = "none";
    }

    // Search enter handler
    const searchInput = header.querySelector("#topbarSearchInput");
    if (searchInput) {
      searchInput.onkeydown = (e) => {
        if (e.key === "Enter" && searchInput.value.trim() && navigate) {
          const val = searchInput.value.toLowerCase();
          if (val.includes("event") || val.includes("contest") || val.includes("exam")) {
            navigate("events");
          } else if (val.includes("notice") || val.includes("announc")) {
            navigate("announcements");
          } else if (val.includes("task") || val.includes("assign") || val.includes("deadlin")) {
            navigate("tasks");
          } else if (val.includes("resource") || val.includes("slide") || val.includes("note")) {
            navigate("resources");
          } else if (val.includes("project")) {
            navigate("projects");
          } else {
            navigate("members");
          }
        }
      };
    }

    // Shortcut Ctrl+K
    window.addEventListener("keydown", (e) => {
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === "k") {
        e.preventDefault();
        if (searchInput) searchInput.focus();
      }
    });
  }, 0);

  return header;
}
