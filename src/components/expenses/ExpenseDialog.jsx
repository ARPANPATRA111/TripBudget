import { useState } from 'react';
import { Dialog } from '../common/Dialog';
import { X, Calendar, Plus } from 'lucide-react';
import { Button } from '../common/Button';

export const ExpenseDialog = ({
  showExpenseDialog,
  setShowExpenseDialog,
  editingExpense,
  expenseAmount,
  setExpenseAmount,
  expenseDescription,
  setExpenseDescription,
  expenseCategory,
  setExpenseCategory,
  expenseDate,
  setExpenseDate,
  categories,
  handleAddExpense,
  handleUpdateExpense
}) => {
  const [showCustomCategory, setShowCustomCategory] = useState(false);
  const [customCategory, setCustomCategory] = useState('');

  const handleCategoryChange = (e) => {
    const value = e.target.value;
    if (value === '__custom__') {
      setShowCustomCategory(true);
      setExpenseCategory('');
    } else {
      setShowCustomCategory(false);
      setExpenseCategory(value);
    }
  };

  const handleAddCustomCategory = () => {
    const trimmed = customCategory.trim();
    if (trimmed) {
      if (categories.includes(trimmed)) {
        alert('This category already exists');
        return;
      }
      setExpenseCategory(trimmed);
      setCustomCategory('');
      setShowCustomCategory(false);
    } else {
      alert('Please enter a category name');
    }
  };

  return (
  <Dialog isOpen={showExpenseDialog} onClose={() => setShowExpenseDialog(false)}>
    <div className="flex justify-between items-center mb-4">
      <h2 className="text-lg sm:text-xl font-semibold text-gray-900">
        {editingExpense ? 'Edit Expense' : 'Add New Expense'}
      </h2>
      <button
        onClick={() => setShowExpenseDialog(false)}
        className="text-gray-400 hover:text-gray-500"
      >
        <X size={20} />
      </button>
    </div>
    <div className="space-y-4">
      <div>
        <label className="block text-sm sm:text-base font-medium text-gray-700 mb-1">Amount (₹)</label>
        <input
          type="number"
          value={expenseAmount}
          onChange={(e) => setExpenseAmount(e.target.value)}
          className="w-full px-3 py-2 text-gray-700 bg-gray-50 rounded-lg border border-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
          placeholder="0.00"
          step="0.01"
          min="0.01"
        />
      </div>
      <div>
        <label className="block text-sm sm:text-base font-medium text-gray-700 mb-1">Description</label>
        <textarea
          value={expenseDescription}
          onChange={(e) => setExpenseDescription(e.target.value)}
          className="w-full px-3 py-2 text-gray-700 bg-gray-50 rounded-lg border border-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all resize-none"
          placeholder="What was this expense for?"
          rows="3"
        />
      </div>
      <div>
        <label className="block text-sm sm:text-base font-medium text-gray-700 mb-1">Category</label>
        {!showCustomCategory && !expenseCategory ? (
          <div className="space-y-2">
            <select
              value={expenseCategory}
              onChange={handleCategoryChange}
              className="w-full text-sm px-3 py-2 text-gray-700 bg-gray-50 rounded-lg border border-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
            >
              <option value="">Select a category</option>
              {categories.map(category => (
                <option key={category} value={category} className='text-sm'>{category}</option>
              ))}
              <option value="__custom__" className="text-sm text-blue-600 font-medium">+ Add Custom Category</option>
            </select>
          </div>
        ) : !showCustomCategory && expenseCategory && !categories.includes(expenseCategory) ? (
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <div className="flex-1 px-3 py-2 text-sm text-gray-700 bg-blue-50 rounded-lg border border-blue-200">
                {expenseCategory}
              </div>
              <button
                onClick={() => {
                  setExpenseCategory('');
                }}
                className="px-3 py-2 bg-gray-200 hover:bg-gray-300 text-gray-700 rounded-lg transition-colors"
                title="Change category"
              >
                <X size={18} />
              </button>
            </div>
            <p className="text-xs text-blue-600">Custom category (will be added to group)</p>
          </div>
        ) : !showCustomCategory && expenseCategory ? (
          <div className="space-y-2">
            <select
              value={expenseCategory}
              onChange={handleCategoryChange}
              className="w-full text-sm px-3 py-2 text-gray-700 bg-gray-50 rounded-lg border border-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
            >
              <option value="">Select a category</option>
              {categories.map(category => (
                <option key={category} value={category} className='text-sm'>{category}</option>
              ))}
              <option value="__custom__" className="text-sm text-blue-600 font-medium">+ Add Custom Category</option>
            </select>
          </div>
        ) : (
          <div className="space-y-2">
            <div className="flex gap-2">
              <input
                type="text"
                value={customCategory}
                onChange={(e) => setCustomCategory(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && handleAddCustomCategory()}
                className="flex-1 px-3 py-2 text-sm text-gray-700 bg-gray-50 rounded-lg border border-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                placeholder="Enter custom category"
                autoFocus
              />
              <button
                onClick={handleAddCustomCategory}
                className="px-3 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors"
                title="Add category"
              >
                <Plus size={18} />
              </button>
              <button
                onClick={() => {
                  setShowCustomCategory(false);
                  setCustomCategory('');
                }}
                className="px-3 py-2 bg-gray-200 hover:bg-gray-300 text-gray-700 rounded-lg transition-colors"
                title="Cancel"
              >
                <X size={18} />
              </button>
            </div>
            {customCategory && categories.includes(customCategory.trim()) && (
              <p className="text-xs text-orange-600">This category already exists</p>
            )}
          </div>
        )}
      </div>
      <div>
        <label className="block text-sm sm:text-base font-medium text-gray-700 mb-1">Date</label>
        <div className="relative">
          <Calendar className="absolute left-3 top-2.5 w-5 h-5 text-gray-400" />
          <input
            type="date"
            value={expenseDate}
            onChange={(e) => setExpenseDate(e.target.value)}
            className="w-full pl-10 pr-3 py-2 text-gray-700 bg-gray-50 rounded-lg border border-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
          />
        </div>
      </div>
      <div className="pt-2">
        <Button
          onClick={editingExpense ? handleUpdateExpense : handleAddExpense}
          className="w-full"
        >
          {editingExpense ? 'Update Expense' : 'Add Expense'}
        </Button>
      </div>
    </div>
  </Dialog>
  );
};