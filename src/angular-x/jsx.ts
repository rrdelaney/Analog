import {Type} from '@angular/core';

declare global {
  namespace JSX {
    type Element<T> = NgElement<T>;

    interface IntrinsicElements {
      div: BaseProps;
      h3: BaseProps;
      span: BaseProps;
      button: BaseProps;
    }

    interface ElementAttributesProperty {
      __props__: any;
    }
  }
}

interface BaseProps {
  onClick?: ($event: MouseEvent) => void;
  class?: string;
}

export const Fragment = Symbol('Fragment');

export interface NgElement<T> {
  elSpec: Type<T> | string | typeof Fragment;
  props: Partial<T> | null;
  children?: unknown[];
}

export type AnyNgElement = NgElement<any>;

export function isNgElement(el: any): el is AnyNgElement {
  return (
    el != null &&
    typeof el !== 'number' &&
    typeof el !== 'string' &&
    'elSpec' in el
  );
}

export class Ng {
  static createElement<T>(
    elSpec: Type<T> | string,
    props: Partial<T>,
    ...children: unknown[]
  ): NgElement<T> {
    return {
      elSpec,
      props,
      children
    };
  }

  static Fragment = Fragment;
}
