import React from 'react';

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement | HTMLSelectElement> {
  label?: string;
  error?: string;
  as?: 'input' | 'select';
}

export function Input({
  label,
  error,
  className = '',
  as = 'input',
  children,
  ...props
}: InputProps) {
  const Component = as as any;
  
  return (
    <div className="w-full space-y-1.5">
      {label && (
        <label className="block text-sm font-semibold text-gray-700 ml-1">
          {label}
        </label>
      )}
      <Component
        className={`w-full p-3.5 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-teal-500 focus:border-transparent outline-none transition-all duration-200 text-gray-800 placeholder:text-gray-400 ${
          error ? 'border-red-500 bg-red-50' : ''
        } ${className}`}
        {...props}
      >
        {children}
      </Component>
      {error && (
        <p className="text-xs font-medium text-red-500 ml-1 mt-1">
          {error}
        </p>
      )}
    </div>
  );
}
