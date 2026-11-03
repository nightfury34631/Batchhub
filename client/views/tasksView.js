import { api } from "../assets/js/api.js";
import { escapeHTML, formatDate, formatTime, showToast, confirmDialog } from "../assets/js/uiUtils.js";

export function TasksView(navigate = null) {
  const container = document.createElement("div");
  container.className = "view-container";

  const user = JSON.parse(localStorage.getItem("user")) || {
    id: 0,
    role: "student",
    department: "CSE",
  };
  const isCRorAdmin = user.role === "cr" || user.role === "admin";

  container.innerHTML = `
    <!-- Header -->
    <div class="view-header">
      <div class="view-title-group">
        <h2>Tasks, Assignments & Deadlines</h2>
        <p>Keep track of academic assignments, lab report submissions, and project deadlines.</p>
      </div>
      <div class="view-actions">
        <button class="btn-primary" id="btnOpenAddTaskModal">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5">
            <polyline points="9 11 12 14 22 4"></polyline>
            <path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11"></path>
          </svg>
          <span>Add Deadline</span>
        </button>
      </div>
    </div>

    <!-- Toolbar -->
    <div class="filter-toolbar">
      <div class="filter-search-box">
        <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" style="color: var(--text-dim); flex-shrink: 0;">
          <circle cx="11" cy="11" r="8"></circle>
          <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
        </svg>
        <input type="text" id="taskSearchInput" placeholder="Search tasks by title, course, or description...">
      </div>

      <div class="filter-tabs" id="taskFilterTabs">
        <button class="filter-tab active" data-filter="all">All Deadlines</button>
        <button class="filter-tab" data-filter="active">Active</button>
        <button class="filter-tab" data-filter="completed">Completed</button>
        <button class="filter-tab" data-filter="overdue">Overdue</button>
        <button class="filter-tab" data-filter="high">High Priority 🔴</button>
      </div>
    </div>

    <!-- Tasks Grid -->
    <div id="tasksGrid" class="app-cards-grid">
      <div class="skeleton-card"></div>
      <div class="skeleton-card"></div>
      <div class="skeleton-card"></div>
    </div>

    <!-- Add Task Modal -->
    <div id="addTaskModal" class="app-modal-overlay">
      <div class="app-modal-dialog">
        <div class="app-modal-header">
          <h3>Add Academic Task / Deadline</h3>
          <button class="app-modal-close" id="closeTaskModalBtn">✕</button>
        </div>
        <form id="addTaskForm">
          <div class="app-modal-body">
            <div class="form-group">
              <label class="form-label">Task / Assignment Title *</label>
              <input type="text" id="tTitle" class="form-input" required placeholder="e.g., Operating Systems Lab Report 2">
            </div>

            <div class="form-row">
              <div class="form-group">
                <label class="form-label">Course Code *</label>
                <input type="text" id="tCourse" class="form-input" required placeholder="e.g., CSE-3201 or General">
              </div>
              <div class="form-group">
                <label class="form-label">Priority *</label>
                <select id="tPriority" class="form-select">
                  <option value="Low">Low Priority</option>
                  <option value="Medium" selected>Medium Priority</option>
                  <option value="High">High Priority</option>
                </select>
              </div>
            </div>

            <div class="form-group">
              <label class="form-label">Submission Due Date & Time *</label>
              <input type="datetime-local" id="tDate" class="form-input" required>
            </div>

            <div class="form-group">
              <label class="form-label">Task Description & Submission Instructions</label>
              <textarea id="tDesc" class="form-textarea" rows="3" placeholder="Provide problem numbers, PDF format guidelines, or portal link..."></textarea>
            </div>
          </div>
          <div class="app-modal-footer">
            <button type="button" class="btn-secondary" id="cancelTaskModalBtn">Cancel</button>
            <button type="submit" class="btn-primary" id="btnSubmitTask">Save Task</button>
          </div>
        </form>
      </div>
    </div>

    <!-- Task Detail Modal -->
    <div id="taskDetailModal" class="app-modal-overlay">
      <div class="app-modal-dialog" style="max-width: 560px;">
        <div class="app-modal-header">
          <div style="display: flex; align-items: center; gap: 8px;">
            <span id="detailTaskCourseBadge" class="app-badge badge-muted">CSE-3201</span>
            <span id="detailTaskPriorityBadge" class="app-badge badge-warning">Medium</span>
            <span id="detailTaskStatusBadge" class="app-badge badge-emerald">Active</span>
          </div>
          <button class="app-modal-close" id="closeTaskDetailBtn">✕</button>
        </div>
        <div class="app-modal-body" style="display: flex; flex-direction: column; gap: 14px;">
          <h2 id="detailTaskTitle" style="font-size: 18px; font-weight: 700; color: var(--text-primary); line-height: 1.3;"></h2>
          
          <div style="display: flex; flex-direction: column; gap: 8px; font-size: 13px; color: var(--text-secondary); background: var(--card-inner); padding: 12px 14px; border-radius: var(--radius-sm); border: 1px solid var(--card-border);">
            <div style="display: flex; align-items: center; gap: 8px;">
              <span style="color: var(--primary-mint);">⏰</span>
              <div><strong>Submission Due:</strong> <span id="detailTaskDue"></span></div>
            </div>
            <div style="display: flex; align-items: center; gap: 8px;">
              <span style="color: var(--primary-mint);">👤</span>
              <div><strong>Published By:</strong> <span id="detailTaskCreator"></span></div>
            </div>
          </div>

          <div id="detailTaskInstructions" style="font-size: 13.5px; line-height: 1.6; color: var(--text-secondary); white-space: pre-line;"></div>
        </div>
        <div class="app-modal-footer">
          <button type="button" class="btn-primary btn-sm" id="dismissTaskDetailBtn">Close</button>
        </div>
      </div>
    </div>
  `;

  let allTasks = [];
  let currentFilter = "all";
  let searchQuery = "";

  async function fetchTasks() {
    try {
      const token = localStorage.getItem("token");
      const res = await api.get("/tasks", token);
      if (res.success && res.tasks) {
        allTasks = res.tasks;
        renderTasks();
      } else {
        renderEmpty("No active assignments or task deadlines.");
      }
    } catch (err) {
      renderError("Failed to load tasks: " + err.message);
    }
  }

  function getDeadlineStatus(dueDateStr, isCompleted) {
    if (isCompleted) {
      return { label: "✓ Completed", className: "badge-emerald" };
    }
    const dueTime = new Date(dueDateStr).getTime();
    const now = Date.now();
    const diffHours = (dueTime - now) / (1000 * 3600);

    if (diffHours < 0) {
      return { label: "⚠️ Overdue", className: "badge-danger" };
    } else if (diffHours <= 24) {
      return { label: "⏰ Due Today", className: "badge-warning" };
    } else if (diffHours <= 72) {
      return { label: "⏳ Due Soon", className: "badge-warning" };
    }
    return { label: "Active", className: "badge-muted" };
  }

  function renderTasks() {
    const grid = container.querySelector("#tasksGrid");
    if (!grid) return;
    grid.innerHTML = "";

    const now = Date.now();

    const filtered = allTasks.filter((t) => {
      const isCompleted = Number(t.is_completed) === 1;
      const isOverdue = !isCompleted && new Date(t.due_date).getTime() < now;

      let matchFilter = true;
      if (currentFilter === "active") matchFilter = !isCompleted;
      else if (currentFilter === "completed") matchFilter = isCompleted;
      else if (currentFilter === "overdue") matchFilter = isOverdue;
      else if (currentFilter === "high") matchFilter = t.priority === "High";

      const matchSearch =
        searchQuery === "" ||
        (t.title && t.title.toLowerCase().includes(searchQuery)) ||
        (t.course_code && t.course_code.toLowerCase().includes(searchQuery)) ||
        (t.description && t.description.toLowerCase().includes(searchQuery));

      return matchFilter && matchSearch;
    });

    if (filtered.length === 0) {
      renderEmpty(
        searchQuery || currentFilter !== "all"
          ? "No tasks match your selected filter."
          : "All caught up! No active tasks or pending assignment deadlines."
      );
      return;
    }

    filtered.forEach((task) => {
      const card = document.createElement("div");
      card.className = "app-card";
      card.style.cursor = "pointer";

      const isCompleted = Number(task.is_completed) === 1;
      const canDelete = isCRorAdmin || (user.id && task.created_by === user.id);
      const deadline = getDeadlineStatus(task.due_date, isCompleted);

      const priorityBadge =
        task.priority === "High"
          ? "badge-danger"
          : task.priority === "Medium"
          ? "badge-warning"
          : "badge-emerald";

      card.innerHTML = `
        <div class="app-card-header">
          <div style="display: flex; gap: 8px; align-items: center; flex-wrap: wrap;">
            <span class="app-badge badge-muted">${escapeHTML(task.course_code || "General")}</span>
            <span class="app-badge ${priorityBadge}">${escapeHTML(task.priority)} Priority</span>
            <span class="app-badge ${deadline.className}">${escapeHTML(deadline.label)}</span>
          </div>
          ${
            canDelete
              ? `<button class="delete-task-btn" title="Delete Task" data-id="${task.id}" style="background: none; border: none; color: var(--text-dim); cursor: pointer; padding: 4px; display: flex; align-items: center; justify-content: center; border-radius: 4px; transition: color 0.15s ease;">
                  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <polyline points="3 6 5 6 21 6"></polyline>
                    <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path>
                  </svg>
                </button>`
              : ""
          }
        </div>

        <h3 class="app-card-title" style="${isCompleted ? "text-decoration: line-through; opacity: 0.75;" : ""}">${escapeHTML(task.title)}</h3>

        <div class="app-card-body">
          <p>${escapeHTML(task.description || "No specific instructions provided.")}</p>
          <div style="margin-top: 10px; display: flex; align-items: center; gap: 8px; font-size: 13px; color: var(--text-primary); background: var(--card-inner); padding: 8px 12px; border-radius: var(--radius-sm); border: 1px solid var(--card-border);">
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" style="color: var(--primary-mint);">
              <circle cx="12" cy="12" r="10"></circle>
              <polyline points="12 6 12 12 16 14"></polyline>
            </svg>
            <span><strong>Due:</strong> ${formatDate(task.due_date, true)}</span>
          </div>
        </div>

        <div class="app-card-footer">
          <span style="font-size: 12px; color: var(--text-dim);">By: ${escapeHTML(task.creator_name || "Faculty / CR")}</span>
          <button class="btn-secondary btn-sm toggle-complete-btn" data-id="${task.id}" style="${isCompleted ? "color: var(--text-dim); border-color: var(--card-border);" : "color: var(--primary-mint); border-color: var(--primary-mint-border);"}">
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5">
              <polyline points="20 6 9 17 4 12"></polyline>
            </svg>
            <span>${isCompleted ? "Completed ✓" : "Mark Complete"}</span>
          </button>
        </div>
      `;

      card.onclick = (e) => {
        if (e.target.closest(".toggle-complete-btn") || e.target.closest(".delete-task-btn")) return;
        openTaskDetailModal(task, deadline);
      };

      // Toggle Complete
      const compBtn = card.querySelector(".toggle-complete-btn");
      if (compBtn) {
        compBtn.onclick = async (e) => {
          e.stopPropagation();
          try {
            const token = localStorage.getItem("token");
            if (isCompleted) {
              const res = await api.delete(`/tasks/${task.id}/complete`, token);
              showToast(res.message || "Task marked as active.", "info");
            } else {
              const res = await api.post(`/tasks/${task.id}/complete`, {}, token);
              showToast(res.message || "Task marked as completed!", "success");
            }
            fetchTasks();
          } catch (err) {
            showToast(err.message, "error");
          }
        };
      }

      // Delete Task
      const delBtn = card.querySelector(".delete-task-btn");
      if (delBtn) {
        delBtn.onclick = async (e) => {
          e.stopPropagation();
          const confirmed = await confirmDialog({
            title: "Delete Shared Task",
            message: `Are you sure you want to permanently delete "${task.title}" for all students?`,
            confirmText: "Yes, Delete Task",
            isDanger: true,
          });
          if (!confirmed) return;

          try {
            const token = localStorage.getItem("token");
            const res = await api.delete(`/tasks/${task.id}`, token);
            showToast(res.message || "Task deleted permanently.", "success");
            fetchTasks();
          } catch (err) {
            showToast(err.message, "error");
          }
        };
      }

      grid.appendChild(card);
    });
  }

  function openTaskDetailModal(task, deadline) {
    const modal = container.querySelector("#taskDetailModal");
    if (!modal) return;

    container.querySelector("#detailTaskTitle").textContent = task.title;
    container.querySelector("#detailTaskCourseBadge").textContent = task.course_code || "General";
    container.querySelector("#detailTaskPriorityBadge").textContent = `${task.priority} Priority`;
    container.querySelector("#detailTaskStatusBadge").textContent = deadline.label;
    container.querySelector("#detailTaskStatusBadge").className = `app-badge ${deadline.className}`;
    container.querySelector("#detailTaskDue").textContent = `${formatDate(task.due_date)} at ${formatTime(task.due_date)}`;
    container.querySelector("#detailTaskCreator").textContent = task.creator_name || "Faculty / Batch Representative";
    container.querySelector("#detailTaskInstructions").textContent = task.description || "No specific problem set or guidelines provided.";

    modal.classList.add("app-modal-open");
  }

  function renderEmpty(message) {
    const grid = container.querySelector("#tasksGrid");
    if (!grid) return;
    grid.innerHTML = `
      <div class="empty-state-box" style="grid-column: 1 / -1;">
        <div class="empty-state-icon">
          <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <polyline points="9 11 12 14 22 4"></polyline>
            <path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11"></path>
          </svg>
        </div>
        <h4 class="empty-state-title">No Deadlines</h4>
        <p class="empty-state-desc">${escapeHTML(message)}</p>
      </div>
    `;
  }

  function renderError(message) {
    const grid = container.querySelector("#tasksGrid");
    if (!grid) return;
    grid.innerHTML = `
      <div class="empty-state-box" style="grid-column: 1 / -1; border-color: rgba(248, 113, 113, 0.4);">
        <div class="empty-state-icon" style="background: var(--danger-soft); color: var(--danger-red);">
          <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <circle cx="12" cy="12" r="10"></circle>
            <line x1="12" y1="8" x2="12" y2="12"></line>
            <line x1="12" y1="16" x2="12.01" y2="16"></line>
          </svg>
        </div>
        <h4 class="empty-state-title" style="color: var(--danger-red);">Task List Error</h4>
        <p class="empty-state-desc">${escapeHTML(message)}</p>
      </div>
    `;
  }

  setTimeout(() => {
    fetchTasks();

    // Filter Tabs
    container.querySelectorAll("#taskFilterTabs .filter-tab").forEach((tab) => {
      tab.onclick = () => {
        container
          .querySelectorAll("#taskFilterTabs .filter-tab")
          .forEach((t) => t.classList.remove("active"));
        tab.classList.add("active");
        currentFilter = tab.getAttribute("data-filter");
        renderTasks();
      };
    });

    // Search
    const searchInput = container.querySelector("#taskSearchInput");
    if (searchInput) {
      searchInput.oninput = (e) => {
        searchQuery = e.target.value.trim().toLowerCase();
        renderTasks();
      };
    }

    // Modal
    const modal = container.querySelector("#addTaskModal");
    const openBtn = container.querySelector("#btnOpenAddTaskModal");
    const closeBtn = container.querySelector("#closeTaskModalBtn");
    const cancelBtn = container.querySelector("#cancelTaskModalBtn");
    const form = container.querySelector("#addTaskForm");

    const openModal = () => modal && modal.classList.add("app-modal-open");
    const closeModal = () => modal && modal.classList.remove("app-modal-open");

    if (openBtn) openBtn.onclick = openModal;
    if (closeBtn) closeBtn.onclick = closeModal;
    if (cancelBtn) cancelBtn.onclick = closeModal;
    if (modal) {
      modal.onclick = (e) => {
        if (e.target === modal) closeModal();
      };
    }

    // Detail modal close
    const detailModal = container.querySelector("#taskDetailModal");
    const closeDetailBtn = container.querySelector("#closeTaskDetailBtn");
    const dismissDetailBtn = container.querySelector("#dismissTaskDetailBtn");
    const closeDetail = () => detailModal && detailModal.classList.remove("app-modal-open");

    if (closeDetailBtn) closeDetailBtn.onclick = closeDetail;
    if (dismissDetailBtn) dismissDetailBtn.onclick = closeDetail;
    if (detailModal) {
      detailModal.onclick = (e) => {
        if (e.target === detailModal) closeDetail();
      };
    }

    if (form) {
      form.onsubmit = async (e) => {
        e.preventDefault();
        const token = localStorage.getItem("token");
        const submitBtn = container.querySelector("#btnSubmitTask");

        const payload = {
          title: container.querySelector("#tTitle").value.trim(),
          course_code: container.querySelector("#tCourse").value.trim() || "General",
          priority: container.querySelector("#tPriority").value,
          due_date: container.querySelector("#tDate").value,
          description: container.querySelector("#tDesc").value.trim(),
          department: user.department || "CSE",
        };

        try {
          if (submitBtn) {
            submitBtn.disabled = true;
            submitBtn.textContent = "Saving...";
          }

          const res = await api.post("/tasks", payload, token);
          if (res.success) {
            showToast(res.message || "Task saved successfully!", "success");
            closeModal();
            form.reset();
            fetchTasks();
          }
        } catch (err) {
          showToast(err.message, "error");
        } finally {
          if (submitBtn) {
            submitBtn.disabled = false;
            submitBtn.textContent = "Save Task";
          }
        }
      };
    }
  }, 0);

  return container;
}
