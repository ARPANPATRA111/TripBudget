import { formatDate, truncateDescription } from '../../utils/helpers';
import { getInitials, getColorFromEmail } from '../../utils/helpers';
import { Edit } from 'lucide-react';

export const ExpenseItem = ({ 
  expense, 
  canEdit, 
  onViewDescription, 
  onEdit 
}) => (
  <div className="p-3 bg-gray-50 rounded-lg border border-gray-200 hover:border-gray-300 transition-all">
    <div className="flex justify-between items-start">
      <div className="flex-1">
        {/* Show user info if available (for shared expenses) */}
        {expense.userName && (
          <div className="flex items-center gap-2 mb-1.5">
            <div
              className="w-6 h-6 rounded-full flex items-center justify-center text-white text-xs"
              style={{ backgroundColor: expense.userColor || getColorFromEmail(expense.userEmail) }}
            >
              {expense.userInitials || getInitials(expense.userEmail)}
            </div>
            <span className="text-sm font-medium text-gray-700">
              {expense.userName}
            </span>
            {expense.userRole && (
              <span className="text-xs text-gray-500">
                ({expense.userRole})
              </span>
            )}
          </div>
        )}
        
        <div className="flex items-center space-x-1.5 mb-1">
          <span
            className="text-sm sm:text-base font-medium text-gray-900 cursor-pointer hover:underline"
            onClick={onViewDescription}
          >
            {truncateDescription(expense.description)}
          </span>
          <span className="px-1.5 py-0.5 text-xs sm:text-sm bg-blue-100 text-blue-800 rounded-full">
            {expense.category}
          </span>
        </div>
        <div className="text-xs sm:text-sm text-gray-500">
          {formatDate(expense.timestamp)}
          {expense.edited && (
            <span className="ml-2 text-gray-400 italic">
              (edited {formatDate(expense.editedAt)})
            </span>
          )}
        </div>
      </div>
      <div className="flex items-center space-x-2 ml-3">
        <span className="text-sm sm:text-base font-semibold text-red-600">${expense.amount.toFixed(2)}</span>
        {canEdit && (
          <button
            onClick={onEdit}
            className="text-blue-500 hover:text-blue-700 text-xs px-2 py-0.5 rounded-md hover:bg-blue-50 transition-all"
          >
            <Edit size={14} />
          </button>
        )}
      </div>
    </div>
  </div>
);