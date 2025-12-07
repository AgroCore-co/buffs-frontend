import React from 'react';
import { FiCheckCircle } from 'react-icons/fi';

export default function Toggle({
  label,
  name,
  checked,
  onChange,
  showCheckIcon = true,
}) {
  return (
    <label className="flex items-center gap-3 p-2.5 border border-gray-200 rounded-lg cursor-pointer bg-white hover:bg-gray-50 transition-colors">
      <div className="relative">
        <input
          type="checkbox"
          name={name}
          checked={checked}
          onChange={onChange}
          className="sr-only peer"
        />
        <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-[#ffcf78]/30 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[#ce7d0a]"></div>
      </div>
      <div className="flex items-center gap-2">
        <span className="text-sm font-medium text-gray-700">{label}</span>
        {showCheckIcon && checked && (
          <FiCheckCircle className="text-green-600" />
        )}
      </div>
    </label>
  );
}
