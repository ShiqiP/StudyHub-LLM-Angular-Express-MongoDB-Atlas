
import { Schema, model, InferSchemaType, pluralize } from 'mongoose';
import { FileUploadSchema } from './file.upload.model';

// pluralize(null);

const commentSchema = new Schema({
    comment: { type: String, required: true },
    user: { type: { _id: String, fullname: String }, required: true },
    parentId: { type: String, default: null } // null-first level comment
}, {
    timestamps: true
})

const resourceSchema = new Schema({
    title: { type: String, required: true },
    content: { type: String },
    resources: { type: [FileUploadSchema] },
    embeddedText: { type: String },
    contentEmbedding: { type: [Number] },
    accessType: { type: String, enum: [0, 1], required: true }, // 0-private 1-public
    author: { type: String, required: true },
    likesUserId: { type: [String] }, // store the userId
    comment: { type: [commentSchema] },
}, {
    timestamps: true
})

export type Resource = InferSchemaType<typeof resourceSchema>;

export const ResourceModel = model<Resource>('Resource', resourceSchema);
