const express = require('express');
const router = express.Router();
const authLimiter = require('../middleware/rateLimit');
const { protect } = require('../middleware/auth');

const { register, login, logout, getRefreshToken, getSubscription, getCustomer } = require('../controllers/auth');

router.post('/register', authLimiter, register);
router.post('/login', authLimiter, login);
router.post('/logout', logout);
router.get('/refresh-token', getRefreshToken);
router.get('/subscription', protect, getSubscription);
router.get('/customer', protect, getCustomer);

module.exports = router;