import { RequestHandler } from "express";
import { StandardResponse } from "../common/utils";
import { AddResourceDTO } from "./dtos/add.resource.dto";
import { FileUploadDTO } from "../common/dtos/file.upload.dto";
import PdfParse from "pdf-parse";
import fs from 'node:fs';
import path from "node:path";
import mammoth from "mammoth";
import { generateEmbedding } from "../common/openai.util";
import { ResourceDTO } from "./dtos/resource.dto";
import { Resource, ResourceModel } from "../models/resources.model";
import { ResourceAccessTypeEnum } from "../common/resource.accesstype.enum";
import { MulterFileDetail, ParsedResourceDTO } from "./dtos/parse.resource.dto";
import { AddCommentDTO } from "./dtos/add.comment.dto";
import { CommentDTO } from "../comments/dtos/comment.dto";
import { GetResources } from "./dtos/get.resource.dto";

export const uploadResource: RequestHandler<unknown, StandardResponse<Partial<Resource>>, AddResourceDTO, unknown> = async (req, res, next) => {
    try {
        // const resource_files: FileUploadDTO[] = [];
        let contentText: string = "";

        let parsedData: Partial<ParsedResourceDTO> = {};

        try {
            if (req.files) {
                parsedData = await parseFiles(req.files);
                contentText += req.body.content + parsedData.contentText;
            }
        } catch (err) {
            res.status(500).json({ success: false, message: `Cannot parse one or more file please only use pdf, word, or any file extension which can be opened in text editor.`, data: {} });
            return;
        }
        const embedding = await generateEmbedding(contentText);

        const resource: Partial<ResourceDTO> = {
            title: req.body.title,
            content: req.body.content,
            resources: parsedData.resource_files,
            embeddedText: contentText,
            contentEmbedding: embedding,
            accessType: req.body.accessType, // 0-private 1-public
            author: req['user']?._id,
            likesUserId: [], // store the userId
            comment: [],
        }

        try {
            const newResource: Resource = await ResourceModel.create(resource);
            console.log('Resource saved successfully:', newResource);

            newResource.contentEmbedding = [];
            newResource.embeddedText = "";

            res.status(201).json({ success: true, data: newResource });
        } catch (error) {
            console.error('Error saving resource:', error);
            return;
        }

    } catch (err) {
        res.status(500).json({ success: false, message: `Something went wrong: ${err}`, data: {} });
    }
};

export const getResources: RequestHandler<unknown, StandardResponse<GetResources>, unknown, { page: number, limit: number }> = async (req, res, next) => {
    try {

        const page = req.query.page ?? 1;
        const limit = req.query.limit ?? 10;

        const total = await ResourceModel.find({ accessType: ResourceAccessTypeEnum.public }).countDocuments();

        let resources = await ResourceModel.find({ accessType: ResourceAccessTypeEnum.public }, {
            title: 1,
            content: 1,
            resources: 1,
            embeddedText: 1,
            accessType: 1, // 0-private 1-public
            author: 1,
            likesUserId: 1, // store the userId
            comment: 1,
        })
            .sort({ createdAt: -1, updatedAt: -1 })
            .skip((page - 1) * limit)
            .limit(limit);

        res.status(200).json({ success: true, data: { total: total, resources: resources } });

    } catch (err) {
        res.status(500).json({ success: false, message: `Something went wrong: ${err}`, data: { total: 0, resources: [] } });
    }
};

export const getOwnResources: RequestHandler<unknown, StandardResponse<GetResources>, unknown, { page: number, limit: number }> = async (req, res, next) => {
    try {

        const page = req.query.page ?? 1;
        const limit = req.query.limit ?? 10;

        const total = await ResourceModel.find({ author: req['user']?._id }).countDocuments();

        let resources = await ResourceModel.find({ author: req['user']?._id }, {
            title: 1,
            content: 1,
            resources: 1,
            embeddedText: 1,
            accessType: 1, // 0-private 1-public
            author: 1,
            likesUserId: 1, // store the userId
            comment: 1,
        })
            .sort({ createdAt: -1, updatedAt: -1 })
            .skip((page - 1) * limit)
            .limit(limit);

        res.status(200).json({ success: true, data: { total: total, resources: resources } });

    } catch (err) {
        res.status(500).json({ success: false, message: `Something went wrong: ${err}`, data: { total: 0, resources: [] } });
    }
};

export const getResourceById: RequestHandler<{ id: string }, StandardResponse<Partial<Resource>>, unknown, unknown> = async (req, res, next) => {
    try {

        let resource = await ResourceModel.findById({ _id: req.params.id }, {
            title: 1,
            content: 1,
            resources: 1,
            accessType: 1, // 0-private 1-public
            author: 1,
            likesUserId: 1, // store the userId
            comment: 1,
        });

        res.status(200).json({ success: true, data: resource ?? {} });

    } catch (err) {
        res.status(500).json({ success: false, message: `Something went wrong: ${err}`, data: {} });
    }
};

