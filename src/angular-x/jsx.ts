import {Type} from '@angular/core';

declare global {
  namespace JSX {
    type Element<T> = NgElement<T>;

    interface IntrinsicElements {
      div: OnClick;
      h3: OnClick;
      span: OnClick;
      button: OnClick;
    }

    interface ElementAttributesProperty {
      __props__: any;
    }
  }
}

interface OnClick {
  onClick?: ($event: MouseEvent) => void;
}

export const InputSymbol = Symbol('InputSymbol');

export interface InputValue<T> {
  kind: typeof InputSymbol;
  inputName: string;
  defaultValue?: T;
}

export function isInputValue(value: any): value is InputValue<any> {
  return Object.values(value).includes(InputSymbol);
}

export const StateSymbol = Symbol('StateSymbol');

export interface StateValue<T> {
  kind: typeof StateSymbol;
  currentValue: T;
  componentInstance?: unknown;
}

export function isStateValue(value: any): value is StateValue<any> {
  return Object.values(value).includes(StateSymbol);
}

export type StateUpdater<T> = (update: T | ((_: T) => T)) => void;

export function isStateUpdateFn<T>(value: any): value is (_: T) => T {
  return typeof value === 'function';
}

export type RenderValue<T> = T | InputValue<T> | StateValue<T>;

export interface NgElement<T> {
  elSpec: Type<T> | string;
  props: Partial<T> | null;
  children?: unknown[];
}

export type AngNgElement = NgElement<any>;

export function isNgElement(el: any): el is AngNgElement {
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
}
