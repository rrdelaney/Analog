import {
  ɵdefineComponent as defineComponent,
  Type,
  ViewEncapsulation
} from '@angular/core';
import {AnyNgElement, isComponentSpec, isNgElement} from './element';
import {flat} from './util';
import {pendingInputs} from './use_input';
import {makeRenderFn} from './renderer';

export interface NgComponent extends Type<{}> {
  template(): AnyNgElement;
  ngComponentDef?: never;
}

function findUsedDirectives(el: AnyNgElement): Type<{}>[] {
  const usedDirectives: Type<{}>[] = [];
  if (isComponentSpec(el.elSpec)) {
    usedDirectives.push(el.elSpec);
  }

  const children = el.children || [];
  const childInputs = children
    .filter(isNgElement)
    .map(findUsedDirectives)
    .reduce(flat, []);

  return Array.from(new Set([...usedDirectives, ...childInputs]));
}

export function Component<CType extends NgComponent>(comp: CType) {
  function compFactory(t: Type<{}> | null) {
    const instance = new (t || comp)();
    return instance;
  }

  const template = comp.template();
  const usedDirectives = findUsedDirectives(template);
  const usedInputs = pendingInputs.claim().map(([inputName]) => inputName);

  comp.ngComponentDef = defineComponent({
    type: comp,
    selectors: [[comp.name]],
    consts: 10,
    vars: 10,
    encapsulation: ViewEncapsulation.None,
    directives: usedDirectives,
    inputs: usedInputs,
    factory: compFactory,
    template: makeRenderFn(comp.template)
  });
}
