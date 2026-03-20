const express = require('express');
const router = express.Router();
const { isAuthenticated } = require('../middlewares/isAutenticated');
const { getProfile,updateProfile ,deleteUser} = require('../controllers/userControllers');

router.get('/profile', isAuthenticated, getProfile);
router.patch('/profile', isAuthenticated, updateProfile);
router.delete('/profile', isAuthenticated, deleteUser);

module.exports = router;