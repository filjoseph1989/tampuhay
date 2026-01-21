import React from 'react';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'danger' | 'outline';
  size?: 'sm' | 'md' | 'lg';
  fullWidth?: boolean;
}

export function Button({
  variant = 'primary',
  size = 'md',
  fullWidth = false,
  className = '',
  children,
  ...props
}: ButtonProps) {
  const baseStyles = 'font-bold rounded-xl transition-all duration-200 shadow-sm active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center';
  
  const variants = {
    primary: 'bg-teal-600 text-white hover:bg-teal-700 shadow-teal-100',
    secondary: 'bg-gray-100 text-gray-700 hover:bg-gray-200 shadow-gray-50',
    danger: 'bg-red-500 text-white hover:bg-red-600 shadow-red-100',
    outline: 'bg-transparent border-2 border-teal-600 text-teal-600 hover:bg-teal-50 shadow-none',
  };

  const sizes = {
    sm: 'py-1.5 px-3 text-xs',
    md: 'py-3 px-6 text-sm',
    lg: 'py-4 px-8 text-base',
  };

  const widthStyle = fullWidth ? 'w-full' : '';

  return (
    <button
      className={`${baseStyles} ${variants[variant]} ${sizes[size]} ${widthStyle} ${className}`}
      {...props}
    >
      {children}
    </button>
  );
}
