import { RequestHandler } from "express";
import { ErrorWithStatus, StandardResponse } from "../common/utils";
import { ChatRequestDTO, ChatHomeRequestDTO, ChatHomeResponseDTO, GetChatRequestDTO, ChatResponseDTO } from "./dtos/chat.dto";
import { Chat, ChatModel } from "../models/chat.model";
import { Resource, ResourceModel } from "../models/resources.model";
import { generateEmbedding, chatCompletion } from "../common/openai.util";
import { ChatCompletionMessageParam } from "openai/resources/index.mjs";


export const chatHomeHandler: RequestHandler<unknown, StandardResponse<ChatHomeResponseDTO>, ChatHomeRequestDTO, unknown> = async (req, res, next) => {
    try {
        const { question, userId, chatId, limit } = req.body;
        const messages: Array<ChatCompletionMessageParam> = [
            {
                role: 'system',
                content: 'Answer the question based on the given content'
            }
        ]
        if (!chatId) {
            //new
            const embedding = await generateEmbedding(question);
            const pipeline = [
                {
                    $vectorSearch: {
                        index: 'resource_vector_index',
                        "queryVector": embedding,
                        "path": "contentEmbedding",
                        "numCandidates": 20,
                        "limit": limit || 3,
                    }
                },
                {
                    $project: {
                        embeddedText: 1,
                        title: 1,
                        _id: 1
                    }
                }
            ]

            // find the relevant resources
            const results = await ResourceModel.aggregate(pipeline);
            const references = results.map(el => { return { _id: el._id, title: el.title } });

            // summarize the resources
            const contents: Array<ChatCompletionMessageParam> = results.map(el => { return { content: `Content: ${el.embeddedText}`, role: 'user' } })
            messages.push(...contents)
            messages.push({
                role: 'user',
                content: `Question: ${question}`
            })

            const answerObject = await chatCompletion({ messages })
            const answer = answerObject.choices[0].message.content
            const result = await ChatModel.create(
                { references, userId, type: 0, resourceId: '0', records: [{ type: 0, content: question }, { type: 1, content: answer }] })

            if (answer === null) throw new ErrorWithStatus("Something went wrong with the answer", 500)
            res.status(201).json({ success: true, data: { records: [{ type: 1, content: answer, index: 1 }], _id: result._id.toString(), references: result.references } });

        } else {
            //update
            const result = await ChatModel.findOne({ _id: chatId }, { references: 1, records: 1, _id: 0 })
            if (result === null) throw new ErrorWithStatus('Chat records went wrong', 404);

            //records
            const previousContents: Array<ChatCompletionMessageParam> = result?.records.map(el => { return { role: 'user', content: `${el.type === 0 ? 'Qustion' : 'Answer'} : ${el.content}` } })
            const newIndex = previousContents.length;

            // references 
            const refrencesContentsObj = await ResourceModel.find({ _id: { $in: result.references.map(el => el._id) } }, { _id: 0, embeddedText: 1 })
            const referencesContents: Array<ChatCompletionMessageParam> = refrencesContentsObj
                .map(el => { return { role: 'user', content: `Content: ${el.embeddedText}` } })

            messages.push(...referencesContents)
            messages.push(...previousContents, { role: 'user', content: `Question: ${question}` })

            const answerObject = await chatCompletion({
                messages
            })
            const answer = answerObject.choices[0].message.content
            if (answer === null) throw new ErrorWithStatus("Something went wrong with the answer", 500)

            const result2 = await ChatModel.updateOne({ _id: chatId }, { $push: { "records": { $each: [{ type: 0, content: question }, { type: 1, content: answer }], } } })

            res.status(201).json({ success: true, data: { records: [{ type: 1, content: answer, index: newIndex + 1 }], _id: chatId, references: [] } });

        }

    } catch (err) {
        next(err)
    }
}

export const chatHandler: RequestHandler<unknown, StandardResponse<ChatResponseDTO>, ChatRequestDTO, unknown> = async (req, res, next) => {
    try {
        const { question, userId, resourceId, chatId } = req.body

        // get the content of the resource
        const resouce = await ResourceModel.findOne({ _id: resourceId }, { _id: 0, embeddedText: 1 })
        if (resouce === null) throw new ErrorWithStatus('Resouces went wrong', 404);

        const messages: Array<ChatCompletionMessageParam> = [
            {
                role: 'system',
                content: 'Answer the question based on the given content'
            },
            {
                role: 'user',
                content: `Content: ${resouce.embeddedText}`
            },
        ]

        if (!chatId) {
            // new 
            if (!userId || !resourceId) {
                throw new ErrorWithStatus('Lack of required parameter userId,resourceId', 404);
            }
            const questionObj: ChatCompletionMessageParam = { role: 'user', content: `Question: ${question}` }
            messages.push(questionObj)

            const answerObject = await chatCompletion({
                messages
            })
            const answer = answerObject.choices[0].message.content
            if (answer === null) throw new ErrorWithStatus("Something went wrong with the answer", 500)
            const result = await ChatModel.create({
                type: 1,
                userId,
                resourceId,
                records: [{ type: 0, content: question }, { type: 1, content: answer }]
            })
            res.status(201).json({ success: true, data: { _id: result._id.toString(), records: [{ type: 1, content: answer, index: 1 }] } })

        }
        else {
            // update
            const result = await ChatModel.findOne({ _id: chatId }, { records: 1, _id: 0 })
            if (result === null) throw new ErrorWithStatus('Chat records went wrong', 404);

            const previousContents: Array<ChatCompletionMessageParam> = result?.records.map(el => { return { role: 'user', content: `${el.type === 0 ? 'Qustion' : 'Answer'} : ${el.content}` } })
            const newIndex = previousContents.length;
            messages.push(...previousContents, { role: 'user', content: `Question: ${question}` })

            const answerObject = await chatCompletion({
                messages
            })
            const answer = answerObject.choices[0].message.content
            if (answer === null) throw new ErrorWithStatus("Something went wrong with the answer", 500)

            const result2 = await ChatModel.updateOne({ _id: chatId }, { $push: { "records": { $each: [{ type: 0, content: question }, { type: 1, content: answer }], } } })

            res.status(201).json({ success: true, data: { _id: chatId, records: [{ type: 1, content: answer, index: newIndex + 1 }] } })

        }

    } catch (err) {
        next(err)
    }
}

export const getChatHandler: RequestHandler<unknown, StandardResponse<Chat | null>, unknown, GetChatRequestDTO> = async (req, res, next) => {
    try {
        const { userId, resourceId, type } = req.query
        const result = await ChatModel.findOne({ resourceId, userId, type });

        if (result === null) {
            res.status(201).json({ success: true, data: null })
        } else {
            res.status(201).json({ success: true, data: result })
        }
    } catch (err) {
        next(err)
    }
}

export const deleteChatHandler: RequestHandler<unknown, StandardResponse<null>, unknown, { _id: string }> = async (req, res, next) => {
    try {
        const { _id } = req.query
        const result = await ChatModel.deleteOne({ _id })
        if (result === null) {
            res.status(404).json({ success: false, data: null })
        } else {
            res.status(201).json({ success: true, data: null })
        }
    } catch (err) {
        next(err)
    }
}
