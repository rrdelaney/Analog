import {RenderValue, InputSymbol} from './jsx';

const usedInputs = new Set<string>();
export function claimInputs(): string[] {
  const claimedInputs = Array.from(usedInputs);
  usedInputs.clear();
  return claimedInputs;
}

export function useInput<PropTypes extends {}>(
  inputName: keyof PropTypes,
  defaultValue?: PropTypes[typeof inputName]
): RenderValue<PropTypes[typeof inputName]> {
  usedInputs.add(inputName as string);

  return {
    kind: InputSymbol,
    inputName: inputName as string,
    defaultValue
  };
}
