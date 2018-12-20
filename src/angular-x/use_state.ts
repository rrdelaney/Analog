import {EventEmitter} from '@angular/core';
import {
  StateValue,
  StateSymbol,
  StateUpdater,
  RenderValue,
  isStateUpdateFn
} from './jsx';

export const STATE_UPDATES = new EventEmitter<unknown>();

export function useState<T>(
  defaultValue: T
): [RenderValue<T>, StateUpdater<T>] {
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
