import {
  ɵdefineDirective as defineDirective,
  ɵdirectiveInject as directiveInject,
  ViewContainerRef,
  TemplateRef
} from '@angular/core';
import {NgIf} from '@angular/common';

function installNgIfCompat() {
  (NgIf as any).ngDirectiveDef = defineDirective({
    type: NgIf,
    selectors: [['ngIf']],
    factory: () =>
      new NgIf(
        directiveInject(ViewContainerRef as any),
        directiveInject(TemplateRef as any)
      ),
    inputs: {ngIf: 'ngIf', ngIfThen: 'ngIfThen', ngIfElse: 'ngIfElse'}
  });
}

let didInstall = false;
export function installCompat() {
  if (didInstall) return;
  installNgIfCompat();
  didInstall = true;
}
