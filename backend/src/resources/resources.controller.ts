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

export const uploadResource: RequestHandler<unknown, StandardResponse<Resource>, AddResourceDTO, unknown> = async (req, res, next) => {
    try {
        const resource_files: FileUploadDTO[] = [];
        let contentText: string = "";

        if (req.body.content) {
            contentText += req.body.content;
        }

        for (const f in req.files) {
            const extName = path.extname(req.files[f].originalname);
            if (extName === ".pdf") {
                let dataBuffer = fs.readFileSync(req.files[f].path);
                let data = await PdfParse(dataBuffer);
                contentText += data.text;
            } else if (extName === ".doc" || extName === ".docx") {
                let data = await mammoth.extractRawText({ path: req.files[f].path });
                contentText += data.value;
            } else {
                contentText += fs.readFileSync(req.files[f].path, { encoding: 'utf8' });
            }

            resource_files.push({
                url: req.files[f].path,
                original_name: req.files[f].originalname,
                original_type: req.files[f].mimetype
            });
        }

        const embedding = await generateEmbedding(contentText);

        const resource: Partial<ResourceDTO> = {
            title: req.body.title,
            content: req.body.content,
            resources: resource_files,
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
        }

    } catch (err) {
        next(err);
    }
};