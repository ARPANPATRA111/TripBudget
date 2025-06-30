import { Button } from '../common/Button';

export const SetBudgetForm = ({ budgetInput, setBudgetInput, handleSetBudget }) => (
  <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-200 mb-4">
    <h2 className="text-lg sm:text-xl font-semibold text-gray-900 mb-3">Set Your Budget</h2>
    <div className="flex flex-col gap-2">
      <input
        type="number"
        value={budgetInput}
        onChange={(e) => setBudgetInput(e.target.value)}
        placeholder="Enter budget amount"
        className="w-full px-3 py-2 text-gray-700 bg-gray-50 rounded-lg border border-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
      />
      <Button
        onClick={handleSetBudget}
        variant="success"
        className="w-full"
      >
        Set Budget
      </Button>
    </div>
    <p className="text-xs text-gray-500 mt-2">⚠️ Budget can only be set once</p>
  </div>
);