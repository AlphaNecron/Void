import React, { forwardRef } from 'react';
import Link, { LinkProps } from 'next/link';

export default forwardRef<HTMLAnchorElement, LinkProps & { children: any }>((props, ref) => {
  const {
    href,
    as,
    replace,
    scroll,
    shallow,
    passHref,
    prefetch,
    locale,
    ...otherProps
  } = props;

  return (
    <Link
      ref={ref}
      href={href}
      as={as}
      replace={replace}
      scroll={scroll}
      shallow={shallow}
      passHref={passHref}
      prefetch={prefetch}
      locale={locale}
      {...otherProps}
    >
      {props.children}
    </Link>
  );
});
