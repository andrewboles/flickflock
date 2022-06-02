const express = require('express');

const router = express.Router();
const post_controller = require('../controllers/postController');
const { isAuthenticated } = require('../middlewares');

router.get('/home', isAuthenticated, post_controller.getHomePosts);
router.get('/feed', isAuthenticated, post_controller.getFeedPosts);
router.get('/:id', post_controller.getPost);
router.post('/:id/createComment', isAuthenticated, post_controller.createComment);
router.delete('/removeComment/:id', isAuthenticated, post_controller.removeComment);
router.post('/:id/addHeart', isAuthenticated, post_controller.addHeart);
router.delete('/:id/removeHeart', isAuthenticated, post_controller.removeHeart);
router.post('/:id/addCommentHeart', isAuthenticated, post_controller.addCommentHeart);
router.delete('/:id/removeCommentHeart', isAuthenticated, post_controller.removeCommentHeart);
router.post('/createPost', isAuthenticated, post_controller.createPost);
router.delete('/:id/deletePost', isAuthenticated, post_controller.deletePost);

module.exports = router;
