import {ReplaySubject} from 'rxjs';
import {PendingValues} from './pendingValues';

export const pendingStates = new PendingValues<() => void>();

export function useState<T>(init: T): ReplaySubject<T> {
  const state$ = new ReplaySubject<T>();

  pendingStates.add(() => {
    state$.next(init);
  });

  return state$;
}