export const updateResourceById: RequestHandler<{ id: string }, StandardResponse<number>, AddResourceDTO, unknown> = async (req, res, next) => {

    const resource = await ResourceModel.findOne({ _id: req.params.id }, { _id: 0, author: 1, embeddedText: 1 });

    if (resource?.author != req['user']?._id) {
        res.status(500).json({ success: false, message: `Resourse can only be updated by the auther`, data: 0 });
    }

    let parsedData: ParsedResourceDTO = {
        contentText: "",
        resource_files: []
    };

    try {
        if (req.files) {
            parsedData = await parseFiles(req.files);
        }
    } catch (err) {
        res.status(500).json({ success: false, message: `Cannot parse one or more file please only use pdf, word, or any file extension which can be opened in text editor.`, data: 0 });
    }

    const content: {
        resources: MulterFileDetail[] | undefined,
        embeddedText: string,
        contentEmbedding: number[]
    } = {
        resources: [],
        embeddedText: "",
        contentEmbedding: []
    };

    if ((resource?.embeddedText !== null || parsedData.contentText != null) && resource?.embeddedText !== parsedData.contentText) {
        content.resources = parsedData.resource_files,
            content.embeddedText = parsedData.contentText,
            content.contentEmbedding = await generateEmbedding(parsedData.contentText)
    }

    try {
        let updateData = {};

        if (content.embeddedText != "") {
            updateData = {
                ...content,
                title: req.body.title,
                content: req.body.content,
                accessType: req.body.accessType, // 0-private 1-public
            }
        } else {
            updateData = {
                title: req.body.title,
                content: req.body.content,
                accessType: req.body.accessType, // 0-private 1-public
            }
        }

        let results = await ResourceModel.updateOne({ _id: req.params.id }, updateData);

        res.status(200).json({ success: true, data: results.modifiedCount });

    } catch (err) {
        res.status(500).json({ success: false, message: `Something went wrong: ${err}`, data: 0 });
    }
};

export const deleteResourceById: RequestHandler<{ id: string }, StandardResponse<number>, unknown, unknown> = async (req, res, next) => {

    try {
        let results = await ResourceModel.deleteOne({ _id: req.params.id, author: req['user']?._id });

        res.status(200).json({ success: true, data: results.deletedCount });

    } catch (err) {
        res.status(500).json({ success: false, message: `Something went wrong: ${err}`, data: 0 });
    }
};

export const likeResourceById: RequestHandler<{ id: string }, StandardResponse<number>, { liked: boolean }, unknown> = async (req, res, next) => {

    try {
        let updateData = {};
        if (req.body.liked) {
            updateData = { $pull: { likesUserId: req['user']?._id } };
        } else {
            updateData = { $addToSet: { likesUserId: req['user']?._id } };
        }

        let results = await ResourceModel.updateOne({ _id: req.params.id }, updateData);

        res.status(200).json({ success: true, data: results.modifiedCount });

    } catch (err) {
        res.status(500).json({ success: false, message: `Something went wrong: ${err}`, data: 0 });
    }
};

export const commentResourceById: RequestHandler<{ id: string }, StandardResponse<number>, AddCommentDTO, unknown> = async (req, res, next) => {
    try {
        const comment: CommentDTO = {
            user: { _id: req['user']?._id, fullname: req['user'].fullname },
            comment: req.body.comment,
            parentId: req.body.parentId
        }

        let results = await ResourceModel.updateOne({ _id: req.params.id }, { $push: { comment: comment } });

        res.status(200).json({ success: true, data: results.modifiedCount });

    } catch (err) {
        res.status(500).json({ success: false, message: `Something went wrong: ${err}`, data: 0 });
    }
};

export const downloadResourceFile: RequestHandler<unknown, unknown, { path: string }, unknown> = async (req, res, next) => {
    res.download(req.body.path, function (err) {
        if (err) {
            console.log(err);
        }
    })
}

export const downloadOwnResourceFile: RequestHandler<{ id: string }, unknown, unknown, unknown> = async (req, res, next) => {
}

const parseFiles = async (files: Express.Multer.File[] | { [fieldname: string]: Express.Multer.File[] }): Promise<ParsedResourceDTO> => {

    let parsedData: ParsedResourceDTO = {
        contentText: "",
        resource_files: []
    };

    for (const f in files) {
        const extName = path.extname(files[f].originalname);
        if (extName === ".pdf") {
            let dataBuffer = fs.readFileSync(files[f].path);
            let data = await PdfParse(dataBuffer);
            parsedData.contentText += data.text;
        } else if (extName === ".doc" || extName === ".docx") {
            let data = await mammoth.extractRawText({ path: files[f].path });
            parsedData.contentText += data.value;
        } else {
            parsedData.contentText += fs.readFileSync(files[f].path, { encoding: 'utf8' });
        }

        parsedData.resource_files.push({
            url: files[f].path,
            original_name: files[f].originalname,
            original_type: files[f].mimetype
        });
    }

    return parsedData;
}