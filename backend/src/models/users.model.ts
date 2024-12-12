import { Schema, model, InferSchemaType, pluralize } from 'mongoose';

const userSchema = new Schema({
    fullname: String,
    email: { type: String, unique: true },
    password: String,
    picture_url: String,
    original_picture_name: String,
    original_picture_type: String,
}, {
    timestamps: true
});

export type User = InferSchemaType<typeof userSchema>;

export const UserModel = model<User>('user', userSchema);