import React from 'react';
import { cn } from '../../utils/cn';

interface PaperProps extends React.HTMLAttributes<HTMLDivElement> {
  elevation?: 0 | 1 | 2 | 3 | 4 | 5;
  square?: boolean;
  variant?: 'elevation' | 'outlined';
}

export const Paper: React.FC<PaperProps> = ({
  elevation = 1,
  square = false,
  variant = 'elevation',
  className,
  children,
  ...props
}) => {
  const elevations = {
    0: 'shadow-none',
    1: 'shadow-sm',
    2: 'shadow',
    3: 'shadow-md',
    4: 'shadow-lg',
    5: 'shadow-xl'
  };

  const variants = {
    elevation: elevations[elevation],
    outlined: 'border border-gray-200'
  };

  const classes = cn(
    'bg-white',
    variants[variant],
    !square && 'rounded-lg',
    className
  );

  return (
    <div className={classes} {...props}>
      {children}
    </div>
  );
};
