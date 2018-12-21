import {RenderValue} from './decorate';

export const PipeSymbol = Symbol('PipeSymbol');
export interface PipeValue<T extends RenderValue<any>[], R> {
  kind: typeof PipeSymbol;
  sources: T;
  transform: (..._: T) => R;
}

export function isPipeValue(value: any): value is PipeValue<any, any> {
  return Object.values(value).includes(PipeSymbol);
}

export function usePipe<T1, R>(
  inputs: [RenderValue<T1>],
  transform: (..._: [T1]) => R
): RenderValue<R>;
export function usePipe<T1, T2, R>(
  inputs: [RenderValue<T1>, RenderValue<T2>],
  transform: (..._: [T1, T2]) => R
): RenderValue<R>;
export function usePipe<R>(
  inputs: any,
  transform: (..._: any[]) => R
): RenderValue<R> {
  return {
    kind: PipeSymbol,
    sources: inputs,
    transform
  };
}
