import React from 'react';

export default function Select({
  label,
  name,
  value,
  onChange,
  required = false,
  options = [],
  icon: Icon,
  className = '',
  ...props
}) {
  const selectClass = `w-full ${Icon ? 'pl-10' : 'pl-4'} pr-10 py-2.5 bg-gray-50 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#ffcf78] focus:border-transparent text-gray-700 transition-all appearance-none cursor-pointer ${className}`;
  const labelClass = 'block text-sm font-semibold text-gray-700 mb-1.5';
  const iconClass = 'absolute left-3 top-[38px] text-gray-400 text-lg';

  return (
    <div className="relative">
      {label && <label className={labelClass}>{label}</label>}
      <select
        name={name}
        value={value}
        onChange={onChange}
        required={required}
        className={selectClass}
        {...props}
      >
        {options.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
      {Icon && <Icon className={iconClass} />}
      <div className="absolute right-3 top-[42px] pointer-events-none text-gray-500 text-xs">
        ▼
      </div>
    </div>
  );
}
