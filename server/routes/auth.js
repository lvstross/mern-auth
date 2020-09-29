const express = require('express');
const router = express.Router();
const {
    signup,
    accountActivation,
    signin,
    forgotPassword,
    resetPassword,
    googleLogin,
    facebookLogin
} = require('../controllers/auth');
const {
    userSignupValidator,
    userSigninValidator,
    forgotPasswordValidator,
    resetPasswordValidator
} = require('../validators/auth');
const { runValidation } = require('../validators');

// Auth Routes
router.post('/signup', userSignupValidator, runValidation, signup);
router.post('/account-activation', accountActivation);
router.post('/signin', userSigninValidator, runValidation, signin);
// Forgot & Reset Password
router.put('/forgot-password', forgotPasswordValidator, runValidation, forgotPassword);
router.put('/reset-password', resetPasswordValidator, runValidation, resetPassword);
// Google & Facebook
router.post('/google-login', googleLogin);
router.post('/facebook-login', facebookLogin);

module.exports = router;
