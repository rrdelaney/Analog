import {Subject} from 'rxjs';
import {NgElement} from './element';

declare global {
  namespace JSX {
    type Element<T> = NgElement<T>;

    interface IntrinsicElements {
      div: BaseProps;
      h3: BaseProps;
      span: BaseProps;
      button: BaseProps;
      br: BaseProps;
    }

    interface ElementAttributesProperty {
      __props__: any;
    }
  }
}

interface BaseProps {
  onClick?: Subject<MouseEvent>;
  // style?: RenderValue<any>;
}
