import express from 'express';
import { v4 as uuidv4 } from 'uuid';
import db from '../db/database.js';

const router = express.Router();

// Get all registrations (admin view)
router.get('/', (req, res) => {
  db.all('SELECT * FROM registrations ORDER BY registeredAt DESC', [], (err, rows) => {
    if (err) {
      res.status(500).json({ error: err.message });
      return;
    }
    res.json({ success: true, data: rows, count: rows.length });
  });
});

// Register for workshop
router.post('/register', (req, res) => {
  const { firstName, lastName, email, phone, company, position, attendanceType } = req.body;

  if (!firstName || !lastName || !email) {
    res.status(400).json({ success: false, message: 'First name, last name, and email are required' });
    return;
  }

  const id = uuidv4();
  const stmt = db.prepare(`
    INSERT INTO registrations (id, firstName, lastName, email, phone, company, position, attendanceType)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?)
  `);

  stmt.run(id, firstName, lastName, email, phone || '', company || '', position || '', attendanceType || 'standard', function(err) {
    if (err) {
      if (err.message.includes('UNIQUE constraint failed')) {
        res.status(400).json({ success: false, message: 'This email is already registered' });
      } else {
        res.status(500).json({ success: false, message: err.message });
      }
      return;
    }
    
    res.status(201).json({ 
      success: true, 
      message: 'Registration successful!', 
      data: { id, firstName, lastName, email, attendanceType, registeredAt: new Date().toISOString() }
    });

    // Log the event
    const logId = uuidv4();
    db.run(`
      INSERT INTO eventLogs (id, eventType, userId, details)
      VALUES (?, ?, ?, ?)
    `, [logId, 'registration', id, JSON.stringify({ email, company, position })]);
  });

  stmt.finalize();
});

// Get registration details
router.get('/:email', (req, res) => {
  db.get('SELECT * FROM registrations WHERE email = ?', [req.params.email], (err, row) => {
    if (err) {
      res.status(500).json({ error: err.message });
      return;
    }
    if (!row) {
      res.status(404).json({ error: 'Registration not found' });
      return;
    }
    res.json({ success: true, data: row });
  });
});

// Get registration stats
router.get('/stats/overview', (req, res) => {
  db.all(`
    SELECT 
      COUNT(*) as totalRegistrations,
      attendanceType,
      COUNT(*) as count
    FROM registrations
    GROUP BY attendanceType
  `, [], (err, rows) => {
    if (err) {
      res.status(500).json({ error: err.message });
      return;
    }
    
    db.get('SELECT COUNT(*) as total FROM registrations', [], (err, result) => {
      res.json({ 
        success: true, 
        totalRegistrations: result.total,
        byType: rows
      });
    });
  });
});

export default router;
