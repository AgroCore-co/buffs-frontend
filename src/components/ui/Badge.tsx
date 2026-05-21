import { memo } from 'react';

interface BadgeProps {
  children: React.ReactNode;
  type?: 'active' | 'inactive' | 'info';
}

const Badge = memo(function Badge({ children, type = 'active' }: BadgeProps) {
  const styles = {
    active: 'bg-[#e6fbf2] text-[#0f766e] border-[#ccfbf1]',
    inactive: 'bg-gray-100 text-gray-500 border-gray-200',
    info: 'bg-blue-50 text-blue-700 border-blue-100',
  };

  return (
    <span
      className={`px-2.5 py-0.5 rounded-md text-[10px] font-bold uppercase tracking-wider border ${styles[type] || styles.active}`}
    >
      {children}
    </span>
  );
});

export default Badge;