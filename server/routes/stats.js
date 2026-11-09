const express = require('express');
const { getDB } = require('../db/database');
const { authenticateToken, requireAdmin } = require('../middleware/auth');

const router = express.Router();

// GET /api/stats/admin — full stats (admin only)
router.get('/admin', authenticateToken, requireAdmin, (req, res) => {
  try {
    const db = getDB();

    const total = db.prepare('SELECT COUNT(*) as count FROM complaints').get().count;
    const submitted = db.prepare("SELECT COUNT(*) as count FROM complaints WHERE status = 'Submitted'").get().count;
    const inProgress = db.prepare("SELECT COUNT(*) as count FROM complaints WHERE status = 'In Progress'").get().count;
    const resolved = db.prepare("SELECT COUNT(*) as count FROM complaints WHERE status = 'Resolved'").get().count;

    const byCategory = db.prepare(`
      SELECT category, COUNT(*) as count FROM complaints GROUP BY category ORDER BY count DESC
    `).all();

    const byPriority = db.prepare(`
      SELECT priority, COUNT(*) as count FROM complaints GROUP BY priority
    `).all();

    const recentComplaints = db.prepare(`
      SELECT c.*, u.name as user_name FROM complaints c
      JOIN users u ON c.user_id = u.id
      ORDER BY c.created_at DESC LIMIT 5
    `).all();

    // Avg resolution time (in hours)
    const avgResolution = db.prepare(`
      SELECT AVG((julianday(resolved_at) - julianday(created_at)) * 24) as avg_hours
      FROM complaints WHERE resolved_at IS NOT NULL
    `).get();

    // Trend: last 7 days
    const trend = db.prepare(`
      SELECT DATE(created_at) as date, COUNT(*) as count
      FROM complaints
      WHERE created_at >= datetime('now', '-7 days')
      GROUP BY DATE(created_at)
      ORDER BY date ASC
    `).all();

    const totalUsers = db.prepare("SELECT COUNT(*) as count FROM users WHERE role = 'student'").get().count;

    res.json({
      total, submitted, inProgress, resolved,
      byCategory, byPriority, recentComplaints,
      avgResolutionHours: avgResolution.avg_hours ? Math.round(avgResolution.avg_hours) : 0,
      trend,
      totalUsers
    });
  } catch (err) {
    console.error('Stats error:', err);
    res.status(500).json({ error: 'Failed to fetch stats' });
  }
});

// GET /api/stats/student — student's own stats
router.get('/student', authenticateToken, (req, res) => {
  try {
    const db = getDB();
    const uid = req.user.id;

    const total = db.prepare('SELECT COUNT(*) as count FROM complaints WHERE user_id = ?').get(uid).count;
    const submitted = db.prepare("SELECT COUNT(*) as count FROM complaints WHERE user_id = ? AND status = 'Submitted'").get(uid).count;
    const inProgress = db.prepare("SELECT COUNT(*) as count FROM complaints WHERE user_id = ? AND status = 'In Progress'").get(uid).count;
    const resolved = db.prepare("SELECT COUNT(*) as count FROM complaints WHERE user_id = ? AND status = 'Resolved'").get(uid).count;

    const byCategory = db.prepare(`
      SELECT category, COUNT(*) as count FROM complaints WHERE user_id = ? GROUP BY category
    `).all(uid);

    res.json({ total, submitted, inProgress, resolved, byCategory });
  } catch (err) {
    console.error('Student stats error:', err);
    res.status(500).json({ error: 'Failed to fetch stats' });
  }
});

module.exports = router;
