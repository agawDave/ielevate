const express = require('express');
const { requireAuth } = require('../middleware/authMiddleware');
const { getMyMatches } = require('../controllers/matchController');

const router = express.Router();

router.get('/', requireAuth, getMyMatches);

module.exports = router;
