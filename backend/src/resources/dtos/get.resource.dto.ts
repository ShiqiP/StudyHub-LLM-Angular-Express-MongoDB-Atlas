import { Resource } from "../../models/resources.model";

export interface GetResources {
    total: number;
    resources: Partial<Resource[]>;
}