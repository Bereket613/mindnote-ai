import express from 'express';
import db from '../db';
import { authenticateToken, AuthRequest } from '../middleware/auth';

const router = express.Router();

router.use(authenticateToken);

router.get('/', (req: AuthRequest, res) => {
  const notes = db.prepare('SELECT * FROM notes WHERE user_id = ? ORDER BY is_pinned DESC, updated_at DESC').all(req.userId);
  res.json(notes);
});

router.post('/', (req: AuthRequest, res) => {
  const { title, content, folder_id } = req.body;
  const stmt = db.prepare('INSERT INTO notes (user_id, title, content, folder_id) VALUES (?, ?, ?, ?)');
  const info = stmt.run(req.userId, title, content, folder_id);
  res.status(201).json({ id: info.lastInsertRowid, title, content, folder_id });
});

router.put('/:id', (req: AuthRequest, res) => {
  const { title, content, folder_id, is_pinned } = req.body;
  const stmt = db.prepare('UPDATE notes SET title = ?, content = ?, folder_id = ?, is_pinned = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ? AND user_id = ?');
  stmt.run(title, content, folder_id, is_pinned ? 1 : 0, req.params.id, req.userId);
  res.json({ message: 'Updated' });
});

router.delete('/:id', (req: AuthRequest, res) => {
  db.prepare('DELETE FROM notes WHERE id = ? AND user_id = ?').run(req.params.id, req.userId);
  res.json({ message: 'Deleted' });
});

// Folders
router.get('/folders', (req: AuthRequest, res) => {
  const folders = db.prepare('SELECT * FROM folders WHERE user_id = ?').all(req.userId);
  res.json(folders);
});

router.post('/folders', (req: AuthRequest, res) => {
  const { name } = req.body;
  const info = db.prepare('INSERT INTO folders (user_id, name) VALUES (?, ?)').run(req.userId, name);
  res.status(201).json({ id: info.lastInsertRowid, name });
});

export default router;
