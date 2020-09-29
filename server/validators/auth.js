const { check } = require('express-validator');

const userSignupValidator = [
    check('name')
        .not()
        .isEmpty()
        .withMessage('Name is required'),
    check('email')
        .isEmail()
        .withMessage('Must be a valid email address'),
    check('password')
        .isLength({ min: 6 })
        .withMessage('Password must be at least  6 characters long')
];

const userSigninValidator = [
    check('email')
        .isEmail()
        .withMessage('Must be a valid email address'),
    check('password')
        .isLength({ min: 6 })
        .withMessage('Password must be at least  6 characters long')
];

const forgotPasswordValidator = [
    check('email')
        .not()
        .isEmpty()
        .isEmail()
        .withMessage('Must be a valid email address')
];

const resetPasswordValidator = [
    check('newPassword')
        .not()
        .isEmpty()
        .isLength({ min: 6 })
        .withMessage('Password must be at least  6 characters long')
];

module.exports = {
    userSignupValidator,
    userSigninValidator,
    forgotPasswordValidator,
    resetPasswordValidator    
}
