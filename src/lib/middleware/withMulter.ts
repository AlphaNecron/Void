import {VoidRequest, VoidResponse, withVoid} from 'middleware/withVoid';
import multer from 'multer';
import {NextApiRequest, NextApiResponse} from 'next';

function run(middleware) {
  return (req, res) =>
    new Promise((resolve, reject) => {
      middleware(req, res, (result) => {
        if (result instanceof Error) reject(result);
        resolve(result);
      });
    });
}

export function withMulter(handler: (req: VoidRequest, res: VoidResponse) => void, multiple = true, fileTypes: string[] = []) {
  const uploader = multer({
    fileFilter(_, file, callback) {
      callback(null, fileTypes.length > 0 ? fileTypes.includes(file.mimetype) : true);
    }});
  return async (req: NextApiRequest, res: NextApiResponse) => {
    if (multiple)
      await run(uploader.array('files'))(req, res);
    else
      await run(uploader.single('file'))(req, res);
    return withVoid(handler)(req, res);
  };
}
