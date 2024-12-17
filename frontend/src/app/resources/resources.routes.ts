import { Routes } from "@angular/router";
import { OwnResourcesComponent } from "./own-resources.component";
import { AddResourcesComponent } from "./add-resources.component";
import { ResourceDetailComponent } from "./resource-detail.component";

export const resources_routes: Routes = [
    { path: "", loadComponent: () => OwnResourcesComponent },
    { path: "add", loadComponent: () => AddResourcesComponent },
    { path: ":$resourceId", loadComponent: () => ResourceDetailComponent },
];
