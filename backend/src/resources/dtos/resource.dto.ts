import { CommentDTO } from "../../comments/dtos/comment.dto";
import { ResourceAccessTypeEnum } from "../../common/resource.accesstype.enum";

export interface ResourceDTO {
    title: string,
    content?: string,
    resources: [{ url: string, original_name: string, original_type: string }],
    contentEmbedding: number[],
    accessType: ResourceAccessTypeEnum, // 0-private 1-public
    author: string,
    likesUserId: string[], // store the userId
    comment: CommentDTO[],
}