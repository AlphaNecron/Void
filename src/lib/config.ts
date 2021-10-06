import readConfig from './configReader';
import type { Config } from './types';

if (!global.config) global.config = readConfig() as Config;
export default global.config;