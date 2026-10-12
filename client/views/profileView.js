import { api } from "../assets/js/api.js";

export function ProfileView(navigate) {
  const container = document.createElement("div");
  container.className = "view-container";
  container.innerHTML = `
        <div class="card" style="max-width: 450px;">
            <h2>Account & Profile Management</h2>
            <form id="profileForm" class="auth-form" style="margin-top: 20px;">
                <label style="font-size: 12px; color: #666;">Full Name</label>
                <input type="text" id="profName" required>
                
                <label style="font-size: 12px; color: #666;">Email (Read-only)</label>
                <input type="email" id="profEmail" disabled style="background: #e9ecef; cursor: not-allowed;">
                
                <label style="font-size: 12px; color: #666;">Student ID</label>
                <input type="text" id="profStudentId">
                
                <label style="font-size: 12px; color: #666;">Batch</label>
                <input type="text" id="profBatch">
                
                <label style="font-size: 12px; color: #666;">Department</label>
                <input type="text" id="profDepartment">

                <button type="submit" style="margin-top: 10px;">Update Profile</button>
            </form>
            <p id="profMsg" class="form-msg"></p>
        </div>
    `;

  // Fetch current profile data on load
  async function loadProfile() {
    try {
      const token = localStorage.getItem("token");
      const res = await api.get("/users/profile", token);
      if (res.success) {
        document.getElementById("profName").value = res.user.name || "";
        document.getElementById("profEmail").value = res.user.email || "";
        document.getElementById("profStudentId").value =
          res.user.student_id || "";
        document.getElementById("profBatch").value = res.user.batch || "";
        document.getElementById("profDepartment").value =
          res.user.department || "";
      }
    } catch (err) {
      document.getElementById("profMsg").style.color = "red";
      document.getElementById("profMsg").textContent =
        "Failed to load profile data.";
    }
  }

  setTimeout(() => {
    loadProfile();

    document
      .getElementById("profileForm")
      .addEventListener("submit", async (e) => {
        e.preventDefault();
        const token = localStorage.getItem("token");
        const payload = {
          name: document.getElementById("profName").value,
          student_id: document.getElementById("profStudentId").value,
          batch: document.getElementById("profBatch").value,
          department: document.getElementById("profDepartment").value,
        };

        const msg = document.getElementById("profMsg");
        msg.style.color = "#333";
        msg.textContent = "Updating...";

        try {
          const res = await api.put("/users/profile", payload, token);
          msg.style.color = "green";
          msg.textContent = res.message;
          localStorage.setItem("user", JSON.stringify(res.user)); // Update local storage
        } catch (err) {
          msg.style.color = "red";
          msg.textContent = err.message;
        }
      });
  }, 0);

  return container;
}
