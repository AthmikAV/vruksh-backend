// validators/donationValidators.js
const { z } = require('zod');

const donationItemSchema = z.object({
    treeId: z
        .string()
        .min(1, "Tree ID is required"),
    quantity: z
        .number()
        .min(1, "Minimum 1 tree")
        .max(100, "Maximum 100 trees at once")
});

const createOrderSchema = z.object({
    items: z
        .array(donationItemSchema)
        .min(1, "Select at least one tree")
});

module.exports = { createOrderSchema };