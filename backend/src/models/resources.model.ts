
import { Schema, model, InferSchemaType, pluralize } from 'mongoose';

// pluralize(null);

const commentSchema = new Schema({
    comment: { type: String, required: true },
    userId: { type: String, required: true },
    createAt: { type: Date, default: Date.now },
    updateAt: { type: Date },
    parentId: { type: String, default: null } // null-first level comment
})

const resourceSchema = new Schema({
    title: { type: String, required: true },
    content: { type: String },
    resources: { type: [String] },
    contentEmbedding: { type: [Number] },
    accessType: { type: String, enum: [0, 1], required: true }, // 0-private 1-public
    createAt: { type: Date, default: Date.now },
    updateAt: { type: Date },
    author: { type: String, required: true },
    likesUserId: { type: [String] }, // store the userId
    comment: { type: [commentSchema] },
})

export type Resource = InferSchemaType<typeof resourceSchema>;

export const ResourceModel = model<Resource>('Resource', resourceSchema);
