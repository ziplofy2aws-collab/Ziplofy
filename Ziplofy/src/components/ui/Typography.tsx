import React from 'react';
import { cn } from '../../utils/cn';

interface TypographyProps extends React.HTMLAttributes<HTMLElement> {
  variant?: 'h1' | 'h2' | 'h3' | 'h4' | 'h5' | 'h6' | 'body1' | 'body2' | 'caption' | 'subtitle1' | 'subtitle2';
  component?: keyof JSX.IntrinsicElements;
  color?: 'primary' | 'secondary' | 'textPrimary' | 'textSecondary' | 'error' | 'success';
  align?: 'left' | 'center' | 'right' | 'justify';
  fontWeight?: 'light' | 'normal' | 'medium' | 'semibold' | 'bold';
}

export const Typography: React.FC<TypographyProps> = ({
  variant = 'body1',
  component,
  color = 'textPrimary',
  align = 'left',
  fontWeight,
  className,
  children,
  ...props
}) => {
  const variants = {
    h1: 'text-4xl font-bold',
    h2: 'text-3xl font-bold',
    h3: 'text-2xl font-bold',
    h4: 'text-xl font-semibold',
    h5: 'text-lg font-semibold',
    h6: 'text-base font-semibold',
    body1: 'text-base',
    body2: 'text-sm',
    caption: 'text-xs',
    subtitle1: 'text-base font-medium',
    subtitle2: 'text-sm font-medium'
  };

  const colors = {
    primary: 'text-blue-600',
    secondary: 'text-gray-600',
    textPrimary: 'text-gray-900',
    textSecondary: 'text-gray-600',
    error: 'text-red-600',
    success: 'text-green-600'
  };

  const alignments = {
    left: 'text-left',
    center: 'text-center',
    right: 'text-right',
    justify: 'text-justify'
  };

  const fontWeights = {
    light: 'font-light',
    normal: 'font-normal',
    medium: 'font-medium',
    semibold: 'font-semibold',
    bold: 'font-bold'
  };

  const Component = component || (variant.startsWith('h') ? variant : 'p');

  const classes = cn(
    variants[variant],
    colors[color],
    alignments[align],
    fontWeight && fontWeights[fontWeight],
    className
  );

  return (
    <Component className={classes} {...props}>
      {children}
    </Component>
  );
};
