import {Component, ɵrenderComponent as renderComponent} from '@angular/core';

@Component({
  selector: 'hello-world',
  template: `
    <display-name [name]="name" [name2]="name"></display-name>
  `
})
export class HelloWorld {
  name = 'Ryan';
}

let root = document.createElement('hello-world');
document.body.appendChild(root);
renderComponent(HelloWorld);
