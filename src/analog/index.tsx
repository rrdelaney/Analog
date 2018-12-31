import {createNgElement, Fragment} from './element';

export {Component} from './decorate';
export {useInput} from './use_input';
export {useState} from './use_state';

export const React = {
  createElement: createNgElement,
  Fragment: Fragment
};

export * from './jsx';
