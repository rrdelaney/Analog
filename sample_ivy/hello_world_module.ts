import {NgModule} from '@angular/core';
import {CommonModule} from '@angular/common';

import {HelloWorld} from './hello_world';
import {DisplayName} from './display_name';

@NgModule({
  imports: [CommonModule],
  declarations: [HelloWorld, DisplayName]
})
export class HelloWorldModule {}
