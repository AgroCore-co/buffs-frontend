'use client';

import { forwardRef } from 'react';

const Button = forwardRef(
  (
    {
      children,
      variant = 'primary',
      size = 'medium',
      loading = false,
      disabled = false,
      className = '',
      type = 'button',
      onClick,
      ...props
    },
    ref
  ) => {
    const baseClasses =
      'inline-flex items-center justify-center font-medium rounded-md transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed';

    const variantClasses = {
      primary:
        'bg-[#FFCF78] text-[#404040] font-bold shadow-sm hover:bg-[#F2B84D] focus:ring-[#FFCF78] border-none',
      secondary:
        'bg-[#ce7d0a] text-white font-bold shadow-sm hover:bg-[#b86c09] focus:ring-[#ce7d0a] border-none',
      outline:
        'border border-gray-300 bg-white text-gray-700 hover:bg-gray-50 focus:ring-gray-300 font-medium',
      success:
        'bg-green-500 text-white font-bold shadow-sm hover:bg-green-600 focus:ring-green-500 border-none',
      danger:
        'bg-red-500 text-white font-bold shadow-sm hover:bg-red-600 focus:ring-red-500 border-none',
      info: 'bg-blue-500 text-white font-bold shadow-sm hover:bg-blue-600 focus:ring-blue-500 border-none',
      report:
        'bg-gray-100 text-gray-700 font-bold shadow-sm hover:bg-gray-200 focus:ring-gray-200 border border-gray-300',
    };

    const sizeClasses = {
      small: 'px-3 py-2 text-sm',
      medium: 'px-5 py-2.5 text-base',
      large: 'px-6 py-3 text-lg',
      full: 'w-full px-5 py-2.5 text-base',
    };

    const classes = `${baseClasses} ${variantClasses[variant]} ${sizeClasses[size]} ${className}`;

    return (
      <button
        ref={ref}
        type={type}
        className={classes}
        disabled={disabled || loading}
        onClick={onClick}
        {...props}
      >
        {loading && (
          <svg
            className="animate-spin -ml-1 mr-3 h-5 w-5"
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
          >
            <circle
              className="opacity-25"
              cx="12"
              cy="12"
              r="10"
              stroke="currentColor"
              strokeWidth="4"
            ></circle>
            <path
              className="opacity-75"
              fill="currentColor"
              d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
            ></path>
          </svg>
        )}
        {children}
      </button>
    );
  }
);

Button.displayName = 'Button';

export default Button;
