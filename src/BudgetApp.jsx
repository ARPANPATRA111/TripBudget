import React, { useState } from 'react';
import { User, DollarSign, Plus, Minus, LogOut } from 'lucide-react';

const BudgetApp = () => {
  // Hardcoded credentials with roles
  const users = {
    'admin@company.com': { password: 'admin123', role: 'Admin', name: 'Admin User' },
    'manager@company.com': { password: 'manager123', role: 'Manager', name: 'John Manager' },
    'employee@company.com': { password: 'emp123', role: 'Employee', name: 'Jane Employee' }
  };

  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [currentUser, setCurrentUser] = useState(null);
  const [loginForm, setLoginForm] = useState({ email: '', password: '' });
  const [error, setError] = useState('');
  
  // Budget and expense state
  const [budgets, setBudgets] = useState({});
  const [expenses, setExpenses] = useState({});
  const [budgetForm, setBudgetForm] = useState({ amount: '' });
  const [expenseForm, setExpenseForm] = useState({ description: '', amount: '' });

  const handleLogin = () => {
    const user = users[loginForm.email];
    
    if (user && user.password === loginForm.password) {
      setCurrentUser({ email: loginForm.email, ...user });
      setIsLoggedIn(true);
      setError('');
      setLoginForm({ email: '', password: '' });
    } else {
      setError('Invalid credentials');
    }
  };

  const handleLogout = () => {
    setIsLoggedIn(false);
    setCurrentUser(null);
    setLoginForm({ email: '', password: '' });
    setError('');
  };

  const handleSetBudget = () => {
    if (budgetForm.amount && parseFloat(budgetForm.amount) > 0) {
      setBudgets(prev => ({
        ...prev,
        [currentUser.email]: parseFloat(budgetForm.amount)
      }));
      setBudgetForm({ amount: '' });
    }
  };

  const handleAddExpense = () => {
    if (expenseForm.description && expenseForm.amount && parseFloat(expenseForm.amount) > 0) {
      const expenseAmount = parseFloat(expenseForm.amount);
      const currentBudget = budgets[currentUser.email] || 0;
      
      if (expenseAmount <= currentBudget) {
        setBudgets(prev => ({
          ...prev,
          [currentUser.email]: currentBudget - expenseAmount
        }));
        
        setExpenses(prev => ({
          ...prev,
          [currentUser.email]: [
            ...(prev[currentUser.email] || []),
            {
              id: Date.now(),
              description: expenseForm.description,
              amount: expenseAmount,
              date: new Date().toLocaleDateString()
            }
          ]
        }));
        
        setExpenseForm({ description: '', amount: '' });
      } else {
        alert('Expense amount exceeds available budget!');
      }
    }
  };

  const userBudget = budgets[currentUser?.email] || 0;
  const userExpenses = expenses[currentUser?.email] || [];

  if (!isLoggedIn) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
        <div className="bg-white rounded-lg shadow-xl p-8 w-full max-w-md">
          <div className="text-center mb-8">
            <div className="mx-auto w-16 h-16 bg-indigo-600 rounded-full flex items-center justify-center mb-4">
              <User className="w-8 h-8 text-white" />
            </div>
            <h1 className="text-2xl font-bold text-gray-900">Budget Management</h1>
            <p className="text-gray-600 mt-2">Sign in to manage your budget</p>
          </div>

          <div className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Email Address
              </label>
              <input
                type="email"
                value={loginForm.email}
                onChange={(e) => setLoginForm(prev => ({ ...prev, email: e.target.value }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                placeholder="Enter your email"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Password
              </label>
              <input
                type="password"
                value={loginForm.password}
                onChange={(e) => setLoginForm(prev => ({ ...prev, password: e.target.value }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                placeholder="Enter your password"
              />
            </div>

            {error && (
              <div className="text-red-600 text-sm text-center bg-red-50 p-2 rounded">
                {error}
              </div>
            )}

            <button
              onClick={handleLogin}
              className="w-full bg-indigo-600 text-white py-2 px-4 rounded-md hover:bg-indigo-700 transition duration-200 font-medium"
            >
              Sign In
            </button>
          </div>

          <div className="mt-8 pt-6 border-t border-gray-200">
            <h3 className="text-sm font-medium text-gray-700 mb-3">Demo Credentials:</h3>
            <div className="text-xs text-gray-600 space-y-1">
              <div><strong>Admin:</strong> admin@company.com / admin123</div>
              <div><strong>Manager:</strong> manager@company.com / manager123</div>
              <div><strong>Employee:</strong> employee@company.com / emp123</div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <div className="flex items-center">
              <DollarSign className="w-8 h-8 text-indigo-600 mr-3" />
              <h1 className="text-2xl font-bold text-gray-900">Budget Dashboard</h1>
            </div>
            <div className="flex items-center space-x-4">
              <div className="text-right">
                <p className="text-sm font-medium text-gray-900">{currentUser.name}</p>
                <p className="text-xs text-gray-500">{currentUser.role}</p>
              </div>
              <button
                onClick={handleLogout}
                className="flex items-center text-gray-600 hover:text-gray-900 transition duration-200"
              >
                <LogOut className="w-5 h-5" />
              </button>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Budget Overview */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-lg shadow p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">Budget Overview</h2>
              <div className="text-center">
                <div className="text-3xl font-bold text-indigo-600 mb-2">
                  ${userBudget.toFixed(2)}
                </div>
                <p className="text-gray-600">Available Budget</p>
              </div>
              
              <div className="mt-6 pt-6 border-t">
                <h3 className="text-sm font-medium text-gray-700 mb-3">Set Budget</h3>
                <div className="space-y-3">
                  <input
                    type="number"
                    step="0.01"
                    value={budgetForm.amount}
                    onChange={(e) => setBudgetForm({ amount: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    placeholder="Enter budget amount"
                  />
                  <button
                    onClick={handleSetBudget}
                    className="w-full bg-green-600 text-white py-2 px-4 rounded-md hover:bg-green-700 transition duration-200 flex items-center justify-center"
                  >
                    <Plus className="w-4 h-4 mr-2" />
                    Set Budget
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Add Expense */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-lg shadow p-6 mb-8">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">Add Expense</h2>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <input
                  type="text"
                  value={expenseForm.description}
                  onChange={(e) => setExpenseForm(prev => ({ ...prev, description: e.target.value }))}
                  className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  placeholder="Expense description"
                />
                <input
                  type="number"
                  step="0.01"
                  value={expenseForm.amount}
                  onChange={(e) => setExpenseForm(prev => ({ ...prev, amount: e.target.value }))}
                  className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  placeholder="Amount"
                />
                <button
                  onClick={handleAddExpense}
                  className="bg-red-600 text-white py-2 px-4 rounded-md hover:bg-red-700 transition duration-200 flex items-center justify-center"
                >
                  <Minus className="w-4 h-4 mr-2" />
                  Add Expense
                </button>
              </div>
            </div>

            {/* Expense History */}
            <div className="bg-white rounded-lg shadow p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">Recent Expenses</h2>
              {userExpenses.length === 0 ? (
                <p className="text-gray-500 text-center py-8">No expenses recorded yet</p>
              ) : (
                <div className="space-y-3">
                  {userExpenses.slice().reverse().map((expense) => (
                    <div key={expense.id} className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                      <div>
                        <p className="font-medium text-gray-900">{expense.description}</p>
                        <p className="text-sm text-gray-500">{expense.date}</p>
                      </div>
                      <div className="text-right">
                        <p className="font-semibold text-red-600">-${expense.amount.toFixed(2)}</p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default BudgetApp;