import Ngx, {useTemplate, component, useInputs, useState, usePipe} from './ngx';

component(WithExclamation);
function WithExclamation(inputs = useInputs<{value: string}>()) {
  useTemplate(<span>{inputs.value}!</span>);
}

component(DisplayName);
function DisplayName(inputs = useInputs<{name: string}>()) {
  useTemplate(
    <h3 onClick={e => console.log(e)}>
      Hello <WithExclamation value={inputs.name} />
    </h3>
  );
}

component(Counter);
function Counter() {
  const [count, setCount] = useState(1);

  const countStr = usePipe(count, c => `${c}`);

  function incrementCount() {
    setCount(count => count + 1);
  }

  useTemplate(
    // <button onClick={incrementCount}>
    <WithExclamation value="Ryan" />
    // </button>
  );
}

component(NgxHelloWorld);
export function NgxHelloWorld() {
  useTemplate(
    <div>
      <DisplayName name="RT" />
      <Counter />
    </div>
  );
}
