export const getInitials = (email) => {
  if (!email) return '?';
  const namePart = email.split('@')[0];
  const parts = namePart.split(/[._-]/);
  return parts.map(part => part.charAt(0).toUpperCase()).join('').substring(0, 2);
};

export const getColorFromEmail = (email) => {
  if (!email) return '#6b7280';
  const colors = [
    '#3b82f6', '#6366f1', '#8b5cf6', '#a855f7', '#d946ef', '#ec4899',
    '#f43f5e', '#ef4444', '#f97316', '#f59e0b', '#10b981', '#14b8a6'
  ];
  const hash = email.split('').reduce((acc, char) => char.charCodeAt(0) + acc, 0);
  return colors[hash % colors.length];
};

export const formatDate = (timestamp) => {
  const date = new Date(timestamp);
  return date.toLocaleString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  });
};

export const truncateDescription = (desc) => {
  if (desc.length <= 20) return desc;
  return `${desc.substring(0, 20)}...`;
};