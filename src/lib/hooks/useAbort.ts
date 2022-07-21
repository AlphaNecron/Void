import {useEffect, useState} from 'react';

export default function useAbort(): { renew: () => void, abort: () => void, signal: AbortSignal, onAbort(handler: () => void) } {
  const [controller, setController] = useState(new AbortController());
  const renewController = () => {
    if (controller.signal.aborted)
      setController(new AbortController());
  };
  useEffect(() => {
    controller.signal.onabort = () => renewController();
  }, [controller]);
  return {
    renew: renewController,
    abort: () => controller.abort(),
    signal: controller.signal,
    onAbort(handler: () => void) {
      controller.signal.onabort = () => {
        handler();
        renewController();
      };
    }
  };
}
