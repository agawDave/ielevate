const express = require('express');
const { requireAuth } = require('../middleware/authMiddleware');
const { getSummary } = require('../controllers/dashboardController');

const router = express.Router();

router.get('/summary', requireAuth, getSummary);

module.exports = router;
