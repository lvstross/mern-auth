import mongoose, { Schema, Document } from 'mongoose';

interface ITodo extends Document {
    description: string;
    complete: boolean;
    color: string;
    pinned: boolean;
}

const TodoSchema: Schema = new Schema(
    {
        description: {
            type: String,
            trim: true,
            required: true,
            max: 255
        },
        complete: {
            type: Boolean,
            default: false,
        },
        color: {
            type: String,
            max: 25
        },
        pinned: {
            type: Boolean,
            default: false,
        },
    },
    { timestamps: true }
);

export default mongoose.model<ITodo>('Todo', TodoSchema);