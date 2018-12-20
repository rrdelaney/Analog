import React, {
  Component,
  useInput,
  useState,
  Inputs,
  useStyle,
  usePipe
} from './aviator';

interface DisplayNameProps {
  name: string;
}

@Component
class DisplayName extends Inputs<DisplayNameProps> {
  static template() {
    const name = useInput<DisplayNameProps>('name');
    const [size, setSize] = useState(10);
    const sizePt = usePipe(size, s => `${s}pt`);
    const largeFont = useStyle({'font-size': sizePt});

    function incSize() {
      setSize(s => s + 1);
    }

    return (
      <>
        <h3 style={largeFont}>Hello {name}!</h3>
        <button onClick={incSize}>+</button>
      </>
    );
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
        {/* <Counter /> */}
      </>
    );
  }
}
