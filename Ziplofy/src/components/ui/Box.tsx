import React from 'react';
import { cn } from '../../utils/cn';

interface BoxProps extends React.HTMLAttributes<HTMLDivElement> {
  component?: keyof JSX.IntrinsicElements;
  sx?: React.CSSProperties;
}

export const Box: React.FC<BoxProps> = ({
  component: Component = 'div',
  sx,
  className,
  children,
  ...props
}) => {
  return (
    <Component
      className={cn(className)}
      style={sx}
      {...props}
    >
      {children}
    </Component>
  );
};
