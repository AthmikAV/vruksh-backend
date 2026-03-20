const { treeRegisterValidationSchema,treeUpdateValidationSchema } = require("../validators/treeValidators")
const { Tree } = require('../models/treesSchema');

const postTree = async (req, res, next) => {
    try {
        const result = treeRegisterValidationSchema.safeParse(req.body);
        if (!result.success) {
            return res.status(400).json({
                success: false,
                message: result.error.flatten().fieldErrors
            })
        }
        const existingTree = await Tree.findOne({ name: result.data.name });
        if (existingTree) {
            return res.status(409).json({
                success: false,
                message: "Tree already exists"
            })
        }

        const tree = new Tree(result.data);
        await tree.save();

        return res.status(201).json({
            success: true,
            message: "Tree added successfully",
            data: tree
        })

    } catch (error) {
        next(error);
    }
};
const getAllTree = async (req, res, next) => {
    try {
        const trees = await Tree.find({ isAvailable: true });
        return res.status(200).json({
            success: true,
            count: trees.length,
            data: trees
        });
    } catch (error) {
        next(error);
    }
};
const getTreeById = async (req, res, next) => {
    try {
        const tree = await Tree.findById(req.params.id);
        if (!tree || !tree.isAvailable) {
            return res.status(404).json({
                success: false,
                message: "Tree not found"
            });
        }
        return res.status(200).json({
            success: true,
            data: tree
        });
    } catch (error) {
        next(error);
    }
};
const editTree = async (req, res, next) => {
    try {
        const result = treeUpdateValidationSchema.safeParse(req.body);
        if (!result.success) {
            return res.status(400).json({
                success: false,
                message: result.error.flatten().fieldErrors
            })
        }
        if (Object.keys(result.data).length == 0) {
            return res.status(400).json({
                success: false,
                message: "Nothing to update"
            })
        }
        const tree = await Tree.findByIdAndUpdate(
            req.params.id,
            { $set: result.data },
            { new: true, runValidators: true }
        )
        if (!tree) {
            return res.status(404).json({
                success: false,
                message:"Tree not found"
            })
        }
        return res.status(200).json({
            success: true,
            message: "Tree updated successfully",
            data: tree
        });
    } catch (error) {
        next(error);
    }
}

module.exports = { postTree ,getAllTree, getTreeById,editTree};