// const express = require('express');
// const { updateProfile, getProfile } = require('../controllers/user.controller');

// const router = express.Router();

// router.get('/:id', getProfile);
// router.put('/:id', updateProfile);

// module.exports = router;
const express = require('express');
const { getProfile, updateProfile } = require('../controllers/user.controller');
const { protect } = require('../middlewares/authMiddleware');

const router = express.Router();

// Get and update logged-in user’s profile (secure)
router.get('/me', protect, getProfile);
router.put('/me', protect, updateProfile);

module.exports = router;
