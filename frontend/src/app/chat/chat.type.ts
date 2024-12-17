

export interface Record {
    type: number,
    content: string,
    index?: number
}

export interface Reference {
    title: string,
    _id: string
}

export interface ChatResponse {
    records: Array<Record>,
    references?: Array<Reference>,
    _id: string
}

export interface ChatRequest {
    question: string,
    userId?: string,
    chatId?: string
    resourceId?: string,
}