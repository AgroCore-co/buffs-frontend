import React from 'react';

export default function DashboardContainer({ children, className = '' }) {
  return (
    <div
      className={`w-full flex flex-col bg-white rounded-xl p-6 gap-6 border border-[#ce7d0a]/10 shadow-sm ${className}`}
    >
      {children}
    </div>
  );
}
