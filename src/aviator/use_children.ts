const ChildrenSymbol = Symbol('ChildrenSymbol');
export interface ChildrenValue {
  kind: typeof ChildrenSymbol;
}

let hasUsedChildren = false;
export function claimHasUsedChildren() {
  const claimed = hasUsedChildren;
  hasUsedChildren = false;
  return claimed;
}

export function isChildrenValue(value: any): value is ChildrenValue {
  return Object.values(value).includes(ChildrenSymbol);
}

export function useChildren(): ChildrenValue {
  hasUsedChildren = true;
  return {
    kind: ChildrenSymbol
  };
}
