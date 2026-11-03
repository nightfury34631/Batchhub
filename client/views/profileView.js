import { api } from "../assets/js/api.js";
import { escapeHTML, showToast } from "../assets/js/uiUtils.js";

export function ProfileView(navigate = null) {
  const container = document.createElement("div");
  container.className = "view-container";
  container.style.maxWidth = "800px";

  const randomDefaultAvatar =
    "https://api.dicebear.com/7.x/bottts/svg?seed=BatchHubUser";

  container.innerHTML = `
    <!-- Header -->
    <div class="view-header">
      <div class="view-title-group">
        <h2>Account Settings & Profile</h2>
        <p>Manage your academic profile credentials, personal details, and security passwords.</p>
      </div>
    </div>

    <!-- Main Profile Card -->
    <div class="app-card" style="padding: 30px;">
      <h3 style="font-size: 16px; font-weight: 700; color: var(--text-primary); margin-bottom: 20px;">
        👤 Personal & Academic Profile
      </h3>

      <form id="profileForm" style="display: flex; flex-direction: column; gap: 20px;">
        <!-- Avatar Section -->
        <div style="display: flex; align-items: center; gap: 24px; padding-bottom: 22px; border-bottom: 1px solid var(--card-border); flex-wrap: wrap;">
          <img id="previewAvatar" src="${randomDefaultAvatar}" alt="Avatar" style="width: 84px; height: 84px; border-radius: 50%; object-fit: cover; border: 3px solid var(--primary-mint); background: #1a2f37; flex-shrink: 0;">
          <div style="display: flex; flex-direction: column; gap: 8px; flex-grow: 1;">
            <label class="form-label" style="font-size: 13px;">Change Profile Photo</label>
            <input type="file" id="imageInput" accept="image/*" class="form-input" style="padding: 7px 12px; font-size: 12.5px; cursor: pointer;">
            <input type="hidden" id="profilePictureBase64">
            <span style="font-size: 11.5px; color: var(--text-dim);">Supported formats: PNG, JPG, GIF (Up to 5MB)</span>
          </div>
        </div>

        <!-- Form Fields -->
        <div class="form-row">
          <div class="form-group">
            <label class="form-label">Full Name *</label>
            <input type="text" id="profName" class="form-input" required placeholder="Nokib Rahman">
          </div>
          <div class="form-group">
            <label class="form-label">Email Address (Read-only)</label>
            <input type="email" id="profEmail" class="form-input" disabled style="opacity: 0.7; cursor: not-allowed; background: var(--card-bg);">
          </div>
        </div>

        <div class="form-row">
          <div class="form-group">
            <label class="form-label">Student ID *</label>
            <input type="text" id="profStudentId" class="form-input" required placeholder="e.g., 2155198">
          </div>
          <div class="form-group">
            <label class="form-label">Batch / Year *</label>
            <input type="text" id="profBatch" class="form-input" required placeholder="e.g., 2024 / 3rd Year">
          </div>
        </div>

        <div class="form-row">
          <div class="form-group">
            <label class="form-label">Department *</label>
            <input type="text" id="profDepartment" class="form-input" required placeholder="e.g., Computer Science & Engineering">
          </div>
          <div class="form-group">
            <label class="form-label">Gender (Optional)</label>
            <select id="profGender" class="form-select">
              <option value="">Prefer not to say</option>
              <option value="Male">Male</option>
              <option value="Female">Female</option>
              <option value="Other">Other</option>
            </select>
          </div>
        </div>

        <div class="form-group">
          <label class="form-label">Technical Skills (Comma separated)</label>
          <input type="text" id="profSkills" class="form-input" placeholder="e.g., JavaScript, React, Node.js, Python, MySQL, Git">
          <span style="font-size: 11.5px; color: var(--text-dim); margin-top: 2px;">These skills will appear as search tags on your profile card in the Students Directory.</span>
        </div>

        <div style="display: flex; justify-content: flex-end; gap: 12px; margin-top: 10px; padding-top: 18px; border-top: 1px solid var(--card-border);">
          <button type="submit" class="btn-primary" id="btnSaveProfile">
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <path d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2z"></path>
              <polyline points="17 21 17 13 7 13 7 21"></polyline>
              <polyline points="7 3 7 8 15 8"></polyline>
            </svg>
            <span>Save Profile Changes</span>
          </button>
        </div>
      </form>
    </div>

    <!-- Security & Password Change Card -->
    <div class="app-card" style="padding: 30px; margin-top: 20px;">
      <h3 style="font-size: 16px; font-weight: 700; color: var(--text-primary); margin-bottom: 20px;">
        🔒 Security & Password Update
      </h3>

      <form id="changePasswordForm" style="display: flex; flex-direction: column; gap: 16px;">
        <div class="form-group">
          <label class="form-label">Current Password *</label>
          <input type="password" id="currPasswordInput" class="form-input" required placeholder="••••••••" autocomplete="current-password">
        </div>

        <div class="form-row">
          <div class="form-group">
            <label class="form-label">New Password * (Min 6 characters)</label>
            <input type="password" id="newPasswordInput" class="form-input" required minlength="6" placeholder="••••••••" autocomplete="new-password">
          </div>
          <div class="form-group">
            <label class="form-label">Confirm New Password *</label>
            <input type="password" id="confirmPasswordInput" class="form-input" required minlength="6" placeholder="••••••••" autocomplete="new-password">
          </div>
        </div>

        <div style="display: flex; justify-content: flex-end; gap: 12px; margin-top: 6px; padding-top: 14px; border-top: 1px solid var(--card-border);">
          <button type="submit" class="btn-primary" id="btnChangePassword">
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <rect x="3" y="11" width="18" height="11" rx="2" ry="2"></rect>
              <path d="M7 11V7a5 5 0 0 1 10 0v4"></path>
            </svg>
            <span>Update Password</span>
          </button>
        </div>
      </form>
    </div>
  `;

  async function loadProfile() {
    try {
      const token = localStorage.getItem("token");
      const res = await api.get("/users/profile", token);
      if (res.success && res.user) {
        const u = res.user;
        container.querySelector("#profName").value = u.name || "";
        container.querySelector("#profEmail").value = u.email || "";
        container.querySelector("#profStudentId").value = u.student_id || "";
        container.querySelector("#profBatch").value = u.batch || "";
        container.querySelector("#profDepartment").value = u.department || "";
        container.querySelector("#profSkills").value = u.skills || "";
        if (u.gender) container.querySelector("#profGender").value = u.gender;

        const savedPicture =
          u.profile_picture && u.profile_picture.trim() !== ""
            ? u.profile_picture
            : randomDefaultAvatar;
        container.querySelector("#profilePictureBase64").value = u.profile_picture || "";
        container.querySelector("#previewAvatar").src = savedPicture;
      }
    } catch (err) {
      showToast("Failed to load profile data: " + err.message, "error");
    }
  }

  setTimeout(() => {
    loadProfile();

    // Image file selection -> convert to Base64
    const imgInput = container.querySelector("#imageInput");
    if (imgInput) {
      imgInput.addEventListener("change", (e) => {
        const file = e.target.files[0];
        if (file) {
          if (file.size > 5 * 1024 * 1024) {
            showToast("Image file size exceeds 5MB limit.", "error");
            return;
          }
          const reader = new FileReader();
          reader.onload = (event) => {
            const base64String = event.target.result;
            container.querySelector("#previewAvatar").src = base64String;
            container.querySelector("#profilePictureBase64").value = base64String;
          };
          reader.readAsDataURL(file);
        }
      });
    }

    // Submit Profile form
    const form = container.querySelector("#profileForm");
    if (form) {
      form.onsubmit = async (e) => {
        e.preventDefault();
        const token = localStorage.getItem("token");
        const saveBtn = container.querySelector("#btnSaveProfile");

        const payload = {
          name: container.querySelector("#profName").value.trim(),
          student_id: container.querySelector("#profStudentId").value.trim(),
          batch: container.querySelector("#profBatch").value.trim(),
          department: container.querySelector("#profDepartment").value.trim(),
          profile_picture: container.querySelector("#profilePictureBase64").value || null,
          skills: container.querySelector("#profSkills").value.trim(),
          gender: container.querySelector("#profGender").value || null,
        };

        try {
          if (saveBtn) {
            saveBtn.disabled = true;
            saveBtn.innerHTML = "<span>Saving...</span>";
          }

          const res = await api.put("/users/profile", payload, token);
          if (res.success) {
            showToast("Profile updated successfully!", "success");
            // Update localStorage user object
            if (res.user) {
              localStorage.setItem("user", JSON.stringify(res.user));
              // Sync Topbar instantly without re-login
              const topbarAvatar = document.querySelector("#topbarUserAvatar");
              const topbarName = document.querySelector("#topbarUserName");
              if (topbarAvatar && res.user.profile_picture) {
                topbarAvatar.src = res.user.profile_picture;
              }
              if (topbarName && res.user.name) {
                topbarName.textContent = res.user.name;
              }
            }
          }
        } catch (err) {
          showToast(err.message, "error");
        } finally {
          if (saveBtn) {
            saveBtn.disabled = false;
            saveBtn.innerHTML = `
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <path d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2z"></path>
                <polyline points="17 21 17 13 7 13 7 21"></polyline>
                <polyline points="7 3 7 8 15 8"></polyline>
              </svg>
              <span>Save Profile Changes</span>
            `;
          }
        }
      };
    }

    // Submit Password change form
    const pwdForm = container.querySelector("#changePasswordForm");
    if (pwdForm) {
      pwdForm.onsubmit = async (e) => {
        e.preventDefault();
        const currPassword = container.querySelector("#currPasswordInput").value;
        const newPassword = container.querySelector("#newPasswordInput").value;
        const confirmPassword = container.querySelector("#confirmPasswordInput").value;
        const pwdBtn = container.querySelector("#btnChangePassword");

        if (newPassword !== confirmPassword) {
          showToast("New passwords do not match. Please re-enter.", "error");
          return;
        }

        if (newPassword.length < 6) {
          showToast("New password must be at least 6 characters.", "error");
          return;
        }

        try {
          if (pwdBtn) {
            pwdBtn.disabled = true;
            pwdBtn.textContent = "Updating Password...";
          }

          const token = localStorage.getItem("token");
          const res = await api.put(
            "/users/change-password",
            { currentPassword: currPassword, newPassword },
            token
          );

          showToast(res.message || "Password updated successfully!", "success");
          pwdForm.reset();
        } catch (err) {
          showToast(err.message, "error");
        } finally {
          if (pwdBtn) {
            pwdBtn.disabled = false;
            pwdBtn.innerHTML = `
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <rect x="3" y="11" width="18" height="11" rx="2" ry="2"></rect>
                <path d="M7 11V7a5 5 0 0 1 10 0v4"></path>
              </svg>
              <span>Update Password</span>
            `;
          }
        }
      };
    }
  }, 0);

  return container;
}
