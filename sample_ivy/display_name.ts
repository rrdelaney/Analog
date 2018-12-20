import {Component, Input} from '@angular/core';

@Component({
  selector: 'display-name',
  template: `
    <h3>
      Hello <span *ngIf="name"><ng-content></ng-content></span>
      <p [style.font-size]="'20pt'">{{ name }}</p>
    </h3>
  `
})
export class DisplayName {
  @Input() name!: string;
  @Input() name2!: string;
}
