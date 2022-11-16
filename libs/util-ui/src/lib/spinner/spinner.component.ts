import { Component } from '@angular/core';

/**
 * Zie https://loading.io/css/
 */
@Component({
  selector: 'fab-util-spinner',
  template: `
    <div class="lds-ellipsis">
      <div></div>
      <div></div>
      <div></div>
      <div></div>
    </div>
  `,
  styleUrls: ['./spinner.component.css'],
})
export class SpinnerComponent {}
