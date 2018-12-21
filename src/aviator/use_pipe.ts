import {RenderValue} from './decorate';

export const PipeSymbol = Symbol('PipeSymbol');
export interface PipeValue<T, R> {
  kind: typeof PipeSymbol;
  source: RenderValue<T>;
  transform: (_: T) => R;
}

export function isPipeValue(value: any): value is PipeValue<any, any> {
  return Object.values(value).includes(PipeSymbol);
}

export function usePipe<T, R>(
  input: RenderValue<T>,
  transform: (_: T) => R
): RenderValue<R> {
  return {
    kind: PipeSymbol,
    source: input,
    transform
  };
}
