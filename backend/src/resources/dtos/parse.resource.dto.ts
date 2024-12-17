export interface ParsedResourceDTO {
    contentText: string,
    resource_files: MulterFileDetail[]
}

export interface MulterFileDetail {
    url: string,
    original_name: string,
    original_type: string
}