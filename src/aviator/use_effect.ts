import {RenderValue} from './decorate';

export const EffectSymbol = Symbol('EffectSymbol');
export interface EffectValue<T extends RenderValue<any>[]> {
  kind: typeof EffectSymbol;
  sources: T;
  effect: (..._: T) => void;
}

export function isEffectValue(value: any): value is EffectValue<any> {
  return Object.values(value).includes(EffectSymbol);
}

export function useEffect<T1>(
  inputs: [RenderValue<T1>],
  effect: (..._: [T1]) => void
): RenderValue<() => void>;
export function useEffect<T1, T2>(
  inputs: [RenderValue<T1>, RenderValue<T2>],
  effect: (..._: [T1, T2]) => void
): RenderValue<() => void>;
export function useEffect(
  inputs: any,
  effect: (..._: any[]) => void
): RenderValue<() => void> {
  return {
    kind: EffectSymbol,
    sources: inputs,
    effect
  };
}
