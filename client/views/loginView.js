import { api } from "../assets/js/api.js";

export function LoginView(navigate) {
  const container = document.createElement("div");
  container.className = "view-container";
  container.innerHTML = `
        <div class="card">
            <h2>BatchHub Login</h2>
            <form id="loginForm" class="auth-form">
                <input type="email" id="loginEmail" placeholder="Email Address" required>
                <input type="password" id="loginPassword" placeholder="Password" required>
                <button type="submit">Login</button>
            </form>
            <p id="loginMsg" class="form-msg"></p>
        </div>
    `;

  setTimeout(() => {
    document
      .getElementById("loginForm")
      .addEventListener("submit", async (e) => {
        e.preventDefault();
        const payload = {
          email: document.getElementById("loginEmail").value,
          password: document.getElementById("loginPassword").value,
        };

        const msg = document.getElementById("loginMsg");
        msg.style.color = "#333";
        msg.textContent = "Logging in...";

        try {
          const res = await api.post("/auth/login", payload);
          msg.style.color = "green";
          msg.textContent = res.message;
          localStorage.setItem("token", res.token);
          localStorage.setItem("user", JSON.stringify(res.user));
          setTimeout(() => navigate("dashboard"), 1000);
        } catch (err) {
          msg.style.color = "red";
          msg.textContent = err.message;
        }
      });
  }, 0);

  return container;
}
