import {ContextModalProps} from '@mantine/modals';

export default function UserInfo({innerProps: { user }}: ContextModalProps<{ user: { avatar: string } }>) {
  return <>{JSON.stringify(user)}</>;
}
