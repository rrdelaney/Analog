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
  ɵelementStyleProp as elementStyleProp,
  ɵelementStylingApply as elementStylingApply,
  ViewEncapsulation
} from '@angular/core';
import {AnyNgElement, isNgElement, Fragment} from './jsx';
import {claimInputs, InputValue, isInputValue} from './use_input';
import {STATE_UPDATES, StateValue, isStateValue} from './use_state';
import {PipeValue, isPipeValue} from './use_pipe';
import {StyleValue, isStyleValue, StyleRule} from './use_style';
import {flat} from './utils';

export type RenderValue<T> =
  | T
  | InputValue<T>
  | StateValue<T>
  | StyleValue<T>
  | PipeValue<any, T>;

export interface NgxComponent extends Type<{}> {
  template(): AnyNgElement;
  ngComponentDef?: never;
}

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

export function Component<CType extends NgxComponent>(compDef: CType) {
  const template = compDef.template();
  const usedInputs = claimInputs();
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
  const styleBindings = new Map<number, RenderValue<unknown>>();

  function compDefRender(rf: RenderFlags, ctx: {}) {
    function unwrapRenderValue<T>(value: RenderValue<T>): T {
      if (isStateValue(value)) {
        return value.currentValue;
      } else if (isInputValue(value)) {
        return (ctx as any)[value.inputName] || value.defaultValue;
      } else if (isPipeValue(value)) {
        return value.transform(unwrapRenderValue(value.source));
      } else if (isStyleValue(value)) {
        return unwrapRenderValue(value.rules[0].source);
      } else {
        return value;
      }
    }

    function setComponentInstanceForState<T>(value: RenderValue<T>) {
      if (isStateValue(value) && !value.componentInstance) {
        value.componentInstance = ctx;
      } else if (isPipeValue(value)) {
        setComponentInstanceForState(value.source);
      } else if (isStyleValue(value)) {
        for (const {source} of value.rules) {
          setComponentInstanceForState(source);
        }
      }
    }

    function renderEl(el: AnyNgElement) {
      if (typeof el.elSpec === 'string') {
        elementStart(elIndex, el.elSpec);
      } else if (el.elSpec !== Fragment) {
        element(elIndex, el.elSpec.name, [1, ...Object.keys(el.props || {})]);
      }

      for (const [propName, propValue] of Object.entries(el.props || {})) {
        setComponentInstanceForState(propValue);

        if (propName === 'onClick') {
          listener('click', unwrapRenderValue(propValue));
        } else if (propName === 'style') {
          styleBindings.set(elIndex, propValue);
          elementStyling(
            null,
            propValue.rules.map((v: StyleRule<any>) => v.property)
          );
        } else {
          propertyBindings.set([elIndex, propName], propValue);
        }
      }

      if (el.elSpec !== Fragment) {
        elIndex++;
      }

      for (const child of el.children || []) {
        setComponentInstanceForState(child);

        if (isNgElement(child)) {
          renderEl(child);
        } else if (isStateValue(child)) {
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
        textBinding(
          elIndex,
          interpolation1('', unwrapRenderValue(binding), '')
        );
      }

      for (const [[elIndex, propName], binding] of propertyBindings) {
        elementProperty(elIndex, propName, bind(unwrapRenderValue(binding)));
      }

      for (const [elIndex, binding] of styleBindings) {
        if (isStyleValue(binding)) {
          for (let i = 0; i < binding.rules.length; ++i) {
            elementStyleProp(
              elIndex,
              i,
              unwrapRenderValue(binding.rules[i].source)
            );
          }

          elementStylingApply(elIndex);
        }
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
    factory: compDefFactory,
    template: compDefRender
  });
}

export class Inputs<InputTypes extends {}> {
  __props__!: {[P in keyof InputTypes]: RenderValue<InputTypes[P]>};
}
