import Ng, {Component, useInput, useState, Props} from './angular-x';

interface DisplayNameProps {
  name: string;
}

@Component
class DisplayName extends Props<DisplayNameProps> {
  static template() {
    const name = useInput<DisplayNameProps>('name');

    return <div>Hello {name}!</div>;
  }
}

@Component
class Counter {
  static template() {
    const [count, setCount] = useState(0);

    function incCount() {
      setCount(c => c + 1);
    }

    return <button onClick={incCount}>{count}</button>;
  }
}

@Component
export class NgxHelloWorld {
  static template() {
    return (
      <div>
        <DisplayName name="Jake" />
        <Counter />
      </div>
    );
  }
}
