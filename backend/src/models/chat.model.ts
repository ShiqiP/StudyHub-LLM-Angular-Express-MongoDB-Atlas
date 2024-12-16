import { Schema, model, InferSchemaType } from "mongoose";


const recordSchema = new Schema({
    type: { type: Number, required: true }, // 0-question 1-answer
    content: { type: String, required: true }
})

const referenceSchema = new Schema({
    title: { type: String, required: true },
    _id: { type: String, required: true }
})

const chatSchema = new Schema({
    references: { type: [referenceSchema] },
    userId: { type: String, required: true },
    records: { type: [recordSchema] },
    type: { type: Number, required: true }, // 0-homepage 1-certain resouce
    resourceId: { type: String, required: true } // 0-homepage  
}, {
    timestamps: true
})

export type Reference = InferSchemaType<typeof referenceSchema>
export type Record = InferSchemaType<typeof recordSchema>
export type Chat = InferSchemaType<typeof chatSchema>

export const ChatModel = model<Chat>('Chat', chatSchema)