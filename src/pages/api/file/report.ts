import {VoidRequest, VoidResponse, withVoid} from 'middleware/withVoid';

export function handler(req: VoidRequest, res: VoidResponse) {
  if (req.method !== 'POST') return res.notAllowed();
  const id = (req.body.id ?? '').toString();
  if (id === '') {
    return res.forbid('No ID');
  }
  console.log(`User reported file: ${id}`);
  return res.json({
    success: true
  });
}

export default withVoid(handler);
