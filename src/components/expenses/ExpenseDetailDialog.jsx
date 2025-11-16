import { Dialog } from '../common/Dialog';
import { X, IndianRupee, Calendar, Tag, User, Clock } from 'lucide-react';

export const ExpenseDetailDialog = ({ isOpen, onClose, expense }) => {
  if (!expense) return null;

  const formatDateTime = (date) => {
    if (!date) return 'N/A';
    const dateObj = date?.toDate ? date.toDate() : new Date(date);
    return dateObj.toLocaleString('en-IN', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      hour12: true
    });
  };

  const formatDate = (date) => {
    if (!date) return 'N/A';
    const dateObj = new Date(date);
    return dateObj.toLocaleDateString('en-IN', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  return (
    <Dialog isOpen={isOpen} onClose={onClose}>
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-xl font-bold text-gray-900">Expense Details</h2>
        <button
          onClick={onClose}
          className="text-gray-400 hover:text-gray-500"
        >
          <X size={20} />
        </button>
      </div>

      <div className="space-y-4">
        {/* Amount */}
        <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-lg p-4 border border-blue-200">
          <div className="flex items-center justify-between">
            <span className="text-sm text-gray-600">Amount</span>
            <div className="flex items-center text-2xl font-bold text-gray-900">
              <IndianRupee className="w-6 h-6 mr-1" />
              <span>{expense.amount?.toFixed(2) || '0.00'}</span>
            </div>
          </div>
        </div>

        {/* Description */}
        <div className="border-b border-gray-200 pb-3">
          <label className="block text-sm font-medium text-gray-600 mb-1">Description</label>
          <p className="text-gray-900">{expense.description || 'No description'}</p>
        </div>

        {/* Category */}
        {expense.category && (
          <div className="border-b border-gray-200 pb-3">
            <label className="block text-sm font-medium text-gray-600 mb-1">Category</label>
            <div className="flex items-center text-gray-900">
              <Tag className="w-4 h-4 mr-2 text-blue-600" />
              <span className="capitalize">{expense.category}</span>
            </div>
          </div>
        )}

        {/* Paid By */}
        <div className="border-b border-gray-200 pb-3">
          <label className="block text-sm font-medium text-gray-600 mb-1">Paid By</label>
          <div className="flex items-center text-gray-900">
            <User className="w-4 h-4 mr-2 text-blue-600" />
            <span>{expense.user_profiles?.full_name || expense.user_profiles?.email || 'Unknown'}</span>
          </div>
        </div>

        {/* Expense Date */}
          <div className="border-b border-gray-200 pb-3">
            <label className="block text-sm font-medium text-gray-600 mb-1">Expense Date</label>
            <div className="flex items-center text-gray-900">
              <Calendar className="w-4 h-4 mr-2 text-blue-600" />
              <span>{formatDate(expense.expense_date)}</span>
            </div>
          </div>        {/* Created At */}
        <div className="border-b border-gray-200 pb-3">
          <label className="block text-sm font-medium text-gray-600 mb-1">Created At</label>
          <div className="flex items-center text-gray-900">
            <Clock className="w-4 h-4 mr-2 text-green-600" />
            <span className="text-sm">{formatDateTime(expense.created_at)}</span>
          </div>
        </div>

        {/* Updated At */}
        {expense.updated_at && expense.created_at?.toMillis?.() !== expense.updated_at?.toMillis?.() && (
          <div className="border-b border-gray-200 pb-3">
            <label className="block text-sm font-medium text-gray-600 mb-1">Last Updated</label>
            <div className="flex items-center text-gray-900">
              <Clock className="w-4 h-4 mr-2 text-orange-600" />
              <span className="text-sm">{formatDateTime(expense.updated_at)}</span>
            </div>
          </div>
        )}
      </div>

      <div className="mt-6 flex justify-end">
        <button
          onClick={onClose}
          className="px-4 py-2 bg-gray-200 hover:bg-gray-300 rounded-lg text-gray-700 font-medium transition-colors"
        >
          Close
        </button>
      </div>
    </Dialog>
  );
};
