import 'dotenv/config'
import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import expressJwt from 'express-jwt';
import * as _ from 'lodash';
import { OAuth2Client } from 'google-auth-library';
import fetch from 'node-fetch';
import sgMail from '@sendgrid/mail';
import User, { IUser } from '../models/user';
import { NativeError } from 'mongoose';

sgMail.setApiKey(process.env.SENDGRID_API_KEY!);


// Signup without email verification
export const signup = (req: Request, res: Response): void => {
    console.log('REQ BODY ON SIGNUP', req.body);
    const { name, email, password } = req.body;

    User.findOne({ email }).exec((_: NativeError, user: IUser) => {
        if (user) {
            return res.status(400).json({
                error: 'Email is taken'
            });
        }
        return;
    });

    let newUser = new User({ name, email, password });

    newUser.save((err) => {
        if (err) {
            return res.status(400).json({
                error: err
            });
        }
        return res.json({
            message: 'Signup success! Please signin'
        });
    });
};

// Email Verification Signup
// export const signup = (req: Request, res: Response) => {
//     const { name, email, password } = req.body;

//     User.findOne({ email }).exec((err, user) => {
//         if (user) {
//             return res.status(400).json({
//                 error: 'Email is taken'
//             });
//         }

//         const token = jwt.sign({ name, email, password }, process.env.JWT_ACCOUNT_ACTIVATION, { expiresIn: '10m' });

//         const emailData = {
//             from: process.env.EMAIL_FROM,
//             to: email,
//             subject: `Account activation link`,
//             html: `
//                 <h1>Please use the following link to activate your account</h1>
//                 <p>${process.env.CLIENT_URL}/auth/activate/${token}</p>
//                 <hr />
//                 <p>This email may contain sensetive information</p>
//                 <p>${process.env.CLIENT_URL}</p>
//             `
//         };

//         sgMail
//             .send(emailData)
//             .then(sent => {
//                 // console.log('SIGNUP EMAIL SENT', sent)
//                 return res.json({
//                     message: `Email has been sent to ${email}. Follow the instruction to activate your account`
//                 });
//             })
//             .catch(err => {
//                 // console.log('SIGNUP EMAIL SENT ERROR', err)
//                 return res.json({
//                     message: err.message
//                 });
//             });
//     });
// };

// @ts-ignore
export const accountActivation = (req: Request, res: Response) => {
    const { token } = req.body;

    if (token) {
        // @ts-ignore
        jwt.verify(token, process.env.JWT_ACCOUNT_ACTIVATION!, (err: any) => {
            if (err) {
                console.log('JWT VERIFY IN ACCOUNT ACTIVATION ERROR', err);
                return res.status(401).json({
                    error: 'Expired link. Signup again'
                });
            }
            // @ts-ignore
            const { name, email, password } = jwt.decode(token);

            const user = new User({ name, email, password });

            user.save((err) => {
                if (err) {
                    console.log('SAVE USER IN ACCOUNT ACTIVATION ERROR', err);
                    return res.status(401).json({
                        error: 'Error saving user in database. Try signup again'
                    });
                }
                return res.json({
                    message: 'Signup success. Please signin.'
                });
            });
        });
    } else {
        return res.json({
            message: 'Something went wrong. Try again.'
        });
    }
};

export const signin = (req: Request, res: Response) => {
    const { email, password } = req.body;
    // check if user exist
    User.findOne({ email }).exec((err, user) => {
        if (err || !user) {
            return res.status(400).json({
                error: 'User with that email does not exist. Please signup'
            });
        }
        // authenticate
        if (!user.authenticate(password)) {
            return res.status(400).json({
                error: 'Email and password do not match'
            });
        }
        // generate a token and send to client
        const token = jwt.sign({ _id: user._id }, process.env.JWT_SECRET!, { expiresIn: '7d' });
        const { _id, name, email, role } = user;

        return res.json({
            token,
            user: { _id, name, email, role }
        });
    });
};

export const requireSignin = expressJwt({ secret: process.env.JWT_SECRET! });

export const adminMiddleware = (req: Request, res: Response, next: NextFunction) => {
    // @ts-ignore
    User.findById({ _id: req.user._id }).exec((err, user) => {
        if (err || !user) {
            return res.status(400).json({
                error: 'User not found'
            });
        }

        if (user.role !== 'admin') {
            return res.status(400).json({
                error: 'Admin resource. Access denied.'
            });
        }
        // @ts-ignore
        req.profile = user;
        return next();
    });
};

