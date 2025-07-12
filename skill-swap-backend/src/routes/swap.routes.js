const express = require('express');
const { createSwap, updateSwapStatus, getUserSwaps } = require('../controllers/swap.controller');

const router = express.Router();

router.post('/request', createSwap);
router.put('/:id/status', updateSwapStatus);
router.get('/user/:userId', getUserSwaps);

module.exports = router;
