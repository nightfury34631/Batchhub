import { Navbar } from "../../components/Navbar.js";
import { RegisterView } from "../../views/registerView.js";
import { LoginView } from "../../views/loginView.js";
import { DashboardView } from "../../views/dashboardView.js";
import { ProfileView } from "../../views/profileView.js";

function navigate(viewName) {
  const appRoot = document.getElementById("app");
  appRoot.innerHTML = "";

  // Re-render navbar to update active links / logout state
  const navbarContainer = document.getElementById("navbar-container");
  navbarContainer.innerHTML = "";
  navbarContainer.appendChild(Navbar(navigate));

  if (viewName === "register") {
    appRoot.appendChild(RegisterView(navigate));
  } else if (viewName === "login") {
    appRoot.appendChild(LoginView(navigate));
  } else if (viewName === "profile") {
    appRoot.appendChild(ProfileView(navigate));
  } else {
    appRoot.appendChild(DashboardView(navigate));
  }
}

function init() {
  const token = localStorage.getItem("token");
  navigate(token ? "dashboard" : "login");
}

window.addEventListener("DOMContentLoaded", init);
