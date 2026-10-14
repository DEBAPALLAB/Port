import setup, { options as base } from './luman.js';
export const options = { ...base };
export default api => setup(api, 'classic');
