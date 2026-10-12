export function DashboardView() {
  const container = document.createElement("div");
  container.className = "view-container";

  const user = JSON.parse(localStorage.getItem("user")) || {
    name: "Guest",
    role: "Visitor",
  };

  container.innerHTML = `
        <div class="card" style="max-width: 500px; text-align: left;">
            <h2>Welcome, ${user.name} 👋</h2>
            <p style="margin-top: 10px; color: #555;"><strong>Role:</strong> ${user.role.toUpperCase()}</p>
            <p style="margin-top: 5px; color: #555;"><strong>Email:</strong> ${user.email || "Not logged in"}</p>
            <hr style="margin: 20px 0; border: 0; border-top: 1px solid #ddd;">
            <p>Your BatchHub workspace is active and successfully connected to the backend database.</p>
        </div>
    `;
  return container;
}
