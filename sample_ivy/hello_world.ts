import {Component, ɵrenderComponent as renderComponent} from '@angular/core';

@Component({
  selector: 'hello-world',
  template: `
    <display-name [name]="name"> <span>Ryan</span> </display-name>
  `
})
export class HelloWorld {
  name = 'Ryan';
}

let root = document.createElement('hello-world');
document.body.appendChild(root);
renderComponent(HelloWorld);
