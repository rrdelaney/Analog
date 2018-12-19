import {NgxElement, isStateNgxElement, isStateSpec} from './jsx';

export function usePipe<T, R>(
  input: T | NgxElement<T>,
  transform: (_: T) => R
): NgxElement<R> {
  return {
    elSpec: {
      type: 'NGX_STATE_SPEC',
      get value() {
        const innerValue =
          isStateNgxElement(input) && isStateSpec(input.elSpec)
            ? (input.elSpec.value as T)
            : (input as T);

        return transform(innerValue);
      }
    },
    props: {}
  };
}
