import {Type} from '@angular/core';

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

export function createNgElement<T>(
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
