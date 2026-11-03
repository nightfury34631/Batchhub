import { api } from "../assets/js/api.js";
import { escapeHTML, formatDate, showToast, confirmDialog } from "../assets/js/uiUtils.js";

export function CRPanelView(navigate = null) {
  const container = document.createElement("div");
  container.className = "view-container";

  const user = JSON.parse(localStorage.getItem("user")) || {
    role: "student",
    batch: "2024",
    department: "CSE",
  };

  const isCRorAdmin = user.role === "cr" || user.role === "admin";

  if (!isCRorAdmin) {
    container.innerHTML = `
      <div class="empty-state-box" style="margin-top: 40px; border-color: rgba(248, 113, 113, 0.4);">
        <div class="empty-state-icon" style="background: var(--danger-soft); color: var(--danger-red);">
          <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <rect x="3" y="11" width="18" height="11" rx="2" ry="2"></rect>
            <path d="M7 11V7a5 5 0 0 1 10 0v4"></path>
          </svg>
        </div>
        <h3 class="empty-state-title" style="color: var(--danger-red);">Access Restricted</h3>
        <p class="empty-state-desc">The CR & Admin Management Panel is exclusively accessible to authorized Batch Representatives and Administrators.</p>
        <button class="btn-secondary" id="unauthBackBtn" style="margin-top: 14px;">Return to Dashboard</button>
      </div>
    `;
    setTimeout(() => {
      const btn = container.querySelector("#unauthBackBtn");
      if (btn && navigate) btn.onclick = () => navigate("dashboard");
    }, 0);
    return container;
  }

  container.innerHTML = `
    <!-- Header -->
    <div class="view-header">
      <div class="view-title-group">
        <h2>CR & Academic Administration Panel</h2>
        <p>Review student upload approvals, organize weekly class routines, and manage semester curriculum.</p>
      </div>
      <div class="view-actions">
        <span class="app-badge badge-warning">Role: ${escapeHTML(user.role.toUpperCase())}</span>
        <span class="app-badge badge-emerald">Batch: ${escapeHTML(user.batch || "2024")}</span>
      </div>
    </div>

    <!-- Navigation Tabs -->
    <div class="filter-toolbar">
      <div class="filter-tabs" id="crPanelTabs">
        <button class="filter-tab active" data-tab="approvals">
          Pending Approvals
          <span id="totalPendingBadge" class="app-badge badge-warning" style="margin-left: 4px; padding: 1px 6px; font-size: 10px;">0</span>
        </button>
        <button class="filter-tab" data-tab="routines">Class Routines</button>
        <button class="filter-tab" data-tab="courses">Semester Courses</button>
      </div>
    </div>

    <!-- TAB 1: PENDING APPROVALS -->
    <div id="tabContentApprovals" class="cr-tab-pane" style="display: flex; flex-direction: column; gap: 20px;">
      <!-- Pending Resources Sub-section -->
      <div class="app-card">
        <div class="app-card-header">
          <div style="display: flex; align-items: center; gap: 8px;">
            <span class="app-badge badge-info">Resources</span>
            <h3 class="app-card-title">Pending Study Material Submissions</h3>
          </div>
          <span id="badgePendingResources" class="app-badge badge-muted">0 pending</span>
        </div>
        <div id="pendingResourcesList" style="display: flex; flex-direction: column; gap: 10px;">
          <p style="color: var(--text-muted); font-size: 13px;">Checking pending materials...</p>
        </div>
      </div>

      <!-- Pending Events Sub-section -->
      <div class="app-card">
        <div class="app-card-header">
          <div style="display: flex; align-items: center; gap: 8px;">
            <span class="app-badge badge-emerald">Events</span>
            <h3 class="app-card-title">Pending Event Suggestions</h3>
          </div>
          <span id="badgePendingEvents" class="app-badge badge-muted">0 pending</span>
        </div>
        <div id="pendingEventsList" style="display: flex; flex-direction: column; gap: 10px;">
          <p style="color: var(--text-muted); font-size: 13px;">Checking pending events...</p>
        </div>
      </div>

      <!-- Pending Tasks Sub-section -->
      <div class="app-card">
        <div class="app-card-header">
          <div style="display: flex; align-items: center; gap: 8px;">
            <span class="app-badge badge-warning">Deadlines</span>
            <h3 class="app-card-title">Pending Task & Assignment Submissions</h3>
          </div>
          <span id="badgePendingTasks" class="app-badge badge-muted">0 pending</span>
        </div>
        <div id="pendingTasksList" style="display: flex; flex-direction: column; gap: 10px;">
          <p style="color: var(--text-muted); font-size: 13px;">Checking pending tasks...</p>
        </div>
      </div>
    </div>

    <!-- TAB 2: CLASS ROUTINES -->
    <div id="tabContentRoutines" class="cr-tab-pane" style="display: none;">
      <div class="app-card" style="max-width: 650px;">
        <h3 class="app-card-title" style="margin-bottom: 6px;">Add Routine Schedule Slot</h3>
        <p style="font-size: 13px; color: var(--text-muted); margin-bottom: 16px;">Add weekly class periods and lecture times for students in your batch.</p>
        
        <form id="addRoutineForm" style="display: flex; flex-direction: column; gap: 14px;">
          <div class="form-row">
            <div class="form-group">
              <label class="form-label">Batch *</label>
              <input type="text" id="rBatch" class="form-input" value="${escapeHTML(user.batch || "2024")}" required>
            </div>
            <div class="form-group">
              <label class="form-label">Day of Week *</label>
              <select id="rDay" class="form-select" required>
                <option value="Sunday">Sunday</option>
                <option value="Monday">Monday</option>
                <option value="Tuesday">Tuesday</option>
                <option value="Wednesday">Wednesday</option>
                <option value="Thursday">Thursday</option>
                <option value="Friday">Friday</option>
                <option value="Saturday">Saturday</option>
              </select>
            </div>
          </div>

          <div class="form-row">
            <div class="form-group">
              <label class="form-label">Time Slot *</label>
              <input type="text" id="rTime" class="form-input" placeholder="e.g., 09:00 AM - 10:30 AM" required>
            </div>
            <div class="form-group">
              <label class="form-label">Room / Lab No *</label>
              <input type="text" id="rRoom" class="form-input" placeholder="e.g., Room 402 / Lab 3" required>
            </div>
          </div>

          <div class="form-group">
            <label class="form-label">Course Name *</label>
            <input type="text" id="rCourse" class="form-input" placeholder="e.g., CSE-3201 Operating Systems" required>
          </div>

          <div style="display: flex; justify-content: flex-end; margin-top: 8px;">
            <button type="submit" class="btn-primary" id="btnSaveRoutine">Add Routine Slot</button>
          </div>
        </form>
      </div>
    </div>

    <!-- TAB 3: SEMESTER COURSES -->
    <div id="tabContentCourses" class="cr-tab-pane" style="display: none;">
      <div class="app-card" style="max-width: 650px;">
        <h3 class="app-card-title" style="margin-bottom: 6px;">Register Semester Course</h3>
        <p style="font-size: 13px; color: var(--text-muted); margin-bottom: 16px;">Enroll an academic course into the curriculum catalog for syllabus and materials indexing.</p>
        
        <form id="addCourseForm" style="display: flex; flex-direction: column; gap: 14px;">
          <div class="form-row">
            <div class="form-group">
              <label class="form-label">Course Code *</label>
              <input type="text" id="cCode" class="form-input" placeholder="e.g., CSE-3201" required>
            </div>
            <div class="form-group">
              <label class="form-label">Department *</label>
              <input type="text" id="cDept" class="form-input" value="${escapeHTML(user.department || "CSE")}" required>
            </div>
          </div>

          <div class="form-group">
            <label class="form-label">Course Title *</label>
            <input type="text" id="cTitle" class="form-input" placeholder="e.g., Operating Systems & System Programming" required>
          </div>

          <div class="form-group">
            <label class="form-label">Batch *</label>
            <input type="text" id="cBatch" class="form-input" value="${escapeHTML(user.batch || "2024")}" required>
          </div>

          <div style="display: flex; justify-content: flex-end; margin-top: 8px;">
            <button type="submit" class="btn-primary" id="btnSaveCourse">Register Course</button>
          </div>
        </form>
      </div>
    </div>
  `;

  let pendingCounts = { resources: 0, events: 0, tasks: 0 };

  function updateBadgeTotals() {
    const total = pendingCounts.resources + pendingCounts.events + pendingCounts.tasks;
    const badge = container.querySelector("#totalPendingBadge");
    if (badge) badge.textContent = total;
  }

  // 1. Load Pending Resources
  async function loadPendingResources() {
    try {
      const token = localStorage.getItem("token");
      const res = await api.get("/resources", token);
      const list = container.querySelector("#pendingResourcesList");
      const badge = container.querySelector("#badgePendingResources");
      if (!list) return;

      const items = res.pendingMaterials || [];
      pendingCounts.resources = items.length;
      if (badge) badge.textContent = `${items.length} pending`;
      updateBadgeTotals();

      if (items.length === 0) {
        list.innerHTML = `<p style="color: var(--text-muted); font-size: 13px;">✓ No pending resources to approve. All up to date!</p>`;
        return;
      }

      list.innerHTML = "";
      items.forEach((mat) => {
        const item = document.createElement("div");
        item.style.cssText =
          "display: flex; justify-content: space-between; align-items: center; background: var(--card-inner); padding: 12px 16px; border-radius: var(--radius-sm); border: 1px solid var(--card-border); gap: 12px; flex-wrap: wrap;";
        item.innerHTML = `
          <div style="font-size: 13px; color: var(--text-primary); flex-grow: 1;">
            <strong>${escapeHTML(mat.title)}</strong> 
            <span style="color: var(--text-muted);">(${escapeHTML(mat.course_code)} • ${escapeHTML(mat.category)})</span>
            <div style="font-size: 12px; color: var(--text-dim); margin-top: 2px;">
              By ${escapeHTML(mat.uploader_name || "Student")} • <a href="${escapeHTML(mat.file_url)}" target="_blank" rel="noopener noreferrer" style="color: var(--primary-mint);">Review File</a>
            </div>
          </div>
          <div style="display: flex; gap: 8px;">
            <button class="btn-primary btn-sm approve-res-btn" data-id="${mat.id}">Approve</button>
            <button class="btn-danger btn-sm reject-res-btn" data-id="${mat.id}">Reject</button>
          </div>
        `;

        item.querySelector(".approve-res-btn").onclick = async () => {
          try {
            await api.put(`/resources/${mat.id}/approve`, {}, token);
            showToast("Resource approved and published!", "success");
            loadPendingResources();
          } catch (e) {
            showToast(e.message, "error");
          }
        };

        item.querySelector(".reject-res-btn").onclick = async () => {
          const conf = await confirmDialog({
            title: "Reject Resource",
            message: `Reject and permanently delete "${mat.title}"?`,
            confirmText: "Yes, Reject",
            isDanger: true,
          });
          if (!conf) return;
          try {
            await api.delete(`/resources/${mat.id}/reject`, token);
            showToast("Resource rejected and deleted.", "info");
            loadPendingResources();
          } catch (e) {
            showToast(e.message, "error");
          }
        };

        list.appendChild(item);
      });
    } catch (err) {
      console.warn("CR pending resources error:", err.message);
    }
  }

  // 2. Load Pending Events
  async function loadPendingEvents() {
    try {
      const token = localStorage.getItem("token");
      const res = await api.get("/events", token);
      const list = container.querySelector("#pendingEventsList");
      const badge = container.querySelector("#badgePendingEvents");
      if (!list) return;

      const items = res.pendingEvents || [];
      pendingCounts.events = items.length;
      if (badge) badge.textContent = `${items.length} pending`;
      updateBadgeTotals();

      if (items.length === 0) {
        list.innerHTML = `<p style="color: var(--text-muted); font-size: 13px;">✓ No pending event suggestions to review.</p>`;
        return;
      }

      list.innerHTML = "";
      items.forEach((ev) => {
        const item = document.createElement("div");
        item.style.cssText =
          "display: flex; justify-content: space-between; align-items: center; background: var(--card-inner); padding: 12px 16px; border-radius: var(--radius-sm); border: 1px solid var(--card-border); gap: 12px; flex-wrap: wrap;";
        item.innerHTML = `
          <div style="font-size: 13px; color: var(--text-primary); flex-grow: 1;">
            <strong>${escapeHTML(ev.title)}</strong> 
            <span style="color: var(--text-muted);">(${escapeHTML(ev.location)} • ${formatDate(ev.event_date)})</span>
            <div style="font-size: 12px; color: var(--text-dim); margin-top: 2px;">
              Suggested by: ${escapeHTML(ev.organizer_name || "Student")}
            </div>
          </div>
          <div style="display: flex; gap: 8px;">
            <button class="btn-primary btn-sm approve-ev-btn" data-id="${ev.id}">Approve</button>
            <button class="btn-danger btn-sm reject-ev-btn" data-id="${ev.id}">Reject</button>
          </div>
        `;

        item.querySelector(".approve-ev-btn").onclick = async () => {
          try {
            await api.put(`/events/${ev.id}/approve`, {}, token);
            showToast("Event approved and published to calendar!", "success");
            loadPendingEvents();
          } catch (e) {
            showToast(e.message, "error");
          }
        };

        item.querySelector(".reject-ev-btn").onclick = async () => {
          const conf = await confirmDialog({
            title: "Reject Event",
            message: `Decline and remove event suggestion "${ev.title}"?`,
            confirmText: "Yes, Reject",
            isDanger: true,
          });
          if (!conf) return;
          try {
            await api.delete(`/events/${ev.id}/reject`, token);
            showToast("Event rejected.", "info");
            loadPendingEvents();
          } catch (e) {
            showToast(e.message, "error");
          }
        };

        list.appendChild(item);
      });
    } catch (err) {
      console.warn("CR pending events error:", err.message);
    }
  }

  // 3. Load Pending Tasks
  async function loadPendingTasks() {
    try {
      const token = localStorage.getItem("token");
      const res = await api.get("/tasks/pending", token);
      const list = container.querySelector("#pendingTasksList");
      const badge = container.querySelector("#badgePendingTasks");
      if (!list) return;

      const items = res.pendingTasks || [];
      pendingCounts.tasks = items.length;
      if (badge) badge.textContent = `${items.length} pending`;
      updateBadgeTotals();

      if (items.length === 0) {
        list.innerHTML = `<p style="color: var(--text-muted); font-size: 13px;">✓ No pending task deadlines to approve.</p>`;
        return;
      }

      list.innerHTML = "";
      items.forEach((task) => {
        const item = document.createElement("div");
        item.style.cssText =
          "display: flex; justify-content: space-between; align-items: center; background: var(--card-inner); padding: 12px 16px; border-radius: var(--radius-sm); border: 1px solid var(--card-border); gap: 12px; flex-wrap: wrap;";
        item.innerHTML = `
          <div style="font-size: 13px; color: var(--text-primary); flex-grow: 1;">
            <strong>${escapeHTML(task.title)}</strong> 
            <span style="color: var(--text-muted);">(${escapeHTML(task.course_code)} • Due: ${formatDate(task.due_date)})</span>
            <div style="font-size: 12px; color: var(--text-dim); margin-top: 2px;">
              Submitted by: ${escapeHTML(task.uploader_name || "Student")}
            </div>
          </div>
          <div style="display: flex; gap: 8px;">
            <button class="btn-primary btn-sm approve-task-btn" data-id="${task.id}">Approve</button>
            <button class="btn-danger btn-sm reject-task-btn" data-id="${task.id}">Reject</button>
          </div>
        `;

        item.querySelector(".approve-task-btn").onclick = async () => {
          try {
            await api.put(`/tasks/${task.id}/approve`, {}, token);
            showToast("Task approved and published to batch!", "success");
            loadPendingTasks();
          } catch (e) {
            showToast(e.message, "error");
          }
        };

        item.querySelector(".reject-task-btn").onclick = async () => {
          const conf = await confirmDialog({
            title: "Reject Task",
            message: `Decline and remove task "${task.title}"?`,
            confirmText: "Yes, Reject",
            isDanger: true,
          });
          if (!conf) return;
          try {
            await api.delete(`/tasks/${task.id}/reject`, token);
            showToast("Task submission rejected.", "info");
            loadPendingTasks();
          } catch (e) {
            showToast(e.message, "error");
          }
        };

        list.appendChild(item);
      });
    } catch (err) {
      console.warn("CR pending tasks error:", err.message);
    }
  }

  setTimeout(() => {
    // Tab switching
    container.querySelectorAll("#crPanelTabs .filter-tab").forEach((tab) => {
      tab.onclick = () => {
        container
          .querySelectorAll("#crPanelTabs .filter-tab")
          .forEach((t) => t.classList.remove("active"));
        tab.classList.add("active");

        const target = tab.getAttribute("data-tab");
        container.querySelectorAll(".cr-tab-pane").forEach((pane) => (pane.style.display = "none"));

        if (target === "approvals") {
          const p = container.querySelector("#tabContentApprovals");
          if (p) p.style.display = "flex";
        } else if (target === "routines") {
          const p = container.querySelector("#tabContentRoutines");
          if (p) p.style.display = "block";
        } else if (target === "courses") {
          const p = container.querySelector("#tabContentCourses");
          if (p) p.style.display = "block";
        }
      };
    });

    // Add Routine Form submit
    const routineForm = container.querySelector("#addRoutineForm");
    if (routineForm) {
      routineForm.onsubmit = async (e) => {
        e.preventDefault();
        const token = localStorage.getItem("token");
        const submitBtn = container.querySelector("#btnSaveRoutine");

        const payload = {
          batch: container.querySelector("#rBatch").value.trim(),
          day_of_week: container.querySelector("#rDay").value,
          time_slot: container.querySelector("#rTime").value.trim(),
          course_name: container.querySelector("#rCourse").value.trim(),
          room_no: container.querySelector("#rRoom").value.trim(),
        };

        try {
          if (submitBtn) {
            submitBtn.disabled = true;
            submitBtn.textContent = "Saving...";
          }
          const res = await api.post("/academic/routine", payload, token);
          showToast(res.message || "Routine schedule slot added!", "success");
          routineForm.reset();
        } catch (err) {
          showToast(err.message, "error");
        } finally {
          if (submitBtn) {
            submitBtn.disabled = false;
            submitBtn.textContent = "Add Routine Slot";
          }
        }
      };
    }

    // Add Course Form submit
    const courseForm = container.querySelector("#addCourseForm");
    if (courseForm) {
      courseForm.onsubmit = async (e) => {
        e.preventDefault();
        const token = localStorage.getItem("token");
        const submitBtn = container.querySelector("#btnSaveCourse");

        const payload = {
          course_code: container.querySelector("#cCode").value.trim(),
          course_title: container.querySelector("#cTitle").value.trim(),
          department: container.querySelector("#cDept").value.trim(),
          batch: container.querySelector("#cBatch").value.trim(),
        };

        try {
          if (submitBtn) {
            submitBtn.disabled = true;
            submitBtn.textContent = "Registering...";
          }
          const res = await api.post("/academic/courses", payload, token);
          showToast(res.message || "Course registered into catalog!", "success");
          courseForm.reset();
        } catch (err) {
          showToast(err.message, "error");
        } finally {
          if (submitBtn) {
            submitBtn.disabled = false;
            submitBtn.textContent = "Register Course";
          }
        }
      };
    }

    loadPendingResources();
    loadPendingEvents();
    loadPendingTasks();
  }, 0);

  return container;
}
