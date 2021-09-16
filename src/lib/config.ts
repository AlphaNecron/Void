import type { Config } from './types';
import configReader from './configReader';
if (!global.config) global.config = configReader() as Config;
export default global.config;