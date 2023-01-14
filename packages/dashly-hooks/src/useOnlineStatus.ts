import { useDisclosure, useWindowEvent } from '@mantine/hooks';

export function useOnlineStatus() {
  const [online, handlers] = useDisclosure(window.navigator.onLine);

  useWindowEvent('online', handlers.open);
  useWindowEvent('offline', handlers.close);

  return online;
}
