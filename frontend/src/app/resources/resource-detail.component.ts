import { Component, input } from '@angular/core';

@Component({
  selector: 'app-resource-detail',
  imports: [],
  template: `
    <p>
      resource-detail works!
      {{ $resourceId() }}
    </p>
  `,
  styles: ``
})
export class ResourceDetailComponent {
  $resourceId = input<string>();
}
