import {Avatar} from '@mantine/core';
import {validateHex} from 'lib/utils';

export default function UserAvatar({user, ext = false, ...props}) {
  const shorten = (name: string) => name.split(' ').map(x => x.toUpperCase()[0]).slice(0, 2);
  return (
    <Avatar src={`/api/user/avatar${ext ? `?id=${user.id}` : ''}`} styles={validateHex(user.role.color) && {
      placeholder: {
        background: user.role.color,
        color: 'white'
      }
    }} radius={100} {...props}>
      {shorten(user.name || user.username || user.id)}
    </Avatar>
  );
}
