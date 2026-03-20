const User = require("../models/userSchema");
const { userPatchValidationSchema } = require("../validators/userValidators");

const getProfile = async (req, res, next) => {
    try {
        const user = req.user;
        const editedData = {
            name: user.name,
            email: user.email,
            phone: user.phone,
            profilePhoto: user.profilePhoto
        }

        return res.status(200).json({
            success: true,
            message: "User details",
            data: editedData
        })
    } catch (error) {
        next(error);
    }
}
const updateProfile = async (req, res, next) => {
    try {
        const result = userPatchValidationSchema.safeParse(req.body);
    if (!result.success) {
        return res.status(400).json({
            success: false,
            message:result.error.flatten().fieldErrors
        })
    }
     if (Object.keys(result.data).length === 0) {
            return res.status(400).json({
                success: false,
                message: "Nothing to update"
            });
    }
    const updatedUser = await User.findByIdAndUpdate(
        req.user._id,
        { $set: result.data },
        { 
                new: true,      // ✅ return updated user not old user
                runValidators: true  // ✅ run mongoose validators on update
        }
    )
    const editedData = {
        name: updatedUser.name,
        email: updatedUser.email,
        phone: updatedUser.phone,
        profilePhoto: updatedUser.profilePhoto
    }

    return res.status(200).json({
        success: true,
        message: "Updated succesfully",
        data:editedData
    })
    } catch (error) {
        next(error);
    }
}
const deleteUser = async (req, res, next) =>{
    try {
        await User.findByIdAndDelete(req.user._id);
        res.clearCookie('token', {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: 'Strict'
        })
        return res.status(200).json({
            success: true,
            message:"Accoutn deleted successfully"
        })
    } catch (error) {
        next(error);
    }

}
module.exports = { getProfile, updateProfile,deleteUser };