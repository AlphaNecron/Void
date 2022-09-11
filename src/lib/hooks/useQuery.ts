import {useDebouncedValue, useInputState} from '@mantine/hooks';

export default function useQuery(delay = 500) {
  const [query, setQuery] = useInputState('');
  const [debounced] = useDebouncedValue(query, delay, {leading: true});
  const matcher = (text: string) => (text || '').toLowerCase().includes((debounced || '').toLowerCase());
  return {
    query,
    handler: {
      set: setQuery,
      filter: matcher,
      filterList: (list, criteria: string[]) => list.filter(x => criteria.some(z => matcher(x[z])))
    },
    debouncedQuery: debounced
  };
}
