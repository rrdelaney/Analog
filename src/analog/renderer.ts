import {
  ɵdefineComponent as defineComponent,
  // ɵRenderFlags as RenderFlags,
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
  Type,
  ViewEncapsulation
} from '@angular/core';
import {isObservable, BehaviorSubject} from 'rxjs';
import {AnyNgElement, isComponentSpec, isNgElement} from './element';
import {pendingInputs} from './use_input';
import {pendingStates} from './use_state';

interface Bindings {
  elIndex: number;
  interpolations: Array<[number, BehaviorSubject<any>]>;
  properties: Array<[number, string, BehaviorSubject<any>]>;
}

function handleInputs(ctx: {}) {
  const inputs = pendingInputs.claim();
  for (const [inputName, emitValue] of inputs) {
    emitValue(undefined);

    Object.defineProperty(ctx, inputName, {
      set(value) {
        emitValue(value);
      }
    });
  }
}

function handleStates() {
  const states = pendingStates.claim();
  for (const startState of states) {
    startState();
  }
}

function renderEl(ctx: {}, el: AnyNgElement, bindings: Bindings) {
  let usedElIndex = true;
  if (typeof el.elSpec === 'string') {
    elementStart(bindings.elIndex, el.elSpec);
  } else if (
    isComponentSpec(el.elSpec) &&
    el.children &&
    el.children.length > 0
  ) {
    elementStart(bindings.elIndex, el.elSpec.name);
  } else if (isComponentSpec(el.elSpec)) {
    element(bindings.elIndex, el.elSpec.name, [
      1,
      ...Object.keys(el.props || {})
    ]);
  } else {
    usedElIndex = false;
  }

  for (const [propName, propValue] of Object.entries(el.props || {})) {
    if (propName === 'onClick') {
      listener('click', e => {
        propValue.next(e);
      });
    } else if (propName === 'style') {
      // this.styleBindings.set(this.elIndex, propValue);
      // elementStyling(
      //   null,
      //   propValue.rules.map((v: StyleRule<any>) => v.property)
      // );
    } else {
      bindings.properties.push([bindings.elIndex, propName, propValue]);
    }
  }

  if (usedElIndex) {
    bindings.elIndex++;
  }

  for (const child of el.children || []) {
    if (isNgElement(child)) {
      renderEl(ctx, child, bindings);
    } else if (isObservable(child)) {
      const behaviorChild = new BehaviorSubject<any>(null);
      child.subscribe(behaviorChild);

      behaviorChild.subscribe(() => {
        markDirty(ctx);
      });

      bindings.interpolations.push([bindings.elIndex, behaviorChild]);
      text(bindings.elIndex++);
    } else {
      text(bindings.elIndex++, child);
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

function renderBindings(bindings: Bindings) {
  for (const [elIndex, binding] of bindings.interpolations) {
    textBinding(elIndex, interpolation1('', binding.value, ''));
  }

  for (const [elIndex, propName, binding] of bindings.properties) {
    elementProperty(elIndex, propName, bind(binding.value));
  }

  // for (const [elIndex, binding] of this.matchBindings) {
  //   if (isMatchValue(binding)) {
  //     containerRefreshStart(elIndex);

  //     const value = Renderer.unwrapRenderValue(binding.source, ctx);
  //     const match = binding.getMatchFor(value);
  //     if (match) {
  //       const rf = embeddedViewStart(this.embeddedViewCount + 1, 10, 10);
  //       const matchRenderer = new Renderer({
  //         template: match,
  //         hasUsedChildren: false,
  //         embeddedViewCount: this.embeddedViewCount + 1
  //       });

  //       matchRenderer.render(rf, ctx);
  //       embeddedViewEnd();
  //     }

  //     containerRefreshEnd();
  //   }
  // }

  // for (const [elIndex, binding] of this.styleBindings) {
  //   if (isStyleValue(binding)) {
  //     for (let i = 0; i < binding.rules.length; ++i) {
  //       elementStyleProp(
  //         elIndex,
  //         i,
  //         Renderer.unwrapRenderValue(binding.rules[i].source, ctx)
  //       );
  //     }

  //     elementStylingApply(elIndex);
  //   }
  // }
}

export function makeRenderFn(templateFn: () => AnyNgElement) {
  const bindings: Bindings = {
    elIndex: 0,
    interpolations: [],
    properties: []
  };

  return function render(rf: number, ctx: {}) {
    if (rf & 1) {
      const template = templateFn();
      handleInputs(ctx);
      handleStates();

      renderEl(ctx, template, bindings);
    }

    if (rf & 2) {
      renderBindings(bindings);
    }
  };
}
