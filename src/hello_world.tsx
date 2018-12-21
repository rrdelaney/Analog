import {
  React,
  Component,
  useInput,
  useState,
  Inputs,
  useStyle,
  usePipe,
  useChildren,
  match
} from './aviator';

interface DisplayNameProps {
  name: string;
  fontSize: number;
  onFontSizeIncrease: () => void;
}

@Component
class DisplayName extends Inputs<DisplayNameProps> {
  static template() {
    const name = useInput<DisplayNameProps, 'name'>('name');
    const fontSize = useInput<DisplayNameProps, 'fontSize'>('fontSize');
    const onFontSizeIncrease = useInput<DisplayNameProps, 'onFontSizeIncrease'>(
      'onFontSizeIncrease'
    );

    const sizePt = usePipe(fontSize, s => `${s}pt`);
    const largeFont = useStyle({'font-size': sizePt});

    return (
      <>
        <h3 style={largeFont}>Hello {name}!</h3>
        <button onClick={onFontSizeIncrease}>+</button>

        {match(fontSize)
          .when(fs => fs > 10, <span>Thats a honker!</span>)
          .else(<span>Small honk</span>)}
      </>
    );
  }
}

@Component
class Counter {
  static template() {
    const [count, setCount] = useState(0);

    const incCount = usePipe(setCount, set => () => {
      set(20);
    });

    return (
      <>
        <div>Count: {count}</div>
        <button onClick={incCount}>+</button>
      </>
    );
  }
}

@Component
class Heading {
  static template() {
    const children = useChildren();
    const largeFontStyle = useStyle({
      'font-size': '20pt'
    });

    return <h3 style={largeFontStyle}>{children}</h3>;
  }
}

@Component
export class NgxHelloWorld {
  static template() {
    const [size, setSize] = useState(10);

    const incSize = usePipe(setSize, set => () => {
      set(20);
    });

    return (
      <>
        <DisplayName name="Ryan" fontSize={size} onFontSizeIncrease={incSize} />
        <Counter />
        <Counter />
        <Heading>Ryan</Heading>
      </>
    );
  }
}
