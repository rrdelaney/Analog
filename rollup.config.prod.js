import {terser} from 'rollup-plugin-terser';
import config from './rollup.config.js';

export default {
  ...config,
  plugins: [...config.plugins, terser()]
};
