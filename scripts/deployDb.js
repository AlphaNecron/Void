const { error } = require('../src/lib/logger');
const prismaRun = require('./prismaRun');

module.exports = async (config) => {
  try {
    await prismaRun(config.core.database_url, ['migrate', 'deploy']);
    await prismaRun(config.core.database_url, ['generate'], true);
  } catch (e) {
    console.log(e);
    error('DB', 'there was an error.. exiting..');
    process.exit(1);
  }
};