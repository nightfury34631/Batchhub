export function Navbar(navigate) {
  const nav = document.createElement("nav");
  nav.className = "navbar";
  const isLoggedIn = !!localStorage.getItem("token");

  nav.innerHTML = `
        <h2 id="logo-btn" style="cursor: pointer;">BatchHub</h2>
        <div class="nav-links">
            <a id="nav-dashboard" href="#">Dashboard</a>
            ${isLoggedIn ? '<a id="nav-profile" href="#">Profile</a>' : ""}
            ${isLoggedIn ? '<a id="nav-logout" href="#" style="color: #ff9999;">Logout</a>' : '<a id="nav-login" href="#">Login</a> <a id="nav-register" href="#">Register</a>'}
        </div>
    `;

  setTimeout(() => {
    nav.querySelector("#logo-btn").onclick = (e) => {
      e.preventDefault();
      navigate(isLoggedIn ? "dashboard" : "login");
    };
    if (nav.querySelector("#nav-dashboard"))
      nav.querySelector("#nav-dashboard").onclick = (e) => {
        e.preventDefault();
        navigate("dashboard");
      };
    if (nav.querySelector("#nav-profile"))
      nav.querySelector("#nav-profile").onclick = (e) => {
        e.preventDefault();
        navigate("profile");
      };
    if (nav.querySelector("#nav-login"))
      nav.querySelector("#nav-login").onclick = (e) => {
        e.preventDefault();
        navigate("login");
      };
    if (nav.querySelector("#nav-register"))
      nav.querySelector("#nav-register").onclick = (e) => {
        e.preventDefault();
        navigate("register");
      };
    if (nav.querySelector("#nav-logout")) {
      nav.querySelector("#nav-logout").onclick = (e) => {
        e.preventDefault();
        localStorage.removeItem("token");
        localStorage.removeItem("user");
        navigate("login");
      };
    }
  }, 0);

  return nav;
}
