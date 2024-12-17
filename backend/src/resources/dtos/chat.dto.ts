import { Record, Chat, Reference } from "../../models/chat.model"


export interface ChatHomeRequestDTO {
    question: string,
    userId?: string,
    chatId?: string
    limit?: number
}
export interface ChatHomeResponseDTO {
    records: Array<Record & { index: number }>,
    references: Array<Reference>,
    _id: string
}

export interface ChatRequestDTO {
    question: string,
    userId?: string,
    resourceId?: string,
    chatId?: string
}

export interface ChatResponseDTO {
    records: Array<Record & { index: number }>
    _id: string
}


export interface GetChatRequestDTO {
    userId: string,
    resourceId: string,
    type: number
}