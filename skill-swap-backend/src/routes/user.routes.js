const express = require('express');
const { updateProfile, getProfile } = require('../controllers/user.controller');

const router = express.Router();

router.get('/:id', getProfile);
router.put('/:id', updateProfile);

module.exports = router;
