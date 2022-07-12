import oauth from 'lib/oauth';
import generate from 'lib/urlGenerator';
import {VoidRequest, VoidResponse, withVoid} from 'middleware/withVoid';

async function handler(req: VoidRequest, res: VoidResponse) {
  if (oauth) {
    const url = oauth.generateAuthUrl({
      scope: ['identify'],
      state: generate('alphanumeric', 16)
    });
    return res.success({
      url
    });
  }
  return res.forbid('Discord OAuth is not enabled.');
}

export default withVoid(handler);
