import { PrismaClientKnownRequestError } from '@prisma/client/runtime';
import { rm } from 'fs/promises';
import { VoidRequest, VoidResponse, withVoid } from 'middleware/withVoid';
import { resolve } from 'path';
import internal from 'void/internal';

async function handler(req: VoidRequest, res: VoidResponse) {
  if (req.method === 'DELETE') {
    const user = await req.getUser();
    if (!user) return res.unauthorized;
    const tokens = req.body;
    if (!Array.isArray(tokens) || tokens.length === 0) return res.forbid('Invalid tokens');
    if (!tokens) return res.forbid('No deletion tokens.');
    const failed: string[] = [], deleted: { id: string, fileName: string }[] = [];
    try {
      for (const token of tokens) {
        const file = await internal.prisma.file.delete({
          where: {
            deletionToken: token
          },
          include: {
            user: true
          }
        });
        if (file) {
          await rm(resolve(internal.config.void.upload.outputDirectory, file.user.id, file.id));
          deleted.push({id: file.id, fileName: file.fileName});
        } else failed.push(token);
      }
    } catch (e) {
      internal.logger.debug(e);
    }
    return res.json(failed.length > 0 ? ({success: false, failed, deleted}) : ({success: true, deleted}));
  } else {
    if (!req.query.token) return res.forbid('No deletion token provided');
    try {
      const file = await internal.prisma.file.delete({
        where: {
          deletionToken: req.query.token as string
        },
        include: {
          user: true
        }
      });
      await rm(resolve(internal.config.void.upload.outputDirectory, file.user.id, file.id));
      return res.success({fileName: file.fileName});
    } catch (e) {
      if (e instanceof PrismaClientKnownRequestError)
        return res.notFound('File with specified token does not exist.');
      return res.forbid('Failed to delete the file');
    }
  }
}

export default withVoid(handler);
