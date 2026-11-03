import { api } from "../assets/js/api.js";
import { escapeHTML, formatDate, formatTime, showToast, confirmDialog } from "../assets/js/uiUtils.js";

export function TasksView(navigate = null) {
  const container = document.createElement("div");
  container.className = "tasks-page-container";

  // Auth check & User state
  let user = null;
  try {
    const stored = localStorage.getItem("user");
    if (stored) user = JSON.parse(stored);
  } catch (e) {
    user = null;
  }

  if (!user || !localStorage.getItem("token")) {
    if (typeof navigate === "function") {
      setTimeout(() => navigate("login"), 0);
    }
    container.innerHTML = `<div style="padding: 48px; text-align: center; color: var(--text-muted); font-size: 13.5px;">Redirecting to authentication...</div>`;
    return container;
  }

  const isCRorAdmin = user.role === "cr" || user.role === "admin";
  const userId = Number(user.id) || 0;

  // View Skeleton
  container.innerHTML = `
    <!-- 1. Academic Command Center Header -->
    <header class="command-center-header">
      <div class="command-header-left">
        <div class="academic-eyebrow-strip">
          <span class="academic-context-badge">
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" aria-hidden="true">
              <path d="M22 10v6M2 10l10-5 10 5-10 5z"></path>
              <path d="M6 12v5c3 3 9 3 12 0v-5"></path>
            </svg>
            Academic Command Center
          </span>
          <span class="academic-term-label">Cohort Deadlines & Coursework Deliverables</span>
        </div>
        <h2 class="command-header-title">Tasks, Assignments & Deadlines</h2>
        <p class="command-header-desc">
          Centralized milestone tracking for assignments, lab submissions, and cohort projects with individualized progress tracking.
        </p>
      </div>
      <div class="command-header-right">
        <button class="btn-command-primary" id="btnOpenAddTaskModal" aria-haspopup="dialog" aria-controls="addTaskModal">
          <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" aria-hidden="true">
            <line x1="12" y1="5" x2="12" y2="19"></line>
            <line x1="5" y1="12" x2="19" y2="12"></line>
          </svg>
          <span>Add Academic Deadline</span>
        </button>
      </div>
    </header>

    <!-- 2. Asymmetric Overview: Academic Flight Deck -->
    <section class="overview-flight-deck" id="academicFlightDeck" role="region" aria-label="Academic Workload Overview">
      <!-- 2A. Hero Active Workload Card (Left) -->
      <div class="overview-hero-card" id="heroWorkloadCard" tabindex="0" role="button" aria-label="Filter active coursework">
        <div class="hero-card-header">
          <div class="hero-label-group">
            <span class="hero-eyebrow">Active Academic Workload</span>
            <div class="hero-main-stat"><span id="heroActiveCount">0</span> Active Deadlines</div>
          </div>
          <div class="hero-rate-chip" id="heroRateChip">
            <span id="heroCompletionRate">0%</span> Completed
          </div>
        </div>

        <div class="hero-progress-section">
          <div class="hero-progress-meta">
            <span id="heroProgressMeta">0 of 0 deliverables marked complete</span>
            <span style="font-size: 11.5px; color: var(--text-dim);">Individual Progress</span>
          </div>
          <div class="hero-progress-track">
            <div class="hero-progress-fill" id="heroProgressFill" style="width: 0%;"></div>
          </div>
        </div>
      </div>

      <!-- 2B. Satellite Metric Stack (Right) -->
      <div class="overview-satellite-stack">
        <!-- Overdue -->
        <div class="satellite-metric-tile tile-overdue" data-filter="overdue" tabindex="0" role="button" aria-label="Filter overdue tasks">
          <div class="tile-top-row">
            <span class="tile-label">Overdue</span>
            <div class="tile-icon-box" aria-hidden="true">⚠️</div>
          </div>
          <div class="tile-number" id="countOverdue">0</div>
          <p class="tile-caption">Requires attention</p>
        </div>

        <!-- Due Today -->
        <div class="satellite-metric-tile tile-today" data-filter="today" tabindex="0" role="button" aria-label="Filter tasks due today">
          <div class="tile-top-row">
            <span class="tile-label">Due Today</span>
            <div class="tile-icon-box" aria-hidden="true">⏰</div>
          </div>
          <div class="tile-number" id="countToday">0</div>
          <p class="tile-caption">Due before 11:59 PM</p>
        </div>

        <!-- Completed -->
        <div class="satellite-metric-tile tile-completed" data-filter="completed" tabindex="0" role="button" aria-label="Filter completed tasks">
          <div class="tile-top-row">
            <span class="tile-label">Completed</span>
            <div class="tile-icon-box" aria-hidden="true">✓</div>
          </div>
          <div class="tile-number" id="countCompleted">0</div>
          <p class="tile-caption">Archived deliverables</p>
        </div>
      </div>
    </section>

    <!-- 3. CR / Admin Moderation Command Panel -->
    <section id="crModerationSection" style="display: none;"></section>

    <!-- 4. Student Pending Submissions Queue -->
    <section id="studentPendingSection" style="display: none;"></section>

    <!-- 5. Precision Task Workspace Controls -->
    <section class="task-workspace-toolbar">
      <div class="workspace-toolbar-top">
        <div class="workspace-search-box">
          <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" style="color: var(--text-dim); flex-shrink: 0;" aria-hidden="true">
            <circle cx="11" cy="11" r="8"></circle>
            <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
          </svg>
          <input type="text" id="taskSearchInput" placeholder="Filter by assignment title, course code, or instructions..." aria-label="Search academic deadlines">
        </div>

        <div class="workspace-status-nav" id="taskStatusNav" role="tablist" aria-label="Task Status Navigation">
          <button class="nav-status-tab active-status" data-filter="all" role="tab" aria-selected="true">All Deadlines</button>
          <button class="nav-status-tab" data-filter="active" role="tab" aria-selected="false">Active</button>
          <button class="nav-status-tab" data-filter="today" role="tab" aria-selected="false">Due Today</button>
          <button class="nav-status-tab" data-filter="overdue" role="tab" aria-selected="false">Overdue</button>
          <button class="nav-status-tab" data-filter="completed" role="tab" aria-selected="false">Completed</button>
          ${isCRorAdmin ? `<button class="nav-status-tab" data-filter="pending_mod" role="tab" aria-selected="false">Moderation Queue <span id="tabModBadge" class="mod-count-pill" style="display: none;">0</span></button>` : ""}
          <button class="nav-status-tab" data-filter="my_pending" id="tabMyPending" role="tab" aria-selected="false" style="display: none;">My Pending (<span id="tabMyPendingCount">0</span>)</button>
        </div>
      </div>

      <div class="workspace-toolbar-bottom">
        <div class="workspace-filter-group">
          <label for="filterCourseSelect">Course:</label>
          <select id="filterCourseSelect" class="workspace-select-field" aria-label="Filter by Course">
            <option value="all">All Courses</option>
          </select>

          <label for="filterPrioritySelect">Priority:</label>
          <select id="filterPrioritySelect" class="workspace-select-field" aria-label="Filter by Priority">
            <option value="all">All Priorities</option>
            <option value="High">High Priority</option>
            <option value="Medium">Medium Priority</option>
            <option value="Low">Low Priority</option>
          </select>

          <span id="workspaceResultCount" style="font-size: 11.5px; color: var(--text-dim); margin-left: 4px;"></span>
        </div>

        <div class="workspace-sort-group">
          <label for="sortTasksSelect">Sort by:</label>
          <select id="sortTasksSelect" class="workspace-select-field" aria-label="Sort deadlines">
            <option value="due_asc">Nearest Due Date (First)</option>
            <option value="due_desc">Furthest Due Date</option>
            <option value="priority_desc">Priority (High to Low)</option>
            <option value="course_asc">Course Code (A–Z)</option>
            <option value="newest">Recently Added</option>
          </select>
        </div>
      </div>
    </section>

    <!-- 6. Main Editorial Task Collection -->
    <main id="tasksGrid" class="task-collection-grid" role="region" aria-live="polite" aria-label="Academic Deadlines Workspace">
      <div class="command-skeleton-row"></div>
      <div class="command-skeleton-row"></div>
      <div class="command-skeleton-row"></div>
    </main>

    <!-- 7. Create Task Modal -->
    <div id="addTaskModal" class="app-modal-overlay" role="dialog" aria-modal="true" aria-labelledby="addTaskModalHeading" aria-hidden="true">
      <div class="app-modal-dialog" style="max-width: 540px;">
        <div class="app-modal-header task-modal-header">
          <h3 id="addTaskModalHeading" class="modal-title-display">Add Academic Deadline</h3>
          <button class="app-modal-close" id="closeTaskModalBtn" aria-label="Close dialog">✕</button>
        </div>
        <form id="addTaskForm">
          <div class="app-modal-body">
            <div class="form-group">
              <label for="tTitle" class="form-label">Task / Assignment Title *</label>
              <input type="text" id="tTitle" class="form-input" required placeholder="e.g., Operating Systems Lab Report 2">
            </div>

            <div class="form-row">
              <div class="form-group">
                <label for="tCourse" class="form-label">Course Code *</label>
                <input type="text" id="tCourse" class="form-input" list="taskCourseDatalist" required placeholder="e.g., CSE-3201 or General">
                <datalist id="taskCourseDatalist"></datalist>
              </div>
              <div class="form-group">
                <label for="tPriority" class="form-label">Priority *</label>
                <select id="tPriority" class="form-select">
                  <option value="Low">Low Priority</option>
                  <option value="Medium" selected>Medium Priority</option>
                  <option value="High">High Priority</option>
                </select>
              </div>
            </div>

            <div class="form-group">
              <label for="tDate" class="form-label">Submission Due Date & Time *</label>
              <input type="datetime-local" id="tDate" class="form-input" required>
            </div>

            <div class="form-group">
              <label for="tDesc" class="form-label">Submission Guidelines & Problem Details</label>
              <textarea id="tDesc" class="form-textarea" rows="3" placeholder="Provide problem numbers, PDF format guidelines, or portal link..."></textarea>
            </div>
          </div>
          <div class="app-modal-footer">
            <button type="button" class="btn-secondary" id="cancelTaskModalBtn">Cancel</button>
            <button type="submit" class="btn-primary" id="btnSubmitTask">Save Deadline</button>
          </div>
        </form>
      </div>
    </div>

    <!-- 8. Task Detail Modal -->
    <div id="taskDetailModal" class="app-modal-overlay" role="dialog" aria-modal="true" aria-labelledby="detailTaskTitle" aria-hidden="true">
      <div class="app-modal-dialog" style="max-width: 580px;">
        <div class="app-modal-header task-modal-header">
          <div style="display: flex; align-items: center; gap: 8px; flex-wrap: wrap;">
            <span id="detailTaskCourseEyebrow" class="task-course-chip">CSE-3201</span>
            <div id="detailTaskPriorityIndicator" class="task-priority-pip-badge">
              <span class="pip-indicator-dot dot-medium"></span>
              <span id="detailTaskPriorityText">Medium Priority</span>
            </div>
            <span id="detailTaskDeadlineBadge" class="task-relative-status-badge badge-state-active">Active</span>
          </div>
          <button class="app-modal-close" id="closeTaskDetailBtn" aria-label="Close details dialog">✕</button>
        </div>
        <div class="app-modal-body" style="display: flex; flex-direction: column; gap: 14px;">
          <h2 id="detailTaskTitle" class="modal-title-display"></h2>

          <div class="modal-metadata-strip">
            <div style="display: flex; align-items: center; gap: 8px;">
              <span style="color: var(--primary-mint);">⏰</span>
              <div><strong>Submission Due:</strong> <span id="detailTaskDue"></span></div>
            </div>
            <div style="display: flex; align-items: center; gap: 8px;">
              <span style="color: var(--primary-mint);">👤</span>
              <div><strong>Submitted By:</strong> <span id="detailTaskCreator"></span></div>
            </div>
          </div>

          <div>
            <span style="font-size: 11.5px; font-weight: 700; text-transform: uppercase; letter-spacing: 0.3px; color: var(--text-muted); display: block; margin-bottom: 6px;">Instructions & Problem Details</span>
            <div id="detailTaskInstructions" class="modal-instructions-scroll"></div>
          </div>
        </div>
        <div class="app-modal-footer" style="display: flex; justify-content: space-between; align-items: center;">
          <div id="detailModalActionLeft">
            <button type="button" class="btn-secondary" id="btnModalToggleComplete">
              <span id="modalCompleteBtnLabel">Mark as Completed</span>
            </button>
          </div>
          <div style="display: flex; gap: 8px;">
            <button type="button" class="btn-danger" id="btnModalDeleteTask" style="display: none;">Delete Task</button>
            <button type="button" class="btn-primary" id="dismissTaskDetailBtn">Done</button>
          </div>
        </div>
      </div>
    </div>
  `;

  // Internal State
  let allTasks = [];
  let pendingModerationTasks = [];
  let myPendingTasks = [];
  let availableCourses = new Set();
  let currentFilter = "all";
  let selectedCourse = "all";
  let selectedPriority = "all";
  let selectedSort = "due_asc";
  let searchQuery = "";
  let activeDetailTask = null;
  let lastActiveElement = null;

  // Deadline info & relative time
  function getDeadlineInfo(dueDateStr, isCompleted) {
    if (isCompleted) {
      return { label: "✓ Completed", className: "badge-state-completed", isCompleted: true, isOverdue: false, isToday: false };
    }
    const dueTime = new Date(dueDateStr).getTime();
    const now = Date.now();
    const diffHours = (dueTime - now) / (1000 * 3600);

    if (diffHours < 0) {
      return { label: "⚠️ Overdue", className: "badge-state-overdue", isCompleted: false, isOverdue: true, isToday: false };
    } else if (diffHours <= 24) {
      return { label: "⏰ Due Today", className: "badge-state-today", isCompleted: false, isOverdue: false, isToday: true };
    } else if (diffHours <= 72) {
      const days = Math.ceil(diffHours / 24);
      return { label: `⏳ Due in ${days}d`, className: "badge-state-soon", isCompleted: false, isOverdue: false, isToday: false };
    }
    const diffDays = Math.ceil(diffHours / 24);
    return { label: `In ${diffDays} days`, className: "badge-state-active", isCompleted: false, isOverdue: false, isToday: false };
  }

  function getPriorityMeta(priority) {
    switch (priority) {
      case "High":
        return { dotClass: "dot-high", label: "High Priority" };
      case "Low":
        return { dotClass: "dot-low", label: "Low Priority" };
      case "Medium":
      default:
        return { dotClass: "dot-medium", label: "Medium Priority" };
    }
  }

  // Populate Course Dropdowns
  function updateCourseOptions() {
    const courseSelect = container.querySelector("#filterCourseSelect");
    const datalist = container.querySelector("#taskCourseDatalist");
    if (!courseSelect) return;

    const previousSelection = courseSelect.value;
    courseSelect.innerHTML = `<option value="all">All Courses</option>`;
    if (datalist) datalist.innerHTML = "";

    const sorted = Array.from(availableCourses).filter(Boolean).sort();
    sorted.forEach((course) => {
      const opt = document.createElement("option");
      opt.value = course;
      opt.textContent = course;
      courseSelect.appendChild(opt);

      if (datalist) {
        const dOpt = document.createElement("option");
        dOpt.value = course;
        datalist.appendChild(dOpt);
      }
    });

    if (availableCourses.has(previousSelection)) {
      courseSelect.value = previousSelection;
    } else {
      courseSelect.value = "all";
      selectedCourse = "all";
    }
  }

  // Data Fetching
  async function fetchTasks() {
    try {
      const token = localStorage.getItem("token");
      const [taskRes, academicRes] = await Promise.allSettled([
        api.get("/tasks", token),
        api.get("/academic", token),
      ]);

      if (academicRes.status === "fulfilled" && academicRes.value?.courses) {
        academicRes.value.courses.forEach((c) => {
          if (c.course_code) availableCourses.add(c.course_code.toUpperCase().trim());
        });
      }

      if (taskRes.status === "fulfilled" && taskRes.value?.success) {
        allTasks = taskRes.value.tasks || [];
        pendingModerationTasks = taskRes.value.pendingTasks || [];
        myPendingTasks = taskRes.value.myPendingTasks || [];

        allTasks.forEach((t) => {
          if (t.course_code) availableCourses.add(t.course_code.toUpperCase().trim());
        });
        pendingModerationTasks.forEach((t) => {
          if (t.course_code) availableCourses.add(t.course_code.toUpperCase().trim());
        });

        updateCourseOptions();
        updateWorkloadFlightDeck();
        renderPendingModerationSection();
        renderStudentPendingSection();
        renderTasks();
      } else {
        renderError("Failed to load tasks from server.");
      }
    } catch (err) {
      renderError("Network error: " + err.message);
    }
  }

  // Workload Flight Deck Counts & Hero Progress Track
  function updateWorkloadFlightDeck() {
    let overdue = 0;
    let today = 0;
    let active = 0;
    let completed = 0;
    const total = allTasks.length;

    allTasks.forEach((task) => {
      const isDone = Number(task.is_completed) === 1;
      const deadline = getDeadlineInfo(task.due_date, isDone);
      if (isDone) {
        completed++;
      } else {
        active++;
        if (deadline.isOverdue) overdue++;
        if (deadline.isToday) today++;
      }
    });

    const completionRate = total > 0 ? Math.round((completed / total) * 100) : 0;

    // Update Hero Card
    const elHeroActive = container.querySelector("#heroActiveCount");
    const elHeroRate = container.querySelector("#heroCompletionRate");
    const elHeroMeta = container.querySelector("#heroProgressMeta");
    const elHeroFill = container.querySelector("#heroProgressFill");

    if (elHeroActive) elHeroActive.textContent = active;
    if (elHeroRate) elHeroRate.textContent = `${completionRate}%`;
    if (elHeroMeta) elHeroMeta.textContent = `${completed} of ${total} batch deliverables submitted`;
    if (elHeroFill) elHeroFill.style.width = `${completionRate}%`;

    // Update Satellite Tiles
    const elOverdue = container.querySelector("#countOverdue");
    const elToday = container.querySelector("#countToday");
    const elCompleted = container.querySelector("#countCompleted");

    if (elOverdue) elOverdue.textContent = overdue;
    if (elToday) elToday.textContent = today;
    if (elCompleted) elCompleted.textContent = completed;

    // Moderation badge
    const tabModBadge = container.querySelector("#tabModBadge");
    if (tabModBadge) {
      if (pendingModerationTasks.length > 0) {
        tabModBadge.textContent = pendingModerationTasks.length;
        tabModBadge.style.display = "inline-block";
      } else {
        tabModBadge.style.display = "none";
      }
    }

    // Student pending tab & count
    const tabMyPending = container.querySelector("#tabMyPending");
    const tabMyPendingCount = container.querySelector("#tabMyPendingCount");
    if (tabMyPending && tabMyPendingCount) {
      if (myPendingTasks.length > 0) {
        tabMyPendingCount.textContent = myPendingTasks.length;
        tabMyPending.style.display = "flex";
      } else {
        tabMyPending.style.display = "none";
      }
    }
  }

  // Render CR / Admin Moderation Panel
  function renderPendingModerationSection() {
    const section = container.querySelector("#crModerationSection");
    if (!section) return;

    if (!isCRorAdmin || pendingModerationTasks.length === 0) {
      section.innerHTML = "";
      section.style.display = "none";
      return;
    }

    section.style.display = "block";
    section.innerHTML = `
      <div class="moderation-command-panel" role="region" aria-label="Class Representative Moderation Queue">
        <div class="mod-panel-header">
          <div class="mod-panel-title-area">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" style="color: var(--warning-orange);" aria-hidden="true">
              <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"></path>
            </svg>
            <h3>Class Representative Moderation Queue</h3>
            <span class="mod-count-pill">${pendingModerationTasks.length} Pending Approval</span>
          </div>
          <span class="mod-panel-subtext">Review peer student submissions before publishing to the cohort schedule.</span>
        </div>

        <div class="mod-items-grid">
          ${pendingModerationTasks.map((task) => {
            const pMeta = getPriorityMeta(task.priority);
            return `
              <div class="mod-submission-tile" data-task-id="${task.id}">
                <div class="mod-tile-top">
                  <span class="task-course-chip">${escapeHTML(task.course_code || "General")}</span>
                  <div class="task-priority-pip-badge">
                    <span class="pip-indicator-dot ${pMeta.dotClass}"></span>
                    <span>${escapeHTML(task.priority)}</span>
                  </div>
                </div>
                <h4 class="mod-tile-title">${escapeHTML(task.title)}</h4>
                <div class="mod-tile-meta">
                  <div><strong>Due:</strong> ${formatDate(task.due_date)} at ${formatTime(task.due_date)}</div>
                  <div><strong>Submitted by:</strong> ${escapeHTML(task.creator_name || "Student")} ${task.creator_student_id ? `(${escapeHTML(task.creator_student_id)})` : ""}</div>
                  ${task.description ? `<p style="margin-top: 4px; color: var(--text-secondary); line-height: 1.4;">${escapeHTML(task.description)}</p>` : ""}
                </div>
                <div class="mod-tile-actions">
                  <button class="btn-mod-approve-entry" data-id="${task.id}" aria-label="Approve task ${escapeHTML(task.title)}">
                    ✓ Approve Deadline
                  </button>
                  <button class="btn-mod-decline-entry" data-id="${task.id}" aria-label="Decline task ${escapeHTML(task.title)}">
                    ✕ Decline
                  </button>
                </div>
              </div>
            `;
          }).join("")}
        </div>
      </div>
    `;

    // Bind Approve Actions
    section.querySelectorAll(".btn-mod-approve-entry").forEach((btn) => {
      btn.onclick = async (e) => {
        e.stopPropagation();
        const taskId = btn.getAttribute("data-id");
        btn.disabled = true;
        btn.textContent = "Approving...";
        try {
          const token = localStorage.getItem("token");
          const res = await api.put(`/tasks/${taskId}/approve`, {}, token);
          showToast(res.message || "Task approved and published!", "success");
          fetchTasks();
        } catch (err) {
          showToast(err.message, "error");
          btn.disabled = false;
          btn.textContent = "✓ Approve Deadline";
        }
      };
    });

    // Bind Decline Actions
    section.querySelectorAll(".btn-mod-decline-entry").forEach((btn) => {
      btn.onclick = async (e) => {
        e.stopPropagation();
        const taskId = btn.getAttribute("data-id");
        const confirmed = await confirmDialog({
          title: "Decline Task Submission",
          message: "Are you sure you want to decline this task submission? The student will be notified.",
          confirmText: "Yes, Decline Submission",
          isDanger: true,
        });
        if (!confirmed) return;

        btn.disabled = true;
        btn.textContent = "Declining...";
        try {
          const token = localStorage.getItem("token");
          const res = await api.delete(`/tasks/${taskId}/reject`, token);
          showToast(res.message || "Task submission declined.", "info");
          fetchTasks();
        } catch (err) {
          showToast(err.message, "error");
          btn.disabled = false;
          btn.textContent = "✕ Decline";
        }
      };
    });
  }

  // Render Student Pending Submissions Queue
  function renderStudentPendingSection() {
    const section = container.querySelector("#studentPendingSection");
    if (!section) return;

    if (myPendingTasks.length === 0) {
      section.innerHTML = "";
      section.style.display = "none";
      return;
    }

    section.style.display = "block";
    section.innerHTML = `
      <div class="student-queue-banner" role="region" aria-label="My Submissions Awaiting Approval">
        <div class="student-queue-header">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true">
            <circle cx="12" cy="12" r="10"></circle>
            <polyline points="12 6 12 12 16 14"></polyline>
          </svg>
          <span>Your Submitted Tasks Awaiting Class Representative Review (${myPendingTasks.length})</span>
        </div>
        <p style="font-size: 11.5px; color: var(--text-muted); margin: 0;">
          Your proposals are in the moderation queue. Once approved by a cohort lead, they will be published to the batch deadline calendar.
        </p>
        <div style="display: flex; flex-direction: column; gap: 8px; margin-top: 4px;">
          ${myPendingTasks.map((task) => `
            <div class="student-queue-item">
              <div style="display: flex; align-items: center; gap: 10px; flex-wrap: wrap;">
                <span class="task-course-chip">${escapeHTML(task.course_code || "General")}</span>
                <span style="font-size: 13.5px; font-weight: 600; color: var(--text-primary);">${escapeHTML(task.title)}</span>
                <span style="font-size: 11.5px; color: var(--text-dim);">Due: ${formatDate(task.due_date)}</span>
              </div>
              <div style="display: flex; align-items: center; gap: 8px;">
                <span class="task-relative-status-badge badge-state-soon">⏳ Awaiting CR Review</span>
                <button class="btn-sm btn-secondary btn-withdraw-task" data-id="${task.id}" title="Withdraw submission" style="font-size: 11.5px; padding: 4px 10px;">
                  Withdraw
                </button>
              </div>
            </div>
          `).join("")}
        </div>
      </div>
    `;

    // Withdraw submission
    section.querySelectorAll(".btn-withdraw-task").forEach((btn) => {
      btn.onclick = async () => {
        const taskId = btn.getAttribute("data-id");
        const confirmed = await confirmDialog({
          title: "Withdraw Task Submission",
          message: "Are you sure you want to withdraw this task submission?",
          confirmText: "Yes, Withdraw",
          isDanger: true,
        });
        if (!confirmed) return;

        try {
          const token = localStorage.getItem("token");
          const res = await api.delete(`/tasks/${taskId}`, token);
          showToast(res.message || "Submission withdrawn.", "info");
          fetchTasks();
        } catch (err) {
          showToast(err.message, "error");
        }
      };
    });
  }

  // Filter & Sort Logic
  function getFilteredAndSortedTasks() {
    const now = Date.now();

    const filtered = allTasks.filter((task) => {
      const isCompleted = Number(task.is_completed) === 1;
      const dueTime = new Date(task.due_date).getTime();
      const diffHours = (dueTime - now) / (1000 * 3600);
      const isOverdue = !isCompleted && diffHours < 0;
      const isToday = !isCompleted && diffHours >= 0 && diffHours <= 24;

      // Status Filter
      let matchStatus = true;
      if (currentFilter === "active") matchStatus = !isCompleted;
      else if (currentFilter === "completed") matchStatus = isCompleted;
      else if (currentFilter === "overdue") matchStatus = isOverdue;
      else if (currentFilter === "today") matchStatus = isToday;
      else if (currentFilter === "pending_mod" || currentFilter === "my_pending") return false;

      // Course Filter
      let matchCourse = true;
      if (selectedCourse !== "all") {
        matchCourse = (task.course_code || "").toUpperCase().trim() === selectedCourse;
      }

      // Priority Filter
      let matchPriority = true;
      if (selectedPriority !== "all") {
        matchPriority = task.priority === selectedPriority;
      }

      // Search Filter
      let matchSearch = true;
      if (searchQuery) {
        const q = searchQuery.toLowerCase();
        const t = (task.title || "").toLowerCase();
        const c = (task.course_code || "").toLowerCase();
        const d = (task.description || "").toLowerCase();
        const cr = (task.creator_name || "").toLowerCase();
        matchSearch = t.includes(q) || c.includes(q) || d.includes(q) || cr.includes(q);
      }

      return matchStatus && matchCourse && matchPriority && matchSearch;
    });

    // Sorting
    filtered.sort((a, b) => {
      const timeA = new Date(a.due_date).getTime();
      const timeB = new Date(b.due_date).getTime();

      switch (selectedSort) {
        case "due_desc":
          return timeB - timeA;
        case "priority_desc": {
          const pOrder = { High: 3, Medium: 2, Low: 1 };
          const pDiff = (pOrder[b.priority] || 2) - (pOrder[a.priority] || 2);
          return pDiff !== 0 ? pDiff : timeA - timeB;
        }
        case "course_asc": {
          const cA = (a.course_code || "General").toUpperCase();
          const cB = (b.course_code || "General").toUpperCase();
          return cA.localeCompare(cB);
        }
        case "newest": {
          const createdA = new Date(a.created_at || a.due_date).getTime();
          const createdB = new Date(b.created_at || b.due_date).getTime();
          return createdB - createdA;
        }
        case "due_asc":
        default:
          return timeA - timeB;
      }
    });

    return filtered;
  }

  // Render Main Tasks Collection
  function renderTasks() {
    const grid = container.querySelector("#tasksGrid");
    if (!grid) return;
    grid.innerHTML = "";

    const counterSpan = container.querySelector("#workspaceResultCount");

    // If "pending_mod" tab is selected
    if (currentFilter === "pending_mod") {
      if (counterSpan) counterSpan.textContent = `Moderation Queue (${pendingModerationTasks.length})`;
      if (pendingModerationTasks.length === 0) {
        renderEmpty("The Class Representative moderation queue is clear! No proposals awaiting review.");
      } else {
        renderEmpty(`Showing ${pendingModerationTasks.length} task proposals in the Moderation Queue above.`);
      }
      return;
    }

    // If "my_pending" tab is selected
    if (currentFilter === "my_pending") {
      if (counterSpan) counterSpan.textContent = `My Pending Submissions (${myPendingTasks.length})`;
      if (myPendingTasks.length === 0) {
        renderEmpty("You currently have no task proposals awaiting Class Representative review.");
      } else {
        renderEmpty(`Showing your ${myPendingTasks.length} submitted proposal(s) awaiting review above.`);
      }
      return;
    }

    const tasks = getFilteredAndSortedTasks();
    if (counterSpan) {
      counterSpan.textContent = `Showing ${tasks.length} of ${allTasks.length} deadlines`;
    }

    if (tasks.length === 0) {
      if (searchQuery || selectedCourse !== "all" || selectedPriority !== "all" || currentFilter !== "all") {
        renderEmpty("No academic deadlines match your current search or filter criteria.");
      } else {
        renderEmpty("All caught up! No active tasks or pending assignment deadlines for your batch cohort.");
      }
      return;
    }

    tasks.forEach((task) => {
      const isCompleted = Number(task.is_completed) === 1;
      const canDelete = isCRorAdmin || (userId && task.created_by === userId);
      const deadline = getDeadlineInfo(task.due_date, isCompleted);
      const pMeta = getPriorityMeta(task.priority);

      const card = document.createElement("article");
      card.className = "command-task-card";
      card.setAttribute("tabindex", "0");
      card.setAttribute("role", "article");
      card.setAttribute("aria-label", `${task.title}, Course ${task.course_code || "General"}, ${deadline.label}`);

      card.innerHTML = `
        <!-- Left: Course Chip & Priority Pip -->
        <div class="task-identity-col">
          <span class="task-course-chip">${escapeHTML(task.course_code || "General")}</span>
          <div class="task-priority-pip-badge">
            <span class="pip-indicator-dot ${pMeta.dotClass}"></span>
            <span>${escapeHTML(pMeta.label)}</span>
          </div>
        </div>

        <!-- Center: Headline, Summary & Attribution -->
        <div class="task-content-col">
          <h3 class="task-headline-title ${isCompleted ? "task-strikethrough" : ""}">${escapeHTML(task.title)}</h3>
          <p class="task-summary-text">
            ${escapeHTML(task.description || "No specific guidelines or problem instructions provided.")}
          </p>
          <div class="task-meta-breadcrumbs">
            <span>By: ${escapeHTML(task.creator_name || "Batch Member")}</span>
            <span>·</span>
            <span>Batch CSE</span>
          </div>
        </div>

        <!-- Right: Deadline & Direct Actions -->
        <div class="task-action-col">
          <div class="task-deadline-cluster">
            <div class="task-due-time-label">
              <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true">
                <circle cx="12" cy="12" r="10"></circle>
                <polyline points="12 6 12 12 16 14"></polyline>
              </svg>
              <span>${formatDate(task.due_date)} · ${formatTime(task.due_date)}</span>
            </div>
            <span class="task-relative-status-badge ${deadline.className}">${escapeHTML(deadline.label)}</span>
          </div>

          <div class="task-control-buttons">
            <button class="btn-command-toggle-done ${isCompleted ? "done-active" : ""}" data-id="${task.id}" aria-label="${isCompleted ? "Mark task as incomplete" : "Mark task as complete"}">
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" aria-hidden="true">
                <polyline points="20 6 9 17 4 12"></polyline>
              </svg>
              <span>${isCompleted ? "Done ✓" : "Mark Complete"}</span>
            </button>

            ${canDelete ? `
              <button class="btn-command-delete-task" data-id="${task.id}" title="Delete Task" aria-label="Delete task ${escapeHTML(task.title)}">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true">
                  <polyline points="3 6 5 6 21 6"></polyline>
                  <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path>
                </svg>
              </button>
            ` : ""}
          </div>
        </div>
      `;

      card.onclick = (e) => {
        if (e.target.closest(".btn-command-toggle-done") || e.target.closest(".btn-command-delete-task")) return;
        openTaskDetailModal(task, deadline, pMeta, card);
      };

      card.onkeydown = (e) => {
        if (e.key === "Enter" || e.key === " ") {
          if (e.target.closest(".btn-command-toggle-done") || e.target.closest(".btn-command-delete-task")) return;
          e.preventDefault();
          openTaskDetailModal(task, deadline, pMeta, card);
        }
      };

      const compBtn = card.querySelector(".btn-command-toggle-done");
      if (compBtn) {
        compBtn.onclick = async (e) => {
          e.stopPropagation();
          await toggleTaskCompletion(task, isCompleted);
        };
      }

      const delBtn = card.querySelector(".btn-command-delete-task");
      if (delBtn) {
        delBtn.onclick = async (e) => {
          e.stopPropagation();
          await deleteTaskPrompt(task);
        };
      }

      grid.appendChild(card);
    });
  }

  // Toggle Completion API helper
  async function toggleTaskCompletion(task, currentlyCompleted) {
    try {
      const token = localStorage.getItem("token");
      if (currentlyCompleted) {
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
  }

  // Delete Task Prompt
  async function deleteTaskPrompt(task) {
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
      showToast(res.message || "Task deleted successfully.", "success");
      fetchTasks();
    } catch (err) {
      showToast(err.message, "error");
    }
  }

  // Task Detail Modal
  function openTaskDetailModal(task, deadline, pMeta, triggerElement) {
    const modal = container.querySelector("#taskDetailModal");
    if (!modal) return;
    lastActiveElement = triggerElement;
    activeDetailTask = task;

    const isCompleted = Number(task.is_completed) === 1;
    const canDelete = isCRorAdmin || (userId && task.created_by === userId);

    container.querySelector("#detailTaskTitle").textContent = task.title;
    container.querySelector("#detailTaskCourseEyebrow").textContent = task.course_code || "General";
    container.querySelector("#detailTaskPriorityText").textContent = pMeta.label;
    
    const pip = container.querySelector("#detailTaskPriorityIndicator .pip-indicator-dot");
    if (pip) pip.className = `pip-indicator-dot ${pMeta.dotClass}`;

    const badge = container.querySelector("#detailTaskDeadlineBadge");
    badge.textContent = deadline.label;
    badge.className = `task-relative-status-badge ${deadline.className}`;

    container.querySelector("#detailTaskDue").textContent = `${formatDate(task.due_date)} at ${formatTime(task.due_date)}`;
    container.querySelector("#detailTaskCreator").textContent = task.creator_name || "Batch Member";
    container.querySelector("#detailTaskInstructions").textContent = task.description || "No specific problem set or guidelines provided.";

    const modalCompBtn = container.querySelector("#btnModalToggleComplete");
    const modalCompLabel = container.querySelector("#modalCompleteBtnLabel");
    if (modalCompBtn && modalCompLabel) {
      modalCompLabel.textContent = isCompleted ? "Mark as Incomplete" : "Mark as Completed";
      modalCompBtn.onclick = async () => {
        closeTaskDetailModal();
        await toggleTaskCompletion(task, isCompleted);
      };
    }

    const modalDelBtn = container.querySelector("#btnModalDeleteTask");
    if (modalDelBtn) {
      modalDelBtn.style.display = canDelete ? "inline-block" : "none";
      modalDelBtn.onclick = async () => {
        closeTaskDetailModal();
        await deleteTaskPrompt(task);
      };
    }

    modal.classList.add("app-modal-open");
    modal.setAttribute("aria-hidden", "false");

    const closeBtn = container.querySelector("#closeTaskDetailBtn");
    if (closeBtn) closeBtn.focus();
  }

  function closeTaskDetailModal() {
    const modal = container.querySelector("#taskDetailModal");
    if (!modal) return;
    modal.classList.remove("app-modal-open");
    modal.setAttribute("aria-hidden", "true");
    activeDetailTask = null;
    if (lastActiveElement && typeof lastActiveElement.focus === "function") {
      lastActiveElement.focus();
    }
  }

  function renderEmpty(message) {
    const grid = container.querySelector("#tasksGrid");
    if (!grid) return;
    grid.innerHTML = `
      <div class="command-empty-state">
        <div class="empty-state-glyph-box" aria-hidden="true">
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <polyline points="9 11 12 14 22 4"></polyline>
            <path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11"></path>
          </svg>
        </div>
        <h4 class="empty-state-heading">No Deadlines Found</h4>
        <p class="empty-state-copy">${escapeHTML(message)}</p>
      </div>
    `;
  }

  function renderError(message) {
    const grid = container.querySelector("#tasksGrid");
    if (!grid) return;
    grid.innerHTML = `
      <div class="command-empty-state" style="border-color: rgba(248, 113, 113, 0.4);">
        <div class="empty-state-glyph-box" style="background: var(--danger-soft); color: var(--danger-red); border-color: rgba(248, 113, 113, 0.3);">
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true">
            <circle cx="12" cy="12" r="10"></circle>
            <line x1="12" y1="8" x2="12" y2="12"></line>
            <line x1="12" y1="16" x2="12.01" y2="16"></line>
          </svg>
        </div>
        <h4 class="empty-state-heading" style="color: var(--danger-red);">Unable to Load Deadlines</h4>
        <p class="empty-state-copy">${escapeHTML(message)}</p>
        <button class="btn-secondary btn-sm" id="btnRetryLoadTasks" style="margin-top: 8px;">Try Again</button>
      </div>
    `;
    const retryBtn = grid.querySelector("#btnRetryLoadTasks");
    if (retryBtn) retryBtn.onclick = () => fetchTasks();
  }

  // Lifecycle Initialization
  setTimeout(() => {
    fetchTasks();

    // 1. Hero Card click -> active filter
    const heroCard = container.querySelector("#heroWorkloadCard");
    if (heroCard) {
      heroCard.onclick = () => {
        container.querySelectorAll(".nav-status-tab").forEach((t) => {
          t.classList.remove("active-status");
          t.setAttribute("aria-selected", "false");
        });
        const activeTab = container.querySelector('.nav-status-tab[data-filter="active"]');
        if (activeTab) {
          activeTab.classList.add("active-status");
          activeTab.setAttribute("aria-selected", "true");
        }
        container.querySelectorAll(".satellite-metric-tile").forEach((t) => t.classList.remove("tile-active"));
        currentFilter = "active";
        renderTasks();
      };
      heroCard.onkeydown = (e) => {
        if (e.key === "Enter" || e.key === " ") {
          e.preventDefault();
          heroCard.click();
        }
      };
    }

    // 2. Satellite Metric Tiles click -> filter
    container.querySelectorAll(".satellite-metric-tile").forEach((tile) => {
      tile.onclick = () => {
        const targetFilter = tile.getAttribute("data-filter");
        container.querySelectorAll(".satellite-metric-tile").forEach((t) => t.classList.remove("tile-active"));
        tile.classList.add("tile-active");

        const tabBtn = container.querySelector(`.nav-status-tab[data-filter="${targetFilter}"]`);
        if (tabBtn) {
          container.querySelectorAll(".nav-status-tab").forEach((t) => {
            t.classList.remove("active-status");
            t.setAttribute("aria-selected", "false");
          });
          tabBtn.classList.add("active-status");
          tabBtn.setAttribute("aria-selected", "true");
        }
        currentFilter = targetFilter;
        renderTasks();
      };
      tile.onkeydown = (e) => {
        if (e.key === "Enter" || e.key === " ") {
          e.preventDefault();
          tile.click();
        }
      };
    });

    // 3. Status Navigation Tabs
    container.querySelectorAll(".nav-status-tab").forEach((tab) => {
      tab.onclick = () => {
        container.querySelectorAll(".nav-status-tab").forEach((t) => {
          t.classList.remove("active-status");
          t.setAttribute("aria-selected", "false");
        });
        tab.classList.add("active-status");
        tab.setAttribute("aria-selected", "true");

        currentFilter = tab.getAttribute("data-filter");
        container.querySelectorAll(".satellite-metric-tile").forEach((t) => {
          if (t.getAttribute("data-filter") === currentFilter) {
            t.classList.add("tile-active");
          } else {
            t.classList.remove("tile-active");
          }
        });

        renderTasks();
      };
    });

    // 4. Search Box
    const searchInput = container.querySelector("#taskSearchInput");
    if (searchInput) {
      searchInput.oninput = (e) => {
        searchQuery = e.target.value.trim().toLowerCase();
        renderTasks();
      };
    }

    // 5. Course Filter Dropdown
    const courseSelect = container.querySelector("#filterCourseSelect");
    if (courseSelect) {
      courseSelect.onchange = (e) => {
        selectedCourse = e.target.value;
        renderTasks();
      };
    }

    // 6. Priority Filter Dropdown
    const prioritySelect = container.querySelector("#filterPrioritySelect");
    if (prioritySelect) {
      prioritySelect.onchange = (e) => {
        selectedPriority = e.target.value;
        renderTasks();
      };
    }

    // 7. Sort Dropdown
    const sortSelect = container.querySelector("#sortTasksSelect");
    if (sortSelect) {
      sortSelect.onchange = (e) => {
        selectedSort = e.target.value;
        renderTasks();
      };
    }

    // 8. Add Task Modal
    const addModal = container.querySelector("#addTaskModal");
    const openAddBtn = container.querySelector("#btnOpenAddTaskModal");
    const closeAddBtn = container.querySelector("#closeTaskModalBtn");
    const cancelAddBtn = container.querySelector("#cancelTaskModalBtn");
    const addForm = container.querySelector("#addTaskForm");
    const tDateInput = container.querySelector("#tDate");

    const openAddModal = () => {
      lastActiveElement = openAddBtn;
      if (tDateInput) {
        const nowLocal = new Date(Date.now() - new Date().getTimezoneOffset() * 60000)
          .toISOString()
          .slice(0, 16);
        tDateInput.setAttribute("min", nowLocal);
      }
      addModal.classList.add("app-modal-open");
      addModal.setAttribute("aria-hidden", "false");
      const titleInput = container.querySelector("#tTitle");
      if (titleInput) titleInput.focus();
    };

    const closeAddModal = () => {
      addModal.classList.remove("app-modal-open");
      addModal.setAttribute("aria-hidden", "true");
      if (lastActiveElement && typeof lastActiveElement.focus === "function") {
        lastActiveElement.focus();
      }
    };

    if (openAddBtn) openAddBtn.onclick = openAddModal;
    if (closeAddBtn) closeAddBtn.onclick = closeAddModal;
    if (cancelAddBtn) cancelAddBtn.onclick = closeAddModal;
    if (addModal) {
      addModal.onclick = (e) => {
        if (e.target === addModal) closeAddModal();
      };
    }

    // 9. Task Detail Modal Close
    const detailModal = container.querySelector("#taskDetailModal");
    const closeDetailBtn = container.querySelector("#closeTaskDetailBtn");
    const dismissDetailBtn = container.querySelector("#dismissTaskDetailBtn");

    if (closeDetailBtn) closeDetailBtn.onclick = closeTaskDetailModal;
    if (dismissDetailBtn) dismissDetailBtn.onclick = closeTaskDetailModal;
    if (detailModal) {
      detailModal.onclick = (e) => {
        if (e.target === detailModal) closeTaskDetailModal();
      };
    }

    // 10. Global Escape Key Handler
    const handleGlobalKeydown = (e) => {
      if (e.key === "Escape") {
        if (detailModal && detailModal.classList.contains("app-modal-open")) {
          closeTaskDetailModal();
        } else if (addModal && addModal.classList.contains("app-modal-open")) {
          closeAddModal();
        }
      }
    };
    container.addEventListener("keydown", handleGlobalKeydown);

    // 11. Add Task Form Submit
    if (addForm) {
      addForm.onsubmit = async (e) => {
        e.preventDefault();
        const token = localStorage.getItem("token");
        const submitBtn = container.querySelector("#btnSubmitTask");

        const rawTitle = container.querySelector("#tTitle").value.trim();
        const rawCourse = container.querySelector("#tCourse").value.trim() || "General";
        const rawPriority = container.querySelector("#tPriority").value;
        const rawDate = container.querySelector("#tDate").value;
        const rawDesc = container.querySelector("#tDesc").value.trim();

        if (!rawTitle) {
          showToast("Task title is required.", "error");
          return;
        }

        if (!rawDate) {
          showToast("Due date and time is required.", "error");
          return;
        }

        const dueTimestamp = new Date(rawDate).getTime();
        if (dueTimestamp < Date.now() - 5 * 60 * 1000) {
          showToast("Submission deadline cannot be in the past.", "error");
          return;
        }

        const payload = {
          title: rawTitle,
          course_code: rawCourse.toUpperCase(),
          priority: rawPriority,
          due_date: rawDate,
          description: rawDesc,
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
            closeAddModal();
            addForm.reset();
            fetchTasks();
          }
        } catch (err) {
          showToast(err.message || "Failed to save task.", "error");
        } finally {
          if (submitBtn) {
            submitBtn.disabled = false;
            submitBtn.textContent = "Save Deadline";
          }
        }
      };
    }
  }, 0);

  return container;
}
