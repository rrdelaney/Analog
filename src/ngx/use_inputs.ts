import {NgxElement} from './jsx';

export function useInputs<T extends object>(): {
  [P in keyof T]: T[P] | NgxElement<T[P]>
} {
  return new Proxy({} as T, {
    get(_target, propName: string): NgxElement<{}> {
      return {
        elSpec: {
          type: 'NGX_INPUT_SPEC',
          name: propName
        },
        props: {}
      };
    }
  });
}
