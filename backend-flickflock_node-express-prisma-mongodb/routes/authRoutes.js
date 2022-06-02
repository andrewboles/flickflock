const express = require('express');
const passport = require('passport');

const router = express.Router();
const auth_controller = require('../controllers/authController');
const { isAuthenticated } = require('../middlewares');

router.post('/register', auth_controller.register);
router.post('/login', auth_controller.login);
router.post('/refreshToken', auth_controller.refreshToken);
router.post('/logout', isAuthenticated, auth_controller.logout);
router.post('/checkUsername', auth_controller.checkUsername);
router.post('/updateUsername', isAuthenticated, auth_controller.updateUsername);
router.get('/google', passport.authenticate('google', { scope: ['profile', 'email'] }));
router.get('/facebook', passport.authenticate('facebook', { scope: 'email' }));
router.get('/googleRedirect', passport.authenticate('google'), auth_controller.googleRedirect);
router.get('/facebookRedirect', passport.authenticate('facebook', { scope: 'email' }), auth_controller.facebookRedirect);

module.exports = router;
