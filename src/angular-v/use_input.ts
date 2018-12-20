import {toObject} from './utils';

const InputSymbol = Symbol('InputSymbol');
export interface InputValue<T> {
  kind: typeof InputSymbol;
  inputName: string;
  defaultValue?: T;
}

export function isInputValue(value: any): value is InputValue<any> {
  return Object.values(value).includes(InputSymbol);
}

const usedInputs = new Set<string>();
export function claimInputs(): Record<string, string> {
  const claimedInputs = Array.from(usedInputs);
  usedInputs.clear();
  return claimedInputs.reduce(toObject, {});
}

export function useInput<InputTypes extends {}>(
  inputName: keyof InputTypes,
  defaultValue?: InputTypes[typeof inputName]
): InputValue<InputTypes[typeof inputName]> {
  usedInputs.add(inputName as string);

  return {
    kind: InputSymbol,
    inputName: inputName as string,
    defaultValue
  };
}
