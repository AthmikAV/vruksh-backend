
const User = require('../models/userSchema');
const { userRegisterValidationSchema,userLoginValidationSchema } = require('../validators/userValidators');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');

const registerUser = async (req, res,next) => {
    try {
        
        const result = userRegisterValidationSchema.safeParse(req.body);

        if (!result.success) {
            return res.status(400).json({
                success: false,
                message: result.error.flatten().fieldErrors
            })
        }

        const { name, email, password, phone, profilePhoto } = result.data;

    

        const existingUser = await User.findOne({ email });
        if (existingUser) {
            return res.status(409).json({
                success:false,
                message: "User already exists"
            })
        };
    
        const cryptedPassword = await bcrypt.hash(password, parseInt(process.env.SALT));

        const user = new User({ name, email, password: cryptedPassword, phone, profilePhoto });

        await user.save();
        const safeUser = await User.findById(user._id);
        res.status(201).json({
            success:true,
            message: "User created", user: safeUser
        });
    } catch (error) {
        next(error);
    }
}
const loginUser = async (req, res,next) => {
    try {
        const result = userLoginValidationSchema.safeParse(req.body);
        if (!result.success) {
            return res.status(400).json({
                success:false,
                message: result.error.flatten().fieldErrors
            })
        }
        const { email, password } = result.data;
        const user = await User.findOne({ email }).select('+password');
        if (!user) {
            return res.status(401).json({
                success:false,
                message: "Invalid Credential"
            });
        }
        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) {
            return res.status(401).json({
                success:false,
                message:"Invalid Credential"
            })
        }
        const payload = { id: user._id, email: email, role:user.role };

        const token = jwt.sign(payload, process.env.JWT_SECRET, { expiresIn: '7d' });
        res.cookie('token', token, {
            httpOnly: true,   
            secure: process.env.NODE_ENV === 'production',    
            sameSite: 'Strict',
            maxAge: 7 * 24 * 60 * 60 * 1000 
        })
        return res.status(200).json({
            success:true,
            message: "Login Successfull",
            role:user.role
        });

    } catch (error) {
        next(error);
    }
}
const logoutUser = async (req, res,next) => {
    try {
        res.clearCookie('token', {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: 'Strict'
        })

        return res.status(200).json({
            success: true,
            message: "Logout Successful"
        });
    } catch (error) {
        next(error);
    }
}
module.exports = { registerUser, loginUser, logoutUser };