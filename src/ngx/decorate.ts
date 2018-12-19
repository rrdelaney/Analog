import {
  ɵdefineComponent as defineComponent,
  ɵRenderFlags as RenderFlags,
  Type,
  ɵtext as text,
  ɵtextBinding as textBinding,
  ɵinterpolation1 as interpolation1,
  ɵelement as element,
  ɵelementProperty as elementProperty,
  ɵbind as bind,
  ɵelementStart as elementStart,
  ɵelementEnd as elementEnd,
  ɵlistener as listener,
  ɵmarkDirty as markDirty
} from '@angular/core';
import {
  NgxElement,
  isInputSpec,
  isInputNgxElement,
  isStateSpec,
  isStateNgxElement,
  NgxStateSpec
} from './jsx';
import {flat, toObject} from './utils';
import {pendingTemplates} from './use_template';
import {pendingStateSpecs, HOOKS_STATE_BUS} from './use_state';

function findUsedInputs(tree: NgxElement<{}>): string[] {
  const usedInputs: string[] = [];
  if (isInputSpec(tree.elSpec)) {
    usedInputs.push(tree.elSpec.name);
  }

  const propInputs: string[] = [];
  for (const propValue of Object.values(tree.props || {})) {
    if (isInputNgxElement(propValue) && isInputSpec(propValue.elSpec)) {
      propInputs.push(propValue.elSpec.name);
    }
  }

  const children = tree.children || [];
  const childInputs = children
    .filter((c): c is NgxElement<{}> => typeof c !== 'string')
    .map(findUsedInputs)
    .reduce(flat, []);

  return Array.from(new Set([...usedInputs, ...propInputs, ...childInputs]));
}

function findUsedDirectives(tree: NgxElement<{}>): Type<{}>[] {
  const usedDirectives: Type<{}>[] = [];
  if (
    typeof tree.elSpec !== 'string' &&
    !isInputSpec(tree.elSpec) &&
    !isStateSpec(tree.elSpec)
  ) {
    usedDirectives.push(tree.elSpec);
  }

  const children = tree.children || [];
  const childInputs = children
    .filter((c): c is NgxElement<{}> => typeof c !== 'string')
    .map(findUsedDirectives)
    .reduce(flat, []);

  return Array.from(new Set([...usedDirectives, ...childInputs]));
}

function makeRenderFunction<T>(
  tree: NgxElement<{}>
): (rf: RenderFlags, ctx: T) => void {
  let elIndex = 0;
  const interpolationBindings = new Map<number, unknown>();
  const propertyBindings = new Map<[number, string], unknown>();

  function renderEl(el: NgxElement<{}>) {
    if (typeof el.elSpec === 'string') {
      elementStart(elIndex, el.elSpec);
    } else if (isInputSpec(el.elSpec) || isStateSpec(el.elSpec)) {
      text(elIndex);
      interpolationBindings.set(elIndex, el.elSpec);
    } else {
      element(elIndex, el.elSpec.name, [1, ...Object.keys(el.props || {})]);
    }

    for (const [propName, propValue] of Object.entries(el.props || {})) {
      if (propName === 'onClick') {
        listener('click', propValue as any);
      } else if (
        isInputNgxElement(propValue) &&
        isInputSpec(propValue.elSpec)
      ) {
        propertyBindings.set([elIndex, propName], propValue.elSpec);
      } else if (
        isStateNgxElement(propValue) &&
        isStateSpec(propValue.elSpec)
      ) {
        propertyBindings.set([elIndex, propName], propValue.elSpec);
      } else {
        propertyBindings.set([elIndex, propName], propValue);
      }
    }

    elIndex++;

    for (const child of el.children || []) {
      if (typeof child === 'string') {
        text(elIndex++, child);
      } else {
        renderEl(child);
      }
    }

    if (typeof el.elSpec === 'string') {
      elementEnd();
    }
  }

  function setupBindings(ctx: T) {
    for (const [elIndex, binding] of interpolationBindings) {
      if (isInputSpec(binding)) {
        textBinding(
          elIndex,
          interpolation1('', ctx[binding.name as keyof T], '')
        );
      } else if (isStateSpec(binding)) {
        textBinding(elIndex, interpolation1('', binding.value, ''));
      } else {
        textBinding(elIndex, interpolation1('', binding, ''));
      }
    }

    for (const [[elIndex, propName], binding] of propertyBindings) {
      if (isInputSpec(binding)) {
        elementProperty(elIndex, propName, bind(ctx[binding.name as keyof T]));
      } else if (isStateSpec(binding)) {
        elementProperty(elIndex, propName, bind(binding.value));
      } else {
        elementProperty(elIndex, propName, bind(binding));
      }
    }
  }

  return (rf, ctx) => {
    if (rf & 1) {
      elIndex = 0;
      renderEl(tree);
    }

    if (rf & 2) {
      setupBindings(ctx);
    }
  };
}

let isBootstrapping = false;
export function decorateComponent<T>(Base: (props?: T) => void) {
  if (isBootstrapping) return;
  if (new.target) return;

  pendingTemplates.clear();
  isBootstrapping = true;
  Base();
  isBootstrapping = false;
  const bootstrap = Array.from(pendingTemplates)[0];

  const usedDirectives = findUsedDirectives(bootstrap);
  for (const directive of usedDirectives) {
    decorateComponent(directive as any);
  }

  (Base as any).ngComponentDef = defineComponent<Type<T>>({
    type: Base as any,
    selectors: [[Base.name]],
    factory: t => {
      const instance = new (t || (Base as any))();

      for (const pendingStateSpec of pendingStateSpecs) {
        pendingStateSpec.component = instance;
      }

      pendingStateSpecs.clear();

      HOOKS_STATE_BUS.subscribe((spec: NgxStateSpec) => {
        if (spec.component === instance) {
          markDirty(instance);
        }
      });

      return instance;
    },
    consts: 10,
    vars: 10,
    encapsulation: 2,
    directives: usedDirectives,
    inputs: findUsedInputs(bootstrap).reduce(toObject, {}),
    template: makeRenderFunction(bootstrap)
  });
}
