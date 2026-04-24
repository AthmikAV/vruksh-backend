
const Donation = require('../models/donationSchema');
const { Tree } = require('../models/treesSchema');
const { createOrderSchema } = require('../validators/donationValidators');
const crypto = require('crypto');

const postDonation = async (req, res, next) => {
    try {
        const result = createOrderSchema.safeParse(req.body);
        if (!result.success) {
            return res.status(400).json({
                success: false,
                message: result.error.flatten().fieldErrors
            });
        }

        const { items } = result.data;

        const donationItems = await Promise.all(
            items.map(async (item) => {
                const tree = await Tree.findById(item.treeId);
                if (!tree || !tree.isAvailable) {
                    throw new Error(`Tree not found or unavailable`);
                }
                return {
                    tree: tree._id,
                    quantity: item.quantity,
                    priceAtDonation: tree.price 
                };
            })
        );

        const totalAmount = donationItems.reduce((sum, item) => {
            return sum + (item.priceAtDonation * item.quantity);
        }, 0);

        const totalTrees = donationItems.reduce((sum, item) => {
            return sum + item.quantity;
        }, 0);

        const orderId = 'ORD_' + crypto.randomBytes(8).toString('hex').toUpperCase();

        const donation = new Donation({
            user: req.user._id,
            items: donationItems,
            totalAmount,
            totalTrees,
            orderId,
            paymentStatus: 'pending'
        });

        await donation.save();

        return res.status(201).json({
            success: true,
            message: "Order created successfully",
            data: {
                orderId,
                totalAmount,
                totalTrees,
                donationId: donation._id
            }
        });

    } catch (error) {
        next(error);
    }
};
const verifyPayment = async (req, res, next) => {
    try {
        // Step 1 — get donationId
        const { donationId } = req.body;
        if (!donationId) {
            return res.status(400).json({
                success: false,
                message: "Donation ID is required"
            });
        }

        // Step 2 — find donation
        const donation = await Donation.findById(donationId);
        if (!donation) {
            return res.status(404).json({
                success: false,
                message: "Donation not found"
            });
        }

        // Step 3 — check ownership
        if (donation.user.toString() !== req.user._id.toString()) {
            return res.status(403).json({
                success: false,
                message: "Unauthorized"
            });
        }

        // Step 4 — check if already verified
        if (donation.paymentStatus === 'success') {
            return res.status(400).json({
                success: false,
                message: "Payment already verified"
            });
        }

        // Step 5 — mark as success
        donation.paymentStatus = 'success';
        await donation.save();

        // Step 6 — respond
        return res.status(200).json({
            success: true,
            message: "Payment verified successfully",
            data: {
                orderId: donation.orderId,
                totalAmount: donation.totalAmount,
                totalTrees: donation.totalTrees,
                paymentStatus: donation.paymentStatus
            }
        });

    } catch (error) {
        next(error);
    }
};
const getMyDonations = async (req, res, next) => {
    try {
        const donations = await Donation.find({
            user: req.user._id,        
            paymentStatus: 'success'   
        })
        .populate('items.tree', 'name oxygenProduced price') // ✅ get tree details
        .sort({ createdAt: -1 });      // ✅ latest first

        // Step 2 — calculate total impact
        const totalTrees = donations.reduce((sum, donation) => {
            return sum + donation.totalTrees;
        }, 0);

        const totalAmount = donations.reduce((sum, donation) => {
            return sum + donation.totalAmount;
        }, 0);

        const totalOxygen = donations.reduce((sum, donation) => {
            return sum + donation.items.reduce((s, item) => {
                return s + ((item.tree?.oxygenProduced || 0) * item.quantity);
            }, 0);
        }, 0);

        // Step 3 — respond
        return res.status(200).json({
            success: true,
            data: {
                donations,
                impact: {
                    totalTrees,    // total trees planted
                    totalAmount,   // total money donated ₹
                    totalOxygen    // total oxygen per day kg
                }
            }
        });

    } catch (error) {
        next(error);
    }
};


 const getUserDashboard = async (req, res) => {
  try {
    const userId = req.user._id;

    // 1. My donation history (only successful)
    const donations = await Donation.find({ user: userId, paymentStatus: 'success' })
      .populate('items.tree', 'name image')
      .sort({ createdAt: -1 });

    // 2. My totals
    const totals = await Donation.aggregate([
      { $match: { user: new mongoose.Types.ObjectId(userId), paymentStatus: 'success' } },
      {
        $group: {
          _id: null,
          totalTrees: { $sum: '$totalTrees' },
          totalAmount: { $sum: '$totalAmount' },
        },
      },
    ]);

    const { totalTrees = 0, totalAmount = 0 } = totals[0] || {};

    // 3. My rank on leaderboard (by trees)
    const leaderboard = await Donation.aggregate([
      { $match: { paymentStatus: 'success' } },
      {
        $group: {
          _id: '$user',
          totalTrees: { $sum: '$totalTrees' },
        },
      },
      { $sort: { totalTrees: -1 } },
    ]);

    const myRank = leaderboard.findIndex(
      (entry) => entry._id.toString() === userId.toString()
    ) + 1;

    res.status(200).json({
      success: true,
      donations,
      stats: { totalTrees, totalAmount },
      myRank: myRank || null,
    });
  } catch (error) {
    console.error('Dashboard error:', error);
    res.status(500).json({ message: 'Failed to load dashboard' });
  }
};

const getLeaderboard = async (req, res) => {
  try {
    const leaderboard = await Donation.aggregate([
      { $match: { paymentStatus: 'success' } },
      {
        $group: {
          _id: '$user',
          totalTrees: { $sum: '$totalTrees' },
          totalAmount: { $sum: '$totalAmount' },
          donationCount: { $sum: 1 },
        },
      },
      { $sort: { totalTrees: -1 } },
      { $limit: 10 }, // top 10
      {
        $lookup: {
          from: 'users',
          localField: '_id',
          foreignField: '_id',
          as: 'user',
        },
      },
      { $unwind: '$user' },
      {
        $project: {
          totalTrees: 1,
          totalAmount: 1,
          donationCount: 1,
          'user.name': 1,
          'user.avatar': 1, // remove if you don't have avatar
        },
      },
    ]);

    res.status(200).json({ success: true, leaderboard });
  } catch (error) {
    console.error('Leaderboard error:', error);
    res.status(500).json({ message: 'Failed to load leaderboard' });
  }
};
module.exports = { postDonation,verifyPayment,getMyDonations,getUserDashboard,getLeaderboard };


