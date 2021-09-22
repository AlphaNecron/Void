import configReader from './configReader';
import type { Config } from './types';
if (!global.config) global.config = configReader() as Config;
export default global.config;