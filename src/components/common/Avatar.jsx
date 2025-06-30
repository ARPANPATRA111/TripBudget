import { getInitials, getColorFromEmail } from '../../utils/helpers';

export const Avatar = ({ email, size = 'md', className = '' }) => {
  const sizeClasses = {
    sm: 'w-6 h-6 text-xs',
    md: 'w-8 h-8 text-sm',
    lg: 'w-10 h-10 text-base',
  };

  return (
    <div
      className={`rounded-full flex items-center justify-center text-white ${sizeClasses[size]} ${className}`}
      style={{ backgroundColor: getColorFromEmail(email) }}
    >
      {getInitials(email)}
    </div>
  );
};