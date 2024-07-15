const rateLimit = require('express-rate-limit');

// Create a rate limiting middleware
const authLimiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 10, // limit each IP to 10 requests per windowMs
    message: 'Too many login attempts from this IP, please try again after 15 minutes',
    headers: true, // include rate limit info in the response headers
});

module.exports = authLimiter;
