const express = require('express');
const { v4: uuidv4 } = require('uuid');
const { getDB } = require('../db/database');
const { authenticateToken, requireAdmin } = require('../middleware/auth');

const router = express.Router();

// Generate unique complaint number
function generateComplaintNumber() {
  const prefix = 'CP';
  const year = new Date().getFullYear();
  const random = Math.floor(Math.random() * 90000) + 10000;
  return `${prefix}-${year}-${random}`;
}

// Rule-based priority classification
function classifyPriority(category, description) {
  const desc = description.toLowerCase();
  const criticalKeywords = ['fire', 'flood', 'electric shock', 'emergency', 'danger', 'unsafe', 'injury'];
  const highKeywords = ['no water', 'no electricity', 'outage', 'broken', 'urgent', 'major', 'exam', 'leak'];
  const lowKeywords = ['minor', 'small', 'suggestion', 'improve', 'aesthetic'];

  if (criticalKeywords.some(k => desc.includes(k))) return 'Critical';
  if (highKeywords.some(k => desc.includes(k))) return 'High';
  if (lowKeywords.some(k => desc.includes(k))) return 'Low';
  if (category === 'Electricity' || category === 'Water') return 'High';
  if (category === 'Wi-Fi') return 'Medium';
  return 'Medium';
}

// Basic duplicate detection
function detectDuplicate(db, userId, title, category) {
  const recent = db.prepare(`
    SELECT id, complaint_number FROM complaints 
    WHERE user_id = ? AND category = ? AND status != 'Resolved'
    AND created_at > datetime('now', '-24 hours')
    AND LOWER(title) = LOWER(?)
  `).get(userId, category, title);
  return recent || null;
}

// POST /api/complaints — create complaint
router.post('/', authenticateToken, (req, res) => {
  try {
    const { title, description, category, location, priority } = req.body;

    if (!title || !description || !category || !location) {
      return res.status(400).json({ error: 'Title, description, category and location are required' });
    }

    const validCategories = ['Electricity','Water','Wi-Fi','Cleanliness','Hostel','Classroom','Infrastructure','Other'];
    if (!validCategories.includes(category)) {
      return res.status(400).json({ error: 'Invalid category' });
    }

    const db = getDB();

    // Duplicate detection
    const duplicate = detectDuplicate(db, req.user.id, title, category);
    if (duplicate) {
      return res.status(409).json({
        error: 'A similar complaint was recently submitted',
        existingComplaint: duplicate.complaint_number
      });
    }

    const finalPriority = priority || classifyPriority(category, description);
    const complaintId = uuidv4();
    const complaintNumber = generateComplaintNumber();

    db.prepare(`
      INSERT INTO complaints (id, complaint_number, title, description, category, location, priority, status, user_id)
      VALUES (?, ?, ?, ?, ?, ?, ?, 'Submitted', ?)
    `).run(complaintId, complaintNumber, title.trim(), description.trim(), category, location, finalPriority, req.user.id);

    // Record initial status history
    db.prepare(`
      INSERT INTO status_history (id, complaint_id, status, note, changed_by)
      VALUES (?, ?, 'Submitted', 'Complaint submitted successfully', ?)
    `).run(uuidv4(), complaintId, req.user.id);

    const complaint = db.prepare('SELECT * FROM complaints WHERE id = ?').get(complaintId);
    res.status(201).json({ complaint });
  } catch (err) {
    console.error('Create complaint error:', err);
    res.status(500).json({ error: 'Failed to create complaint' });
  }
});

