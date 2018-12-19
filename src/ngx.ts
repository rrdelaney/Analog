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
  EventEmitter,
  ɵmarkDirty as markDirty
} from '@angular/core';

interface OnClick {
  onClick?: ($event: MouseEvent) => void;
}

declare global {
  namespace JSX {
    type Element<T> = NgxElement<T>;

    interface IntrinsicElements {
      div: OnClick;
      h3: OnClick;
      span: OnClick;
      button: OnClick;
    }
  }
}

function flat<T>(acc: T[], curr: T[]): T[] {
  return [...acc, ...curr];
}

function toObject(
  obj: Record<string, string>,
  key: string
): Record<string, string> {
  return {
    ...obj,
    [key]: key
  };
}

interface NgxInputSpec {
  type: 'NGX_INPUT_SPEC';
  name: string;
}

interface NgxStateSpec {
  type: 'NGX_STATE_SPEC';
  value: unknown;
  component?: {};
}

interface NgxElement<T> {
  elSpec: Type<T> | string | NgxInputSpec | NgxStateSpec;
  props: Partial<T> | null;
  children?: (NgxElement<{}> | string)[];
}

function isInputSpec(spec: any): spec is NgxInputSpec {
  return Object.values(spec).includes('NGX_INPUT_SPEC');
}

function isInputNgxElement(el: any): el is NgxElement<{}> {
  return Object.values(el).some(isInputSpec);
}

function isStateSpec(spec: any): spec is NgxStateSpec {
  return Object.values(spec).includes('NGX_STATE_SPEC');
}

function isStateNgxElement(el: any): el is NgxElement<{}> {
  return Object.values(el).some(isStateSpec);
}

export default class Ngx {
  static createElement<T>(
    elSpec: Type<T> | string,
    props: Partial<T>,
    ...children: (string | NgxElement<{}>)[]
  ): NgxElement<T> {
    return {
      elSpec,
      props,
      children
    };
  }
}

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

  return [...usedInputs, ...propInputs, ...childInputs];
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

  return [...usedDirectives, ...childInputs];
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
      renderEl(tree);
    }

    if (rf & 2) {
      setupBindings(ctx);
    }
  };
}

let isBootstrapping = false;
export function component<T>(Base: (props?: T) => void) {
  if (isBootstrapping) return;
  if (new.target) return;

  lastTemplate = null;
  isBootstrapping = true;
  Base();
  isBootstrapping = false;
  let bootstrap = lastTemplate!;

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
    directives: findUsedDirectives(bootstrap),
    inputs: findUsedInputs(bootstrap).reduce(toObject, {}),
    template: makeRenderFunction(bootstrap)
    // changeDetection: ChangeDetectionStrategy.OnPush
  });
}

let lastTemplate: NgxElement<{}> | null = null;
export function useTemplate(template: NgxElement<{}>) {
  lastTemplate = template;
}

export function useInputs<T extends object>(): {
  [P in keyof T]: T[P] | NgxElement<T[P]>
} {
  return new Proxy({} as T, {
    get(_target, propName: string): NgxElement<{}> {
      return {
        elSpec: {
          type: 'NGX_INPUT_SPEC',
          name: propName
        },
        props: {}
      };
    }
  });
}

type Updater<T> = (old: T) => T;
function isUpdater<T>(updater: T | Updater<T>): updater is (old: T) => T {
  return typeof updater === 'function';
}

let pendingStateSpecs = new Set<NgxStateSpec>();
const HOOKS_STATE_BUS = new EventEmitter<{}>();

export function useState<T>(
  initialValue: T
): [NgxElement<T>, (newValue: T | Updater<T>) => void] {
  const stateSpec: NgxStateSpec = {
    type: 'NGX_STATE_SPEC',
    value: initialValue
  };

  const stateValue = {
    elSpec: stateSpec,
    props: {}
  };

  const updateState = (newValue: T | Updater<T>) => {
    if (isUpdater(newValue)) {
      stateValue.elSpec.value = newValue(stateValue.elSpec.value as T);
    } else {
      stateValue.elSpec.value = newValue;
    }

    HOOKS_STATE_BUS.emit(stateValue.elSpec);
  };

  pendingStateSpecs.add(stateSpec);
  return [stateValue, updateState];
}

export function usePipe<T, R>(
  input: T | NgxElement<T>,
  transform: (_: T) => R
): NgxElement<R> {
  return {
    elSpec: {
      type: 'NGX_STATE_SPEC',
      get value() {
        const innerValue =
          isStateNgxElement(input) && isStateSpec(input.elSpec)
            ? (input.elSpec.value as T)
            : (input as T);

        return transform(innerValue);
      }
    },
    props: {}
  };
}
