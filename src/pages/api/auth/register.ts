import {hash} from 'argon2';
import {VoidRequest, VoidResponse, withVoid} from 'middleware/withVoid';

async function handler(req: VoidRequest, res: VoidResponse) {
  const {referral, username, email, password} = req.body;
  if (!(referral && username && password))
    return res.forbid('Invalid credentials.');
  const ref = await prisma.referralCode.findUnique({
    where: {
      code: referral
    },
    include: {
      user: {
        select: {
          username: true
        }
      }
    }
  });
  if (!ref) return res.forbid('Invalid referral code.');
  if (ref.consumedBy) return res.forbid('This code is already consumed.');
  if (ref.expiresAt.getTime() <= new Date().getTime())
    return res.forbid('This referral code is already expired.');
  const usr = await prisma.user.findFirst({
    where: {
      OR: [
        {
          username
        },
        {
          email
        }
      ]
    }
  });
  if (usr)
    return res.forbid(usr.username === username ? 'Username already exists.' : 'Email is already occupied.');
  const user = await prisma.user.create({
    data: {
      username,
      email,
      password: await hash(password)
    }
  });
  if (!user)
    return res.error('Failed to create a user.');
  await prisma.referralCode.update({
    where: {
      code: ref.code
    },
    data: {
      consumedBy: user.id
    }
  });
  return res.success({
    ref: ref.user.username
  });
}

export default withVoid(handler);
