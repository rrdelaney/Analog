import {Subject} from 'rxjs';
import {withLatestFrom, map} from 'rxjs/operators';
import {Component, React, useState} from './analog';

@Component
export class NgHelloWorld {
  static template() {
    const click$ = new Subject<MouseEvent>();
    const count$ = useState(0);

    click$
      .pipe(
        withLatestFrom(count$),
        map(([_, count]) => count + 1)
      )
      .subscribe(count$);

    return (
      <>
        <div>{count$}</div>
        <button onClick={click$}>+</button>
      </>
    );
  }
}
