import {Ngx, useTemplate, useInputs, useState, usePipe} from './ngx';

function WithExclamation(inputs = useInputs<{value: string}>()) {
  useTemplate(<span>{inputs.value}!</span>);
}

function DisplayName(inputs = useInputs<{name: string}>()) {
  useTemplate(
    <h3 onClick={e => console.log(e)}>
      Hello <WithExclamation value={inputs.name} />
    </h3>
  );
}

function Counter() {
  const [count, setCount] = useState(1);

  const countStr = usePipe(count, c => `${c}`);

  function incrementCount() {
    setCount(count => count + 1);
  }

  useTemplate(
    <button onClick={incrementCount}>
      <WithExclamation value={countStr} />
    </button>
  );
}

export function NgxHelloWorld() {
  useTemplate(
    <div>
      <DisplayName name="TX" />
      <Counter />
    </div>
  );
}
