const express = require('express');
const { requireAuth } = require('../middleware/authMiddleware');
const {
  listConversations,
  getMessages,
  startConversation,
} = require('../controllers/messageController');

const router = express.Router();

router.get('/conversations', requireAuth, listConversations);
router.post('/conversations', requireAuth, startConversation);
router.get('/conversations/:conversationId/messages', requireAuth, getMessages);

module.exports = router;
