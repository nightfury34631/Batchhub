---
target: client/views/tasksView.js
total_score: 18
max_score: 40
na_heuristics: 
p0_count: 1
p1_count: 1
target_identity: "file:C:\\Users\\Night_Fury\\Desktop\\full\\SDP-I\\client\\views\\tasksView.js"
target_fingerprint: "sha256:142c5265cf58195ec3b2c39cf4ee8285769008e749afcd88ec6adae0b4dc44ea"
target_path: "C:\\Users\\Night_Fury\\Desktop\\full\\SDP-I\\client\\views\\tasksView.js"
timestamp: 2026-11-03T20-21-18Z
slug: client-views-tasksview-js
---
# Critique: client/views/tasksView.js

## Design Health Score

| # | Heuristic | Score | Key Issue |
|---|-----------|:-----:|-----------|
| 1 | Visibility of System Status | 1/4 | es.pendingTasks discarded; student submissions disappear into invisible queue; no workload counters |
| 2 | Match System / Real World | 2/4 | Raw timestamps without academic relative framing ("Due Friday before Lab"); missing assignment category taxonomy |
| 3 | User Control and Freedom | 2/4 | No task editing; accidental errors require full deletion; detail modal lacks completion toggle |
| 4 | Consistency and Standards | 2/4 | "Badge Salad" with 3 disparate pills per card; detector flagged off-scale font-size (18px) and border-radius (4px) |
| 5 | Error Prevention | 2/4 | Freeform course code input causes fragmented casing/duplicates; past due dates allowed |
| 6 | Recognition Rather than Recall | 2/4 | Zero course-level filtering forces manual search recall; no chronological timeline/calendar view |
| 7 | Flexibility and Efficiency | 1/4 | Zero sorting controls (cannot sort by due date or course); orthogonal status/priority filters are mutually exclusive |
| 8 | Aesthetic and Minimalist Design | 2/4 | High visual noise (36 competing badges across 12 cards); double-red warning fatigue on overdue high-priority items |
| 9 | Error Recovery | 3/4 | Destructive deletion guarded by confirm dialog, but form submission feedback relies purely on toasts |
| 10 | Help and Documentation | 1/4 | Zero guidance or empty states explaining the CR moderation lifecycle to contributing students |
| **Total** | | **18/40** | **Severe Usability Deficit** |

## Design Specificity Verdict
- **Verdict**: Category-Interchangeable with Superficial Academic Veneer
- **LLM Assessment**: Despite course code fields, the page functions as a generic flat todo list. It disconnects from the core university cohort lifecycle: academic deadlines are not anchored to semester weeks or submission types, cohort momentum is absent, and the primary value proposition—a peer-contributed, CR-moderated workflow—is completely severed because pending tasks are ignored.
- **Deterministic Scan**: 2 violations in client/views/tasksView.js:
  - design-system-font-size at line 118 (ont-size: 18px on #detailTaskTitle violates DESIGN.md typography scale).
  - design-system-radius at line 237 (order-radius: 4px on .delete-task-btn violates DESIGN.md rounded scale).
  - Shared CSS violations in main.css: line 1167 (ont-size: 18px), line 1179 (order-radius: 6px).

## What's Working
1. **Independent Per-Student Completion Tracking**: Uses 	ask_completions relational mapping cleanly so marking a task complete toggles personal progress without deleting or mutating the shared cohort deadline.
2. **Faithful "Nocturnal Observatory" Baseline Theme**: Clean dark background (#0B1418), solid card surfaces (#111D22), subtle borders (#1A2F37), and emerald accents with zero garish glow antipatterns.
3. **Focused Detail Modal Architecture**: Separates dense problem sets and PDF submission instructions into a clean inspection dialog with pre-line whitespace formatting.

## Priority Issues
- **[P0] Discarded CR Moderation Queue & Ghost Submissions**: pi.get("/tasks") returns { success: true, tasks, pendingTasks }, but 	asksView.js discards pendingTasks. CRs have no approval controls on this page, and students' submitted tasks vanish without explanation.
- **[P1] Missing Academic Sorting & Broken Orthogonal Filtering**: Tasks cannot be sorted by due date, urgency, or course. Filter tabs conflate lifecycle status (Active, Completed, Overdue) with priority (High Priority 🔴), creating cognitive dead ends.
- **[P2] "Badge Salad" & Visual Scannability Degradation**: Every card renders 3 identical-weight pill badges side-by-side (Course, Priority, Deadline), resulting in 36 competing focal points in a 12-card grid and double-red alert fatigue.
- **[P3] Form Usability, Accessibility, and Modal Disconnect**: Course code is unvalidated text, datetime-local accepts past dates, cards lack keyboard accessibility (ole="button", 	abindex="0", Enter/Space activation), modals lack Escape key listener and ARIA dialog attributes, and the detail modal is a dead end without a completion toggle.

## Persona Red Flags
- **Arif (Sleep-Deprived Junior)**: Facing multiple deadlines at 1:45 AM, he is confronted by 14 unsorted cards with 42 multi-colored badges. He cannot filter to only tomorrow morning's course and misses a submission.
- **Tanvir (Class Representative)**: Checks the Tasks page after students tell him they added assignments. The page shows nothing pending, with zero moderation controls, forcing him to check database records or WhatsApp.
- **Nadia (Diligent Freshman)**: Submits a chemistry deadline to help her peers. The modal closes, but the task doesn't appear in the grid. Assuming the app failed, she re-submits it three times.

## Minor Observations
- Filter tab includes hardcoded emoji (High Priority 🔴) inconsistent with the rest of the UI.
- Creator attribution falls back to "By: Faculty / CR", misleadingly labeling student contributions.
- Over 15 inline style="..." attributes bypass the design system.

## Questions to Consider
- Why is the defining CR moderation workflow completely absent from the very page where cohort tasks live?
- Why are deadlines presented solely as cards rather than an academic chronological list or weekly timeline?
- Why does the card have a "Mark Complete" button, but opening the dedicated task detail view lacks any action?
