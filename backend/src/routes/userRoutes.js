const express = require('express');
const { requireAuth } = require('../middleware/authMiddleware');
const { getMyProfile, updateMyProfile, getPublicProfile } = require('../controllers/userController');

const router = express.Router();

router.get('/me', requireAuth, getMyProfile);
router.patch('/me', requireAuth, updateMyProfile);
router.get('/:id', getPublicProfile);

module.exports = router;
