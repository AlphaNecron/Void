import {useDebouncedValue} from '@mantine/hooks';
import {useState} from 'react';

export default function useQuery(delay = 300) {
  const [query, setQuery] = useState('');
  const [debounced] = useDebouncedValue(query, delay, { leading: true });
  const matcher = (text: string) => (text || '').toLowerCase().includes((debounced || '').toLowerCase());
  return {
    query,
    handler: {
      set: setQuery,
      filter: matcher,
      filterList: (list, properties) => list.filter(x => properties.some(z => matcher(x[z])))
    },
    debouncedQuery: debounced
  };
}
