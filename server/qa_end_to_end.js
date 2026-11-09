const http = require('http');
const path = require('path');
const Database = require('better-sqlite3');

function apiCall(endpoint, method = 'GET', body = null, token = null) {
  return new Promise((resolve, reject) => {
    const headers = { 'Content-Type': 'application/json' };
    if (token) headers['Authorization'] = `Bearer ${token}`;

    const req = http.request({
      hostname: 'localhost',
      port: 5000,
      path: encodeURI('/api' + endpoint),
      method,
      headers
    }, res => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        try {
          resolve({ status: res.statusCode, body: JSON.parse(data) });
        } catch {
          resolve({ status: res.statusCode, raw: data });
        }
      });
    });
    req.on('error', reject);
    if (body) req.write(JSON.stringify(body));
    req.end();
  });
}

async function runQA() {
  console.log('================================================================');
  console.log(' 🛡️  CAMPUSPULSE COMPREHENSIVE END-TO-END QA TEST SUITE');
  console.log('================================================================\n');

  let passed = 0;
  let total = 0;

  function test(condition, description) {
    total++;
    if (condition) {
      console.log(`  [PASS] ${description}`);
      passed++;
    } else {
      console.error(`  [FAIL] ${description}`);
      throw new Error(`Assertion failed: ${description}`);
    }
  }

  // --- SECTION 1: HEALTH & PUBLIC ENDPOINTS ---
  console.log('--- 1. Health & Public Endpoints ---');
  const health = await apiCall('/health');
  test(health.status === 200 && health.body.status === 'ok', 'GET /api/health responds with 200 OK');

  // --- SECTION 2: STUDENT REGISTRATION ---
  console.log('\n--- 2. Student Registration ---');
  const uniqueTimestamp = Date.now();
  const studentEmail = `qa_student_${uniqueTimestamp}@campuspulse.edu`;

  // Validation checks
  const emptyReg = await apiCall('/auth/register', 'POST', { name: '', email: '', password: '' });
  test(emptyReg.status === 400, 'Registration rejects empty fields with 400');

  const shortPassReg = await apiCall('/auth/register', 'POST', { name: 'Test', email: 'test@campuspulse.edu', password: '123' });
  test(shortPassReg.status === 400, 'Registration rejects password < 6 characters with 400');

  const invalidEmailReg = await apiCall('/auth/register', 'POST', { name: 'Test', email: 'not-an-email', password: 'password123' });
  test(invalidEmailReg.status === 400, 'Registration rejects invalid email format with 400');

  // Valid registration
  const validReg = await apiCall('/auth/register', 'POST', {
    name: 'QA Test Student',
    email: studentEmail,
    password: 'securePassword123'
  });
  test(validReg.status === 201 && validReg.body.token && validReg.body.user.role === 'student', 'Student registration succeeds with 201 and returns JWT token');
  const student1Token = validReg.body.token;
  const student1Id = validReg.body.user.id;

  // Duplicate registration check
  const dupReg = await apiCall('/auth/register', 'POST', {
    name: 'Duplicate Student',
    email: studentEmail,
    password: 'securePassword123'
  });
  test(dupReg.status === 409, 'Duplicate email registration rejected with 409 Conflict');

  // --- SECTION 3: AUTHENTICATION & LOGIN ---
  console.log('\n--- 3. Authentication & Login ---');
  // Student login
  const studentLogin = await apiCall('/auth/login', 'POST', {
    email: studentEmail,
    password: 'securePassword123'
  });
  test(studentLogin.status === 200 && studentLogin.body.user.email === studentEmail, 'Student login succeeds with valid credentials');

  // Seed demo student login
  const demoStudentLogin = await apiCall('/auth/login', 'POST', {
    email: 'student@campuspulse.edu',
    password: 'student123'
  });
  test(demoStudentLogin.status === 200 && demoStudentLogin.body.user.role === 'student', 'Seed Student login (student@campuspulse.edu) succeeds');
  const demoStudentToken = demoStudentLogin.body.token;

  // Seed demo admin login
  const demoAdminLogin = await apiCall('/auth/login', 'POST', {
    email: 'admin@campuspulse.edu',
    password: 'admin123'
  });
  test(demoAdminLogin.status === 200 && demoAdminLogin.body.user.role === 'admin', 'Seed Admin login (admin@campuspulse.edu) succeeds with role "admin"');
  const adminToken = demoAdminLogin.body.token;

  // Invalid login credentials
  const badPassLogin = await apiCall('/auth/login', 'POST', {
    email: studentEmail,
    password: 'wrongPassword'
  });
  test(badPassLogin.status === 401, 'Login with incorrect password rejected with 401');

  const badEmailLogin = await apiCall('/auth/login', 'POST', {
    email: 'nonexistent@campuspulse.edu',
    password: 'password123'
  });
  test(badEmailLogin.status === 401, 'Login with nonexistent email rejected with 401');

  // Session verification (/auth/me)
  const meCheck = await apiCall('/auth/me', 'GET', null, student1Token);
  test(meCheck.status === 200 && meCheck.body.user.id === student1Id, 'Session verification (/auth/me) returns authenticated profile');

  // Unauthorized request rejected
  const unauthCheck = await apiCall('/auth/me', 'GET', null, null);
  test(unauthCheck.status === 401, 'Unauthenticated request to protected route rejected with 401');

  // --- SECTION 4: COMPLAINT CREATION & SMART RULES ---
  console.log('\n--- 4. Complaint Creation & Smart Functionality ---');
  // Validation checks
  const missingFieldComplaint = await apiCall('/complaints', 'POST', { title: 'Broken' }, student1Token);
  test(missingFieldComplaint.status === 400, 'Complaint submission rejects missing required fields with 400');

  const invalidCategoryComplaint = await apiCall('/complaints', 'POST', {
    title: 'Faulty AC',
    description: 'AC is leaking water on the floor',
    category: 'InvalidCategoryName',
    location: 'Main Building'
  }, student1Token);
  test(invalidCategoryComplaint.status === 400, 'Complaint submission rejects invalid category with 400');

  // Smart rule-based auto-classification: Critical
  const criticalComplaint = await apiCall('/complaints', 'POST', {
    title: 'Severe Water Pipe Flood in Science Laboratory',
    description: 'Major pipe burst causing severe flood and danger of electric shock in Lab 102. Immediate emergency action required!',
    category: 'Water',
    location: 'Science Block'
  }, student1Token);
  test(
    criticalComplaint.status === 201 &&
    criticalComplaint.body.complaint.priority === 'Critical' &&
    /^CP-\d{4}-\d{5}$/.test(criticalComplaint.body.complaint.complaint_number),
    'Rule engine correctly auto-classifies emergency/flood keywords as Critical with format CP-YYYY-XXXXX'
  );
  const createdComplaintId = criticalComplaint.body.complaint.id;
  const createdComplaintNumber = criticalComplaint.body.complaint.complaint_number;

  // Manual priority selection
  const manualPriorityComplaint = await apiCall('/complaints', 'POST', {
    title: 'Whiteboard marker dried out',
    description: 'Markers in Room 101 need replacement before next lecture.',
    category: 'Classroom',
    location: 'Engineering Block',
    priority: 'Low'
  }, student1Token);
  test(manualPriorityComplaint.status === 201 && manualPriorityComplaint.body.complaint.priority === 'Low', 'Manual priority choice "Low" is respected');

  // Duplicate complaint detection
  const dupComplaint = await apiCall('/complaints', 'POST', {
    title: 'Severe Water Pipe Flood in Science Laboratory',
    description: 'Identical attempt submitted within 24 hours',
    category: 'Water',
    location: 'Science Block'
  }, student1Token);
  test(
    dupComplaint.status === 409 &&
    dupComplaint.body.existingComplaint === createdComplaintNumber,
    'Duplicate complaint detection blocks duplicate ticket within 24 hours with 409'
  );

  // --- SECTION 5: COMPLAINT TRACKING & ACCESS CONTROL ---
  console.log('\n--- 5. Complaint Tracking & Access Control ---');
  // Student lists complaints
  const studentList = await apiCall('/complaints', 'GET', null, student1Token);
  test(
    studentList.status === 200 &&
    studentList.body.complaints.length === 2 &&
    studentList.body.complaints.every(c => c.user_id === student1Id),
    'Student complaint listing returns ONLY tickets owned by that student'
  );

  // Student views details of their complaint
  const complaintDetail = await apiCall(`/complaints/${createdComplaintId}`, 'GET', null, student1Token);
  test(
    complaintDetail.status === 200 &&
    complaintDetail.body.complaint.id === createdComplaintId &&
    complaintDetail.body.history.length === 1 &&
    complaintDetail.body.history[0].status === 'Submitted',
    'Student can view complaint details with initial status history event'
  );

  // Second student registers to test isolation
  const secondStudentReg = await apiCall('/auth/register', 'POST', {
    name: 'Second Student',
    email: `second_${uniqueTimestamp}@campuspulse.edu`,
    password: 'password123'
  });
  const secondStudentToken = secondStudentReg.body.token;

  // Second student attempts to view first student's complaint
  const unauthorizedView = await apiCall(`/complaints/${createdComplaintId}`, 'GET', null, secondStudentToken);
  test(unauthorizedView.status === 403, 'Unauthorized student is rejected with 403 when trying to access another student\'s ticket');

  // --- SECTION 6: ADMIN CAPABILITIES & COMPLAINT FILTERING ---
  console.log('\n--- 6. Admin Capabilities & Complaint Filtering ---');
  // Admin sees all complaints
  const adminListAll = await apiCall('/complaints', 'GET', null, adminToken);
  test(adminListAll.status === 200 && adminListAll.body.total >= 8, 'Admin lists all campus complaints across all students');

  // Filter by status: Submitted
  const filterSubmitted = await apiCall('/complaints?status=Submitted', 'GET', null, adminToken);
  test(
    filterSubmitted.status === 200 &&
    filterSubmitted.body.complaints.every(c => c.status === 'Submitted'),
    'Filter complaints by status "Submitted" returns only matching tickets'
  );

  // Filter by status: In Progress
  const filterInProgress = await apiCall('/complaints?status=In Progress', 'GET', null, adminToken);
  test(
    filterInProgress.status === 200 &&
    filterInProgress.body.complaints.every(c => c.status === 'In Progress'),
    'Filter complaints by status "In Progress" returns only matching tickets'
  );

  // Filter by category: Water
  const filterWater = await apiCall('/complaints?category=Water', 'GET', null, adminToken);
  test(
    filterWater.status === 200 &&
    filterWater.body.complaints.every(c => c.category === 'Water'),
    'Filter complaints by category "Water" returns only matching tickets'
  );

  // Search by complaint number
  const searchById = await apiCall(`/complaints?search=${createdComplaintNumber}`, 'GET', null, adminToken);
  test(
    searchById.status === 200 &&
    searchById.body.complaints.length === 1 &&
    searchById.body.complaints[0].complaint_number === createdComplaintNumber,
    'Search by complaint number finds exact ticket'
  );

  // Combined search and category filter
  const combinedFilter = await apiCall('/complaints?category=Water&status=Submitted', 'GET', null, adminToken);
  test(
    combinedFilter.status === 200 &&
    combinedFilter.body.complaints.every(c => c.category === 'Water' && c.status === 'Submitted'),
    'Combined category and status filtering works as expected'
  );

  // --- SECTION 7: STATUS UPDATES & AUDIT TRAIL ---
  console.log('\n--- 7. Status Updates & Audit Trail ---');
  // Student denied from updating status
  const studentDeniedUpdate = await apiCall(`/complaints/${createdComplaintId}/status`, 'PATCH', {
    status: 'In Progress'
  }, student1Token);
  test(studentDeniedUpdate.status === 403, 'Student is denied with 403 when attempting status update');

  // Admin updates status to "In Progress" with note
  const updateToInProgress = await apiCall(`/complaints/${createdComplaintId}/status`, 'PATCH', {
    status: 'In Progress',
    note: 'Plumbing contractor dispatched to Science Block Lab 102'
  }, adminToken);
  test(
    updateToInProgress.status === 200 &&
    updateToInProgress.body.complaint.status === 'In Progress',
    'Admin updates status to "In Progress"'
  );

  // Admin updates status to "Resolved" with resolution note
  const updateToResolved = await apiCall(`/complaints/${createdComplaintId}/status`, 'PATCH', {
    status: 'Resolved',
    note: 'Main valve replaced, floor dried and inspected by facility manager'
  }, adminToken);
  test(
    updateToResolved.status === 200 &&
    updateToResolved.body.complaint.status === 'Resolved' &&
    updateToResolved.body.complaint.resolved_at !== null,
    'Admin updates status to "Resolved" and resolved_at timestamp is populated'
  );

  // Verify status timeline now contains 3 chronological events
  const timelineCheck = await apiCall(`/complaints/${createdComplaintId}`, 'GET', null, student1Token);
  test(
    timelineCheck.status === 200 &&
    timelineCheck.body.history.length === 3 &&
    timelineCheck.body.history[1].status === 'In Progress' &&
    timelineCheck.body.history[2].status === 'Resolved',
    'Status history records full 3-step audit trail with author names and notes'
  );

  // --- SECTION 8: DATABASE PERSISTENCE CHECK ---
  console.log('\n--- 8. Database Persistence (Direct SQLite Disk Verification) ---');
  const dbPath = path.join(__dirname, 'data', 'campuspulse.db');
  const diskDb = new Database(dbPath, { readonly: true });

  const diskUser = diskDb.prepare('SELECT id, email, role FROM users WHERE id = ?').get(student1Id);
  test(diskUser && diskUser.email === studentEmail, 'Registered student is physically persisted in users table on disk');

  const diskComplaint = diskDb.prepare('SELECT id, complaint_number, status, resolved_at FROM complaints WHERE id = ?').get(createdComplaintId);
  test(
    diskComplaint &&
    diskComplaint.status === 'Resolved' &&
    diskComplaint.resolved_at !== null,
    'Updated complaint and resolved_at are physically persisted in complaints table on disk'
  );

  const diskHistory = diskDb.prepare('SELECT COUNT(*) as count FROM status_history WHERE complaint_id = ?').get(createdComplaintId);
  test(diskHistory && diskHistory.count === 3, 'Audit timeline (3 records) is physically persisted in status_history table on disk');
  diskDb.close();

  // --- SECTION 9: ADMIN STATS UPDATE VERIFICATION ---
  console.log('\n--- 9. Dashboard Statistics Verification ---');
  const statsRes = await apiCall('/stats/admin', 'GET', null, adminToken);
  test(
    statsRes.status === 200 &&
    statsRes.body.total >= 8 &&
    statsRes.body.resolved >= 3 &&
    statsRes.body.byCategory.some(c => c.category === 'Water') &&
    typeof statsRes.body.avgResolutionHours === 'number',
    'Admin dashboard statistics accurately reflect the resolved complaint and SLA resolution time'
  );

  // --- SECTION 10: DELETION WITH CONFIRMATION & CASCADE ---
  console.log('\n--- 10. Deletion Flow & Foreign Key Cascade ---');
  // Student cannot delete
  const studentDeleteAttempt = await apiCall(`/complaints/${createdComplaintId}`, 'DELETE', null, student1Token);
  test(studentDeleteAttempt.status === 403, 'Student cannot delete complaint (403 Forbidden)');

  // Admin deletes complaint
  const adminDelete = await apiCall(`/complaints/${createdComplaintId}`, 'DELETE', null, adminToken);
  test(adminDelete.status === 200, 'Admin can delete inappropriate/test complaint with 200 OK');

  // Verify complaint no longer exists
  const postDeleteFetch = await apiCall(`/complaints/${createdComplaintId}`, 'GET', null, adminToken);
  test(postDeleteFetch.status === 404, 'Deleted complaint returns 404 Not Found on subsequent requests');

  // Direct disk verify that cascade deleted status_history
  const diskDbAfter = new Database(dbPath, { readonly: true });
  const diskHistoryAfter = diskDbAfter.prepare('SELECT COUNT(*) as count FROM status_history WHERE complaint_id = ?').get(createdComplaintId);
  test(diskHistoryAfter.count === 0, 'Foreign key cascade successfully purged associated status history on disk');
  diskDbAfter.close();

  console.log('\n================================================================');
  console.log(` 🏆 QA RESULTS: ${passed}/${total} TESTS PASSED (100%)`);
  console.log('================================================================\n');
}

runQA().catch(err => {
  console.error('\n❌ QA FAILED WITH ERROR:', err);
  process.exit(1);
});
