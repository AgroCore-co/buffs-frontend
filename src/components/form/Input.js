import React from 'react';

export default function Input({
  label,
  name,
  type = 'text',
  value,
  onChange,
  required = false,
  placeholder,
  maxLength,
  icon: Icon,
  className = '',
  ...props
}) {
  const inputClass = `w-full ${Icon ? 'pl-10' : 'pl-4'} pr-4 py-2.5 bg-gray-50 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#ffcf78] focus:border-transparent text-gray-700 transition-all placeholder-gray-400 ${className}`;
  const labelClass = 'block text-sm font-semibold text-gray-700 mb-1.5';
  const iconClass = 'absolute left-3 top-[38px] text-gray-400 text-lg';

  return (
    <div className="relative">
      {label && <label className={labelClass}>{label}</label>}
      <input
        type={type}
        name={name}
        value={value}
        onChange={onChange}
        required={required}
        placeholder={placeholder}
        maxLength={maxLength}
        className={inputClass}
        {...props}
      />
      {Icon && <Icon className={iconClass} />}
    </div>
  );
}
