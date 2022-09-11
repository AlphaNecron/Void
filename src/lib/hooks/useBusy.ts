import {useState} from 'react';

type UseBusy = {
  busy: boolean;
  set: (value: boolean) => void;
  toggle: () => void;
}

export default function setBusy(): UseBusy {
  const [busy, setBusy] = useState(false);
  return {
    busy,
    set: v => setBusy(v),
    toggle: () => setBusy(p => !p)
  };
}
