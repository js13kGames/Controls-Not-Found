import { uglify } from "rollup-plugin-uglify";
import { terser } from "rollup-plugin-terser";
import { nodeResolve } from '@rollup/plugin-node-resolve';
export default {
    input: 'game.js',
    output: {
      file: './dist/bundle.js',
      format: 'iife',
      sourcemap: false
    //   strict: false
    },
    plugins: [nodeResolve(), terser()],
  };