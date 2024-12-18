import { ResourceAccessTypeEnum } from "../../common/resource.accesstype.enum";

export interface ResourceDTO {
    _id: string,
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

export interface FileUploadDTO {
    url: string,
    original_name: string,
    original_type: string
}

export interface CommentDTO {
    _id: string,
    comment: string,
    user: { fullname: string, _id: string },
    parentId?: string,
    createdAt?: number
}