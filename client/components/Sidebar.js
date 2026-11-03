/**
 * BatchHub Global Navigation Sidebar
 * Compact icon rail by default on desktop, expands on hover.
 * Off-canvas drawer on mobile/tablet.
 */
export function Sidebar(navigate, currentView) {
  const aside = document.createElement("aside");
  aside.className = "sidebar";
  aside.id = "appSidebar";

  const user = JSON.parse(localStorage.getItem("user")) || { role: "student" };
  const isCRorAdmin = user.role === "cr" || user.role === "admin";

  aside.innerHTML = `
    <div class="sidebar-top">
      <div class="logo-area" id="sidebarLogoBtn" title="BatchHub Dashboard">
        <span class="logo-icon-svg">
          <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">
            <path d="M22 10v6M2 10l10-5 10 5-10 5-10-5z"/>
            <path d="M6 12v5c3.33 1.67 8.67 1.67 12 0v-5"/>
          </svg>
        </span>
        <h2 class="logo-text">BatchHub</h2>
      </div>

      <nav class="nav-menu" aria-label="Main Navigation">
        <!-- 1. Dashboard -->
        <a href="#" class="nav-link ${currentView === "dashboard" ? "active" : ""}" data-view="dashboard" title="Dashboard">
          <span class="nav-icon">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <rect x="3" y="3" width="7" height="7"></rect>
              <rect x="14" y="3" width="7" height="7"></rect>
              <rect x="14" y="14" width="7" height="7"></rect>
              <rect x="3" y="14" width="7" height="7"></rect>
            </svg>
          </span>
          <span class="nav-label">Dashboard</span>
        </a>

        <!-- 2. Students -->
        <a href="#" class="nav-link ${currentView === "members" ? "active" : ""}" data-view="members" title="Students">
          <span class="nav-icon">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path>
              <circle cx="9" cy="7" r="4"></circle>
              <path d="M23 21v-2a4 4 0 0 0-3-3.87"></path>
              <path d="M16 3.13a4 4 0 0 1 0 7.75"></path>
            </svg>
          </span>
          <span class="nav-label">Students</span>
        </a>

        <!-- 3. Events -->
        <a href="#" class="nav-link ${currentView === "events" ? "active" : ""}" data-view="events" title="Events">
          <span class="nav-icon">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect>
              <line x1="16" y1="2" x2="16" y2="6"></line>
              <line x1="8" y1="2" x2="8" y2="6"></line>
              <line x1="3" y1="10" x2="21" y2="10"></line>
            </svg>
          </span>
          <span class="nav-label">Events</span>
        </a>

        <!-- 4. Announcements -->
        <a href="#" class="nav-link ${currentView === "announcements" ? "active" : ""}" data-view="announcements" title="Announcements">
          <span class="nav-icon">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <path d="M18 8a3 3 0 0 0-3-3H5a2 2 0 0 0-2 2v8a2 2 0 0 0 2 2h10a3 3 0 0 0 3-3V8z"></path>
              <path d="M21 15V9"></path>
              <path d="M6 19v2"></path>
              <path d="M14 19v2"></path>
            </svg>
          </span>
          <span class="nav-label">Announcements</span>
        </a>

        <!-- 5. Academic Resources -->
        <a href="#" class="nav-link ${currentView === "resources" ? "active" : ""}" data-view="resources" title="Resources">
          <span class="nav-icon">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20"></path>
              <path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z"></path>
            </svg>
          </span>
          <span class="nav-label">Resources</span>
        </a>

        <!-- 6. Tasks / Deadlines -->
        <a href="#" class="nav-link ${currentView === "tasks" ? "active" : ""}" data-view="tasks" title="Tasks & Deadlines">
          <span class="nav-icon">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <polyline points="9 11 12 14 22 4"></polyline>
              <path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11"></path>
            </svg>
          </span>
          <span class="nav-label">Tasks</span>
        </a>

        <!-- 7. Projects -->
        <a href="#" class="nav-link ${currentView === "projects" ? "active" : ""}" data-view="projects" title="Batch Projects">
          <span class="nav-icon">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <polygon points="12 2 2 7 12 12 22 7 12 2"></polygon>
              <polyline points="2 17 12 22 22 17"></polyline>
              <polyline points="2 12 12 17 22 12"></polyline>
            </svg>
          </span>
          <span class="nav-label">Projects</span>
        </a>

        <div class="nav-divider"></div>

        <!-- 8. Settings / Profile -->
        <a href="#" class="nav-link ${currentView === "profile" ? "active" : ""}" data-view="profile" title="Profile & Settings">
          <span class="nav-icon">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <circle cx="12" cy="12" r="3"></circle>
              <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z"></path>
            </svg>
          </span>
          <span class="nav-label">Settings</span>
        </a>

        <!-- 9. CR Panel (Role Restricted) -->
        ${
          isCRorAdmin
            ? `
        <a href="#" class="nav-link cr-panel-link ${currentView === "cr-panel" ? "active" : ""}" data-view="cr-panel" title="CR Management Panel">
          <span class="nav-icon">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"></path>
            </svg>
          </span>
          <span class="nav-label">CR Panel</span>
        </a>`
            : ""
        }
      </nav>
    </div>

    <div class="sidebar-footer">
      <button id="logoutBtn" class="logout-btn" title="Sign Out">
        <span class="nav-icon">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"></path>
            <polyline points="16 17 21 12 16 7"></polyline>
            <line x1="21" y1="12" x2="9" y2="12"></line>
          </svg>
        </span>
        <span class="nav-label">Logout</span>
      </button>
    </div>
  `;

  setTimeout(() => {
    // Logo click -> dashboard
    const logoBtn = aside.querySelector("#sidebarLogoBtn");
    if (logoBtn) {
      logoBtn.onclick = () => {
        closeMobileSidebar();
        navigate("dashboard");
      };
    }

    // Nav link clicks
    aside.querySelectorAll("[data-view]").forEach((link) => {
      link.onclick = (e) => {
        e.preventDefault();
        closeMobileSidebar();
        const targetView = link.getAttribute("data-view");
        navigate(targetView);
      };
    });

    // Logout
    const logoutBtn = aside.querySelector("#logoutBtn");
    if (logoutBtn) {
      logoutBtn.onclick = () => {
        closeMobileSidebar();
        localStorage.removeItem("token");
        localStorage.removeItem("user");
        navigate("login");
      };
    }
  }, 0);

  function closeMobileSidebar() {
    aside.classList.remove("mobile-open");
    const backdrop = document.getElementById("sidebarBackdrop");
    if (backdrop) backdrop.classList.remove("active");
  }

  return aside;
}
