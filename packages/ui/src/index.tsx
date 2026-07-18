import type { ButtonHTMLAttributes, PropsWithChildren } from 'react';

export type ButtonVariant = 'primary' | 'secondary';

export interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  readonly variant?: ButtonVariant;
}

export const Button = ({
  children,
  type = 'button',
  variant = 'primary',
  ...props
}: PropsWithChildren<ButtonProps>) => (
  <button data-variant={variant} type={type} {...props}>
    {children}
  </button>
);
