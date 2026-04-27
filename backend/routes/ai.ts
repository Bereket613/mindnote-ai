import express from 'express';
const router = express.Router();

// This route is mostly for future extensions or server-side AI processing if needed.
// According to guidelines, Gemini calls should stay on the frontend.
router.get('/config', (req, res) => {
  res.json({ message: "Use frontend GEMINI_API_KEY for AI tasks." });
});

export default router;
