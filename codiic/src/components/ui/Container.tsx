import React from 'react';
import { cn } from '../../utils/cn';

interface ContainerProps extends React.HTMLAttributes<HTMLDivElement> {
  maxWidth?: 'xs' | 'sm' | 'md' | 'lg' | 'xl' | false;
  fixed?: boolean;
  disableGutters?: boolean;
}

export const Container: React.FC<ContainerProps> = ({
  maxWidth = 'lg',
  fixed = false,
  disableGutters = false,
  className,
  children,
  ...props
}) => {
  const maxWidths = {
    xs: 'max-w-xs',
    sm: 'max-w-sm',
    md: 'max-w-md',
    lg: 'max-w-4xl',
    xl: 'max-w-6xl',
    false: 'max-w-none'
  };

  const classes = cn(
    'mx-auto px-4',
    maxWidth !== false && maxWidths[maxWidth],
    fixed && 'max-w-screen-lg',
    !disableGutters && 'px-4 sm:px-6 lg:px-8',
    className
  );

  return (
    <div className={classes} {...props}>
      {children}
    </div>
  );
};
