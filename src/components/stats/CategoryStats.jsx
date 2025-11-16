import { PieChart, X } from 'lucide-react';

export const CategoryStats = ({ 
  showStats, 
  setShowStats, 
  categorySpending 
}) => (
  <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-200 mb-4">
    <div className="flex items-center justify-between mb-3">
      <h3 className="text-sm sm:text-base font-medium text-gray-900 flex items-center">
        <PieChart className="mr-2 w-4 h-4 sm:w-5 sm:h-5" />
        Spending by Category
      </h3>
      <button
        onClick={() => setShowStats(false)}
        className="text-gray-400 hover:text-gray-500"
      >
        <X size={16} />
      </button>
    </div>

    <div className="space-y-3">
      {categorySpending.map(({ category, amount, percentage }) => (
        <div key={category} className="space-y-1">
          <div className="flex justify-between text-sm sm:text-base">
            <span className="font-medium">{category}</span>
            <span>₹{amount.toFixed(2)} ({percentage.toFixed(1)}%)</span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div
              className="bg-blue-600 h-2 rounded-full"
              style={{ width: `${percentage}%` }}
            ></div>
          </div>
        </div>
      ))}
    </div>
  </div>
);