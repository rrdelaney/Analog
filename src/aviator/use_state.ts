import {randomId} from './utils';

const StateSymbol = Symbol('StateSymbol');
export interface StateValue<T> {
  kind: typeof StateSymbol;
  keyedBy: string;
  defaultValue: T;
}

export function isStateValue(value: any): value is StateValue<any> {
  return Object.values(value).includes(StateSymbol);
}

const UpdaterSymbol = Symbol('UpdaterSymbol');
export interface UpdaterValue<T> {
  kind: typeof UpdaterSymbol;
  keyedBy: string;
}

export function isUpdaterValue(value: any): value is UpdaterValue<any> {
  return Object.values(value).includes(UpdaterSymbol);
}
export function useState<T>(
  defaultValue: T
): [StateValue<T>, UpdaterValue<(_: T) => void>] {
  const keyedBy = randomId();

  const stateValue: StateValue<T> = {
    kind: StateSymbol,
    keyedBy,
    defaultValue
  };

  const updaterValue: UpdaterValue<T> = {
    kind: UpdaterSymbol,
    keyedBy
  };

  return [stateValue, updaterValue];
}
