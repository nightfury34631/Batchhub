import { api } from "../assets/js/api.js";
import { escapeHTML, formatDate, formatTime, showToast } from "../assets/js/uiUtils.js";

export function DashboardView(navigate = null) {
  const container = document.createElement("div");
  container.className = "dashboard-page";

  const user = JSON.parse(localStorage.getItem("user")) || {
    name: "Tripto",
    role: "student",
  };

  const firstName = user.name ? user.name.split(" ")[0] : "Student";

  // State for dynamic calendar
  let calDate = new Date();
  let calYear = calDate.getFullYear();
  let calMonth = calDate.getMonth(); // 0-11
  let liveEvents = [];
  let selectedDateNum = new Date().getDate();

  container.innerHTML = `
    <!-- 1. Welcome Header -->
    <div class="welcome-section">
      <h1 class="welcome-heading">Welcome back, ${escapeHTML(firstName)}! 👋</h1>
      <p class="welcome-subtext">Here's what's happening across your batch and department.</p>
    </div>

    <!-- 2. Dynamic Metric Cards (3 Columns) -->
    <div class="metrics-row">
      <!-- Total Students Card -->
      <div class="metric-card" id="cardStudents" title="View Students Directory">
        <div class="metric-icon-box">
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path>
            <circle cx="9" cy="7" r="4"></circle>
            <path d="M23 21v-2a4 4 0 0 0-3-3.87"></path>
            <path d="M16 3.13a4 4 0 0 1 0 7.75"></path>
          </svg>
        </div>
        <div class="metric-info">
          <span class="metric-title">Total Students</span>
          <span class="metric-value" id="countStudents">...</span>
        </div>
      </div>

      <!-- Total Events Card -->
      <div class="metric-card" id="cardEvents" title="View Events">
        <div class="metric-icon-box">
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect>
            <line x1="16" y1="2" x2="16" y2="6"></line>
            <line x1="8" y1="2" x2="8" y2="6"></line>
            <line x1="3" y1="10" x2="21" y2="10"></line>
          </svg>
        </div>
        <div class="metric-info">
          <span class="metric-title">Total Events</span>
          <span class="metric-value" id="countEvents">...</span>
        </div>
      </div>

      <!-- Total Announcements Card -->
      <div class="metric-card" id="cardAnnouncements" title="View Announcements">
        <div class="metric-icon-box">
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <path d="M18 8a3 3 0 0 0-3-3H5a2 2 0 0 0-2 2v8a2 2 0 0 0 2 2h10a3 3 0 0 0 3-3V8z"></path>
            <path d="M21 15V9"></path>
            <path d="M6 19v2"></path>
            <path d="M14 19v2"></path>
          </svg>
        </div>
        <div class="metric-info">
          <span class="metric-title">Total Announcements</span>
          <span class="metric-value" id="countAnnouncements">...</span>
        </div>
      </div>
    </div>

    <!-- 3. Middle Section: Dynamic Calendar + Upcoming Events (2 Columns) -->
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
          <span id="selectedDateText">Events on selected day</span>
          <a href="#" id="viewSelectedDateEventsLink" style="color: var(--primary-mint); text-decoration: none; font-weight: 600;">View in Events →</a>
        </div>
      </div>

      <!-- Right Card: Upcoming Events Stack -->
      <div class="widget-card">
        <div class="widget-header">
          <div class="widget-header-title">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect>
              <line x1="16" y1="2" x2="16" y2="6"></line>
              <line x1="8" y1="2" x2="8" y2="6"></line>
              <line x1="3" y1="10" x2="21" y2="10"></line>
            </svg>
            <span>Upcoming Events</span>
          </div>
          <a class="widget-link" id="linkViewAllEvents">View All →</a>
        </div>

        <div class="events-list-stack" id="eventsListStack">
          <div style="padding: 24px; text-align: center; color: var(--text-muted); font-size: 13px;">
            Loading upcoming events...
          </div>
        </div>
      </div>
    </div>

    <!-- 4. Bottom Section: Announcements -->
    <div class="announcements-card">
      <div class="widget-header">
        <div class="widget-header-title">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <path d="M18 8a3 3 0 0 0-3-3H5a2 2 0 0 0-2 2v8a2 2 0 0 0 2 2h10a3 3 0 0 0 3-3V8z"></path>
            <path d="M21 15V9"></path>
            <path d="M6 19v2"></path>
            <path d="M14 19v2"></path>
          </svg>
          <span>Announcements</span>
        </div>
        <div class="announcements-header-right">
          <a class="widget-link" id="linkViewAllAnnouncements">View All →</a>
          <button class="btn-new-announcement" id="btnNewAnnouncement">
            <span>+</span>
            <span>New Announcement</span>
          </button>
        </div>
      </div>

      <!-- Dynamic Announcements Container -->
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
            <span class="badge-pinned">📌 Pinned</span>
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

    <!-- New Announcement Modal -->
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
  `;

  // Dynamic Calendar Render Function
  function renderCalendar(year, month, events) {
    const monthNames = [
      "January", "February", "March", "April", "May", "June",
      "July", "August", "September", "October", "November", "December"
    ];

    const label = container.querySelector("#calMonthLabel");
    if (label) label.textContent = `${monthNames[month]} ${year}`;

    const grid = container.querySelector("#calGridBody");
    if (!grid) return;
    grid.innerHTML = "";

    const firstDayIndex = new Date(year, month, 1).getDay(); // 0 for Sunday
    const daysInMonth = new Date(year, month + 1, 0).getDate();

    // Find days with events in this month
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
          const isSelected = currentDayNum === selectedDateNum;
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
            selectedDateNum = currentDayNum;
            container.querySelectorAll(".cal-day-cell").forEach((el) => el.classList.remove("active"));
            cell.classList.add("active");
            updateSelectedDateNote(currentDayNum, year, month, events);
          };

          td.appendChild(cell);
          dayCounter++;
        }
        tr.appendChild(td);
      }
      grid.appendChild(tr);
    }

    updateSelectedDateNote(selectedDateNum, year, month, events);
  }

  function updateSelectedDateNote(dayNum, year, month, events) {
    const noteEl = container.querySelector("#selectedDateText");
    if (!noteEl) return;

    const dayEvents = events.filter((ev) => {
      try {
        const d = new Date(ev.event_date);
        return d.getFullYear() === year && d.getMonth() === month && d.getDate() === dayNum;
      } catch (e) {
        return false;
      }
    });

    if (dayEvents.length > 0) {
      noteEl.innerHTML = `<strong>Day ${dayNum}:</strong> ${dayEvents.length} event(s) scheduled (${escapeHTML(dayEvents[0].title)})`;
    } else {
      noteEl.textContent = `Day ${dayNum}: No events scheduled.`;
    }
  }

  // Load Real Data from MySQL API
  async function loadData() {
    const token = localStorage.getItem("token");
    if (!token) return;

    try {
      // 1. Fetch Members/Students
      const membersRes = await api.get("/members", token);
      if (membersRes.success && membersRes.members) {
        const countEl = container.querySelector("#countStudents");
        if (countEl) countEl.textContent = membersRes.members.length;
      }

      // 2. Fetch Events
      const eventsRes = await api.get("/events", token);
      if (eventsRes.success && eventsRes.events) {
        liveEvents = eventsRes.events;
        const countEventsEl = container.querySelector("#countEvents");
        if (countEventsEl) countEventsEl.textContent = liveEvents.length;

        // Render upcoming events list
        const stack = container.querySelector("#eventsListStack");
        if (stack) {
          stack.innerHTML = "";
          if (liveEvents.length === 0) {
            stack.innerHTML = `
              <div style="padding: 24px; text-align: center; color: var(--text-dim); font-size: 13px;">
                No upcoming events scheduled. Click View All to add or browse events!
              </div>`;
          } else {
            liveEvents.slice(0, 3).forEach((ev) => {
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
            });
          }
        }

        // Render dynamic calendar
        renderCalendar(calYear, calMonth, liveEvents);
      }

      // 3. Fetch Notices/Announcements
      const noticesRes = await api.get("/notices", token);
      if (noticesRes.success && noticesRes.notices) {
        const notices = noticesRes.notices;
        const countAnnounceEl = container.querySelector("#countAnnouncements");
        if (countAnnounceEl) countAnnounceEl.textContent = notices.length;

        if (notices.length > 0) {
          const first = notices[0];
          const pinnedTitle = container.querySelector("#pinnedTitle");
          const pinnedDate = container.querySelector("#pinnedDate");
          if (pinnedTitle) pinnedTitle.textContent = first.title;
          if (pinnedDate) pinnedDate.textContent = formatDate(first.created_at);
        } else {
          const pinnedTitle = container.querySelector("#pinnedTitle");
          if (pinnedTitle) pinnedTitle.textContent = "No announcements posted yet.";
        }
      }
    } catch (err) {
      console.warn("Dashboard sync:", err.message);
    }
  }

  // Interactivity Handlers
  setTimeout(() => {
    // Metric cards navigation
    const cardStudents = container.querySelector("#cardStudents");
    if (cardStudents && navigate) cardStudents.onclick = () => navigate("members");

    const cardEvents = container.querySelector("#cardEvents");
    if (cardEvents && navigate) cardEvents.onclick = () => navigate("events");

    // Click Total Announcements card -> goes to dedicated announcements view!
    const cardAnnounce = container.querySelector("#cardAnnouncements");
    if (cardAnnounce && navigate) cardAnnounce.onclick = () => navigate("announcements");

    const linkEvents = container.querySelector("#linkViewAllEvents");
    if (linkEvents && navigate) linkEvents.onclick = () => navigate("events");

    // View All Announcements -> goes to announcements view!
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
        renderCalendar(calYear, calMonth, liveEvents);
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
        renderCalendar(calYear, calMonth, liveEvents);
      };
    }

    // Modal logic for + New Announcement
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
        const token = localStorage.getItem("token");
        const submitBtn = container.querySelector("#btnPostAnnouncement");

        const payload = {
          title: container.querySelector("#announceTitle").value.trim(),
          description: container.querySelector("#announceDesc").value.trim(),
          category: container.querySelector("#announceCategory").value,
        };

        try {
          if (submitBtn) {
            submitBtn.disabled = true;
            submitBtn.textContent = "Posting...";
          }

          const res = await api.post("/notices", payload, token);
          if (res.success) {
            showToast("Announcement posted successfully!", "success");
            closeModal();
            form.reset();
            loadData(); // Refresh counts and list live!
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

    loadData();
  }, 0);

  return container;
}
