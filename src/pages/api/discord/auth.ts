import generate from 'lib/urlGenerator';
import { VoidRequest, VoidResponse, withVoid } from 'middleware/withVoid';
import internal from 'void/internal';

async function handler(req: VoidRequest, res: VoidResponse) {
  if (internal.oauth) {
    const url = internal.oauth.generateAuthUrl({
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
