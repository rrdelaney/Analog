import {Component, Input} from '@angular/core';

@Component({
  selector: 'display-name',
  template: `
    <h3>
      Hello
      <p class="para">{{ name }}</p>
    </h3>
  `,
  styles: [
    `
      .para {
        font-size: 20pt;
      }
    `
  ]
})
export class DisplayName {
  @Input() name!: string;
  @Input() name2!: string;
}
