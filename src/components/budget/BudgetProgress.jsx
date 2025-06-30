export const BudgetProgress = ({ totalExpenses, remainingBudget, budgetProgress }) => (
  <div className="mb-4">
    <div className="flex justify-between text-xs sm:text-sm text-gray-600 mb-1">
      <span>Spent: ${totalExpenses.toFixed(2)}</span>
      <span>Remaining: ${remainingBudget.toFixed(2)}</span>
    </div>
    <div className="w-full bg-gray-200 rounded-full h-2.5">
      <div
        className="bg-blue-600 h-2.5 rounded-full"
        style={{ width: `${budgetProgress}%` }}
      ></div>
    </div>
  </div>
);