const express = require('express');
const router = express.Router();
const { isAdmin } = require('../middlewares/isAdmin');
const { postTree, getAllTree,getTreeById,editTree } = require('../controllers/treeControllers');
const { isAuthenticated } = require('../middlewares/isAutenticated');

router.get('/', isAuthenticated, getAllTree);
router.get('/:id', isAuthenticated, getTreeById);
router.post('/', isAuthenticated, isAdmin, postTree);
router.patch('/:id', isAuthenticated, isAdmin, editTree);

module.exports =  router ;