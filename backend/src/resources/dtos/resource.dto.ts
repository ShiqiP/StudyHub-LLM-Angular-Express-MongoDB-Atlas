import { Schema } from "mongoose";
import { CommentDTO } from "../../comments/dtos/comment.dto";
import { FileUploadDTO } from "../../common/dtos/file.upload.dto";
import { ResourceAccessTypeEnum } from "../../common/resource.accesstype.enum";

export interface ResourceDTO {
    _id: Schema.Types.ObjectId,
    title: string,
    content?: string,
    resources?: FileUploadDTO[],
    embeddedText: string,
    contentEmbedding: number[],
    accessType: ResourceAccessTypeEnum, // 0-private 1-public
    author: string,
    likesUserId: string[], // store the userId
    comment: CommentDTO[],
}