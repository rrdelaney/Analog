import {NgxStateSpec, NgxElement} from './jsx';
import {EventEmitter} from '@angular/core';

type Updater<T> = (old: T) => T;
function isUpdater<T>(updater: T | Updater<T>): updater is (old: T) => T {
  return typeof updater === 'function';
}

export const pendingStateSpecs = new Set<NgxStateSpec>();
export const HOOKS_STATE_BUS = new EventEmitter<{}>();

export function useState<T>(
  initialValue: T
): [NgxElement<T>, (newValue: T | Updater<T>) => void] {
  const stateSpec: NgxStateSpec = {
    type: 'NGX_STATE_SPEC',
    value: initialValue
  };

  const stateValue = {
    elSpec: stateSpec,
    props: {}
  };

  const updateState = (newValue: T | Updater<T>) => {
    if (isUpdater(newValue)) {
      stateValue.elSpec.value = newValue(stateValue.elSpec.value as T);
    } else {
      stateValue.elSpec.value = newValue;
    }

    HOOKS_STATE_BUS.emit(stateValue.elSpec);
  };

  pendingStateSpecs.add(stateSpec);
  return [stateValue, updateState];
}
