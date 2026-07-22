const express = require('express');
const { requireAuth, requireRole } = require('../middleware/authMiddleware');
const { listMyCredentials, issueCredential } = require('../controllers/credentialController');

const router = express.Router();

router.get('/me', requireAuth, listMyCredentials);
// Issuing is normally triggered by a system job when both parties confirm completion,
// but exposed here for admin/manual triggering as well.
router.post('/issue', requireAuth, requireRole('admin'), issueCredential);

module.exports = router;
