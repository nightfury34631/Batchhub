import assert from "assert";

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

async function runTests() {
  console.log("\n=======================================================");
  console.log("   BATCHHUB PHASE 1: SECURITY & FUNCTIONALITY TEST SUITE");
  console.log("=======================================================\n");

  const timestamp = Date.now();
  const testStudentEmail = `test_student_${timestamp}@test.edu`;
  const testStudentId = `STU_${timestamp}`;
  const testCrEmail = `test_cr_${timestamp}@test.edu`;
  const testCrId = `CR_${timestamp}`;
  const testAdminEmail = `test_admin_${timestamp}@test.edu`;
  const testAdminId = `ADM_${timestamp}`;

  let studentToken = "";
  let studentUserId = null;
  let crToken = "";
  let crUserId = null;
  let adminToken = "";
  let adminUserId = null;

  // 1. REGISTRATION ROLE ESCALATION
  console.log("--- 1. Registration Role Escalation & Account Security ---");

  await test("Public registration with role='admin' is forced to role='student'", async () => {
    const res = await request("/auth/register", {
      method: "POST",
      body: {
        name: "Malicious Admin Wannabe",
        email: testAdminEmail,
        password: "Password123!",
        student_id: testAdminId,
        batch: "2024",
        department: "CSE",
        role: "admin", // Malicious payload attempting privilege escalation
      },
    });
    assert.strictEqual(res.status, 201, `Expected status 201, got ${res.status}`);
    assert.strictEqual(res.data.success, true);
    adminUserId = res.data.userId || (res.data.user && res.data.user.id);
    assert.ok(adminUserId, "Registered user must have a valid ID");
    assert.strictEqual(res.data.user.role, "student", "Role must be sanitized and forced to 'student'");
  });

  await test("Public registration with role='cr' is forced to role='student'", async () => {
    const res = await request("/auth/register", {
      method: "POST",
      body: {
        name: "CR Candidate",
        email: testCrEmail,
        password: "Password123!",
        student_id: testCrId,
        batch: "2024",
        department: "CSE",
        role: "cr",
      },
    });
    assert.strictEqual(res.status, 201);
    crUserId = res.data.userId || (res.data.user && res.data.user.id);
    assert.ok(crUserId, "Registered CR user must have a valid ID");
    assert.strictEqual(res.data.user.role, "student", "Role must be sanitized to 'student'");
  });

  await test("Normal public student registration succeeds", async () => {
    const res = await request("/auth/register", {
      method: "POST",
      body: {
        name: "Regular Student",
        email: testStudentEmail,
        password: "Password123!",
        student_id: testStudentId,
        batch: "2024",
        department: "CSE",
      },
    });
    assert.strictEqual(res.status, 201);
    studentUserId = res.data.userId || (res.data.user && res.data.user.id);
    assert.ok(studentUserId, "Registered student user must have a valid ID");
    assert.strictEqual(res.data.user.role, "student");
  });

  await test("Duplicate email registration is rejected with 409 Conflict", async () => {
    const res = await request("/auth/register", {
      method: "POST",
      body: {
        name: "Duplicate Email User",
        email: testStudentEmail.toUpperCase(), // Case insensitive test
        password: "Password123!",
        student_id: `OTHER_${timestamp}`,
        batch: "2024",
        department: "CSE",
      },
    });
    assert.strictEqual(res.status, 409, `Expected 409, got ${res.status}`);
    assert.strictEqual(res.data.success, false);
  });

  await test("Duplicate student_id registration is rejected with 409 Conflict", async () => {
    const res = await request("/auth/register", {
      method: "POST",
      body: {
        name: "Duplicate ID User",
        email: `unique_${timestamp}@test.edu`,
        password: "Password123!",
        student_id: testStudentId,
        batch: "2024",
        department: "CSE",
      },
    });
    assert.strictEqual(res.status, 409, `Expected 409, got ${res.status}`);
    assert.strictEqual(res.data.success, false);
  });

  // 2. AUTHENTICATION & LOGIN CHECKS
  console.log("\n--- 2. Authentication & Credential Protection ---");

  await test("Login with invalid password returns generic 401 Unauthorized", async () => {
    const res = await request("/auth/login", {
      method: "POST",
      body: { email: testStudentEmail, password: "WrongPassword999" },
    });
    assert.strictEqual(res.status, 401);
    assert.strictEqual(res.data.success, false);
  });

  await test("Login with non-existent email returns generic 401 Unauthorized", async () => {
    const res = await request("/auth/login", {
      method: "POST",
      body: { email: "ghost_user_does_not_exist@test.edu", password: "Password123!" },
    });
    assert.strictEqual(res.status, 401);
    assert.strictEqual(res.data.success, false);
  });

  await test("Valid student login returns JWT token", async () => {
    const res = await request("/auth/login", {
      method: "POST",
      body: { email: testStudentEmail, password: "Password123!" },
    });
    assert.strictEqual(res.status, 200);
    assert.ok(res.data.token, "Token must be present");
    studentToken = res.data.token;
  });

  await test("Login without token on protected route returns 401", async () => {
    const res = await request("/tasks");
    assert.strictEqual(res.status, 401);
  });

  // Promote test accounts for authorized testing
  const { default: db } = await import("../src/config/db.js");
  await db.execute("UPDATE users SET role = 'admin' WHERE id = ?", [adminUserId]);
  await db.execute("UPDATE users SET role = 'cr' WHERE id = ?", [crUserId]);

  // Re-login to generate role-bearing JWTs
  const adminLogin = await request("/auth/login", {
    method: "POST",
    body: { email: testAdminEmail, password: "Password123!" },
  });
  adminToken = adminLogin.data.token;

  const crLogin = await request("/auth/login", {
    method: "POST",
    body: { email: testCrEmail, password: "Password123!" },
  });
  crToken = crLogin.data.token;

  // 3. ADMIN ROLE MANAGEMENT ROUTE
  console.log("\n--- 3. Role Management & Access Control ---");

  await test("Student cannot change user roles (403 Forbidden)", async () => {
    const res = await request(`/users/${studentUserId}/role`, {
      method: "PUT",
      token: studentToken,
      body: { role: "admin" },
    });
    assert.strictEqual(res.status, 403);
  });

  await test("Admin can assign authorized roles via PUT /api/users/:userId/role", async () => {
    const res = await request(`/users/${studentUserId}/role`, {
      method: "PUT",
      token: adminToken,
      body: { role: "student" },
    });
    assert.strictEqual(res.status, 200);
    assert.strictEqual(res.data.success, true);
  });

  // 4. TASK AUTHORIZATION, COMPLETION VS DELETION
  console.log("\n--- 4. Task Management, Approval & Completion Tracking ---");

  let createdTaskId = null;
  await test("Student can create a task (submitted as pending approval)", async () => {
    const res = await request("/tasks", {
      method: "POST",
      token: studentToken,
      body: {
        title: `SDP Assignment Test ${timestamp}`,
        description: "Submit PDF report via LMS portal",
        course_code: "CSE-3200",
        due_date: new Date(Date.now() + 86400000).toISOString().slice(0, 19).replace("T", " "),
        priority: "High",
        department: "CSE",
      },
    });
    assert.strictEqual(res.status, 201);
    createdTaskId = res.data.taskId;
  });

  await test("Ordinary student cannot approve pending tasks (403 Forbidden)", async () => {
    const res = await request(`/tasks/${createdTaskId}/approve`, {
      method: "PUT",
      token: studentToken,
    });
    assert.strictEqual(res.status, 403);
  });

  await test("Ordinary student cannot reject pending tasks (403 Forbidden)", async () => {
    const res = await request(`/tasks/${createdTaskId}/reject`, {
      method: "DELETE",
      token: studentToken,
    });
    assert.strictEqual(res.status, 403);
  });

  await test("CR can approve pending task", async () => {
    const res = await request(`/tasks/${createdTaskId}/approve`, {
      method: "PUT",
      token: crToken,
    });
    assert.strictEqual(res.status, 200);
  });

  await test("Student can mark approved task complete without deleting it (task_completions)", async () => {
    const res = await request(`/tasks/${createdTaskId}/complete`, {
      method: "POST",
      token: studentToken,
    });
    assert.strictEqual(res.status, 200);
    assert.strictEqual(res.data.success, true);

    // Verify task still exists in tasks list and shows is_completed = 1
    const listRes = await request("/tasks", { token: studentToken });
    assert.strictEqual(listRes.status, 200);
    const completedTask = listRes.data.tasks.find((t) => t.id === createdTaskId);
    assert.ok(completedTask, "Task must still exist in the database!");
    assert.strictEqual(Number(completedTask.is_completed), 1, "Task must be marked as completed for user");
  });

  await test("Another student still sees the shared task as active / not completed", async () => {
    const crListRes = await request("/tasks", { token: crToken });
    const taskForCr = crListRes.data.tasks.find((t) => t.id === createdTaskId);
    assert.ok(taskForCr, "Task must be visible to CR");
    assert.strictEqual(Number(taskForCr.is_completed), 0, "Task completion must be per-user, not global");
  });

  await test("Student can uncomplete the task", async () => {
    const res = await request(`/tasks/${createdTaskId}/complete`, {
      method: "DELETE",
      token: studentToken,
    });
    assert.strictEqual(res.status, 200);

    const listRes = await request("/tasks", { token: studentToken });
    const uncompletedTask = listRes.data.tasks.find((t) => t.id === createdTaskId);
    assert.strictEqual(Number(uncompletedTask.is_completed), 0);
  });

  await test("Unrelated student cannot delete task created by someone else (403 Forbidden)", async () => {
    const otherEmail = `other_student_${timestamp}@test.edu`;
    await request("/auth/register", {
      method: "POST",
      body: {
        name: "Other Student",
        email: otherEmail,
        password: "Password123!",
        student_id: `OTHER_${timestamp}`,
        batch: "2024",
        department: "CSE",
      },
    });
    const loginRes = await request("/auth/login", {
      method: "POST",
      body: { email: otherEmail, password: "Password123!" },
    });
    const otherToken = loginRes.data.token;

    const delRes = await request(`/tasks/${createdTaskId}`, {
      method: "DELETE",
      token: otherToken,
    });
    assert.strictEqual(delRes.status, 403, "Unauthorized user must receive 403 Forbidden");
  });

  await test("Creator can delete their own task", async () => {
    const res = await request(`/tasks/${createdTaskId}`, {
      method: "DELETE",
      token: studentToken,
    });
    assert.strictEqual(res.status, 200);
  });

  // 5. PROJECT JOIN REQUEST AUTHORIZATION & RELATIONAL CONSISTENCY
  console.log("\n--- 5. Projects & Join Request Relational Integrity ---");

  let createdProjectId = null;
  await test("Creating project automatically registers creator in project_members as Owner", async () => {
    const res = await request("/projects", {
      method: "POST",
      token: studentToken,
      body: {
        title: `Robotics Controller ${timestamp}`,
        tech_stack: "C++, ROS2, Arduino",
        team_members: "Student",
        repo_url: "https://github.com/batchhub/robotics",
        description: "Autonomous obstacle avoidance robot",
        department: "CSE",
      },
    });
    assert.strictEqual(res.status, 201);
    createdProjectId = res.data.projectId;

    // Verify creator is in project_members
    const [members] = await db.execute(
      "SELECT * FROM project_members WHERE project_id = ? AND user_id = ?",
      [createdProjectId, studentUserId]
    );
    assert.strictEqual(members.length, 1);
    assert.strictEqual(members[0].role_in_project, "Owner");
  });

  await test("Project owner cannot request to join their own project", async () => {
    const res = await request(`/projects/${createdProjectId}/join`, {
      method: "POST",
      token: studentToken,
    });
    assert.strictEqual(res.status, 400);
    assert.strictEqual(res.data.success, false);
  });

  let requestId = null;
  await test("Another user can submit join request to the project", async () => {
    const res = await request(`/projects/${createdProjectId}/join`, {
      method: "POST",
      token: crToken,
    });
    assert.strictEqual(res.status, 201);
  });

  await test("Duplicate pending join request is rejected", async () => {
    const res = await request(`/projects/${createdProjectId}/join`, {
      method: "POST",
      token: crToken,
    });
    assert.strictEqual(res.status, 400);
  });

  await test("Non-owner cannot approve a project join request (403 Forbidden)", async () => {
    const [requests] = await db.execute(
      "SELECT id FROM project_requests WHERE project_id = ? AND user_id = ?",
      [createdProjectId, crUserId]
    );
    assert.ok(requests.length > 0, "Join request must exist in database");
    requestId = requests[0].id;

    const res = await request(`/projects/requests/${requestId}/approve`, {
      method: "PUT",
      token: crToken, // CR is not the owner of this project!
    });
    assert.strictEqual(res.status, 403, "Non-owner must receive 403 Forbidden");
  });

  await test("Project owner can approve join request and member is added to project_members", async () => {
    const res = await request(`/projects/requests/${requestId}/approve`, {
      method: "PUT",
      token: studentToken, // Owner
    });
    assert.strictEqual(res.status, 200);

    // Verify member is in project_members
    const [members] = await db.execute(
      "SELECT * FROM project_members WHERE project_id = ? AND user_id = ?",
      [createdProjectId, crUserId]
    );
    assert.strictEqual(members.length, 1);
    assert.strictEqual(members[0].role_in_project, "Member");
  });

  // 6. EVENT VISIBILITY & SEPARATION
  console.log("\n--- 6. Event Visibility & Separation ---");

  let createdEventId = null;
  await test("Student creates event (saved as pending)", async () => {
    const futureDate = new Date(Date.now() + 7 * 86400000).toISOString().slice(0, 19).replace("T", " ");
    const res = await request("/events", {
      method: "POST",
      token: studentToken,
      body: {
        title: `AI Seminar ${timestamp}`,
        description: "Guest lecture on LLMs in Education",
        event_date: futureDate,
        location: "Auditorium 1",
        department: "CSE",
      },
    });
    assert.strictEqual(res.status, 201);
    createdEventId = res.data.eventId;
  });

  await test("Ordinary student GET /api/events NEVER sees pending events in public events array", async () => {
    const res = await request("/events", { token: studentToken });
    assert.strictEqual(res.status, 200);
    const pendingInPublic = res.data.events.some((e) => e.status !== "approved");
    assert.strictEqual(pendingInPublic, false, "Public events array must strictly contain status='approved'");
    assert.strictEqual(res.data.pendingEvents.length, 0, "Students must not receive pendingEvents");
  });

  await test("CR GET /api/events receives pending events in pendingEvents array", async () => {
    const res = await request("/events", { token: crToken });
    assert.strictEqual(res.status, 200);
    const found = res.data.pendingEvents.some((e) => e.id === createdEventId);
    assert.strictEqual(found, true, "CR must receive pending event for review");
  });

  await test("Ordinary student cannot approve event (403 Forbidden)", async () => {
    const res = await request(`/events/${createdEventId}/approve`, {
      method: "PUT",
      token: studentToken,
    });
    assert.strictEqual(res.status, 403);
  });

  await test("CR can approve event and it appears in public events list", async () => {
    const res = await request(`/events/${createdEventId}/approve`, {
      method: "PUT",
      token: crToken,
    });
    assert.strictEqual(res.status, 200);

    const listRes = await request("/events", { token: studentToken });
    const foundApproved = listRes.data.events.some((e) => e.id === createdEventId);
    assert.strictEqual(foundApproved, true, "Approved event must now be visible to students");
  });

  // SUMMARY & CLEANUP
  console.log("\n=======================================================");
  console.log(`TOTAL TESTS: ${passed + failed}`);
  console.log(`PASSED:      ${passed}`);
  console.log(`FAILED:      ${failed}`);
  console.log("=======================================================\n");

  // Cleanup test artifacts
  try {
    if (createdProjectId) {
      await db.execute("DELETE FROM project_members WHERE project_id = ?", [createdProjectId]);
      await db.execute("DELETE FROM project_requests WHERE project_id = ?", [createdProjectId]);
      await db.execute("DELETE FROM projects WHERE id = ?", [createdProjectId]);
    }
    if (createdEventId) {
      await db.execute("DELETE FROM events WHERE id = ?", [createdEventId]);
    }
    await db.execute("DELETE FROM users WHERE email LIKE '%@test.edu'");
  } catch (e) {
    // ignore cleanup errors
  }

  process.exit(failed > 0 ? 1 : 0);
}

runTests().catch((err) => {
  console.error("Test execution failed:", err);
  process.exit(1);
});
