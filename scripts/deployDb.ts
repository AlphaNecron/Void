import { error } from '../src/lib/logger';
import prismaRun from './prismaRun';

export default async function(config) {
  try {
    await prismaRun(config.core.database_url, ['migrate', 'deploy']);
    await prismaRun(config.core.database_url, ['generate'], true);
  } catch (e) {
    console.log(e);
    error('DB', 'there was an error.. exiting..');
    process.exit(1);
  }
};