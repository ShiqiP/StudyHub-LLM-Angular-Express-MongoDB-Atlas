import { Schema } from "mongoose";

export const FileUploadSchema = new Schema({
    url: { type: String },
    original_name: { type: String },
    original_type: { type: String },
});