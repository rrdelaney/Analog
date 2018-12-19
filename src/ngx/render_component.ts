import {ɵrenderComponent as renderComponentNg} from '@angular/core';
import {decorateComponent} from './decorate';

export function renderComponent(component: (props?: {}) => void) {
  decorateComponent(component);
  renderComponentNg(component as any);
}
