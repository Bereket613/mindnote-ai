import express from 'express';
import db from '../db';
import { authenticateToken, AuthRequest } from '../middleware/auth';

const router = express.Router();

router.use(authenticateToken);

router.get('/', (req: AuthRequest, res) => {
  const tasks = db.prepare('SELECT * FROM tasks WHERE user_id = ? ORDER BY due_date ASC').all(req.userId);
  res.json(tasks);
});

router.post('/', (req: AuthRequest, res) => {
  const { title, description, priority, due_date } = req.body;
  const info = db.prepare('INSERT INTO tasks (user_id, title, description, priority, due_date) VALUES (?, ?, ?, ?, ?)')
    .run(req.userId, title, description, priority, due_date);
  res.status(201).json({ id: info.lastInsertRowid, title, description, priority, due_date, status: 'pending' });
});

router.put('/:id', (req: AuthRequest, res) => {
  const { title, description, priority, status, due_date } = req.body;
  db.prepare('UPDATE tasks SET title = ?, description = ?, priority = ?, status = ?, due_date = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ? AND user_id = ?')
    .run(title, description, priority, status, due_date, req.params.id, req.userId);
  res.json({ message: 'Updated' });
});

router.delete('/:id', (req: AuthRequest, res) => {
  db.prepare('DELETE FROM tasks WHERE id = ? AND user_id = ?').run(req.params.id, req.userId);
  res.json({ message: 'Deleted' });
});

export default router;
