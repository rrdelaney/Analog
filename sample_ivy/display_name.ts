import {
  Component,
  Input,
  ChangeDetectorRef,
  Optional,
  InjectionToken,
  Inject
} from '@angular/core';

export const PROPS = new InjectionToken('props');

@Component({
  selector: 'display-name',
  template: `
    <h3 (click)="logTrue()">
      Hello
      <p>{{ name }}</p>
    </h3>
  `
})
export class DisplayName {
  @Input() name!: string;
  @Input() name2!: string;

  constructor(
    @Optional() @Inject(PROPS) readonly props: number,
    readonly cdr: ChangeDetectorRef
  ) {}

  logTrue() {
    console.log(true);
  }
}
