import {RenderValue} from './decorate';

export interface StyleRule<T> {
  property: string;
  source: RenderValue<T>;
}

const StyleSymbol = Symbol('StyleSymbol');
export interface StyleValue<T> {
  kind: typeof StyleSymbol;
  rules: StyleRule<T>[];
}

export function isStyleValue(value: any): value is StyleValue<any> {
  return Object.values(value).includes(StyleSymbol);
}

export function useStyle(
  cssRules: Record<string, RenderValue<string>>
): StyleValue<string> {
  return {
    kind: StyleSymbol,
    rules: Object.entries(cssRules).map(([property, source]) => ({
      property,
      source
    }))
  };
}
