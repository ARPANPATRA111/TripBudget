import { formatDate, truncateDescription } from '../../utils/helpers';
import { getInitials, getColorFromEmail } from '../../utils/helpers';
import { Edit, Trash2 } from 'lucide-react';

export const ExpenseItem = ({ 
  expense, 
  canEdit, 
  onViewDescription, 
  onEdit,
  onDelete,
  currentUserId
}) => {
  const isMyExpense = expense.user_id === currentUserId;
  const userName = expense.user_profiles?.full_name || expense.user_profiles?.email?.split('@')[0] || expense.userName || 'Unknown';
  const userEmail = expense.user_profiles?.email || expense.userEmail || '';
  
  return (
    <div className="p-3 bg-gray-50 rounded-lg border border-gray-200 hover:border-gray-300 transition-all">
      <div className="flex justify-between items-start">
        <div className="flex-1">
          {/* Show user info */}
          <div className="flex items-center gap-2 mb-1.5">
            <div
              className="w-6 h-6 rounded-full flex items-center justify-center text-white text-xs font-semibold"
              style={{ backgroundColor: getColorFromEmail(userEmail) }}
            >
              {getInitials(userEmail) || userName[0]?.toUpperCase()}
            </div>
            <span className="text-sm font-medium text-gray-700">
              {userName}
              {isMyExpense && <span className="ml-1 text-xs text-blue-600">(You)</span>}
            </span>
          </div>
          
          <div className="flex items-center space-x-1.5 mb-1">
            <span
              className="text-sm sm:text-base font-medium text-gray-900 cursor-pointer hover:underline"
              onClick={() => onViewDescription && onViewDescription(expense.description)}
            >
              {truncateDescription(expense.description)}
            </span>
            <span className="px-1.5 py-0.5 text-xs sm:text-sm bg-blue-100 text-blue-800 rounded-full">
              {expense.category}
            </span>
          </div>
          <div className="text-xs sm:text-sm text-gray-500">
            {expense.expense_date && new Date(expense.expense_date).toLocaleDateString()}
            {expense.is_edited && (
              <span className="ml-2 text-gray-400 italic">
                (edited)
              </span>
            )}
          </div>
        </div>
        <div className="flex items-center space-x-2 ml-3">
          <span className="text-sm sm:text-base font-semibold text-red-600">
            ${parseFloat(expense.amount).toFixed(2)}
          </span>
          {canEdit && isMyExpense && (
            <div className="flex space-x-1">
              <button
                onClick={() => onEdit(expense)}
                className="text-blue-500 hover:text-blue-700 text-xs px-2 py-0.5 rounded-md hover:bg-blue-50 transition-all"
                title="Edit"
              >
                <Edit size={14} />
              </button>
              {onDelete && (
                <button
                  onClick={() => onDelete(expense.id)}
                  className="text-red-500 hover:text-red-700 text-xs px-2 py-0.5 rounded-md hover:bg-red-50 transition-all"
                  title="Delete"
                >
                  <Trash2 size={14} />
                </button>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};