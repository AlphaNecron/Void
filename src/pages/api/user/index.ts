import { hash } from 'argon2';
import internal from 'void/internal';
import { isEmpty } from 'lib/utils';
import { embedSchema } from 'lib/validate';
import { VoidRequest, VoidResponse, withVoid } from 'middleware/withVoid';
import { ValidationError } from 'yup';

async function handler(req: VoidRequest, res: VoidResponse) {
  const user = await req.getUser();
  if (!user) return res.unauthorized();
  switch (req.method) {
  case 'PATCH': {
    const data = {};
    if (req.body.password) {
      data['password'] = await hash(req.body.password);
    }
    if (req.body.username) {
      if (req.body.username.toLowerCase() !== user.username.toLowerCase()) {
        const existing = await internal.prisma.user.findUnique({
          where: {
            username: req.body.username
          }
        });
        if (existing)
          return res.forbid('Username is already taken');
      } else if (req.body.username.length < 3)
        return res.error('Username must be longer than 3 characters.');
      data['username'] = req.body.username;
    }
    if (req.body.name)
      data['name'] = req.body.name;
    if (req.body.embed) {
      try {
        const embedData = await embedSchema.validate(req.body.embed, {
          stripUnknown: true
        });
        if (embedData)
          data['embed'] = embedData;
      } catch (e) {
        if (e instanceof ValidationError)
          return res.error(e.errors.shift());
        return res.error(e.toString());
      }
    }
    if (!isEmpty(data)) {
      const updated = await internal.prisma.user.update({
        where: {
          id: user.id
        },
        data: {
          ...data,
          ...(data['embed'] && !isEmpty(data['embed']) && {
            embed: {
              upsert: {
                update: data['embed'],
                create: data['embed']
              }
            }
          })
        },
        select: {
          id: true,
          username: true,
          name: true,
          email: true,
          embed: true,
          role: true,
          privateToken: true
        }
      });
      if (updated) {
        req.session.user = updated;
        await req.session.save();
      }
      return res.success();
    }
    return res.error('Nothing was updated.');
  }
  case 'GET': {
    delete user.email;
    delete user.privateToken;
    return res.json(user);
  }
  default:
    return res.notAllowed();
  }
}

export default withVoid(handler);
