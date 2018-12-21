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
  ɵprojectionDef as projectionDef,
  ɵprojection as projection,
  ɵcontainer as container,
  ɵcontainerRefreshStart as containerRefreshStart,
  ɵcontainerRefreshEnd as containerRefreshEnd,
  ɵembeddedViewStart as embeddedViewStart,
  ɵembeddedViewEnd as embeddedViewEnd,
  ViewEncapsulation
} from '@angular/core';
import {AnyNgElement, isNgElement, isComponentSpec} from './element';
import {claimInputs, InputValue, isInputValue} from './use_input';
import {
  StateValue,
  isStateValue,
  UpdaterValue,
  isUpdaterValue
} from './use_state';
import {PipeValue, isPipeValue} from './use_pipe';
import {StyleValue, isStyleValue, StyleRule} from './use_style';
import {
  ChildrenValue,
  isChildrenValue,
  claimHasUsedChildren
} from './use_children';
import {EffectValue, isEffectValue} from './use_effect';
import {flat} from './utils';
import {isMatchValue} from './match';

export type RenderValue<T> =
  | T
  | InputValue<T>
  | StateValue<T>
  | UpdaterValue<T>
  | StyleValue<T>
  | PipeValue<any, T>
  | EffectValue<any>
  | ChildrenValue;

export interface NgxComponent extends Type<{}> {
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

class Renderer {
  static unwrapRenderValue<T>(value: RenderValue<T>, ctx: any): T {
    if (isStateValue(value)) {
      return ctx[value.keyedBy] || value.defaultValue;
    } else if (isUpdaterValue(value)) {
      return ((newValue: any) => {
        ctx[value.keyedBy] = newValue;
        markDirty(ctx);
      }) as any;
    } else if (isInputValue(value)) {
      return ctx[value.inputName] || value.defaultValue;
    } else if (isPipeValue(value)) {
      return value.transform(
        ...value.sources.map((source: any) =>
          Renderer.unwrapRenderValue(source, ctx)
        )
      );
    } else if (isEffectValue(value)) {
      return (() => {
        value.effect(
          ...value.sources.map((source: any) =>
            Renderer.unwrapRenderValue(source, ctx)
          )
        );
      }) as any;
    } else if (isStyleValue(value)) {
      return Renderer.unwrapRenderValue(value.rules[0].source, ctx);
    } else if (isChildrenValue(value)) {
      throw new Error('Cannot unwrap child here!');
    } else {
      return value;
    }
  }

  private elIndex = 0;
  private interpolationBindings = new Map<number, RenderValue<unknown>>();
  private propertyBindings = new Map<[number, string], RenderValue<unknown>>();
  private styleBindings = new Map<number, RenderValue<unknown>>();
  private matchBindings = new Map<number, RenderValue<unknown>>();

  private renderEl(el: AnyNgElement, ctx: any) {
    let usedElIndex = true;
    if (typeof el.elSpec === 'string') {
      elementStart(this.elIndex, el.elSpec);
    } else if (
      isComponentSpec(el.elSpec) &&
      el.children &&
      el.children.length > 0
    ) {
      elementStart(this.elIndex, el.elSpec.name);
    } else if (isComponentSpec(el.elSpec)) {
      element(this.elIndex, el.elSpec.name, [
        1,
        ...Object.keys(el.props || {})
      ]);
    } else {
      usedElIndex = false;
    }

    for (const [propName, propValue] of Object.entries(el.props || {})) {
      if (propName === 'onClick') {
        listener('click', Renderer.unwrapRenderValue(propValue, ctx));
      } else if (propName === 'style') {
        this.styleBindings.set(this.elIndex, propValue);
        elementStyling(
          null,
          propValue.rules.map((v: StyleRule<any>) => v.property)
        );
      } else {
        this.propertyBindings.set([this.elIndex, propName], propValue);
      }
    }

    if (usedElIndex) {
      this.elIndex++;
    }

    for (const child of el.children || []) {
      if (isNgElement(child)) {
        this.renderEl(child, ctx);
      } else if (isChildrenValue(child)) {
        projection(this.elIndex++);
      } else if (isStateValue(child) || isInputValue(child)) {
        this.interpolationBindings.set(this.elIndex, child);
        text(this.elIndex++);
      } else if (isMatchValue(child)) {
        this.matchBindings.set(this.elIndex, child);
        container(this.elIndex++);
      } else {
        text(this.elIndex++, child);
      }
    }

    if (typeof el.elSpec === 'string') {
      elementEnd();
    } else if (
      isComponentSpec(el.elSpec) &&
      el.children &&
      el.children.length > 0
    ) {
      elementEnd();
    }
  }

  private renderBindings(ctx: any) {
    for (const [elIndex, binding] of this.interpolationBindings) {
      textBinding(
        elIndex,
        interpolation1('', Renderer.unwrapRenderValue(binding, ctx), '')
      );
    }

    for (const [[elIndex, propName], binding] of this.propertyBindings) {
      elementProperty(
        elIndex,
        propName,
        bind(Renderer.unwrapRenderValue(binding, ctx))
      );
    }

    for (const [elIndex, binding] of this.matchBindings) {
      if (isMatchValue(binding)) {
        containerRefreshStart(elIndex);

        const value = Renderer.unwrapRenderValue(binding.source, ctx);
        const match = binding.getMatchFor(value);
        if (match) {
          const rf = embeddedViewStart(this.embeddedViewCount + 1, 10, 10);
          const matchRenderer = new Renderer({
            template: match,
            hasUsedChildren: false,
            embeddedViewCount: this.embeddedViewCount + 1
          });

          matchRenderer.render(rf, ctx);
          embeddedViewEnd();
        }

        containerRefreshEnd();
      }
    }

    for (const [elIndex, binding] of this.styleBindings) {
      if (isStyleValue(binding)) {
        for (let i = 0; i < binding.rules.length; ++i) {
          elementStyleProp(
            elIndex,
            i,
            Renderer.unwrapRenderValue(binding.rules[i].source, ctx)
          );
        }

        elementStylingApply(elIndex);
      }
    }
  }

  private readonly template: AnyNgElement;
  private readonly hasUsedChildren: boolean;
  private readonly embeddedViewCount: number;
  constructor(opts: {
    template: AnyNgElement;
    hasUsedChildren: boolean;
    embeddedViewCount?: number;
  }) {
    this.template = opts.template;
    this.hasUsedChildren = opts.hasUsedChildren;
    this.embeddedViewCount = opts.embeddedViewCount || 0;
  }

  render(rf: RenderFlags, ctx: any) {
    if (rf & RenderFlags.Create) {
      if (this.hasUsedChildren) {
        projectionDef();
      }

      this.elIndex = 0;
      this.renderEl(this.template, ctx);
    }

    if (rf & RenderFlags.Update) {
      this.renderBindings(ctx);
    }
  }
}

export function Component<CType extends NgxComponent>(compDef: CType) {
  const template = compDef.template();
  const usedInputs = claimInputs();
  const hasUsedChildren = claimHasUsedChildren();
  const usedDirectives = findUsedDirectives(template);
  const renderer = new Renderer({template, hasUsedChildren});

  function compDefFactory(t: Type<{}> | null) {
    const instance = new (t || compDef)();

    return instance;
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
    template: (rf, ctx) => renderer.render(rf, ctx)
  });
}

export class Inputs<InputTypes extends {}> {
  __props__!: {[P in keyof InputTypes]: RenderValue<InputTypes[P]>};
}
