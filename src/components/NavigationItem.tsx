import {NavLink, ThemeIcon} from '@mantine/core';

export default function NavigationItem({
  highlight = false,
  label,
  color,
  icon,
  ...props
}) {
  return (
    <NavLink {...props} label={label} active={highlight} color={color} defaultOpened childrenOffset={0} icon={
      <ThemeIcon variant='light' style={{background: highlight && 'transparent'}} color={color}>
        {icon}
      </ThemeIcon>
    } />
  );
}
