import React, {Component, useInput, useState, Inputs} from './angular-x';

interface DisplayNameProps {
  name: string;
}

@Component
class DisplayName extends Inputs<DisplayNameProps> {
  static template() {
    const name = useInput<DisplayNameProps>('name');

    return <h3>Hello {name}!</h3>;
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
