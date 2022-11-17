import type { SelectItem } from '@mantine/core';
import { Badge, Button, ColorInput, Modal, MultiSelect, NumberInput, Stack, TextInput } from '@mantine/core';
import { useForm, yupResolver } from '@mantine/form';
import useRequest from 'lib/hooks/useRequest';
import { showError } from 'lib/notification';
import { getPermissions, Permission } from 'lib/permission';
import { prettyBytes } from 'lib/utils';
import { roleSchema } from 'lib/validate';
import { useMemo } from 'react';
import { RiErrorWarningFill } from 'react-icons/ri';

export default function Dialog_CreateRole({opened, onClose, highestPerm, callback}) {
  const {busy, request} = useRequest();
  const form = useForm({
    validate: yupResolver(roleSchema),
    initialValues: {
      name: '',
      color: '#000000',
      storageQuota: 1048576,
      maxFileSize: 1048576,
      maxFileCount: 1,
      maxRefCodes: 5,
      permissions: 0
    }
  });

  const handleSubmit = v =>
    request({
      endpoint: '/api/admin/roles',
      method: 'POST',
      body: v,
      callback() {
        callback();
        onClose();
        form.reset();
      },
      onError: e => showError(e, <RiErrorWarningFill />)
    });

  const perms = useMemo(() => Object.values(Permission).filter(p => typeof p === 'number' && p < highestPerm).map(p => ({
    label: <strong>{Permission[p]}</strong>, value: p.toString()
  } as unknown as SelectItem)), [highestPerm]);
  return (
    <Modal opened={opened} onClose={onClose} title='Create a new role'>
      <form onSubmit={form.onSubmit(handleSubmit)}>
        <Stack>
          <TextInput label='Name' {...form.getInputProps('name')} required />
          <ColorInput label='Color' {...form.getInputProps('color')} required />
          <NumberInput rightSectionWidth={84}
            rightSection={<Badge radius='xs' color='dark' mr='xs'
              fullWidth>{prettyBytes(form.values['storageQuota'])}</Badge>}
            label='Storage quota (maximum total size)' min={1048576}
            step={1048576} {...form.getInputProps('storageQuota')} required />
          <NumberInput rightSectionWidth={84}
            rightSection={<Badge radius='xs' color='dark' mr='xs'
              fullWidth>{prettyBytes(form.values['maxFileSize'])}</Badge>}
            label='Max file size per upload (in bytes)' min={1048576}
            step={1048576} {...form.getInputProps('maxFileSize')} required />
          <NumberInput label='Max files per upload'
            min={1} {...form.getInputProps('maxFileCount')} required />
          <NumberInput label='Max referral codes' {...form.getInputProps('maxRefCodes')} required />
          <MultiSelect data={perms} value={getPermissions(form.values['permissions']).map(p => p.toString())}
            onChange={v => form.setFieldValue('permissions', v.map(p => +p).reduce((a, b) => a | b, 0))}
            label='Permissions' />
          <Button type='submit' loading={busy}>
            Create
          </Button>
        </Stack>
      </form>
    </Modal>
  );
}
