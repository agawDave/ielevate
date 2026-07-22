const express = require('express');
const { requireAuth, requireRole } = require('../middleware/authMiddleware');
const {
  listUsers,
  updateUserStatus,
  listDisputes,
  resolveDispute,
  systemStats,
} = require('../controllers/adminController');

const router = express.Router();

router.use(requireAuth, requireRole('admin', 'moderator'));

router.get('/stats', systemStats);
router.get('/users', listUsers);
router.patch('/users/:userId/status', updateUserStatus);
router.get('/disputes', listDisputes);
router.patch('/disputes/:disputeId', resolveDispute);

module.exports = router;
