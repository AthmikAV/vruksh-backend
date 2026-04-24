const express = require('express');
const router = express.Router();

const { isAuthenticated } = require('../middlewares/isAutenticated');
const { postDonation, verifyPayment ,getMyDonations,getUserDashboard,getLeaderboard} = require('../controllers/donationControllers');

router.post('/create-order', isAuthenticated, postDonation);
router.post('/verify-order', isAuthenticated, verifyPayment);
router.get('/my', isAuthenticated, getMyDonations)
router.get('/dashboard', isAuthenticated, getUserDashboard);
router.get('/leaderboard', getLeaderboard);

module.exports = router;





