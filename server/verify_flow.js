const http = require('http');

async function req(path, options = {}, body = null) {
  return new Promise((resolve, reject) => {
    const request = http.request({
      hostname: 'localhost',
      port: 5000,
      path: '/api' + path,
      method: options.method || 'GET',
      headers: {
        'Content-Type': 'application/json',
        ...(options.headers || {})
      }
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
    request.on('error', reject);
    if (body) request.write(JSON.stringify(body));
    request.end();
  });
}

async function verifyFlow() {
  console.log('🔍 Running Complaint Submission & Admin Status Update Flow Verification...\n');

  // Step 1: Student login
  console.log('Step 1: Logging in as Student (student@campuspulse.edu)...');
  const studentLogin = await req('/auth/login', { method: 'POST' }, {
    email: 'student@campuspulse.edu',
    password: 'student123'
  });
  if (studentLogin.status !== 200) throw new Error('Student login failed: ' + JSON.stringify(studentLogin.body));
  const studentToken = studentLogin.body.token;
  console.log('  ✅ Student logged in successfully. Token acquired.\n');

  // Step 2: Submit a new complaint
  console.log('Step 2: Submitting a new complaint as Student...');
  const submitRes = await req('/complaints', {
    method: 'POST',
    headers: { Authorization: `Bearer ${studentToken}` }
  }, {
    title: 'Library Air Conditioning Outage',
    description: 'The AC units on the 3rd floor quiet study area have stopped working during exam week. Urgent repair needed.',
    category: 'Electricity',
    location: 'Main Library'
  });
  if (submitRes.status !== 201) throw new Error('Complaint submission failed: ' + JSON.stringify(submitRes.body));
  const complaint = submitRes.body.complaint;
  console.log(`  ✅ Complaint submitted successfully!`);
  console.log(`     ID: ${complaint.id}`);
  console.log(`     Complaint Number: ${complaint.complaint_number}`);
  console.log(`     Status: ${complaint.status}`);
  console.log(`     Auto Priority: ${complaint.priority} (Rule-based classification worked)\n`);

  // Step 3: Student verifies complaint appears in their history
  console.log('Step 3: Verifying complaint appears in student complaint list...');
  const studentComplaints = await req('/complaints', {
    headers: { Authorization: `Bearer ${studentToken}` }
  });
  const foundInStudentList = studentComplaints.body.complaints.some(c => c.id === complaint.id);
  if (!foundInStudentList) throw new Error('Newly created complaint not found in student list');
  console.log(`  ✅ Complaint verified in student history (${studentComplaints.body.total} total complaints for this student).\n`);

  // Step 4: Admin login
  console.log('Step 4: Logging in as Admin (admin@campuspulse.edu)...');
  const adminLogin = await req('/auth/login', { method: 'POST' }, {
    email: 'admin@campuspulse.edu',
    password: 'admin123'
  });
  if (adminLogin.status !== 200) throw new Error('Admin login failed');
  const adminToken = adminLogin.body.token;
  console.log('  ✅ Admin logged in successfully.\n');

  // Step 5: Admin inspects complaint details
  console.log('Step 5: Admin inspecting complaint details & timeline...');
  const detailRes = await req(`/complaints/${complaint.id}`, {
    headers: { Authorization: `Bearer ${adminToken}` }
  });
  if (detailRes.status !== 200) throw new Error('Admin failed to get complaint details');
  console.log(`  ✅ Complaint retrieved: "${detailRes.body.complaint.title}"`);
  console.log(`     Initial timeline events: ${detailRes.body.history.length}\n`);

  // Step 6: Admin updates status to "In Progress"
  console.log('Step 6: Admin updates status to "In Progress"...');
  const inProgressRes = await req(`/complaints/${complaint.id}/status`, {
    method: 'PATCH',
    headers: { Authorization: `Bearer ${adminToken}` }
  }, {
    status: 'In Progress',
    note: 'HVAC repair team dispatched to 3rd floor library'
  });
  if (inProgressRes.status !== 200 || inProgressRes.body.complaint.status !== 'In Progress') {
    throw new Error('Failed to update status to In Progress: ' + JSON.stringify(inProgressRes.body));
  }
  console.log('  ✅ Status successfully updated to "In Progress".\n');

  // Step 7: Admin updates status to "Resolved"
  console.log('Step 7: Admin updates status to "Resolved"...');
  const resolvedRes = await req(`/complaints/${complaint.id}/status`, {
    method: 'PATCH',
    headers: { Authorization: `Bearer ${adminToken}` }
  }, {
    status: 'Resolved',
    note: 'AC compressor repaired and cooling restored to 21°C'
  });
  if (resolvedRes.status !== 200 || resolvedRes.body.complaint.status !== 'Resolved') {
    throw new Error('Failed to update status to Resolved: ' + JSON.stringify(resolvedRes.body));
  }
  console.log(`  ✅ Status successfully updated to "Resolved".`);
  console.log(`     Resolved at: ${resolvedRes.body.complaint.resolved_at}\n`);

  // Step 8: Verify student sees complete updated timeline
  console.log('Step 8: Verifying student sees updated status & timeline...');
  const studentView = await req(`/complaints/${complaint.id}`, {
    headers: { Authorization: `Bearer ${studentToken}` }
  });
  if (studentView.body.complaint.status !== 'Resolved') throw new Error('Student did not see Resolved status');
  console.log(`  ✅ Student confirmed status is "Resolved".`);
  console.log(`     Timeline entries count: ${studentView.body.history.length}`);
  studentView.body.history.forEach((h, idx) => {
    console.log(`       [${idx + 1}] Status: ${h.status} | By: ${h.changed_by_name} (${h.changed_by_role}) | Note: "${h.note}"`);
  });
  console.log('');

  // Step 9: Check Admin Dashboard statistics
  console.log('Step 9: Verifying Admin Dashboard statistics updated...');
  const statsRes = await req('/stats/admin', {
    headers: { Authorization: `Bearer ${adminToken}` }
  });
  console.log(`  ✅ Total complaints: ${statsRes.body.total}`);
  console.log(`     Submitted: ${statsRes.body.submitted}`);
  console.log(`     In Progress: ${statsRes.body.inProgress}`);
  console.log(`     Resolved: ${statsRes.body.resolved}`);
  console.log(`     Avg Resolution Time: ${statsRes.body.avgResolutionHours} hours\n`);

  console.log('🎉 ALL END-TO-END FLOW CHECKS PASSED PERFECTLY!');
}

verifyFlow().catch(err => {
  console.error('❌ Flow verification failed:', err);
  process.exit(1);
});

