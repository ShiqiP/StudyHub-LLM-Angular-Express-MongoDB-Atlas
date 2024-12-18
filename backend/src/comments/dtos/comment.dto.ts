export interface CommentDTO {
    comment: string,
    user: { fullname: string, _id: string },
    parentId?: string
}