import {Type} from '@angular/core';

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

interface OnClick {
  onClick?: ($event: MouseEvent) => void;
}

export interface NgxInputSpec {
  type: 'NGX_INPUT_SPEC';
  name: string;
}

export interface NgxStateSpec {
  type: 'NGX_STATE_SPEC';
  value: unknown;
  component?: {};
}

export interface NgxElement<T> {
  elSpec: Type<T> | string | NgxInputSpec | NgxStateSpec;
  props: Partial<T> | null;
  children?: (NgxElement<{}> | string)[];
}

export function isInputSpec(spec: any): spec is NgxInputSpec {
  return Object.values(spec).includes('NGX_INPUT_SPEC');
}

export function isInputNgxElement(el: any): el is NgxElement<{}> {
  return Object.values(el).some(isInputSpec);
}

export function isStateSpec(spec: any): spec is NgxStateSpec {
  return Object.values(spec).includes('NGX_STATE_SPEC');
}

export function isStateNgxElement(el: any): el is NgxElement<{}> {
  return Object.values(el).some(isStateSpec);
}

export class Ngx {
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
