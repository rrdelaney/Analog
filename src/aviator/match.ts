import {RenderValue} from './decorate';
import {AnyNgElement} from './element';

const MatchSymbol = Symbol('MatchSymbol');
export class MatchValue<T> {
  kind = MatchSymbol;

  constructor(
    readonly source: RenderValue<T>,
    private readonly switches: [(_: T) => boolean, AnyNgElement][],
    private readonly defaultSwitch: AnyNgElement | null
  ) {}

  when(switchFn: (_: T) => boolean, switchMatch: AnyNgElement): MatchValue<T> {
    return new MatchValue(
      this.source,
      [...this.switches, [switchFn, switchMatch]],
      this.defaultSwitch
    );
  }

  else(switchMatch: AnyNgElement): MatchValue<T> {
    return new MatchValue(this.source, this.switches, switchMatch);
  }

  getMatchFor(value: T): AnyNgElement | null {
    for (const [switchFn, switchMatch] of this.switches) {
      if (switchFn(value)) {
        return switchMatch;
      }
    }

    return this.defaultSwitch;
  }
}

export function isMatchValue(value: any): value is MatchValue<any> {
  return Object.values(value).includes(MatchSymbol);
}

export function match<T>(source: RenderValue<T>): MatchValue<T> {
  return new MatchValue(source, [], null);
}