export const forgotPassword = (req: Request, res:Response) => {
    const { email } = req.body;

    User.findOne({ email }, (err, user) => {
        if (err || !user) {
            return res.status(400).json({
                error: 'User with that email does not exist'
            });
        }

        const token = jwt.sign({ _id: user._id, name: user.name }, process.env.JWT_RESET_PASSWORD!, {
            expiresIn: '10m'
        });

        const emailData = {
            from: process.env.EMAIL_FROM,
            to: email,
            subject: `Password Reset link`,
            html: `
                <h1>Please use the following link to reset your password</h1>
                <p>${process.env.CLIENT_URL}/auth/password/reset/${token}</p>
                <hr />
                <p>This email may contain sensetive information</p>
                <p>${process.env.CLIENT_URL}</p>
            `
        };
        // @ts-ignore
        return user.updateOne({ resetPasswordLink: token }, (err, _) => {
            if (err) {
                console.log('RESET PASSWORD LINK ERROR', err);
                return res.status(400).json({
                    error: 'Database connection error on user password forgot request'
                });
            } else {
                sgMail
                    // @ts-ignore
                    .send(emailData)
                    .then(_ => {
                        return res.json({
                            message: `Email has been sent to ${email}. Follow the instruction to activate your account`
                        });
                    })
                    .catch(err => {
                        return res.json({
                            message: err.message
                        });
                    });
            }
        });
    });
};

export const resetPassword = (req: Request, res: Response) => {
    const { resetPasswordLink, newPassword } = req.body;

    if (resetPasswordLink) {
        // @ts-ignore
        jwt.verify(resetPasswordLink, process.env.JWT_RESET_PASSWORD!, function(err: any) {
            if (err) {
                return res.status(400).json({
                    error: 'Expired link. Try again'
                });
            }
            // @ts-ignore
            User.findOne({ resetPasswordLink }, (err, user) => {
                if (err || !user) {
                    return res.status(400).json({
                        error: 'Something went wrong. Try later'
                    });
                }

                const updatedFields = {
                    password: newPassword,
                    resetPasswordLink: ''
                };

                user = _.extend(user, updatedFields);

                user.save((err, _) => {
                    if (err) {
                        return res.status(400).json({
                            error: 'Error resetting user password'
                        });
                    }
                    return res.json({
                        message: `Great! Now you can login with your new password`
                    });
                });
            });
        });
    }
};

export const client = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);
export const googleLogin = (req: Request, res: Response) => {
    const { idToken } = req.body;
    // @ts-ignore
    client.verifyIdToken({ idToken, audience: process.env.GOOGLE_CLIENT_ID }).then(response => {
        // @ts-ignore
        const { email_verified, name, email } = response.payload;
        if (email_verified) {
            // @ts-ignore
            User.findOne({ email }).exec((err: NativeError, user: IUser) => {
                if (user) {
                    const token = jwt.sign({ _id: user._id }, process.env.JWT_SECRET!, { expiresIn: '7d' });
                    const { _id, email, name, role } = user;
                    return res.json({
                        token,
                        user: { _id, email, name, role }
                    });
                } else {
                    let password = email + process.env.JWT_SECRET;
                    user = new User({ name, email, password });
                    user.save((err, data) => {
                        if (err) {
                            console.log('ERROR GOOGLE LOGIN ON USER SAVE', err);
                            return res.status(400).json({
                                error: 'User signup failed with google'
                            });
                        }
                        const token = jwt.sign({ _id: data._id }, process.env.JWT_SECRET!, { expiresIn: '7d' });
                        const { _id, email, name, role } = data;
                        return res.json({
                            token,
                            user: { _id, email, name, role }
                        });
                    });
                }
            });
        } else {
            return res.status(400).json({
                error: 'Google login failed. Try again'
            });
        }
    });
};

export const facebookLogin = (req: Request, res: Response) => {
    console.log('FACEBOOK LOGIN REQ BODY', req.body);
    const { userID, accessToken } = req.body;

    const url = `https://graph.facebook.com/v2.11/${userID}/?fields=id,name,email&access_token=${accessToken}`;

    return (
        fetch(url, {
            method: 'GET'
        })
            .then(response => response.json())
            .then(response => {
                const { email, name } = response;
                // @ts-ignore
                User.findOne({ email }).exec((err, user) => {
                    if (user) {
                        const token = jwt.sign({ _id: user._id }, process.env.JWT_SECRET!, { expiresIn: '7d' });
                        const { _id, email, name, role } = user;
                        return res.json({
                            token,
                            user: { _id, email, name, role }
                        });
                    } else {
                        let password = email + process.env.JWT_SECRET;
                        user = new User({ name, email, password });
                        user.save((err, data) => {
                            if (err) {
                                console.log('ERROR FACEBOOK LOGIN ON USER SAVE', err);
                                return res.status(400).json({
                                    error: 'User signup failed with facebook'
                                });
                            }
                            const token = jwt.sign({ _id: data._id }, process.env.JWT_SECRET!, { expiresIn: '7d' });
                            const { _id, email, name, role } = data;
                            return res.json({
                                token,
                                user: { _id, email, name, role }
                            });
                        });
                    }
                });
            })
            .catch(_ => {
                res.json({
                    error: 'Facebook login failed. Try later'
                });
            })
    );
};
