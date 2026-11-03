import { api } from "../assets/js/api.js";
import { escapeHTML, formatDate, formatTime, showToast } from "../assets/js/uiUtils.js";

export function DashboardView(navigate = null) {
  const container = document.createElement("div");
  container.className = "dashboard-page";

  const rawUser = localStorage.getItem("user");
  const token = localStorage.getItem("token");

  // Authentication check - do not display fabricated user identity
  if (!token || !rawUser) {
    if (navigate) navigate("login");
    return container;
  }

  let user = null;
  try {
    user = JSON.parse(rawUser);
  } catch (e) {
    localStorage.removeItem("user");
    localStorage.removeItem("token");
    if (navigate) navigate("login");
    return container;
  }

  const firstName = user?.name ? user.name.split(" ")[0] : "Student";
  const isStaff = user?.role === "cr" || user?.role === "admin";

  // State for dynamic calendar & events
  let calDate = new Date();
  let calYear = calDate.getFullYear();
  let calMonth = calDate.getMonth(); // 0-11
  let liveEvents = [];
  let selectedDate = null; // { year, month, date }

  container.innerHTML = `
    <!-- 1. Welcome Header -->
    <div class="welcome-section">
      <h1 class="welcome-heading">Welcome back, ${escapeHTML(firstName)}! 👋</h1>
      <p class="welcome-subtext">Here's your academic flight deck, upcoming deadlines, and batch notices.</p>
    </div>

    <!-- Error State Banner (Hidden by default) -->
    <div id="dashErrorBanner" class="dash-error-banner" style="display: none;">
      <span>⚠️ Connection issue syncing academic data.</span>
      <button class="btn-retry-sync" id="btnRetrySync">Retry Sync</button>
    </div>

    <!-- 2. Academic Flight Deck (3 Strategic Columns) -->
    <div class="metrics-row">
      <!-- Card 1: Deadlines & Due Soon -->
      <div class="metric-card" id="cardDeadlines" title="View Active Deadlines">
        <div class="metric-icon-box icon-warning">
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <circle cx="12" cy="12" r="10"></circle>
            <polyline points="12 6 12 12 16 14"></polyline>
          </svg>
        </div>
        <div class="metric-info">
          <span class="metric-title">Deadlines Pending</span>
          <span class="metric-value" id="countDeadlines">...</span>
          <div class="metric-subline" id="sublineDeadlines">
            <span style="color: var(--text-dim);">Checking assignments...</span>
          </div>
        </div>
      </div>

      <!-- Card 2: Coursework Progress -->
      <div class="metric-card" id="cardProgress" title="View Course Tasks">
        <div class="metric-icon-box">
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <path d="M9 11l3 3L22 4"></path>
            <path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11"></path>
          </svg>
        </div>
        <div class="metric-info">
          <span class="metric-title">Task Progress</span>
          <span class="metric-value" id="countProgress">...</span>
          <div class="dash-progress-track">
            <div class="dash-progress-fill" id="progressFill" style="width: 0%;"></div>
          </div>
          <div class="metric-subline" id="sublineProgress">
            <span style="color: var(--text-dim);">Calculating completion...</span>
          </div>
        </div>
      </div>

      <!-- Card 3: Next Up (Next Class or Nearest Academic Event) -->
      <div class="metric-card" id="cardNextUp" title="View Schedule / Event Details">
        <div class="metric-icon-box icon-info">
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20"></path>
            <path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z"></path>
          </svg>
        </div>
        <div class="metric-info">
          <span class="metric-title">Next Up</span>
          <span class="metric-value" id="nextUpTitle" style="font-size: 16px; line-height: 1.35;">...</span>
          <div class="metric-subline" id="sublineNextUp">
            <span style="color: var(--text-dim);">Fetching schedule...</span>
          </div>
        </div>
      </div>
    </div>

    <!-- 3. Middle Section: Dynamic Calendar + Filterable Events List (2 Columns) -->
    <div class="dashboard-middle-grid">
      <!-- Left Card: Interactive Event Calendar -->
      <div class="widget-card">
        <div class="widget-header">
          <div class="widget-header-title">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect>
              <line x1="16" y1="2" x2="16" y2="6"></line>
              <line x1="8" y1="2" x2="8" y2="6"></line>
              <line x1="3" y1="10" x2="21" y2="10"></line>
            </svg>
            <span>Event Calendar</span>
          </div>
          <div class="calendar-nav">
            <button class="calendar-nav-btn" id="calPrevBtn" title="Previous Month">‹</button>
            <span id="calMonthLabel">...</span>
            <button class="calendar-nav-btn" id="calNextBtn" title="Next Month">›</button>
          </div>
        </div>

        <!-- Calendar Grid -->
        <table class="calendar-table">
          <thead>
            <tr>
              <th>Sun</th>
              <th>Mon</th>
              <th>Tue</th>
              <th>Wed</th>
              <th>Thu</th>
              <th>Fri</th>
              <th>Sat</th>
            </tr>
          </thead>
          <tbody id="calGridBody">
            <tr><td colspan="7" style="text-align: center; color: var(--text-dim); padding: 30px;">Loading calendar...</td></tr>
          </tbody>
        </table>

        <!-- Selected date details indicator -->
        <div id="selectedDateEventsNote" style="margin-top: 10px; font-size: 12px; color: var(--text-muted); border-top: 1px solid var(--card-border); padding-top: 8px; display: flex; align-items: center; justify-content: space-between;">
          <span id="selectedDateText">Click any day with a dot to filter events</span>
          <a href="#" id="viewSelectedDateEventsLink" style="color: var(--primary-mint); text-decoration: none; font-weight: 600;">View in Events →</a>
        </div>
      </div>

      <!-- Right Card: Upcoming Events Stack with Interactive Filtering -->
      <div class="widget-card">
        <div class="widget-header" id="eventsWidgetHeader">
          <div class="widget-header-title" id="eventsListTitleWrap">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect>
              <line x1="16" y1="2" x2="16" y2="6"></line>
              <line x1="8" y1="2" x2="8" y2="6"></line>
              <line x1="3" y1="10" x2="21" y2="10"></line>
            </svg>
            <span id="eventsListTitleText">Upcoming Events</span>
          </div>
          <div class="widget-header-right" id="eventsHeaderActions">
            <a class="widget-link" id="linkViewAllEvents">View All →</a>
          </div>
        </div>

        <div class="events-list-stack" id="eventsListStack">
          <div style="padding: 24px; text-align: center; color: var(--text-muted); font-size: 13px;">
            Loading events...
          </div>
        </div>
      </div>
    </div>

    <!-- 4. Bottom Section: Announcements Board -->
    <div class="announcements-card">
      <div class="widget-header">
        <div class="widget-header-title">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <path d="M18 8a3 3 0 0 0-3-3H5a2 2 0 0 0-2 2v8a2 2 0 0 0 2 2h10a3 3 0 0 0 3-3V8z"></path>
            <path d="M21 15V9"></path>
            <path d="M6 19v2"></path>
            <path d="M14 19v2"></path>
          </svg>
          <span>Batch Announcements</span>
        </div>
        <div class="announcements-header-right">
          <a class="widget-link" id="linkViewAllAnnouncements">View All →</a>
          ${
            isStaff
              ? `<button class="btn-new-announcement" id="btnNewAnnouncement">
                   <span>+</span>
                   <span>New Announcement</span>
                 </button>`
              : `<button class="btn-view-deadlines" id="btnStudentQuickAction">
                   <span>📋</span>
                   <span>View All Deadlines</span>
                 </button>`
          }
        </div>
      </div>

      <!-- Announcements Container -->
      <div id="announcementsContainer" style="display: flex; flex-direction: column; gap: 10px;">
        <div class="pinned-announcement-box" id="pinnedAnnouncementBox">
          <div class="pinned-left">
            <span class="pin-icon-wrap">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <line x1="12" y1="17" x2="12" y2="22"></line>
                <path d="M5 17h14v-1.76a2 2 0 0 0-1.11-1.79l-1.78-.89A4 4 0 0 1 14 9V4h1a1 1 0 0 0 0-2H9a1 1 0 0 0 0 2h1v5a4 4 0 0 1-2.11 3.56l-1.78.89A2 2 0 0 0 5 15.24V17z"></path>
              </svg>
            </span>
            <span class="pinned-title" id="pinnedTitle">Fetching latest announcement...</span>
            <span class="badge-pinned" id="pinnedBadge">📌 Pinned</span>
          </div>
          <div class="pinned-right">
            <div style="display: flex; align-items: center; gap: 6px;">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect>
                <line x1="16" y1="2" x2="16" y2="6"></line>
                <line x1="8" y1="2" x2="8" y2="6"></line>
                <line x1="3" y1="10" x2="21" y2="10"></line>
              </svg>
              <span id="pinnedDate">...</span>
            </div>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" style="color: var(--text-dim);">
              <polyline points="9 18 15 12 9 6"></polyline>
            </svg>
          </div>
        </div>
      </div>
    </div>

    <!-- 5. CR & Admin Only: New Announcement Modal (Never rendered for students) -->
    ${
      isStaff
        ? `
      <div id="newAnnouncementModal" class="app-modal-overlay">
        <div class="app-modal-dialog">
          <div class="app-modal-header">
            <h3>Create New Announcement</h3>
            <button class="app-modal-close" id="modalCloseBtn">✕</button>
          </div>
          <form id="announcementForm">
            <div class="app-modal-body">
              <div class="form-group">
                <label class="form-label">Announcement Title *</label>
                <input type="text" id="announceTitle" class="form-input" required placeholder="e.g., Midterm Exam Schedule Released">
              </div>
              <div class="form-group">
                <label class="form-label">Category *</label>
                <select id="announceCategory" class="form-select">
                  <option value="academic">Academic</option>
                  <option value="examination">Examination</option>
                  <option value="event">Event</option>
                  <option value="general" selected>General</option>
                </select>
              </div>
              <div class="form-group">
                <label class="form-label">Priority</label>
                <select id="announcePriority" class="form-select">
                  <option value="Normal" selected>Normal</option>
                  <option value="Important">Important</option>
                  <option value="Urgent">Urgent</option>
                </select>
              </div>
              <div class="form-group">
                <label class="form-label">Description *</label>
                <textarea id="announceDesc" class="form-textarea" rows="3" required placeholder="Announcement details and links..."></textarea>
              </div>
            </div>
            <div class="app-modal-footer">
              <button type="button" class="btn-secondary" id="modalCancelBtn">Cancel</button>
              <button type="submit" class="btn-primary" id="btnPostAnnouncement">Post Announcement</button>
            </div>
          </form>
        </div>
      </div>
    `
        : ""
    }
  `;

  const monthNames = [
    "January", "February", "March", "April", "May", "June",
    "July", "August", "September", "October", "November", "December"
  ];

  // Helper for timezone-safe local date matching (YYYY-MM-DD)
  function isSameDay(dateObj, year, month, dayNum) {
    if (!dateObj) return false;
    const d = new Date(dateObj);
    return (
      d.getFullYear() === year &&
      d.getMonth() === month &&
      d.getDate() === dayNum
    );
  }

  // Render Events List (Filters by date or shows default upcoming list)
  function renderEventsList(events, filterDate = null) {
    const stack = container.querySelector("#eventsListStack");
    const titleText = container.querySelector("#eventsListTitleText");
    const actionsWrap = container.querySelector("#eventsHeaderActions");
    if (!stack) return;

    stack.innerHTML = "";

    if (filterDate) {
      // Filter mode: user selected a specific calendar date
      const matchedEvents = events.filter((ev) =>
        isSameDay(ev.event_date, filterDate.year, filterDate.month, filterDate.date)
      );

      if (titleText) {
        titleText.textContent = `Events on ${monthNames[filterDate.month].slice(0, 3)} ${filterDate.date}`;
      }

      if (actionsWrap) {
        actionsWrap.innerHTML = `
          <button class="btn-reset-filter" id="btnResetFilter" title="Clear filter and view all upcoming events">
            ✕ Show All
          </button>
        `;
        const resetBtn = actionsWrap.querySelector("#btnResetFilter");
        if (resetBtn) {
          resetBtn.onclick = () => {
            selectedDate = null;
            container.querySelectorAll(".cal-day-cell").forEach((el) => el.classList.remove("active"));
            renderEventsList(events, null);
            updateSelectedDateNote(null, calYear, calMonth, events);
          };
        }
      }

      if (matchedEvents.length === 0) {
        stack.innerHTML = `
          <div class="calendar-empty-day">
            <span class="empty-day-icon">📅</span>
            <span class="empty-day-title">No events on this day</span>
            <span class="empty-day-desc">There are no academic events or exams scheduled for ${monthNames[filterDate.month]} ${filterDate.date}, ${filterDate.year}.</span>
            <button class="btn-reset-calendar" id="btnResetCalendarEmpty">View All Upcoming Events</button>
          </div>
        `;
        const emptyResetBtn = stack.querySelector("#btnResetCalendarEmpty");
        if (emptyResetBtn) {
          emptyResetBtn.onclick = () => {
            selectedDate = null;
            container.querySelectorAll(".cal-day-cell").forEach((el) => el.classList.remove("active"));
            renderEventsList(events, null);
            updateSelectedDateNote(null, calYear, calMonth, events);
          };
        }
        return;
      }

      // Render matched day events
      matchedEvents.forEach((ev) => appendEventRow(ev, stack));
    } else {
      // Default mode: Show upcoming approved events
      if (titleText) titleText.textContent = "Upcoming Events";

      if (actionsWrap) {
        actionsWrap.innerHTML = `<a class="widget-link" id="linkViewAllEvents">View All →</a>`;
        const linkViewAll = actionsWrap.querySelector("#linkViewAllEvents");
        if (linkViewAll && navigate) linkViewAll.onclick = () => navigate("events");
      }

      if (events.length === 0) {
        stack.innerHTML = `
          <div style="padding: 32px; text-align: center; color: var(--text-muted); font-size: 13px;">
            No upcoming events scheduled. Click View All to explore past and department events.
          </div>
        `;
        return;
      }

      // Top 3 upcoming events
      events.slice(0, 3).forEach((ev) => appendEventRow(ev, stack));
    }
  }

  function appendEventRow(ev, stack) {
    let monthStr = "EVENT";
    let dayStr = "•";
    let timeStr = "TBA";

    try {
      const d = new Date(ev.event_date);
      monthStr = d.toLocaleString("default", { month: "short" }).toUpperCase();
      dayStr = d.getDate();
      timeStr = d.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
    } catch (e) {}

    const row = document.createElement("div");
    row.className = "event-row-card";
    row.innerHTML = `
      <div class="event-date-badge">
        <span class="event-date-month">${monthStr}</span>
        <span class="event-date-num">${dayStr}</span>
      </div>
      <div class="event-details">
        <div class="event-name">${escapeHTML(ev.title)}</div>
        <div class="event-meta">
          <span class="event-meta-item">
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"></circle><polyline points="12 6 12 12 16 14"></polyline></svg>
            ${escapeHTML(timeStr)}
          </span>
          <span class="event-meta-item">
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"></path><circle cx="12" cy="10" r="3"></circle></svg>
            ${escapeHTML(ev.location || "Campus")}
          </span>
        </div>
      </div>
      <div class="event-arrow">→</div>
    `;
    row.onclick = () => navigate && navigate("events");
    stack.appendChild(row);
  }

  // Render Calendar Grid
  function renderCalendar(year, month, events) {
    const label = container.querySelector("#calMonthLabel");
    if (label) label.textContent = `${monthNames[month]} ${year}`;

    const grid = container.querySelector("#calGridBody");
    if (!grid) return;
    grid.innerHTML = "";

    const firstDayIndex = new Date(year, month, 1).getDay(); // 0 for Sunday
    const daysInMonth = new Date(year, month + 1, 0).getDate();

    // Map days with events in this month
    const eventDayNumbers = new Set();
    events.forEach((ev) => {
      try {
        const d = new Date(ev.event_date);
        if (d.getFullYear() === year && d.getMonth() === month) {
          eventDayNumbers.add(d.getDate());
        }
      } catch (e) {}
    });

    const today = new Date();
    const isCurrentMonth = today.getFullYear() === year && today.getMonth() === month;
    const todayDate = today.getDate();

    let dayCounter = 1;
    for (let r = 0; r < 6; r++) {
      if (dayCounter > daysInMonth) break;
      const tr = document.createElement("tr");

      for (let c = 0; c < 7; c++) {
        const td = document.createElement("td");

        if ((r === 0 && c < firstDayIndex) || dayCounter > daysInMonth) {
          td.innerHTML = "";
        } else {
          const currentDayNum = dayCounter;
          const isSelected =
            selectedDate &&
            selectedDate.year === year &&
            selectedDate.month === month &&
            selectedDate.date === currentDayNum;

          const isToday = isCurrentMonth && currentDayNum === todayDate;
          const hasEvent = eventDayNumbers.has(currentDayNum);

          const cell = document.createElement("div");
          cell.className = `cal-day-cell ${isSelected ? "active" : ""}`;
          if (isToday && !isSelected) {
            cell.style.borderColor = "var(--primary-mint-border)";
          }

          cell.innerHTML = `
            ${currentDayNum}
            ${hasEvent && !isSelected ? '<span class="cal-event-dot"></span>' : ""}
          `;

          cell.onclick = () => {
            if (selectedDate && selectedDate.date === currentDayNum && selectedDate.month === month && selectedDate.year === year) {
              // Clicking same day again clears filter
              selectedDate = null;
              cell.classList.remove("active");
              renderEventsList(events, null);
              updateSelectedDateNote(null, year, month, events);
            } else {
              selectedDate = { year, month, date: currentDayNum };
              container.querySelectorAll(".cal-day-cell").forEach((el) => el.classList.remove("active"));
              cell.classList.add("active");
              renderEventsList(events, selectedDate);
              updateSelectedDateNote(currentDayNum, year, month, events);
            }
          };

          td.appendChild(cell);
          dayCounter++;
        }
        tr.appendChild(td);
      }
      grid.appendChild(tr);
    }

    updateSelectedDateNote(selectedDate?.date || null, year, month, events);
  }

  function updateSelectedDateNote(dayNum, year, month, events) {
    const noteEl = container.querySelector("#selectedDateText");
    if (!noteEl) return;

    if (!dayNum) {
      noteEl.textContent = "Click any day with a dot to filter events";
      return;
    }

    const dayEvents = events.filter((ev) => isSameDay(ev.event_date, year, month, dayNum));
    if (dayEvents.length > 0) {
      noteEl.innerHTML = `<strong>Day ${dayNum}:</strong> ${dayEvents.length} event(s) scheduled (${escapeHTML(dayEvents[0].title)})`;
    } else {
      noteEl.textContent = `Day ${dayNum}: No events scheduled.`;
    }
  }

  // Load Real Data from MySQL API
  async function loadData() {
    const activeToken = localStorage.getItem("token");
    if (!activeToken) {
      if (navigate) navigate("login");
      return;
    }

    const errorBanner = container.querySelector("#dashErrorBanner");
    if (errorBanner) errorBanner.style.display = "none";

    try {
      // 1. Fetch Tasks & Deadlines (Academic Flight Deck)
      const tasksRes = await api.get("/tasks", activeToken);
      if (tasksRes.success && tasksRes.tasks) {
        const tasks = tasksRes.tasks;
        const now = new Date();
        const endOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 23, 59, 59);
        const inSevenDays = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000);

        let overdueCount = 0;
        let dueTodayCount = 0;
        let dueSoonCount = 0;
        let completedCount = 0;

        tasks.forEach((t) => {
          if (t.is_completed) {
            completedCount++;
            return;
          }

          const dueDate = new Date(t.due_date);
          if (dueDate < now) {
            overdueCount++;
          } else if (dueDate <= endOfToday) {
            dueTodayCount++;
          } else if (dueDate <= inSevenDays) {
            dueSoonCount++;
          }
        });

        const urgentPending = overdueCount + dueTodayCount + dueSoonCount;
        const countDeadlinesEl = container.querySelector("#countDeadlines");
        const sublineDeadlinesEl = container.querySelector("#sublineDeadlines");

        if (countDeadlinesEl) {
          countDeadlinesEl.textContent = urgentPending;
        }

        if (sublineDeadlinesEl) {
          if (overdueCount > 0) {
            sublineDeadlinesEl.innerHTML = `
              <span class="dash-badge dash-badge-danger">${overdueCount} Overdue</span>
              ${dueTodayCount > 0 ? `<span class="dash-badge dash-badge-warning">${dueTodayCount} Due Today</span>` : ""}
            `;
          } else if (dueTodayCount > 0) {
            sublineDeadlinesEl.innerHTML = `
              <span class="dash-badge dash-badge-warning">${dueTodayCount} Due Today</span>
              ${dueSoonCount > 0 ? `<span style="color: var(--text-muted); font-size: 11.5px;">${dueSoonCount} soon</span>` : ""}
            `;
          } else if (dueSoonCount > 0) {
            sublineDeadlinesEl.innerHTML = `
              <span class="dash-badge dash-badge-emerald">${dueSoonCount} Due This Week</span>
            `;
          } else {
            sublineDeadlinesEl.innerHTML = `
              <span class="dash-badge dash-badge-emerald">✓ All Caught Up</span>
            `;
          }
        }

        // Card 2: Coursework Progress Tracker
        const countProgressEl = container.querySelector("#countProgress");
        const progressFill = container.querySelector("#progressFill");
        const sublineProgressEl = container.querySelector("#sublineProgress");

        const totalTasks = tasks.length;
        const percent = totalTasks > 0 ? Math.round((completedCount / totalTasks) * 100) : 100;

        if (countProgressEl) {
          countProgressEl.textContent = `${completedCount} / ${totalTasks}`;
        }
        if (progressFill) {
          progressFill.style.width = `${percent}%`;
        }
        if (sublineProgressEl) {
          if (totalTasks === 0) {
            sublineProgressEl.innerHTML = `<span style="color: var(--text-muted); font-size: 11.5px;">No coursework tasks assigned yet</span>`;
          } else {
            sublineProgressEl.innerHTML = `
              <span style="color: var(--primary-mint); font-weight: 700;">${percent}%</span>
              <span>of batch tasks completed</span>
            `;
          }
        }
      }

      // 2. Fetch Events & Academic Routine
      let nextUpLoaded = false;
      const nextUpTitleEl = container.querySelector("#nextUpTitle");
      const sublineNextUpEl = container.querySelector("#sublineNextUp");

      try {
        const academicRes = await api.get("/academic", activeToken);
        if (academicRes.success && academicRes.routine && academicRes.routine.length > 0) {
          const days = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
          const currentDayName = days[new Date().getDay()];
          const todaysClasses = academicRes.routine.filter(
            (r) => r.day_of_week && r.day_of_week.toLowerCase() === currentDayName.toLowerCase()
          );

          if (todaysClasses.length > 0) {
            const nextClass = todaysClasses[0];
            if (nextUpTitleEl) nextUpTitleEl.textContent = nextClass.course_name;
            if (sublineNextUpEl) {
              sublineNextUpEl.innerHTML = `
                <span class="dash-badge dash-badge-info">Class Today</span>
                <span>${escapeHTML(nextClass.time_slot || "")} · ${escapeHTML(nextClass.room_no || "")}</span>
              `;
            }
            nextUpLoaded = true;
          }
        }
      } catch (e) {
        // Routine fetch is non-blocking
      }

      // Fetch Events
      const eventsRes = await api.get("/events", activeToken);
      if (eventsRes.success && eventsRes.events) {
        liveEvents = eventsRes.events;

        // If no class was scheduled today, use nearest upcoming academic event
        if (!nextUpLoaded) {
          if (liveEvents.length > 0) {
            const nearestEvent = liveEvents[0];
            let dateStr = "Upcoming";
            try {
              dateStr = formatDate(nearestEvent.event_date);
            } catch (e) {}

            if (nextUpTitleEl) nextUpTitleEl.textContent = nearestEvent.title;
            if (sublineNextUpEl) {
              sublineNextUpEl.innerHTML = `
                <span class="dash-badge dash-badge-emerald">Event</span>
                <span>${dateStr} · ${escapeHTML(nearestEvent.location || "Campus")}</span>
              `;
            }
          } else {
            if (nextUpTitleEl) nextUpTitleEl.textContent = "No Upcoming Events";
            if (sublineNextUpEl) {
              sublineNextUpEl.innerHTML = `<span style="color: var(--text-dim);">No academic events scheduled</span>`;
            }
          }
        }

        // Render Events List (honors selected date if any)
        renderEventsList(liveEvents, selectedDate);

        // Render Calendar
        renderCalendar(calYear, calMonth, liveEvents);
      }

      // Check unread notifications to enhance Next Up widget if unread announcements exist
      try {
        const notifRes = await api.get("/notifications", activeToken);
        if (notifRes.success && notifRes.unreadCount > 0) {
          const unreadPill = document.createElement("span");
          unreadPill.className = "dash-pill-unread";
          unreadPill.textContent = `${notifRes.unreadCount} New`;
          unreadPill.title = "Unread notifications available";
          if (sublineNextUpEl) sublineNextUpEl.appendChild(unreadPill);
        }
      } catch (e) {}

      // 3. Fetch Notices/Announcements
      const noticesRes = await api.get("/notices", activeToken);
      if (noticesRes.success && noticesRes.notices) {
        const notices = noticesRes.notices;
        const pinnedTitle = container.querySelector("#pinnedTitle");
        const pinnedDate = container.querySelector("#pinnedDate");
        const pinnedBadge = container.querySelector("#pinnedBadge");

        if (notices.length > 0) {
          // Pinned first, else latest
          const noticeItem = notices.find((n) => n.is_pinned) || notices[0];

          if (pinnedTitle) pinnedTitle.textContent = noticeItem.title;
          if (pinnedDate) pinnedDate.textContent = formatDate(noticeItem.created_at);
          if (pinnedBadge) {
            if (noticeItem.is_pinned) {
              pinnedBadge.textContent = "📌 Pinned";
              pinnedBadge.style.display = "inline-flex";
            } else if (noticeItem.priority === "Urgent") {
              pinnedBadge.textContent = "🚨 Urgent";
              pinnedBadge.className = "dash-badge dash-badge-danger";
              pinnedBadge.style.display = "inline-flex";
            } else {
              pinnedBadge.style.display = "none";
            }
          }
        } else {
          if (pinnedTitle) pinnedTitle.textContent = "No announcements posted yet.";
          if (pinnedDate) pinnedDate.textContent = "";
          if (pinnedBadge) pinnedBadge.style.display = "none";
        }
      }
    } catch (err) {
      console.warn("Dashboard sync error:", err.message);

      // Handle expired or invalid JWT token
      if (err.message && (err.message.includes("401") || err.message.includes("token") || err.message.includes("Access denied"))) {
        localStorage.removeItem("token");
        localStorage.removeItem("user");
        if (navigate) navigate("login");
        return;
      }

      if (errorBanner) errorBanner.style.display = "flex";
    }
  }

  // Interactivity Handlers
  setTimeout(() => {
    // Metric cards navigation
    const cardDeadlines = container.querySelector("#cardDeadlines");
    if (cardDeadlines && navigate) cardDeadlines.onclick = () => navigate("tasks");

    const cardProgress = container.querySelector("#cardProgress");
    if (cardProgress && navigate) cardProgress.onclick = () => navigate("tasks");

    const cardNextUp = container.querySelector("#cardNextUp");
    if (cardNextUp && navigate) cardNextUp.onclick = () => navigate("events");

    // Student alternative quick action
    const btnStudentQuickAction = container.querySelector("#btnStudentQuickAction");
    if (btnStudentQuickAction && navigate) {
      btnStudentQuickAction.onclick = () => navigate("tasks");
    }

    const linkAnnounce = container.querySelector("#linkViewAllAnnouncements");
    if (linkAnnounce && navigate) linkAnnounce.onclick = () => navigate("announcements");

    const pinnedBox = container.querySelector("#pinnedAnnouncementBox");
    if (pinnedBox && navigate) pinnedBox.onclick = () => navigate("announcements");

    const viewSelectedLink = container.querySelector("#viewSelectedDateEventsLink");
    if (viewSelectedLink && navigate) {
      viewSelectedLink.onclick = (e) => {
        e.preventDefault();
        navigate("events");
      };
    }

    // Calendar month pagination
    const prevBtn = container.querySelector("#calPrevBtn");
    if (prevBtn) {
      prevBtn.onclick = () => {
        calMonth--;
        if (calMonth < 0) {
          calMonth = 11;
          calYear--;
        }
        selectedDate = null;
        renderCalendar(calYear, calMonth, liveEvents);
        renderEventsList(liveEvents, null);
      };
    }

    const nextBtn = container.querySelector("#calNextBtn");
    if (nextBtn) {
      nextBtn.onclick = () => {
        calMonth++;
        if (calMonth > 11) {
          calMonth = 0;
          calYear++;
        }
        selectedDate = null;
        renderCalendar(calYear, calMonth, liveEvents);
        renderEventsList(liveEvents, null);
      };
    }

    // Retry Sync Button
    const retryBtn = container.querySelector("#btnRetrySync");
    if (retryBtn) {
      retryBtn.onclick = () => {
        loadData();
      };
    }

    // Modal logic for + New Announcement (CR and Admin only)
    if (isStaff) {
      const modal = container.querySelector("#newAnnouncementModal");
      const openBtn = container.querySelector("#btnNewAnnouncement");
      const closeBtn = container.querySelector("#modalCloseBtn");
      const cancelBtn = container.querySelector("#modalCancelBtn");
      const form = container.querySelector("#announcementForm");

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

      if (form) {
        form.onsubmit = async (e) => {
          e.preventDefault();
          const activeToken = localStorage.getItem("token");
          const submitBtn = container.querySelector("#btnPostAnnouncement");

          const payload = {
            title: container.querySelector("#announceTitle").value.trim(),
            description: container.querySelector("#announceDesc").value.trim(),
            category: container.querySelector("#announceCategory").value,
            priority: container.querySelector("#announcePriority")?.value || "Normal",
          };

          try {
            if (submitBtn) {
              submitBtn.disabled = true;
              submitBtn.textContent = "Posting...";
            }

            const res = await api.post("/notices", payload, activeToken);
            if (res.success) {
              showToast("Announcement posted successfully!", "success");
              closeModal();
              form.reset();
              loadData();
            }
          } catch (err) {
            showToast(err.message, "error");
          } finally {
            if (submitBtn) {
              submitBtn.disabled = false;
              submitBtn.textContent = "Post Announcement";
            }
          }
        };
      }
    }

    loadData();
  }, 0);

  return container;
}
