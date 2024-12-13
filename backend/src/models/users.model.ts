import { Schema, model, InferSchemaType } from 'mongoose';
import { FileUploadSchema } from './file.upload.model';

const userSchema = new Schema({
    fullname: String,
    email: { type: String, unique: true },
    password: String,
    picture: FileUploadSchema
}, {
    timestamps: true
});

export type User = InferSchemaType<typeof userSchema>;

export const UserModel = model<User>('user', userSchema);