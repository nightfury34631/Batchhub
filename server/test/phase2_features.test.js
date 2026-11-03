import assert from "assert";
import db from "../src/config/db.js";

const BASE_URL = "http://localhost:5000/api";

async function request(path, options = {}) {
  const url = `${BASE_URL}${path}`;
  const res = await fetch(url, {
    ...options,
    headers: {
      "Content-Type": "application/json",
      ...(options.token ? { Authorization: `Bearer ${options.token}` } : {}),
      ...(options.headers || {}),
    },
    body: options.body ? JSON.stringify(options.body) : undefined,
  });
  const data = await res.json().catch(() => ({}));
  return { status: res.status, ok: res.ok, data };
}

let passed = 0;
let failed = 0;

async function test(name, fn) {
  try {
    await fn();
    console.log(`  ✓ PASS: ${name}`);
    passed++;
  } catch (err) {
    console.error(`  ✗ FAIL: ${name}`);
    console.error(`    ${err.message}`);
    failed++;
  }
}

async function runPhase2Tests() {
  console.log("\n=======================================================");
  console.log("   BATCHHUB PHASE 2: FUNCTIONAL IMPROVEMENTS TEST SUITE");
  console.log("=======================================================\n");

  const timestamp = Date.now();
  const studentEmail = `phase2_student_${timestamp}@test.edu`;
  const studentId = `P2_STU_${timestamp}`;
  const crEmail = `phase2_cr_${timestamp}@test.edu`;
  const crId = `P2_CR_${timestamp}`;
  const peerEmail = `phase2_peer_${timestamp}@test.edu`;
  const peerId = `P2_PEER_${timestamp}`;

  let studentToken = "";
  let studentUserId = null;
  let crToken = "";
  let crUserId = null;
  let peerToken = "";
  let peerUserId = null;

  // Setup test accounts
  const reg1 = await request("/auth/register", {
    method: "POST",
    body: { name: "Alice Student", email: studentEmail, password: "Password123!", student_id: studentId, batch: "2024", department: "CSE" }
  });
  studentUserId = reg1.data.userId || reg1.data.user?.id;

  const reg2 = await request("/auth/register", {
    method: "POST",
    body: { name: "Bob CR", email: crEmail, password: "Password123!", student_id: crId, batch: "2024", department: "CSE" }
  });
  crUserId = reg2.data.userId || reg2.data.user?.id;
  await db.execute("UPDATE users SET role = 'cr' WHERE id = ?", [crUserId]);

  const reg3 = await request("/auth/register", {
    method: "POST",
    body: { name: "Charlie Peer", email: peerEmail, password: "Password123!", student_id: peerId, batch: "2024", department: "CSE" }
  });
  peerUserId = reg3.data.userId || reg3.data.user?.id;

  // Login
  const login1 = await request("/auth/login", { method: "POST", body: { email: studentEmail, password: "Password123!" } });
  studentToken = login1.data.token;

  const login2 = await request("/auth/login", { method: "POST", body: { email: crEmail, password: "Password123!" } });
  crToken = login2.data.token;

  const login3 = await request("/auth/login", { method: "POST", body: { email: peerEmail, password: "Password123!" } });
  peerToken = login3.data.token;

  // 1. GLOBAL SEARCH
  console.log("--- 1. Real Cross-Module Global Search ---");

  // Create searchable items
  let testNoticeId = null;
  const noticeRes = await request("/notices", {
    method: "POST",
    token: crToken,
    body: {
      title: `Quantum Computing Seminar ${timestamp}`,
      description: "Exciting lecture on superconducting qubits.",
      category: "academic",
      priority: "Important",
    },
  });
  testNoticeId = noticeRes.data.noticeId;

  let testProjId = null;
  const projRes = await request("/projects", {
    method: "POST",
    token: studentToken,
    body: {
      title: `Decentralized Ledger ${timestamp}`,
      tech_stack: "Rust, Solana, TypeScript",
      team_members: "Alice",
      repo_url: "https://github.com/alice/ledger",
      description: "High-throughput smart contract platform.",
    },
  });
  testProjId = projRes.data.projectId;

  await test("Global search locates student by partial name without leaking password hash", async () => {
    const res = await request(`/search?q=Alice`, { token: studentToken });
    assert.strictEqual(res.status, 200);
    assert.strictEqual(res.data.success, true);
    const found = res.data.results.students.find((s) => s.id === studentUserId);
    assert.ok(found, "Student Alice must be found");
    assert.strictEqual(found.password, undefined, "Password hash must NEVER be returned in search");
  });

  await test("Global search locates announcement by keyword", async () => {
    const res = await request(`/search?q=Quantum`, { token: studentToken });
    assert.strictEqual(res.status, 200);
    const found = res.data.results.announcements.find((a) => a.id === testNoticeId);
    assert.ok(found, "Announcement must be found in global search");
  });

  await test("Global search locates project by tech stack", async () => {
    const res = await request(`/search?q=Solana`, { token: peerToken });
    assert.strictEqual(res.status, 200);
    const found = res.data.results.projects.find((p) => p.id === testProjId);
    assert.ok(found, "Project must be found via tech stack");
  });

  await test("Empty search returns structured empty response", async () => {
    const res = await request("/search?q=", { token: studentToken });
    assert.strictEqual(res.status, 200);
    assert.strictEqual(res.data.totalCount, 0);
  });

  // 2. NOTIFICATIONS SYSTEM
  console.log("\n--- 2. Real Notification Center Engine ---");

  await test("Broadcast notification delivered to peers on new announcement", async () => {
    const res = await request("/notifications", { token: peerToken });
    assert.strictEqual(res.status, 200);
    assert.strictEqual(res.data.success, true);
    assert.ok(res.data.unreadCount > 0, "Unread count must be > 0");
    const notif = res.data.notifications.find((n) => n.related_entity_type === "announcement" && n.related_entity_id === testNoticeId);
    assert.ok(notif, "Notification for quantum seminar announcement must exist");
    assert.strictEqual(Number(notif.is_read), 0);
  });

  let targetNotifId = null;
  await test("Mark single notification as read", async () => {
    const listRes = await request("/notifications", { token: peerToken });
    targetNotifId = listRes.data.notifications[0].id;

    const res = await request(`/notifications/${targetNotifId}/read`, {
      method: "PUT",
      token: peerToken,
    });
    assert.strictEqual(res.status, 200);

    const checkRes = await request("/notifications", { token: peerToken });
    const updated = checkRes.data.notifications.find((n) => n.id === targetNotifId);
    assert.strictEqual(Number(updated.is_read), 1);
  });

  await test("Mark all notifications as read resets unread count to 0", async () => {
    const res = await request("/notifications/read-all", {
      method: "PUT",
      token: peerToken,
    });
    assert.strictEqual(res.status, 200);

    const checkRes = await request("/notifications", { token: peerToken });
    assert.strictEqual(checkRes.data.unreadCount, 0, "Unread count must be 0 after read-all");
  });

  // 3. ANNOUNCEMENTS MODULE
  console.log("\n--- 3. Announcements Module & Real Pinned Support ---");

  await test("CR can toggle pin status on announcement", async () => {
    const res = await request(`/notices/${testNoticeId}/pin`, {
      method: "PUT",
      token: crToken,
    });
    assert.strictEqual(res.status, 200);
    assert.strictEqual(res.data.is_pinned, 1);

    const listRes = await request("/notices", { token: studentToken });
    const pinnedNotice = listRes.data.notices.find((n) => n.id === testNoticeId);
    assert.strictEqual(Number(pinnedNotice.is_pinned), 1);
  });

  await test("Ordinary student cannot toggle pin status (403 Forbidden)", async () => {
    const res = await request(`/notices/${testNoticeId}/pin`, {
      method: "PUT",
      token: studentToken,
    });
    assert.strictEqual(res.status, 403);
  });

  await test("CR can unpin announcement", async () => {
    const res = await request(`/notices/${testNoticeId}/pin`, {
      method: "PUT",
      token: crToken,
    });
    assert.strictEqual(res.status, 200);
    assert.strictEqual(res.data.is_pinned, 0);
  });

  await test("CR can delete announcement", async () => {
    const res = await request(`/notices/${testNoticeId}`, {
      method: "DELETE",
      token: crToken,
    });
    assert.strictEqual(res.status, 200);
  });

  // 4. STUDENT INVITATION & PROJECT COLLABORATION
  console.log("\n--- 4. Student Invitation & Project Collaboration ---");

  await test("Project owner can retrieve their owned projects via GET /api/projects/my-projects", async () => {
    const res = await request("/projects/my-projects", { token: studentToken });
    assert.strictEqual(res.status, 200);
    assert.ok(res.data.projects.some((p) => p.id === testProjId));
  });

  await test("Project owner can invite peer to project", async () => {
    const res = await request(`/projects/${testProjId}/invite`, {
      method: "POST",
      token: studentToken,
      body: { studentId: peerUserId },
    });
    assert.strictEqual(res.status, 201);
    assert.strictEqual(res.data.success, true);

    // Verify invitation notification was created for peer
    const notifRes = await request("/notifications", { token: peerToken });
    const inviteNotif = notifRes.data.notifications.find((n) => n.type === "project" && n.related_entity_id === testProjId);
    assert.ok(inviteNotif, "Invited student must receive an invitation notification");
  });

  await test("Duplicate invitation is prevented (400 Bad Request)", async () => {
    const res = await request(`/projects/${testProjId}/invite`, {
      method: "POST",
      token: studentToken,
      body: { studentId: peerUserId },
    });
    assert.strictEqual(res.status, 400);
  });

  await test("Non-owner cannot invite peers to project (403 Forbidden)", async () => {
    const res = await request(`/projects/${testProjId}/invite`, {
      method: "POST",
      token: peerToken, // Charlie is not owner of Alice's project
      body: { studentId: crUserId },
    });
    assert.strictEqual(res.status, 403);
  });

  await test("Project details returns relational members roster", async () => {
    const res = await request(`/projects/${testProjId}`, { token: studentToken });
    assert.strictEqual(res.status, 200);
    assert.ok(res.data.project, "Project metadata present");
    assert.ok(Array.isArray(res.data.members), "Members array present");
    const ownerMember = res.data.members.find((m) => m.user_id === studentUserId);
    assert.ok(ownerMember, "Owner must be in relational members list");
    assert.strictEqual(ownerMember.role_in_project, "Owner");
  });

  // 5. PROFILE & PASSWORD CHANGE
  console.log("\n--- 5. Profile Updates & Secure Password Change ---");

  await test("Updating profile persists personal details", async () => {
    const res = await request("/users/profile", {
      method: "PUT",
      token: studentToken,
      body: {
        name: "Alice Rahman",
        student_id: studentId,
        batch: "2024",
        department: "CSE",
        skills: "Python, Rust, Distributed Systems",
        gender: "Female",
      },
    });
    assert.strictEqual(res.status, 200);
    assert.strictEqual(res.data.user.name, "Alice Rahman");
    assert.strictEqual(res.data.user.skills, "Python, Rust, Distributed Systems");
  });

  await test("Change password with incorrect current password is rejected (401)", async () => {
    const res = await request("/users/change-password", {
      method: "PUT",
      token: studentToken,
      body: {
        currentPassword: "WrongPassword999!",
        newPassword: "BrandNewPassword2026!",
      },
    });
    assert.strictEqual(res.status, 401);
  });

  await test("Change password with short new password is rejected (400)", async () => {
    const res = await request("/users/change-password", {
      method: "PUT",
      token: studentToken,
      body: {
        currentPassword: "Password123!",
        newPassword: "123", // too short
      },
    });
    assert.strictEqual(res.status, 400);
  });

  await test("Change password with valid credentials updates password and allows login with new password", async () => {
    const changeRes = await request("/users/change-password", {
      method: "PUT",
      token: studentToken,
      body: {
        currentPassword: "Password123!",
        newPassword: "BrandNewPassword2026!",
      },
    });
    assert.strictEqual(changeRes.status, 200);

    // Old password should now fail
    const oldLogin = await request("/auth/login", {
      method: "POST",
      body: { email: studentEmail, password: "Password123!" },
    });
    assert.strictEqual(oldLogin.status, 401);

    // New password should succeed
    const newLogin = await request("/auth/login", {
      method: "POST",
      body: { email: studentEmail, password: "BrandNewPassword2026!" },
    });
    assert.strictEqual(newLogin.status, 200);
    assert.ok(newLogin.data.token);
  });

  // SUMMARY & CLEANUP
  console.log("\n=======================================================");
  console.log(`TOTAL PHASE 2 TESTS: ${passed + failed}`);
  console.log(`PASSED:              ${passed}`);
  console.log(`FAILED:              ${failed}`);
  console.log("=======================================================\n");

  // Clean test artifacts
  try {
    if (testProjId) {
      await db.execute("DELETE FROM project_members WHERE project_id = ?", [testProjId]);
      await db.execute("DELETE FROM project_requests WHERE project_id = ?", [testProjId]);
      await db.execute("DELETE FROM projects WHERE id = ?", [testProjId]);
    }
    await db.execute("DELETE FROM notifications WHERE user_id IN (?, ?, ?)", [studentUserId, crUserId, peerUserId]);
    await db.execute("DELETE FROM users WHERE email LIKE 'phase2_%@test.edu'");
  } catch (e) {}

  process.exit(failed > 0 ? 1 : 0);
}

runPhase2Tests().catch((err) => {
  console.error("Test execution failed:", err);
  process.exit(1);
});
