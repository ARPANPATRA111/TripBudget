import { DollarSign, Tag, Calendar } from 'lucide-react';

export const BudgetCards = ({ budget, totalExpenses, remainingBudget }) => (
  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-4 mb-6">
    <div className="bg-gradient-to-br from-green-400 to-green-600 p-4 rounded-lg shadow text-white">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-green-100 text-xs sm:text-sm font-medium">Budget</p>
          <p className="text-lg sm:text-xl font-bold">${(budget || 0).toFixed(2)}</p>
        </div>
        <DollarSign className="w-6 h-6 sm:w-7 sm:h-7 text-green-200" />
      </div>
    </div>

    <div className="bg-gradient-to-br from-red-400 to-red-600 p-4 rounded-lg shadow text-white">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-red-100 text-xs sm:text-sm font-medium">Expenses</p>
          <p className="text-lg sm:text-xl font-bold">${totalExpenses.toFixed(2)}</p>
        </div>
        <Tag className="w-6 h-6 sm:w-7 sm:h-7 text-red-200" />
      </div>
    </div>

    <div className="bg-gradient-to-br from-blue-400 to-blue-600 p-4 rounded-lg shadow text-white">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-blue-100 text-xs sm:text-sm font-medium">Remaining</p>
          <p className="text-lg sm:text-xl font-bold">${remainingBudget.toFixed(2)}</p>
        </div>
        <Calendar className="w-6 h-6 sm:w-7 sm:h-7 text-blue-200" />
      </div>
    </div>
  </div>
);