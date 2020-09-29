import mongoose, { Schema, Document } from 'mongoose';
import crypto from 'crypto';

interface UserMethods {
    authenticate: Function;
    encryptPassword: Function;
    makeSalt: Function;
}

interface VirtualUserProps {
    password: string;
    _password: string;
}

export interface IUser extends VirtualUserProps, UserMethods, Document {
    name: string;
    email: string;
    hashed_password: string;
    salt: string;
    role: string;
    resetPasswordLink: string;
}

const UserSchema: Schema = new Schema(
    {
        name: {
            type: String,
            trim: true,
            required: true,
            max: 32
        },
        email: {
            type: String,
            trim: true,
            required: true,
            unique: true,
            lowercase: true
        },
        hashed_password: {
            type: String,
            required: true
        },
        salt: String,
        role: {
            type: String,
            default: 'subscriber'
        },
        resetPasswordLink: {
            data: String,
            default: ''
        }
    },
    { timestamps: true }
);

// Virtual
UserSchema
    .virtual('password')
    .set(function(this: IUser & { _password: string, makeSalt: Function, encryptPassword: Function }, password: string) {
        this._password = password;
        this.salt = this.makeSalt();
        this.hashed_password = this.encryptPassword(password);
    })
    .get(function(this: { _password: string }) {
        return this._password;
    });

// Methods
UserSchema.methods = {
    authenticate: function(plainText: string) {
        return this.encryptPassword(plainText) === this.hashed_password;
    },
    encryptPassword: function(password: string) {
        if (!password) return '';
        try {
            return crypto
                .createHmac('sha1', this.salt)
                .update(password)
                .digest('hex');
        } catch (err) {
            return '';
        }
    },
    makeSalt: function() {
        return Math.round(new Date().valueOf() * Math.random()) + '';
    }
};

export default mongoose.model<IUser>('User', UserSchema);
