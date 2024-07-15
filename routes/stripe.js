const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/auth');

const { createCheckout, createWebhook, createPortal } = require('../controllers/stripe');

router.post('/checkout', protect, createCheckout);
router.post('/webhook', createWebhook);
router.post('/portal', createPortal);

module.exports = router;