import { Routes } from "@angular/router";
import { OwnResourcesComponent } from "./own-resources.component";
import { AddResourcesComponent } from "./add-resources.component";
import { ResourceDetailComponent } from "./resource-detail.component";
import { StateService } from "../state.service";
import { inject } from "@angular/core";

export const resources_routes: Routes = [
    {
        path: "", loadComponent: () => OwnResourcesComponent,
        canActivate: [() => inject(StateService).isLoggedIn()]
    },
    {
        path: "add", loadComponent: () => AddResourcesComponent,
        canActivate: [() => inject(StateService).isLoggedIn()]
    },
    { path: ":$resourceId", loadComponent: () => ResourceDetailComponent },
];
