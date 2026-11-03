import { api } from "../assets/js/api.js";
import { toggleTheme } from "../assets/js/theme.js";

export function RegisterView(navigate) {
  const container = document.createElement("div");
  container.className = "auth-container";
  container.innerHTML = `
    <div class="auth-card" style="max-width: 520px;">
      <div style="display: flex; flex-direction: column; align-items: center; justify-content: center; gap: 8px; margin-bottom: 18px;">
        <span class="logo-icon-svg" style="color: var(--primary-mint); width: 42px; height: 42px;">
          <svg width="42" height="42" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">
            <path d="M22 10v6M2 10l10-5 10 5-10 5-10-5z"/>
            <path d="M6 12v5c3.33 1.67 8.67 1.67 12 0v-5"/>
          </svg>
        </span>
        <h2>Create BatchHub Account</h2>
        <p class="auth-subtitle" style="margin-bottom: 0;">Connect with batchmates and collaborate academically</p>
      </div>

      <form id="registerForm" class="auth-form">
        <div class="form-group">
          <label class="form-label">Full Name *</label>
          <input type="text" id="regName" class="form-input" placeholder="e.g. Tripto Rahman" required>
        </div>

        <div class="form-group">
          <label class="form-label">Email Address *</label>
          <input type="email" id="regEmail" class="form-input" placeholder="student@university.edu" required autocomplete="email">
        </div>

        <div class="form-group">
          <label class="form-label">Password *</label>
          <div style="position: relative; display: flex; align-items: center;">
            <input type="password" id="regPassword" class="form-input" placeholder="••••••••" required autocomplete="new-password" style="padding-right: 40px;">
            <button type="button" id="toggleRegPasswordBtn" style="position: absolute; right: 10px; background: none; border: none; color: var(--text-muted); cursor: pointer; padding: 4px; display: flex; align-items: center; justify-content: center;">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path>
                <circle cx="12" cy="12" r="3"></circle>
              </svg>
            </button>
          </div>
        </div>

        <div class="form-row">
          <div class="form-group">
            <label class="form-label">Student ID *</label>
            <input type="text" id="regStudentId" class="form-input" placeholder="e.g. 2155198" required>
          </div>
          <div class="form-group">
            <label class="form-label">Batch / Year *</label>
            <input type="text" id="regBatch" class="form-input" placeholder="e.g. 2024 / 3rd Year" required>
          </div>
        </div>

        <div class="form-row">
          <div class="form-group">
            <label class="form-label">Department *</label>
            <input type="text" id="regDept" class="form-input" value="CSE" placeholder="e.g. CSE" required>
          </div>
          <div class="form-group">
            <label class="form-label">Account Role *</label>
            <select id="regRole" class="form-select">
              <option value="student">Student Member</option>
              <option value="cr">Class Representative (CR)</option>
              <option value="admin">Administrator</option>
            </select>
          </div>
        </div>

        <button type="submit" id="btnRegisterSubmit" class="btn-primary" style="width: 100%; justify-content: center; padding: 12px; margin-top: 10px;">
          <span>Create Account</span>
        </button>
      </form>

      <div id="regAlertBox" style="display: none; margin-top: 14px; padding: 10px 14px; border-radius: 8px; font-size: 13px; text-align: center;"></div>

      <div class="auth-switch">
        Already have an account? <a href="#" id="toLogin">Sign in here</a>
      </div>
    </div>
  `;

  setTimeout(() => {
    // Password toggle
    const toggleBtn = container.querySelector("#toggleRegPasswordBtn");
    const pwdInput = container.querySelector("#regPassword");
    if (toggleBtn && pwdInput) {
      toggleBtn.onclick = () => {
        const isPwd = pwdInput.type === "password";
        pwdInput.type = isPwd ? "text" : "password";
        toggleBtn.innerHTML = isPwd
          ? `<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"></path><line x1="1" y1="1" x2="23" y2="23"></line></svg>`
          : `<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path><circle cx="12" cy="12" r="3"></circle></svg>`;
      };
    }

    // Switch to login
    const toLog = container.querySelector("#toLogin");
    if (toLog) {
      toLog.onclick = (e) => {
        e.preventDefault();
        navigate("login");
      };
    }

    // Submit handler
    const form = container.querySelector("#registerForm");
    const alertBox = container.querySelector("#regAlertBox");
    const submitBtn = container.querySelector("#btnRegisterSubmit");

    if (form) {
      form.onsubmit = async (e) => {
        e.preventDefault();

        const payload = {
          name: container.querySelector("#regName").value.trim(),
          email: container.querySelector("#regEmail").value.trim(),
          password: container.querySelector("#regPassword").value,
          student_id: container.querySelector("#regStudentId").value.trim(),
          batch: container.querySelector("#regBatch").value.trim(),
          department: container.querySelector("#regDept").value.trim(),
          role: container.querySelector("#regRole").value,
        };

        if (alertBox) {
          alertBox.style.display = "block";
          alertBox.style.background = "var(--primary-mint-soft)";
          alertBox.style.color = "var(--primary-mint)";
          alertBox.style.border = "1px solid var(--primary-mint-border)";
          alertBox.textContent = "Registering account credentials...";
        }

        if (submitBtn) {
          submitBtn.disabled = true;
          submitBtn.textContent = "Registering...";
        }

        try {
          const res = await api.post("/auth/register", payload);
          if (alertBox) {
            alertBox.style.background = "var(--primary-mint-soft)";
            alertBox.style.color = "var(--primary-mint)";
            alertBox.textContent = res.message || "Registration successful! Redirecting to login...";
          }
          setTimeout(() => navigate("login"), 900);
        } catch (err) {
          if (alertBox) {
            alertBox.style.background = "var(--danger-soft)";
            alertBox.style.color = "var(--danger-red)";
            alertBox.style.border = "1px solid rgba(248, 113, 113, 0.35)";
            alertBox.textContent = err.message || "Registration failed.";
          }
        } finally {
          if (submitBtn) {
            submitBtn.disabled = false;
            submitBtn.textContent = "Create Account";
          }
        }
      };
    }
  }, 0);

  return container;
}
