import { build, stageOptions } from './comparefiCore.js';
export const options = stageOptions;
export default function setup(api) { return build(api, { auto: true }); }
