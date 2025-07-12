const express = require('express');
const {
  banUser,
  deleteSkill,
  getAllSwaps,
  broadcastMessage,
} = require('../controllers/admin.controller');
const { isAdmin } = require('../middlewares/admin.middleware');

const router = express.Router();

router.put('/ban/:userId', isAdmin, banUser);
router.delete('/delete-skill/:skillId', isAdmin, deleteSkill);
router.get('/swaps', isAdmin, getAllSwaps);
router.post('/broadcast', isAdmin, broadcastMessage);

module.exports = router;
