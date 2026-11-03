import { Sidebar } from "../../components/Sidebar.js";
import { Topbar } from "../../components/Topbar.js";
import { DashboardView } from "../../views/dashboardView.js";
import { AnnouncementsView } from "../../views/announcementsView.js";
import { EventsView } from "../../views/eventsView.js";
import { MembersView } from "../../views/membersView.js";
import { ResourcesView } from "../../views/resourcesView.js";
import { TasksView } from "../../views/tasksView.js";
import { ProjectsView } from "../../views/projectsView.js";
import { ProfileView } from "../../views/profileView.js";
import { CRPanelView } from "../../views/crPanelView.js";
import { LoginView } from "../../views/loginView.js";
import { RegisterView } from "../../views/registerView.js";
import { initTheme, toggleTheme } from "./theme.js";

function navigate(viewName) {
  const root = document.getElementById("app");
  root.innerHTML = "";

  const token = localStorage.getItem("token");

  if (!token && viewName !== "login" && viewName !== "register") {
    navigate("login");
    return;
  }

  if (viewName === "login") {
    root.appendChild(LoginView(navigate));
    const tBtn = root.querySelector("#themeToggle");
    if (tBtn) tBtn.onclick = () => toggleTheme();
  } else if (viewName === "register") {
    root.appendChild(RegisterView(navigate));
    const tBtn = root.querySelector("#themeToggle");
    if (tBtn) tBtn.onclick = () => toggleTheme();
  } else {
    const layout = document.createElement("div");
    layout.className = "app-layout";

    // Mobile Sidebar Backdrop Overlay
    const backdrop = document.createElement("div");
    backdrop.id = "sidebarBackdrop";
    backdrop.className = "sidebar-backdrop";
    backdrop.onclick = () => {
      const sidebar = document.getElementById("appSidebar");
      if (sidebar) sidebar.classList.remove("mobile-open");
      backdrop.classList.remove("active");
    };
    layout.appendChild(backdrop);

    // Sidebar
    layout.appendChild(Sidebar(navigate, viewName));

    // Main Content Area
    const mainArea = document.createElement("div");
    mainArea.className = "main-content-area";
    mainArea.appendChild(Topbar(viewName, navigate));

    const contentWrapper = document.createElement("div");
    contentWrapper.style.cssText =
      "flex-grow: 1; overflow-y: auto; width: 100%; display: flex; flex-direction: column;";

    // Dedicated modular routing
    if (viewName === "profile") {
      contentWrapper.appendChild(ProfileView(navigate));
    } else if (viewName === "members") {
      contentWrapper.appendChild(MembersView(navigate));
    } else if (viewName === "cr-panel") {
      contentWrapper.appendChild(CRPanelView(navigate));
    } else if (viewName === "announcements") {
      contentWrapper.appendChild(AnnouncementsView(navigate));
    } else if (viewName === "events") {
      contentWrapper.appendChild(EventsView(navigate));
    } else if (viewName === "resources") {
      contentWrapper.appendChild(ResourcesView(navigate));
    } else if (viewName === "projects") {
      contentWrapper.appendChild(ProjectsView(navigate));
    } else if (viewName === "tasks") {
      contentWrapper.appendChild(TasksView(navigate));
    } else {
      contentWrapper.appendChild(DashboardView(navigate));
    }

    mainArea.appendChild(contentWrapper);
    layout.appendChild(mainArea);
    root.appendChild(layout);
  }
}

function init() {
  initTheme();
  const token = localStorage.getItem("token");
  navigate(token ? "dashboard" : "login");
}

window.addEventListener("DOMContentLoaded", init);
