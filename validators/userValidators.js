const { z, optional } = require('zod');


const userRegisterValidationSchema = z.object({
    name: z
        .string()
        .min(2, "Name must be at least 2 characters")
        .max(50, "Name is too long")
        .trim(),
    email: z
        .string()
        .email('Invalid email format')
        .toLowerCase(),
    password: z
        .string()
        .min(6, "Password must be at least 6 characters"),
    phone: z
        .string()
        .regex(/^[0-9]{10}$/, "Phone must be 10 digits"),
    profilePhoto: z
        .string()
        .url("Must be valid URL")
        .optional()
        .nullable()
        .default(null),
     role: z.enum(['user', 'admin']).default('user')
    
});

const userLoginValidationSchema = z.object({
    email: z
        .string()
        .email("Invalid email format")
        .toLowerCase(),
    password: z
        .string()
        .min(1, "Password is required")
})

const userPatchValidationSchema = z.object({
    name: z
        .string()
        .min(2, "Name must be at least 2 characters")
        .max(50, "Name is too long")
        .trim()
        .optional(),
    phone: z
        .string()
        .regex(/^[0-9]{10}$/, "Phone must be 10 digits")
        .optional(),
    profilePhoto: z
        .string()
        .url("Must be valid URL")
        .optional()
        .nullable()
    .optional()
})
module.exports = {userRegisterValidationSchema,userLoginValidationSchema,userPatchValidationSchema};