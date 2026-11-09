const http = require('http');

async function request(path, options = {}, body = null) {
  return new Promise((resolve, reject) => {
    const req = http.request({
      hostname: 'localhost',
      port: 5000,
      path: '/api' + path,
      method: options.method || 'GET',
      headers: {
        'Content-Type': 'application/json',
        ...(options.headers || {})
      }
    }, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        try {
          resolve({ status: res.statusCode, data: JSON.parse(data) });
        } catch(e) {
          resolve({ status: res.statusCode, raw: data });
        }
      });
    });
    req.on('error', reject);
    if (body) req.write(JSON.stringify(body));
    req.end();
  });
}

async function runTests() {
  console.log('🧪 Starting CampusPulse Automated Test Suite...\n');
  let passed = 0;
  let total = 0;

  function assert(condition, message) {
    total++;
    if (condition) {
      console.log('  ✅ ' + message);
      passed++;
    } else {
      console.error('  ❌ FAILED: ' + message);
    }
  }

  // 1. Health check
  const health = await request('/health');
  assert(health.status === 200 && health.data.status === 'ok', 'Health check returns 200 OK');

  // 2. Invalid credentials rejected
  const badLogin = await request('/auth/login', { method: 'POST' }, { email: 'student@campuspulse.edu', password: 'wrongpassword' });
  assert(badLogin.status === 401, 'Invalid login rejected with 401');

  // 3. Admin login works
  const adminLogin = await request('/auth/login', { method: 'POST' }, { email: 'admin@campuspulse.edu', password: 'admin123' });
  assert(adminLogin.status === 200 && adminLogin.data.user.role === 'admin' && !!adminLogin.data.token, 'Admin login succeeds and returns JWT');
  const adminToken = adminLogin.data.token;

  // 4. Student login works
  const studentLogin = await request('/auth/login', { method: 'POST' }, { email: 'student@campuspulse.edu', password: 'student123' });
  assert(studentLogin.status === 200 && studentLogin.data.user.role === 'student' && !!studentLogin.data.token, 'Student login succeeds and returns JWT');
  const studentToken = studentLogin.data.token;

  // 5. Registration works
  const newEmail = 'newstudent_' + Date.now() + '@campuspulse.edu';
  const reg = await request('/auth/register', { method: 'POST' }, { name: 'Fresh Student', email: newEmail, password: 'password123' });
  assert(reg.status === 201 && reg.data.user.role === 'student' && !!reg.data.token, 'Student registration succeeds with 201');
  const freshToken = reg.data.token;

  // 6. Duplicate registration rejected
  const dupReg = await request('/auth/register', { method: 'POST' }, { name: 'Duplicate', email: newEmail, password: 'password123' });
  assert(dupReg.status === 409, 'Duplicate registration email rejected with 409');

  // 7. Verify session (/auth/me)
  const me = await request('/auth/me', { headers: { Authorization: 'Bearer ' + freshToken } });
  assert(me.status === 200 && me.data.user.email === newEmail, 'Session verification (/auth/me) works');

  // 8. Unauthorized API requests rejected
  const unauth = await request('/complaints');
  assert(unauth.status === 401, 'Unauthorized request rejected with 401');

  // 9. Student can create complaint with auto-priority
  const newComplaint = await request('/complaints', { method: 'POST', headers: { Authorization: 'Bearer ' + freshToken } }, {
    title: 'Water pipe leakage in science lab',
    description: 'There is an urgent water pipe leak causing floor flooding in Lab 301.',
    category: 'Water',
    location: 'Science Block'
  });
  assert(newComplaint.status === 201 && (newComplaint.data.complaint.priority === 'Critical' || newComplaint.data.complaint.priority === 'High'), 'Student created complaint with rule-based auto priority (' + newComplaint.data?.complaint?.priority + ')');
  const createdId = newComplaint.data.complaint.id;

  // 10. Duplicate complaint detection
  const dupComplaint = await request('/complaints', { method: 'POST', headers: { Authorization: 'Bearer ' + freshToken } }, {
    title: 'Water pipe leakage in science lab',
    description: 'Duplicate attempt within 24h',
    category: 'Water',
    location: 'Science Block'
  });
  assert(dupComplaint.status === 409, 'Duplicate complaint rejected within 24 hours with 409');

  // 11. Student sees only their complaints
  const studentList = await request('/complaints', { headers: { Authorization: 'Bearer ' + freshToken } });
  assert(studentList.status === 200 && studentList.data.complaints.length === 1 && studentList.data.complaints[0].id === createdId, 'Student sees only their own complaints (1 complaint)');

  // 12. Student cannot access other student complaints details
  const forbiddenDetail = await request('/complaints/' + createdId, { headers: { Authorization: 'Bearer ' + studentToken } });
  assert(forbiddenDetail.status === 403, 'Other student forbidden from viewing complaint details (403)');

  // 13. Admin sees all complaints
  const adminList = await request('/complaints', { headers: { Authorization: 'Bearer ' + adminToken } });
  assert(adminList.status === 200 && adminList.data.total >= 8, 'Admin sees all complaints (total: ' + adminList.data.total + ')');

  // 14. Admin can update complaint status
  const updateStatus = await request('/complaints/' + createdId + '/status', {
    method: 'PATCH',
    headers: { Authorization: 'Bearer ' + adminToken }
  }, { status: 'In Progress', note: 'Plumbing technician dispatched' });
  assert(updateStatus.status === 200 && updateStatus.data.complaint.status === 'In Progress', 'Admin updated complaint status to In Progress');

  // 15. Student forbidden from updating status
  const studentUpdate = await request('/complaints/' + createdId + '/status', {
    method: 'PATCH',
    headers: { Authorization: 'Bearer ' + freshToken }
  }, { status: 'Resolved' });
  assert(studentUpdate.status === 403, 'Student forbidden from updating complaint status (403)');

  // 16. Admin can resolve and calculate resolution
  const resolveStatus = await request('/complaints/' + createdId + '/status', {
    method: 'PATCH',
    headers: { Authorization: 'Bearer ' + adminToken }
  }, { status: 'Resolved', note: 'Pipe replaced and area dried' });
  assert(resolveStatus.status === 200 && resolveStatus.data.complaint.status === 'Resolved' && !!resolveStatus.data.complaint.resolved_at, 'Admin resolved complaint with timestamp');

  // 17. Timeline / Status history tracked
  const detailWithHistory = await request('/complaints/' + createdId, { headers: { Authorization: 'Bearer ' + adminToken } });
  assert(detailWithHistory.status === 200 && detailWithHistory.data.history.length === 3, 'Status history tracked with full timeline (3 entries)');

  // 18. Statistics update correctly
  const adminStats = await request('/stats/admin', { headers: { Authorization: 'Bearer ' + adminToken } });
  assert(adminStats.status === 200 && adminStats.data.total >= 8 && adminStats.data.resolved >= 2, 'Admin statistics reflect accurate counts and metrics');

  // 19. Admin can delete complaint
  const deleteRes = await request('/complaints/' + createdId, {
    method: 'DELETE',
    headers: { Authorization: 'Bearer ' + adminToken }
  });
  assert(deleteRes.status === 200, 'Admin can delete complaint (200 OK)');

  // 20. Confirm deleted complaint no longer exists
  const postDelete = await request('/complaints/' + createdId, { headers: { Authorization: 'Bearer ' + adminToken } });
  assert(postDelete.status === 404, 'Deleted complaint returns 404');

  console.log('\n=============================================');
  console.log(`Results: ${passed}/${total} tests passed (${Math.round((passed/total)*100)}%)`);
  console.log('=============================================\n');
}

runTests().catch(console.error);
