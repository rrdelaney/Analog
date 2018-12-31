import {PendingValues} from './pendingValues';
import {ReplaySubject, Observable} from 'rxjs';

export const pendingInputs = new PendingValues<[string, (_: any) => void]>();

export function useInput<
  Inputs extends object,
  InputName extends keyof Inputs,
  InitialValue extends Inputs[InputName]
>(
  _inputs: Inputs,
  inputName: InputName,
  initialValue?: InitialValue
): Observable<InitialValue> {
  const input$ = new ReplaySubject<InitialValue>();

  pendingInputs.add([
    inputName as string,
    inputValue => {
      input$.next(inputValue || initialValue);
    }
  ]);

  return input$;
}
