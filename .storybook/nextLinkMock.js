import React from 'react';

// Mock component for Next.js Link in Storybook
const Link = ({ href, children, className, passHref, ...props }) => {
  return (
    <a href={href} className={className} {...props}>
      {children}
    </a>
  );
};

export default Link;
