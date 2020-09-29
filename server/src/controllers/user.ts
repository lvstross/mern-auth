import { Error } from 'mongoose';
import { Request, Response } from 'express';
import User, { IUser } from '../models/user';

export const read = (req: Request, res: Response) => {
    const userId = req.params.id;
    User.findById(userId).exec((err, user: IUser): Response => {
        if (err || !user) {
            return res.status(400).json({
                error: 'User not found'
            });
        }
        user.hashed_password = '';
        user.salt = '';
        return res.json(user);
    });
};

export const update = (req: any, res: any) => {
    const { name, password } = req.body;

    User.findOne({ _id: req.user._id }, (err, user: IUser) => {
        if (err || !user) {
            return res.status(400).json({
                error: 'User not found'
            });
        }
        if (!name) {
            return res.status(400).json({
                error: 'Name is required'
            });
        } else {
            user.name = name;
        }

        if (password) {
            if (password.length < 6) {
                return res.status(400).json({
                    error: 'Password should be min 6 characters long'
                });
            } else {
                user.password = password;
            }
        }

        user.save((err, updatedUser) => {
            if (err) {
                console.log('USER UPDATE ERROR', err);
                return res.status(400).json({
                    error: 'User update failed'
                });
            }
            updatedUser.hashed_password = '';
            updatedUser.salt = '';
            return res.json(updatedUser);
        });
    });
};
