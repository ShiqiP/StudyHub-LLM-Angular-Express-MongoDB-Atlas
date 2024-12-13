import OpenAI from "openai";

const openai = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY
});

export const generateEmbedding = async (input: string | string[]) => {
    const vectorEmbedding = await openai.embeddings.create({
        model: 'text-embedding-3-small',
        input // string or string[]
    });
    // console.log({
    //     dimensions: vectorEmbedding.data[0].embedding.length, // 1536 dimentions
    //     embedding: vectorEmbedding.data[0].embedding
    // });
    return vectorEmbedding.data[0].embedding
}

export const chatCompletion = async (options: Omit<OpenAI.Chat.Completions.ChatCompletionCreateParamsNonStreaming, "model">) => {
    const configuration = { model: 'gpt-4o-mini', ...options}
    const response = await openai.chat.completions.create(configuration)
    return response
}