interface StatusBadgeProps {
  status: 'active' | 'inactive' | 'connected' | 'not connected' | 'sent' | 'pending' | 'failed';
}

export const StatusBadge = ({ status }: StatusBadgeProps) => {
  const getStatusStyles = () => {
    switch (status.toLowerCase()) {
      case 'active':
      case 'connected':
      case 'sent':
        return 'bg-green-100 text-green-800';
      case 'inactive':
      case 'not connected':
      case 'failed':
        return 'bg-red-100 text-red-800';
      case 'pending':
        return 'bg-yellow-100 text-yellow-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold backdrop-blur-sm ${getStatusStyles()}`}>
      {status}
    </span>
  );
};

