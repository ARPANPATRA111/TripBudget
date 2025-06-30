import { Dialog } from '../common/Dialog';
import { X } from 'lucide-react';
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
  categories,
  handleAddExpense,
  handleUpdateExpense
}) => (
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
        <label className="block text-sm sm:text-base font-medium text-gray-700 mb-1">Amount ($)</label>
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
        <input
          type="text"
          value={expenseDescription}
          onChange={(e) => setExpenseDescription(e.target.value)}
          className="w-full px-3 py-2 text-gray-700 bg-gray-50 rounded-lg border border-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
          placeholder="What was this expense for?"
        />
      </div>
      <div>
        <label className="block text-sm sm:text-base font-medium text-gray-700 mb-1">Category</label>
        <select
          value={expenseCategory}
          onChange={(e) => setExpenseCategory(e.target.value)}
          className="w-full text-sm px-3 py-2 text-gray-700 bg-gray-50 rounded-lg border border-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
        >
          <option value="">Select a category</option>
          {categories.map(category => (
            <option key={category} value={category} className='text-sm'>{category}</option>
          ))}
        </select>
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