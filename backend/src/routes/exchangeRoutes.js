const express = require('express');
const { requireAuth } = require('../middleware/authMiddleware');
const { createExchange } = require('../controllers/exchangeController');

const router = express.Router();

router.post('/', requireAuth, createExchange);

module.exports = router;
