import {useState} from 'react';

interface Checklist {
  checkedItems: string[];
  size: number;
  isChecked: (id: string) => boolean;
  setData: (data: string[]) => void;
  toggle: (id: string) => void;
  check: (id: string) => void;
  uncheck: (id: string) => void;
  checkAll: () => void;
  uncheckAll: () => void;
}

export default function useChecklist(): Checklist {
  const [items, setItems] = useState<Record<string, boolean>>({});
  const setValue = (id: string, state: boolean) =>
    setItems(current => {
      const it = {...current};
      it[id] = state;
      return it;
    });
  const setState = (state: boolean) =>
    setItems(current => Object.fromEntries(Object.keys(current).map(k => [k, state])));
  return {
    checkedItems: Object.keys(items).filter(k => items[k] === true),
    size: Object.values(items).filter(i => i === true).length,
    isChecked: id => items[id] === true,
    setData: dat => setItems(Object.fromEntries(dat.map(id => [id, false]))),
    toggle: id => setValue(id, items[id] !== true),
    check: id => setValue(id, true),
    uncheck: id => setValue(id, false),
    checkAll: () => setState(true),
    uncheckAll: () => setState(false)
  };
}
