import {
  ɵdefineComponent as defineComponent,
  ɵRenderFlags as RenderFlags,
  Type,
  ɵtext as text,
  ɵtextBinding as textBinding,
  ɵinterpolation1 as interpolation1,
  ɵelement as element,
  ɵelementProperty as elementProperty,
  ɵelementStyling as elementStyling,
  ɵbind as bind,
  ɵelementStart as elementStart,
  ɵelementEnd as elementEnd,
  ɵlistener as listener,
  ɵmarkDirty as markDirty,
  ViewEncapsulation
} from '@angular/core';
import {AnyNgElement, isNgElement, Fragment} from './jsx';
import {claimInputs, InputValue, isInputValue} from './use_input';
import {STATE_UPDATES, StateValue, isStateValue} from './use_state';
import {flat} from './utils';
import {claimStyles} from './use_style';

export type RenderValue<T> = T | InputValue<T> | StateValue<T>;

function findUsedDirectives(el: AnyNgElement): Type<{}>[] {
  const usedDirectives: Type<{}>[] = [];
  if (typeof el.elSpec !== 'string' && el.elSpec !== Fragment) {
    usedDirectives.push(el.elSpec);
  }

  const children = el.children || [];
  const childInputs = children
    .filter(isNgElement)
    .map(findUsedDirectives)
    .reduce(flat, []);

  return Array.from(new Set([...usedDirectives, ...childInputs]));
}

export interface NgxComponent extends Type<{}> {
  template(): AnyNgElement;
  ngComponentDef?: never;
}

export function Component<CType extends NgxComponent>(compDef: CType) {
  const template = compDef.template();
  const usedInputs = claimInputs();
  const usedStyles = claimStyles();
  const usedDirectives = findUsedDirectives(template);

  function compDefFactory(t: Type<{}> | null) {
    const instance = new (t || compDef)();

    STATE_UPDATES.subscribe((updatedComponent: unknown) => {
      if (updatedComponent === instance) {
        markDirty(instance);
      }
    });

    return instance;
  }

  let elIndex = 0;
  const interpolationBindings = new Map<number, RenderValue<unknown>>();
  const propertyBindings = new Map<[number, string], RenderValue<unknown>>();
  function compDefRender(rf: RenderFlags, ctx: {}) {
    function renderEl(el: AnyNgElement) {
      if (typeof el.elSpec === 'string') {
        elementStart(elIndex, el.elSpec);
      } else if (el.elSpec !== Fragment) {
        element(elIndex, el.elSpec.name, [1, ...Object.keys(el.props || {})]);
      }

      for (const [propName, propValue] of Object.entries(el.props || {})) {
        if (propName === 'onClick') {
          listener('click', propValue as any);
        } else if (propName === 'class') {
          elementStyling([propValue, 1, propValue, true]);
        } else {
          propertyBindings.set([elIndex, propName], propValue);
        }
      }

      if (el.elSpec !== Fragment) {
        elIndex++;
      }

      for (const child of el.children || []) {
        if (isNgElement(child)) {
          renderEl(child);
        } else if (isStateValue(child)) {
          child.componentInstance = ctx;
          interpolationBindings.set(elIndex, child);
          text(elIndex++);
        } else if (isInputValue(child)) {
          interpolationBindings.set(elIndex, child);
          text(elIndex++);
        } else {
          text(elIndex++, child);
        }
      }

      if (typeof el.elSpec === 'string') {
        elementEnd();
      }
    }

    function renderBindings() {
      for (const [elIndex, binding] of interpolationBindings) {
        if (isStateValue(binding)) {
          textBinding(elIndex, interpolation1('', binding.currentValue, ''));
        } else if (isInputValue(binding)) {
          textBinding(
            elIndex,
            interpolation1(
              '',
              (ctx as any)[binding.inputName] || binding.defaultValue,
              ''
            )
          );
        } else {
          textBinding(elIndex, interpolation1('', binding, ''));
        }
      }

      for (const [[elIndex, propName], binding] of propertyBindings) {
        elementProperty(elIndex, propName, bind(binding));
      }
    }

    if (rf & 1) {
      elIndex = 0;
      renderEl(template);
    }

    if (rf & 2) {
      renderBindings();
    }
  }

  compDef.ngComponentDef = defineComponent({
    type: compDef,
    selectors: [[compDef.name]],
    consts: 10,
    vars: 10,
    encapsulation: ViewEncapsulation.None,
    directives: usedDirectives,
    inputs: usedInputs,
    styles: usedStyles,
    factory: compDefFactory,
    template: compDefRender
  });
}

export class Inputs<InputTypes extends {}> {
  __props__!: {[P in keyof InputTypes]: RenderValue<InputTypes[P]>};
}
