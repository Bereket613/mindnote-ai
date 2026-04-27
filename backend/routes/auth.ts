import express from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import db from '../db';

const router = express.Router();
const JWT_SECRET = process.env.JWT_SECRET || 'fallback_secret';

router.post('/register', async (req, res) => {
  const { name, email, password } = req.body;
  try {
    const password_hash = await bcrypt.hash(password, 10);
    const stmt = db.prepare('INSERT INTO users (name, email, password_hash) VALUES (?, ?, ?)');
    const info = stmt.run(name, email, password_hash);
    const userId = info.lastInsertRowid;
    
    const token = jwt.sign({ userId }, JWT_SECRET, { expiresIn: '7d' });
    res.status(201).json({ token, user: { id: userId, name, email } });
  } catch (error: any) {
    if (error.message.includes('UNIQUE constraint failed')) {
      return res.status(400).json({ error: 'Email already exists' });
    }
    res.status(500).json({ error: 'Internal server error' });
  }
});

router.post('/login', async (req, res) => {
  const { email, password } = req.body;
  try {
    const user = db.prepare('SELECT * FROM users WHERE email = ?').get(email) as any;
    if (!user || !(await bcrypt.compare(password, user.password_hash))) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }
    
    const token = jwt.sign({ userId: user.id }, JWT_SECRET, { expiresIn: '7d' });
    res.json({ token, user: { id: user.id, name: user.name, email: user.email } });
  } catch (error) {
    res.status(500).json({ error: 'Internal server error' });
  }
});

router.post('/forgot-password', async (req, res) => {
  const { email } = req.body;
  try {
    const user = db.prepare('SELECT * FROM users WHERE email = ?').get(email) as any;
    if (user) {
      // Simulate creating a reset token
      const resetToken = jwt.sign({ userId: user.id }, JWT_SECRET, { expiresIn: '15m' });
      // In a real app, send this via SendGrid or similar
      console.log(`[DUMMY EMAIL SERVICE] Password reset requested for ${email}. Token: ${resetToken}`);
    } else {
      console.log(`[DUMMY EMAIL SERVICE] Password reset requested for unknown email: ${email}`);
    }
    // Always return success to prevent email enumeration
    res.json({ message: 'If an account with that email exists, we sent a reset link.' });
  } catch (error) {
    res.status(500).json({ error: 'Internal server error' });
  }
});

export default router;
