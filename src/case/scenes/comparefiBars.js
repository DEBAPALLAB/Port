import { build, stageOptions } from './comparefiCore.js';
export const options = { ...stageOptions, startYaw: -.3, startPitch: .3 };
export default function setup(api) { return build(api, { auto: false }); }
