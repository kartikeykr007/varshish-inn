require('dotenv').config();
const bcrypt = require('bcryptjs');
const { v4: uuidv4 } = require('uuid');
const { getDB, initDB } = require('./db/database');

async function seed() {
  initDB();
  const db = getDB();

  console.log('Seeding database...');

  // Clear existing data
  db.exec("DELETE FROM status_history; DELETE FROM complaints; DELETE FROM users;");

  // Create admin
  const adminId = uuidv4();
  const adminPassword = await bcrypt.hash('admin123', 12);
  db.prepare('INSERT INTO users (id, name, email, password, role) VALUES (?, ?, ?, ?, ?)').run(
    adminId, 'Campus Admin', 'admin@campuspulse.edu', adminPassword, 'admin'
  );

  // Create demo student
  const studentId = uuidv4();
  const studentPassword = await bcrypt.hash('student123', 12);
  db.prepare('INSERT INTO users (id, name, email, password, role) VALUES (?, ?, ?, ?, ?)').run(
    studentId, 'Demo Student', 'student@campuspulse.edu', studentPassword, 'student'
  );

  // Create additional student
  const student2Id = uuidv4();
  const student2Password = await bcrypt.hash('test123', 12);
  db.prepare('INSERT INTO users (id, name, email, password, role) VALUES (?, ?, ?, ?, ?)').run(
    student2Id, 'Alex Johnson', 'alex@campuspulse.edu', student2Password, 'student'
  );

  // Sample complaints
  const complaints = [
    {
      title: 'Broken Classroom Fan in Room 204',
      description: 'The ceiling fan in Classroom 204 (Engineering Block) has been making loud grinding noise and is about to fall. It is a danger to students attending lectures. Urgent repair needed.',
      category: 'Classroom',
      location: 'Engineering Block - Room 204',
      priority: 'High',
      status: 'In Progress',
      userId: studentId,
      createdOffset: -5
    },
    {
      title: 'Hostel Water Supply Completely Cut Off',
      description: 'There is no water supply in Hostel Block C since yesterday morning. Over 200 students are affected and cannot bathe or use washrooms. This is an urgent situation.',
      category: 'Water',
      location: 'Hostel Block C',
      priority: 'Critical',
      status: 'In Progress',
      userId: student2Id,
      createdOffset: -2
    },
    {
      title: 'Campus Wi-Fi Outage in Library',
      description: 'The Wi-Fi connection in the main library has been completely down for 3 days. Students are unable to do research or access online resources during examination preparation.',
      category: 'Wi-Fi',
      location: 'Main Library',
      priority: 'High',
      status: 'Submitted',
      userId: studentId,
      createdOffset: -3
    },
    {
      title: 'Washroom Cleanliness Issue',
      description: 'The washrooms on the 2nd floor of the Science Block are not being cleaned regularly. The situation is unhygienic and unacceptable for a university campus.',
      category: 'Cleanliness',
      location: 'Science Block - 2nd Floor',
      priority: 'Medium',
      status: 'Resolved',
      userId: student2Id,
      createdOffset: -10,
      resolvedOffset: -6
    },
    {
      title: 'Projector Not Working in Lecture Hall 3',
      description: 'The projector in Lecture Hall 3 is damaged and shows distorted colors. Faculty cannot display presentations or teaching materials effectively.',
      category: 'Classroom',
      location: 'Main Building - Lecture Hall 3',
      priority: 'Medium',
      status: 'Submitted',
      userId: studentId,
      createdOffset: -1
    },
    {
      title: 'Street Light Out Near Hostel Gate',
      description: 'Two street lights near the Hostel main gate are not working since a week. The area is completely dark at night creating safety concerns for students.',
      category: 'Electricity',
      location: 'Hostel Block - Main Gate',
      priority: 'High',
      status: 'Submitted',
      userId: student2Id,
      createdOffset: -7
    },
    {
      title: 'Canteen Area Cleanliness',
      description: 'The canteen area floor and tables are rarely cleaned. Food waste accumulates and there is a risk of rodent infestation.',
      category: 'Cleanliness',
      location: 'Main Canteen',
      priority: 'Medium',
      status: 'In Progress',
      userId: studentId,
      createdOffset: -4
    }
  ];

  for (const c of complaints) {
    const cId = uuidv4();
    const year = new Date().getFullYear();
    const num = Math.floor(Math.random() * 90000) + 10000;
    const cNumber = `CP-${year}-${num}`;

    const createdAt = new Date();
    createdAt.setDate(createdAt.getDate() + c.createdOffset);

    let resolvedAt = null;
    if (c.status === 'Resolved' && c.resolvedOffset) {
      resolvedAt = new Date();
      resolvedAt.setDate(resolvedAt.getDate() + c.resolvedOffset);
    }

    db.prepare(`
      INSERT INTO complaints (id, complaint_number, title, description, category, location, priority, status, user_id, created_at, updated_at, resolved_at)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `).run(cId, cNumber, c.title, c.description, c.category, c.location, c.priority, c.status, c.userId,
      createdAt.toISOString(), createdAt.toISOString(), resolvedAt ? resolvedAt.toISOString() : null);

    // Status history
    db.prepare('INSERT INTO status_history (id, complaint_id, status, note, changed_by) VALUES (?, ?, ?, ?, ?)').run(
      uuidv4(), cId, 'Submitted', 'Complaint submitted by student', c.userId
    );

    if (c.status === 'In Progress') {
      db.prepare('INSERT INTO status_history (id, complaint_id, status, note, changed_by, created_at) VALUES (?, ?, ?, ?, ?, ?)').run(
        uuidv4(), cId, 'In Progress', 'Assigned to maintenance team for review', adminId,
        new Date(createdAt.getTime() + 3600000).toISOString()
      );
    }

    if (c.status === 'Resolved') {
      db.prepare('INSERT INTO status_history (id, complaint_id, status, note, changed_by, created_at) VALUES (?, ?, ?, ?, ?, ?)').run(
        uuidv4(), cId, 'In Progress', 'Assigned to maintenance team', adminId,
        new Date(createdAt.getTime() + 3600000).toISOString()
      );
      db.prepare('INSERT INTO status_history (id, complaint_id, status, note, changed_by, created_at) VALUES (?, ?, ?, ?, ?, ?)').run(
        uuidv4(), cId, 'Resolved', 'Issue has been resolved and verified', adminId,
        resolvedAt ? resolvedAt.toISOString() : new Date().toISOString()
      );
    }
  }

  console.log('✅ Database seeded successfully!');
  console.log('');
  console.log('Demo Accounts:');
  console.log('  Admin:   admin@campuspulse.edu / admin123');
  console.log('  Student: student@campuspulse.edu / student123');
  console.log('  Student: alex@campuspulse.edu / test123');
  process.exit(0);
}

seed().catch(err => {
  console.error('Seed failed:', err);
  process.exit(1);
});
