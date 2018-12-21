import {ɵrenderComponent as renderComponent} from '@angular/core';
import {NgxHelloWorld} from './hello_world';

let root = document.createElement(NgxHelloWorld.name);
document.body.appendChild(root);
renderComponent(NgxHelloWorld);

// declare var module: {hot: {accept(_: string, cb: () => void): void}};
// if (module.hot) {
//   module.hot.accept('./hello_world', () => {
//     const nextRoot = document.createElement(NgxHelloWorld.name);
//     document.body.removeChild(root);
//     root = nextRoot;

//     document.body.appendChild(root);
//     renderComponent(NgxHelloWorld);
//   });
// }
