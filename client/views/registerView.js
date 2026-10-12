import { api } from "../assets/js/api.js";

export function RegisterView(navigate) {
  const container = document.createElement("div");
  container.className = "view-container";
  container.innerHTML = `
        <div class="card">
            <h2>Create Account</h2>
            <form id="registerForm" class="auth-form">
                <input type="text" id="name" placeholder="Full Name" required>
                <input type="email" id="email" placeholder="Email Address" required>
                <input type="password" id="password" placeholder="Password" required>
                <input type="text" id="student_id" placeholder="Student ID">
                <input type="text" id="batch" placeholder="Batch">
                <input type="text" id="department" placeholder="Department">
                <select id="role">
                    <option value="student">Student</option>
                    <option value="cr">Batch Representative (CR)</option>
                    <option value="admin">Administrator</option>
                </select>
                <button type="submit">Register</button>
            </form>
            <p id="formMsg" class="form-msg"></p>
        </div>
    `;

  setTimeout(() => {
    document
      .getElementById("registerForm")
      .addEventListener("submit", async (e) => {
        e.preventDefault();
        const payload = {
          name: document.getElementById("name").value,
          email: document.getElementById("email").value,
          password: document.getElementById("password").value,
          student_id: document.getElementById("student_id").value,
          batch: document.getElementById("batch").value,
          department: document.getElementById("department").value,
          role: document.getElementById("role").value,
        };

        const msg = document.getElementById("formMsg");
        msg.style.color = "#333";
        msg.textContent = "Registering...";

        try {
          const res = await api.post("/auth/register", payload);
          msg.style.color = "green";
          msg.textContent = res.message || "Registration successful!";
          setTimeout(() => navigate("login"), 1500);
        } catch (err) {
          msg.style.color = "red";
          msg.textContent = err.message;
        }
      });
  }, 0);

  return container;
}
