import internal from 'void/internal';
import { VoidRequest, VoidResponse, withVoid } from 'middleware/withVoid';

export function handler(req: VoidRequest, res: VoidResponse) {
  if (req.method !== 'POST') return res.notAllowed();
  const id = (req.body.id || '').toString();
  const reason = (req.body.reason || '');
  if (id === '') {
    return res.forbid('No ID');
  }
  if (reason.length <= 3) return res.forbid('Invalid reason.');
  internal.logger.info(`User reported file: ${id} for ${reason}`);
  return res.success();
}

export default withVoid(handler);
