const express = require('express');

const router = express.Router();
const user_controller = require('../controllers/userController');
const { isAuthenticated } = require('../middlewares');

router.get('/getUserAndPostsWithUsername/:id', user_controller.getUserAndPostsWithUsername);
router.post('/:id/follow', isAuthenticated, user_controller.followUser);
router.post('/:id/unfollow', isAuthenticated, user_controller.unfollowUser);
module.exports = router;
