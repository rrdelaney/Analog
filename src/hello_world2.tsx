import {Subject, combineLatest} from 'rxjs';
import {Component, React, useState} from './analog';

@Component
export class NgHelloWorld {
  static template() {
    console.log('TEMPLATE');
    const click$ = new Subject<MouseEvent>();
    click$.subscribe(console.log);
    const count$ = useState(0);
    count$.subscribe(console.log);

    combineLatest(count$, click$, count => {
      console.log('INC COUNT');
      count$.next(count + 1);
    });

    return (
      <>
        <div>{count$}</div>
        <button onClick={click$}>+</button>
      </>
    );
  }
}
