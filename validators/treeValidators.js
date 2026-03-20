const { z } = require('zod');

const treeRegisterValidationSchema = z.object({
    name: z
        .string()
        .min(2, "Tree name must be at least 2 characters")
        .max(50, "Tree name is too long")
        .trim(),
    description: z
        .string()
        .min(2, "Description must be at least 2 characters")
        .max(250, "Description is too long"),
    image: z
        .string()
        .url("Must be a valid URL"),
    oxygenProduced: z
        .number()
        .min(1, "Oxygen produced must be at least 1kg"),
    price: z
        .number()
        .min(1, "Price must be at least ₹1")
});

const treeUpdateValidationSchema = treeRegisterValidationSchema.partial().extend({
        isAvailable: z.boolean().optional() 
    });;

module.exports = { treeRegisterValidationSchema, treeUpdateValidationSchema };