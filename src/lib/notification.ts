import { MantineColor } from '@mantine/core';
import { showNotification } from '@mantine/notifications';
import type { ReactNode } from 'react';

export function notify({title, message, icon, color}: {
  title: ReactNode,
  message: ReactNode | null,
  icon: ReactNode, color: MantineColor | 'void'
}) {
  showNotification({title, message: message || '', icon, color});
}

export function showError(title: ReactNode, icon: ReactNode, message = null) {
  notify({title, icon, message, color: 'red'});
}

export function showSuccess(title: ReactNode, icon: ReactNode, message = null) {
  notify({title, icon, message, color: 'green'});
}

export function showWarning(title: ReactNode, icon: ReactNode, message = null) {
  notify({title, icon, message, color: 'yellow'});
}
