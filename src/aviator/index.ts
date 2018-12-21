import {createNgElement, Fragment} from './element';

export {useInput} from './use_input';
export {useState} from './use_state';
export {useStyle} from './use_style';
export {usePipe} from './use_pipe';
export {useChildren} from './use_children';

export {match} from './match';
export {Component, Inputs} from './decorate';

export const React = {
  createElement: createNgElement,
  Fragment: Fragment
};

export * from './jsx';
