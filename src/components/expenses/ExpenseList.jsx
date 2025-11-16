import { ExpenseItem } from './ExpenseItem';
import { Tag, Users } from 'lucide-react';
import { Button } from '../common/Button';
import { ArrowUp, ArrowDown } from 'lucide-react';

export const ExpenseList = ({
  title,
  expenses,
  sortConfig,
  requestSort,
  canEdit,
  onViewDescription,
  onViewDetail,
  onEdit,
  onDelete,
  currentUserId,
  visibleExpenseCount,
  setVisibleExpenseCount,
  icon: Icon = Tag
}) => (
  <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-200">
    <div className="flex justify-between items-center mb-4">
      <h2 className="text-lg sm:text-xl font-semibold text-gray-900 flex items-center">
        <Icon className="mr-2 w-5 h-5 text-purple-600" />
        {title}
      </h2>
      <div className="flex space-x-2">
        <button
          onClick={() => requestSort('amount')}
          className="flex items-center text-xs sm:text-sm px-2 py-1 bg-gray-100 rounded-lg"
        >
          Amount {sortConfig.key === 'amount' && (
            sortConfig.direction === 'asc' ? <ArrowUp size={12} className="ml-1" /> : <ArrowDown size={12} className="ml-1" />
          )}
        </button>
        <button
          onClick={() => requestSort('timestamp')}
          className="flex items-center text-xs sm:text-sm px-2 py-1 bg-gray-100 rounded-lg"
        >
          Date {sortConfig.key === 'timestamp' && (
            sortConfig.direction === 'asc' ? <ArrowUp size={12} className="ml-1" /> : <ArrowDown size={12} className="ml-1" />
          )}
        </button>
      </div>
    </div>
    {expenses.length > 0 ? (
      <div className="space-y-2">
        {expenses
          .sort((a, b) => {
            if (sortConfig.key === 'amount') {
              return sortConfig.direction === 'asc'
                ? a.amount - b.amount
                : b.amount - a.amount;
            } else {
              return sortConfig.direction === 'asc'
                ? new Date(a.timestamp) - new Date(b.timestamp)
                : new Date(b.timestamp) - new Date(a.timestamp);
            }
          })
          .map(expense => (
            <ExpenseItem
              key={expense.id}
              expense={expense}
              canEdit={canEdit}
              onViewDescription={onViewDescription}
              onViewDetail={onViewDetail}
              onEdit={onEdit}
              onDelete={onDelete}
              currentUserId={currentUserId}
            />
          ))}

        {expenses.length > 10 && (
          <div className="text-center pt-3">
            <Button
              onClick={() => {
                if (visibleExpenseCount >= expenses.length) {
                  setVisibleExpenseCount(10);
                } else {
                  setVisibleExpenseCount(prev => Math.min(prev + 10, expenses.length));
                }
              }}
              variant="secondary"
              className="mx-auto"
            >
              {visibleExpenseCount >= expenses.length
                ? 'Show Less'
                : `Show More (${Math.min(10, expenses.length - visibleExpenseCount)} more)`
              }
              {visibleExpenseCount >= expenses.length ? (
                <ArrowUp size={16} className="ml-1" />
              ) : (
                <ArrowDown size={16} className="ml-1" />
              )}
            </Button>
          </div>
        )}
      </div>
    ) : (
      <div className="text-center py-8">
        <div className="text-gray-400 mb-3">
          <Icon size={40} className="mx-auto" />
        </div>
        <p className="text-gray-500 text-sm sm:text-base">No expenses yet</p>
        <p className="text-gray-400 text-xs sm:text-sm">Start tracking your spending!</p>
      </div>
    )}
  </div>
);