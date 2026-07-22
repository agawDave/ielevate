const express = require('express');
const { requireAuth } = require('../middleware/authMiddleware');
const { createSession, listMySessions, updateSessionStatus } = require('../controllers/sessionController');

const router = express.Router();

router.get('/me', requireAuth, listMySessions);
router.post('/', requireAuth, createSession);
router.patch('/:sessionId/status', requireAuth, updateSessionStatus);

module.exports = router;
