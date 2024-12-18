import { ResourceDTO } from "./resources.dto";

export interface GetResources {
    total: number;
    resources: ResourceDTO[];
}