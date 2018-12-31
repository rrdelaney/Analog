// import {
//   React,
//   Component,
//   useInput,
//   useState,
//   Inputs,
//   useStyle,
//   usePipe,
//   useChildren,
//   useEffect,
//   match
// } from './aviator';

// interface DisplayNameProps {
//   name: string;
//   fontSize: number;
//   onFontSizeIncrease: () => void;
//   onFontSizeDecrease: () => void;
// }

// @Component
// class DisplayName extends Inputs<DisplayNameProps> {
//   static template() {
//     const name = useInput<DisplayNameProps, 'name'>('name');
//     const fontSize = useInput<DisplayNameProps, 'fontSize'>('fontSize');
//     const onFontSizeIncrease = useInput<DisplayNameProps, 'onFontSizeIncrease'>(
//       'onFontSizeIncrease'
//     );
//     const onFontSizeDecrease = useInput<DisplayNameProps, 'onFontSizeDecrease'>(
//       'onFontSizeDecrease'
//     );

//     const sizePt = usePipe([fontSize], s => `${s}pt`);
//     const largeFont = useStyle({'font-size': sizePt});

//     return (
//       <>
//         <button onClick={onFontSizeIncrease}>+</button>
//         <button onClick={onFontSizeDecrease}>-</button>

//         <br />

//         {match(fontSize)
//           .when(fs => fs > 10, <span>Thats a honker!</span>)
//           .when(fs => fs <= 10, <span>Thats not a honker :(</span>)}

//         <br />

//         {/* {match(fontSize)
//           .when(fs => fs > 10, <span>Eh, Thats a honker!</span>)
//           .when(fs => fs <= 10, <span>Eh, Thats not a honker :(</span>)} */}

//         <h3 style={largeFont}>Hello {name}!</h3>
//       </>
//     );
//   }
// }

// @Component
// class Counter {
//   static template() {
//     const [count, setCount] = useState(0);

//     const incCount = useEffect([count, setCount], (count, setCount) => {
//       setCount(count + 1);
//     });

//     return (
//       <>
//         <div>Count: {count}</div>
//         <button onClick={incCount}>+</button>
//       </>
//     );
//   }
// }

// @Component
// class Heading {
//   static template() {
//     const children = useChildren();
//     const largeFontStyle = useStyle({
//       'font-size': '20pt'
//     });

//     return <h3 style={largeFontStyle}>{children}</h3>;
//   }
// }

// @Component
// export class NgxHelloWorld {
//   static template() {
//     const [size, setSize] = useState(10);

//     const incSize = useEffect([size, setSize], (size, setSize) => {
//       setSize(size + 1);
//     });

//     const decSize = useEffect([size, setSize], (size, setSize) => {
//       setSize(size - 1);
//     });

//     return (
//       <>
//         <DisplayName
//           name="Ryan"
//           fontSize={size}
//           onFontSizeIncrease={incSize}
//           onFontSizeDecrease={decSize}
//         />
//         {/* <Counter />
//         <Counter />
//         <Heading>Ryan</Heading> */}
//       </>
//     );
//   }
// }
