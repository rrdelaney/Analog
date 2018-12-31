import commonjs from 'rollup-plugin-commonjs';
import nodeResolve from 'rollup-plugin-node-resolve';
import alias from 'rollup-plugin-alias';
import typescript from 'rollup-plugin-typescript';

export default {
  input: 'src/main.tsx',

  output: {
    dir: 'out',
    format: 'iife'
  },

  treeshake: {
    propertyReadSideEffects: false,
    pureExternalModules: true
  },

  plugins: [
    typescript(),

    alias({
      '@angular/core':
        __dirname + '/node_modules/@angular/core/esm2015/core.js',
      'rxjs/operators':
        __dirname + '/node_modules/rxjs/_esm2015/operators/index.js',
      rxjs: __dirname + '/node_modules/rxjs/_esm2015/index.js'
    }),

    nodeResolve({
      jsnext: true,
      main: true
    }),

    commonjs({
      include: 'node_modules/**',
      ignoreGlobal: false,
      sourceMap: false
    })
  ]
};
