import { ResourceAccessTypeEnum } from "../../common/resource.accesstype.enum";

export interface AddResourceDTO {
    title: string,
    content?: string,
    accessType: ResourceAccessTypeEnum
}