import {Stack, Text} from '@mantine/core';
import {ContextModalProps} from '@mantine/modals';
import dynamic from 'next/dynamic';

const ThemedQr = dynamic(() => import('components/ThemedQr'), {
  ssr: false
});

export default function Dialog_Qr({ innerProps }: ContextModalProps<{ value: string }>) {
  return (
    <Stack align='center'>
      <ThemedQr removeQrCodeBehindLogo logoImage='/logo.png' quietZone={16} qrStyle='dots' eyeRadius={8} value={innerProps.value} size={288}/>
      <Text color='dimmed' weight={600}>Scan this QR code on your device to view the file.</Text>
    </Stack>
  );
}
