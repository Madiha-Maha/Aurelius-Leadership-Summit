import express from 'express';
import { v4 as uuidv4 } from 'uuid';
import db from '../db/database.js';

const router = express.Router();

// Submit contact form
router.post('/submit', (req, res) => {
  const { name, email, subject, message } = req.body;

  if (!name || !email || !subject || !message) {
    res.status(400).json({ success: false, message: 'All fields are required' });
    return;
  }

  const id = uuidv4();
  const stmt = db.prepare(`
    INSERT INTO contacts (id, name, email, subject, message)
    VALUES (?, ?, ?, ?, ?)
  `);

  stmt.run(id, name, email, subject, message, function(err) {
    if (err) {
      res.status(500).json({ success: false, message: err.message });
      return;
    }
    
    res.status(201).json({ 
      success: true, 
      message: 'Your message has been received. We will get back to you soon!',
      data: { id }
    });

    // Log the event
    const logId = uuidv4();
    db.run(`
      INSERT INTO eventLogs (id, eventType, userId, details)
      VALUES (?, ?, ?, ?)
    `, [logId, 'contact_submission', id, JSON.stringify({ email, subject })]);
  });

  stmt.finalize();
});

// Get all contact submissions (admin view)
router.get('/', (req, res) => {
  db.all('SELECT * FROM contacts ORDER BY submittedAt DESC', [], (err, rows) => {
    if (err) {
      res.status(500).json({ error: err.message });
      return;
    }
    res.json({ success: true, data: rows, count: rows.length });
  });
});

export default router;
