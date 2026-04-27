import express from 'express';
import db from '../db';
import { authenticateToken, AuthRequest } from '../middleware/auth';

const router = express.Router();

router.use(authenticateToken);

router.get('/', (req: AuthRequest, res) => {
  const entries = db.prepare('SELECT * FROM diary_entries WHERE user_id = ? ORDER BY created_at DESC').all(req.userId);
  res.json(entries);
});

router.post('/', (req: AuthRequest, res) => {
  const { title, content, mood, tags } = req.body;
  const info = db.prepare('INSERT INTO diary_entries (user_id, title, content, mood, tags) VALUES (?, ?, ?, ?, ?)')
    .run(req.userId, title, content, mood, tags);
  res.status(201).json({ id: info.lastInsertRowid, title, content, mood, tags });
});

router.put('/:id', (req: AuthRequest, res) => {
  const { title, content, mood, tags } = req.body;
  db.prepare('UPDATE diary_entries SET title = ?, content = ?, mood = ?, tags = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ? AND user_id = ?')
    .run(title, content, mood, tags, req.params.id, req.userId);
  res.json({ message: 'Updated' });
});

router.delete('/:id', (req: AuthRequest, res) => {
  db.prepare('DELETE FROM diary_entries WHERE id = ? AND user_id = ?').run(req.params.id, req.userId);
  res.json({ message: 'Deleted' });
});

export default router;
