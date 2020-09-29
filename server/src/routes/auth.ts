import express from 'express';
import {
    signup,
    accountActivation,
    signin,
    forgotPassword,
    resetPassword,
    googleLogin,
    facebookLogin
} from '../controllers/auth';
import {
    userSignupValidator,
    userSigninValidator,
    forgotPasswordValidator,
    resetPasswordValidator
} from '../validators/auth';
import { runValidation } from '../validators';

const router = express.Router();
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

export default router;
