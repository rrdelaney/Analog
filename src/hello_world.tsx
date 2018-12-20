import React, {
  Component,
  useInput,
  useState,
  Inputs,
  useStyle
} from './angular-x';

interface DisplayNameProps {
  name: string;
}

@Component
class DisplayName extends Inputs<DisplayNameProps> {
  static template() {
    const name = useInput<DisplayNameProps>('name');
    const largeFont = useStyle(`
      font-size: 20pt;
    `);

    return <h3 class={largeFont}>Hello {name}!</h3>;
  }
}

@Component
class Counter {
  static template() {
    const [count, setCount] = useState(0);

    function incCount() {
      setCount(c => c + 1);
    }

    return (
      <>
        <div>Count: {count}</div>
        <button onClick={incCount}>+</button>
      </>
    );
  }
}

@Component
export class NgxHelloWorld {
  static template() {
    return (
      <>
        <DisplayName name="Ryan" />
        <Counter />
      </>
    );
  }
}
