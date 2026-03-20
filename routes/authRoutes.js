const express = require('express');
const router = express.Router();
const { registerUser,loginUser,logoutUser } = require('../controllers/authControllers');
const { registerLimiter } = require('../middlewares/rateLimiter');
const { isAuthenticated} = require('../middlewares/isAutenticated')

router.post('/register',registerLimiter, registerUser);
router.post('/login', registerLimiter, loginUser);
router.post('/logout',isAuthenticated,registerLimiter,logoutUser)



module.exports = router;