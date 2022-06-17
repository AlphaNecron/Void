import {Avatar} from '@mantine/core';
import React from 'react';

export default function UserAvatar({user, ...props}) {
  const shorten = (name: string) => name.split(' ').map(x => x.toUpperCase()[0]).slice(0,2);
  return (
    <Avatar src={user.image} radius={100} {...props}>
      {shorten(user.name || user.username || user.id)}
    </Avatar>
  );
}
