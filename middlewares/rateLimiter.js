// middlewares/rateLimiter.js
const rateLimit = require('express-rate-limit');

const registerLimiter = rateLimit({
    windowMs: 15 * 60 * 1000, 
    max: 10,                   
    standardHeaders: true,     
    legacyHeaders: false,
    message: {
        status: 429,
        message: "Too many registration attempts, please try again after 15 minutes"
    }
});

module.exports = { registerLimiter };