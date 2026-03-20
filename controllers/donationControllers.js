
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
                return s + (item.tree.oxygenProduced * item.quantity);
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
module.exports = { postDonation,verifyPayment,getMyDonations };


