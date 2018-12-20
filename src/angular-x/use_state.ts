import {EventEmitter} from '@angular/core';

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

export const STATE_UPDATES = new EventEmitter<unknown>();

export function useState<T>(defaultValue: T): [StateValue<T>, StateUpdater<T>] {
  const stateValue: StateValue<T> = {
    kind: StateSymbol,
    currentValue: defaultValue
  };

  const stateUpdater: StateUpdater<T> = update => {
    if (isStateUpdateFn<T>(update)) {
      stateValue.currentValue = update(stateValue.currentValue);
    } else {
      stateValue.currentValue = update;
    }

    STATE_UPDATES.next(stateValue.componentInstance);
  };

  return [stateValue, stateUpdater];
}
