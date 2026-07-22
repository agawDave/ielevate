const express = require('express');
const { requireAuth } = require('../middleware/authMiddleware');
const {
  searchSkills,
  listMySkills,
  addSkillToProfile,
  removeSkillFromProfile,
} = require('../controllers/skillController');

const router = express.Router();

router.get('/search', searchSkills);
router.get('/me', requireAuth, listMySkills);
router.post('/me', requireAuth, addSkillToProfile);
router.delete('/me/:id', requireAuth, removeSkillFromProfile);

module.exports = router;
