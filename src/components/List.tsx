import {ActionIcon, Group, ScrollArea, TextInput} from '@mantine/core';
import useQuery from 'lib/hooks/useQuery';
import useThemeValue from 'lib/hooks/useThemeValue';
import {ReactNode} from 'react';
import {FiPlus, FiSearch} from 'react-icons/fi';

export default function List({
  items,
  children,
  height = 300,
  onAdd
}: { items: ((filter: (val: string) => boolean) => unknown[]) | unknown[], children(item): ReactNode, height?: number, isSearchable?: boolean, onAdd?: () => void }) {
  const {value, colorValue} = useThemeValue();
  const {query, handler: {set, filter}} = useQuery();
  return (
    <ScrollArea scrollbarSize={4} style={{
      maxHeight: height,
      display: 'flex',
      flexDirection: 'column'
    }}>
      {typeof items === 'function' && (
        <TextInput rightSection={onAdd && (
          <ActionIcon onClick={onAdd}>
            <FiPlus/>
          </ActionIcon>
        )} styles={({colors, radius}) => ({
          root: {
            background: colors.dark[6],
            border: `1px solid ${colorValue('dark', 0, 5, 0.5)}`,
            borderRadius: `${radius.sm}px ${radius.sm}px 0 0`,
            '&:only-child': {
              borderRadius: radius.sm
            },
          }
        })} icon={<FiSearch size={14}/>} variant='unstyled' value={query} onChange={e => set(e.currentTarget.value)}/>
      )}
      {(typeof items === 'function' ? items(filter) : items).map((item, i) => (
        <Group position='apart' py={6} px='sm' sx={({colors, radius}) => ({
          background: value('white', colors.dark[6]),
          cursor: 'default',
          border: `1px solid ${colorValue('dark', 0, 5, 0.5)}`,
          '&:first-of-type': {
            borderRadius: `${radius.sm}px ${radius.sm}px 0 0`
          },
          '&:last-of-type': {
            borderRadius: `0 0 ${radius.sm}px ${radius.sm}px`
          },
          '&:not(:first-of-type):not(:last-of-type)': {
            borderRadius: 0
          },
          '&:only-child': {
            borderRadius: radius.sm
          },
          '&:hover': {
            background: colorValue('dark', 0, 5)
          }
        })} key={i}>
          {children(item)}
        </Group>
      ))}
    </ScrollArea>
  );
}