// GET /api/complaints — list (admin: all, student: own)
router.get('/', authenticateToken, (req, res) => {
  try {
    const db = getDB();
    const { status, category, search, page = 1, limit = 20 } = req.query;
    const offset = (parseInt(page) - 1) * parseInt(limit);

    let whereClause = req.user.role === 'admin' ? 'WHERE 1=1' : 'WHERE c.user_id = ?';
    const params = req.user.role === 'admin' ? [] : [req.user.id];

    if (status && status !== 'All') { whereClause += ' AND c.status = ?'; params.push(status); }
    if (category && category !== 'All') { whereClause += ' AND c.category = ?'; params.push(category); }
    if (search) {
      whereClause += ' AND (c.title LIKE ? OR c.description LIKE ? OR c.complaint_number LIKE ?)';
      params.push(`%${search}%`, `%${search}%`, `%${search}%`);
    }

    const complaints = db.prepare(`
      SELECT c.*, u.name as user_name, u.email as user_email
      FROM complaints c
      JOIN users u ON c.user_id = u.id
      ${whereClause}
      ORDER BY c.created_at DESC
      LIMIT ? OFFSET ?
    `).all([...params, parseInt(limit), offset]);

    const countRow = db.prepare(`
      SELECT COUNT(*) as total FROM complaints c ${whereClause}
    `).get(params);

    res.json({ complaints, total: countRow.total, page: parseInt(page), limit: parseInt(limit) });
  } catch (err) {
    console.error('List complaints error:', err);
    res.status(500).json({ error: 'Failed to fetch complaints' });
  }
});

// GET /api/complaints/:id — get complaint details
router.get('/:id', authenticateToken, (req, res) => {
  try {
    const db = getDB();
    const complaint = db.prepare(`
      SELECT c.*, u.name as user_name, u.email as user_email
      FROM complaints c
      JOIN users u ON c.user_id = u.id
      WHERE c.id = ?
    `).get(req.params.id);

    if (!complaint) return res.status(404).json({ error: 'Complaint not found' });
    if (req.user.role !== 'admin' && complaint.user_id !== req.user.id) {
      return res.status(403).json({ error: 'Access denied' });
    }

    const history = db.prepare(`
      SELECT sh.*, u.name as changed_by_name, u.role as changed_by_role
      FROM status_history sh
      JOIN users u ON sh.changed_by = u.id
      WHERE sh.complaint_id = ?
      ORDER BY sh.created_at ASC
    `).all(req.params.id);

    res.json({ complaint, history });
  } catch (err) {
    console.error('Get complaint error:', err);
    res.status(500).json({ error: 'Failed to fetch complaint' });
  }
});

// PATCH /api/complaints/:id/status — update status (admin only)
router.patch('/:id/status', authenticateToken, requireAdmin, (req, res) => {
  try {
    const { status, note } = req.body;
    const validStatuses = ['Submitted', 'In Progress', 'Resolved'];
    if (!status || !validStatuses.includes(status)) {
      return res.status(400).json({ error: 'Valid status is required' });
    }

    const db = getDB();
    const complaint = db.prepare('SELECT * FROM complaints WHERE id = ?').get(req.params.id);
    if (!complaint) return res.status(404).json({ error: 'Complaint not found' });

    const resolvedAt = status === 'Resolved' ? new Date().toISOString() : complaint.resolved_at;

    db.prepare(`
      UPDATE complaints SET status = ?, resolved_at = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?
    `).run(status, resolvedAt, req.params.id);

    db.prepare(`
      INSERT INTO status_history (id, complaint_id, status, note, changed_by)
      VALUES (?, ?, ?, ?, ?)
    `).run(uuidv4(), req.params.id, status, note || null, req.user.id);

    const updated = db.prepare(`
      SELECT c.*, u.name as user_name, u.email as user_email
      FROM complaints c
      JOIN users u ON c.user_id = u.id
      WHERE c.id = ?
    `).get(req.params.id);
    res.json({ complaint: updated });
  } catch (err) {
    console.error('Update status error:', err);
    res.status(500).json({ error: 'Failed to update status' });
  }
});

// DELETE /api/complaints/:id — delete (admin only)
router.delete('/:id', authenticateToken, requireAdmin, (req, res) => {
  try {
    const db = getDB();
    const complaint = db.prepare('SELECT * FROM complaints WHERE id = ?').get(req.params.id);
    if (!complaint) return res.status(404).json({ error: 'Complaint not found' });

    db.prepare('DELETE FROM complaints WHERE id = ?').run(req.params.id);
    res.json({ message: 'Complaint deleted successfully' });
  } catch (err) {
    console.error('Delete complaint error:', err);
    res.status(500).json({ error: 'Failed to delete complaint' });
  }
});

module.exports = router;
