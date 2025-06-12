import React, { useState, useMemo, useEffect, useCallback } from 'react';
import { Users, Eye, EyeOff, Plus, X, DollarSign, Calendar, Tag, Edit } from 'lucide-react';
import { createClient } from 'https://cdn.jsdelivr.net/npm/@supabase/supabase-js/+esm';

// --- SUPABASE SETUP ---
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Missing Supabase environment variables');
}
const supabase = createClient(supabaseUrl, supabaseAnonKey);

// User credentials moved to environment variables
const USER_CREDENTIALS = {
  [import.meta.env.VITE_ADMIN_USER]: { password: import.meta.env.VITE_ADMIN_PASS, role: 'Admin' },
  [import.meta.env.VITE_USER1]: { password: import.meta.env.VITE_USER1_PASS, role: 'User' },
  [import.meta.env.VITE_USER2]: { password: import.meta.env.VITE_USER2_PASS, role: 'User' },
  [import.meta.env.VITE_USER3]: { password: import.meta.env.VITE_USER3_PASS, role: 'User' },
  [import.meta.env.VITE_USER4]: { password: import.meta.env.VITE_USER4_PASS, role: 'User' },
};

export default function App() {
  // State variables
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [currentUser, setCurrentUser] = useState(null);
  const [usersData, setUsersData] = useState({});
  const [loading, setLoading] = useState(true);
  const [showAllUsers, setShowAllUsers] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [budgetInput, setBudgetInput] = useState('');
  const [showTotalBudget, setShowTotalBudget] = useState(false);

  // Dialog state
  const [showExpenseDialog, setShowExpenseDialog] = useState(false);
  const [expenseAmount, setExpenseAmount] = useState('');
  const [expenseDescription, setExpenseDescription] = useState('');
  const [expenseCategory, setExpenseCategory] = useState('');
  const [editingExpense, setEditingExpense] = useState(null);

  // Description dialog state
  const [showDescriptionDialog, setShowDescriptionDialog] = useState(false);
  const [fullDescription, setFullDescription] = useState('');

  const categories = ['Food', 'Water','Taxi','Utilities','Rooms','Rafting','Renting','Other'];

  // Fetch data from Supabase
  const fetchBudgetData = useCallback(async () => {
    setLoading(true);
    const { data: budgetData, error: fetchError } = await supabase
      .from('user_budgets')
      .select('*');

    if (fetchError) {
      console.error("Error fetching data:", fetchError);
      alert('Database error occurred.');
    } else {
      const formattedData = budgetData.reduce((acc, user) => {
        acc[user.user_email] = user.data;
        return acc;
      }, {});
      setUsersData(formattedData);
    }
    setLoading(false);
  }, []);

  useEffect(() => {
    fetchBudgetData();
  }, [fetchBudgetData]);

  // Memoized values
  const currentUserData = useMemo(() => {
    return isLoggedIn && usersData[currentUser?.email] ? usersData[currentUser.email] : { budget: 0, expenses: [], budgetSet: false };
  }, [isLoggedIn, usersData, currentUser]);

  const totalExpenses = useMemo(() => {
    return currentUserData?.expenses.reduce((sum, expense) => sum + expense.amount, 0) || 0;
  }, [currentUserData]);

  const remainingBudget = useMemo(() => {
    return (currentUserData?.budget || 0) - totalExpenses;
  }, [currentUserData, totalExpenses]);

  const allUsersStats = useMemo(() => {
    return Object.entries(usersData).map(([email, data]) => {
      const totalExp = data.expenses.reduce((sum, exp) => sum + exp.amount, 0);
      const remaining = data.budget - totalExp;
      const role = USER_CREDENTIALS[email]?.role || 'Unknown';
      return {
        email,
        role,
        budget: data.budget,
        totalExpenses: totalExp,
        remaining,
        expenseCount: data.expenses.length,
        budgetSet: data.budgetSet || false
      };
    });
  }, [usersData]);

  // Combined expenses from all users with timestamps
  const allExpensesWithUsers = useMemo(() => {
    return Object.entries(usersData)
      .flatMap(([email, data]) =>
        data.expenses.map(expense => ({
          ...expense,
          userEmail: email,
          userRole: USER_CREDENTIALS[email]?.role || 'Unknown',
          timestamp: expense.timestamp || expense.date
        }))
      )
      .sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));
  }, [usersData]);

  // Calculate total budget across all users
  const totalBudget = useMemo(() => {
    return allUsersStats.reduce((sum, user) => sum + user.remaining, 0);
  }, [allUsersStats]);

  // Authentication handlers
  const handleLogin = () => {
    const user = USER_CREDENTIALS[email];
    if (user && user.password === password) {
      setIsLoggedIn(true);
      setCurrentUser({ email, role: user.role });
      setError('');
      setPassword('');
    } else {
      setError('Invalid email or password. Please try again.');
    }
  };

  const handleLogout = () => {
    setIsLoggedIn(false);
    setCurrentUser(null);
    setEmail('');
    setPassword('');
    setShowAllUsers(false);
    setShowExpenseDialog(false);
  };

  // Budget handler
  const handleSetBudget = async () => {
    const newBudget = parseFloat(budgetInput);
    if (isNaN(newBudget) || newBudget <= 0) {
      alert('Please enter a valid positive number for the budget.');
      return;
    }

    const updatedUserData = {
      ...currentUserData,
      budget: newBudget,
      budgetSet: true
    };

    const { error: upsertError } = await supabase
      .from('user_budgets')
      .upsert({ user_email: currentUser.email, data: updatedUserData });

    if (upsertError) {
      console.error('Error setting budget:', upsertError);
      alert('Failed to update budget.');
    } else {
      setBudgetInput('');
      await fetchBudgetData();
    }
  };

  // Expense handlers
  const handleAddExpense = async () => {
    const amount = parseFloat(expenseAmount);
    if (isNaN(amount) || amount <= 0 || expenseDescription.trim() === '') {
      alert('Please enter valid expense details.');
      return;
    }

    if (amount > remainingBudget) {
      alert("Expense exceeds remaining budget.");
      return;
    }

    const newExpense = {
      id: Date.now(),
      description: expenseDescription.trim(),
      amount: amount,
      date: new Date().toISOString().split('T')[0],
      timestamp: new Date().toISOString(),
      category: expenseCategory || 'Other',
      edited: false
    };

    const updatedUserData = {
      ...currentUserData,
      expenses: [...currentUserData.expenses, newExpense],
    };

    const { error: upsertError } = await supabase
      .from('user_budgets')
      .upsert({ user_email: currentUser.email, data: updatedUserData });

    if (upsertError) {
      console.error('Error adding expense:', upsertError);
      alert('Failed to add expense.');
    } else {
      setExpenseAmount('');
      setExpenseDescription('');
      setExpenseCategory('');
      setShowExpenseDialog(false);
      setEditingExpense(null);
      await fetchBudgetData();
    }
  };

  const handleEditExpense = (expense) => {
    setEditingExpense(expense);
    setExpenseDescription(expense.description);
    setExpenseAmount(expense.amount);
    setExpenseCategory(expense.category);
    setShowExpenseDialog(true);
  };

  const handleUpdateExpense = async () => {
    const amount = parseFloat(expenseAmount);
    if (isNaN(amount) || amount <= 0 || expenseDescription.trim() === '') {
      alert('Please enter valid expense details.');
      return;
    }

    const updatedExpenses = currentUserData.expenses.map(exp => {
      if (exp.id === editingExpense.id) {
        return {
          ...exp,
          description: expenseDescription.trim(),
          amount: amount,
          category: expenseCategory || 'Other',
          edited: true,
          editedAt: new Date().toISOString()
        };
      }
      return exp;
    });

    const updatedUserData = {
      ...currentUserData,
      expenses: updatedExpenses,
    };

    const { error: upsertError } = await supabase
      .from('user_budgets')
      .upsert({ user_email: currentUser.email, data: updatedUserData });

    if (upsertError) {
      console.error('Error updating expense:', upsertError);
      alert('Failed to update expense.');
    } else {
      setExpenseAmount('');
      setExpenseDescription('');
      setExpenseCategory('');
      setShowExpenseDialog(false);
      setEditingExpense(null);
      await fetchBudgetData();
    }
  };

  // Format date for display
  const formatDate = (timestamp) => {
    const date = new Date(timestamp);
    return date.toLocaleString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  // Truncate description
  const truncateDescription = (desc) => {
    if (desc.length <= 20) return desc;
    return `${desc.substring(0, 20)}...`;
  };

  // Loading state
  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <div className="text-xl font-semibold text-gray-700">Loading...</div>
        </div>
      </div>
    );
  }

  // Login screen
  if (!isLoggedIn) {
    return (
      <div className="bg-gradient-to-br from-blue-50 to-indigo-100 min-h-screen flex items-center justify-center p-4">
        <div className="w-full max-w-md">
          <div className="bg-white p-6 rounded-2xl shadow-xl">
            <div className="text-center mb-6">
              <div className="mx-auto w-16 h-16 bg-blue-600 rounded-full flex items-center justify-center mb-4">
                <DollarSign className="w-8 h-8 text-white" />
              </div>
              <h1 className="text-2xl font-bold text-gray-900 mb-1">Budget Tracker</h1>
              <p className="text-gray-600 text-sm">Manage your finances efficiently</p>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Name</label>
                <input
                  type="input"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full px-4 py-2 text-gray-700 bg-gray-50 rounded-lg border border-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                  placeholder="Enter your Name"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Password</label>
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full px-4 py-2 text-gray-700 bg-gray-50 rounded-lg border border-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                  placeholder="Enter your password"
                />
              </div>

              {error && (
                <div className="bg-red-50 border border-red-200 rounded-lg p-3">
                  <p className="text-red-600 text-sm text-center">{error}</p>
                </div>
              )}

              <button
                onClick={handleLogin}
                className="w-full py-2.5 font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-all"
              >
                Sign In
              </button>

              <div className="bg-gray-50 rounded-lg p-3 text-center">
                <p className="text-xs text-gray-600 mb-1">Contact admin for access</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Main app
  return (
    <div className="bg-gray-50 min-h-screen">
      {/* Header */}
      <header className="bg-white shadow-sm sticky top-0 z-50 border-b border-gray-200">
        <div className="px-4">
          <div className="flex justify-between items-center h-14">
            <div className="flex items-center space-x-2">
              <div className="w-7 h-7 bg-blue-600 rounded-md flex items-center justify-center">
                <DollarSign className="w-4 h-4 text-white" />
              </div>
              <div>
                <h1 className="text-sm font-semibold text-gray-900 truncate max-w-[120px]">
                  {currentUser.email.split('@')[0]}
                </h1>
              </div>
            </div>

            {/* In the header section, remove the Admin check for the total budget button */}
            <div className="flex items-center space-x-2">
              <button
                onClick={() => setShowTotalBudget(!showTotalBudget)}
                className={`p-1.5 rounded-md transition-colors ${showTotalBudget
                    ? 'bg-green-100 text-green-600'
                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                  }`}
                title="Show total budget"
              >
                {showTotalBudget ? (
                  <span className="text-xs font-medium">${totalBudget.toFixed(2)}</span>
                ) : (
                  <DollarSign size={16} />
                )}
              </button>
              <button
                onClick={() => setShowAllUsers(!showAllUsers)}
                className={`p-1.5 rounded-md transition-colors ${showAllUsers
                    ? 'bg-purple-100 text-purple-600'
                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                  }`}
                title={showAllUsers ? 'Hide all users' : 'Show all users'}
              >
                {showAllUsers ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
              <button
                onClick={handleLogout}
                className="px-3 py-1.5 text-xs font-medium text-white bg-red-600 rounded-md hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2 transition-all"
              >
                Logout
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Main content */}
      <main className="px-4 py-4">
        {/* Budget summary cards */}
        <div className="grid grid-cols-3 gap-3 mb-6">
          <div className="bg-gradient-to-br from-green-400 to-green-600 p-4 rounded-lg shadow text-white">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-green-100 text-xs font-medium">Budget</p>
                <p className="text-lg font-bold">${(currentUserData.budget || 0).toFixed(2)}</p>
              </div>
              <DollarSign className="w-6 h-6 text-green-200" />
            </div>
          </div>

          <div className="bg-gradient-to-br from-red-400 to-red-600 p-4 rounded-lg shadow text-white">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-red-100 text-xs font-medium">Expenses</p>
                <p className="text-lg font-bold">${totalExpenses.toFixed(2)}</p>
              </div>
              <Tag className="w-6 h-6 text-red-200" />
            </div>
          </div>

          <div className="bg-gradient-to-br from-blue-400 to-blue-600 p-4 rounded-lg shadow text-white">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-blue-100 text-xs font-medium">Remaining</p>
                <p className="text-lg font-bold">${remainingBudget.toFixed(2)}</p>
              </div>
              <Calendar className="w-6 h-6 text-blue-200" />
            </div>
          </div>
        </div>

        {/* Budget setting - only show if not set */}
        {!currentUserData.budgetSet && (
          <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-200 mb-4">
            <h2 className="text-lg font-semibold text-gray-900 mb-3">Set Your Budget</h2>
            <div className="flex flex-col gap-2">
              <input
                type="number"
                value={budgetInput}
                onChange={(e) => setBudgetInput(e.target.value)}
                placeholder="Enter budget amount"
                className="w-full px-3 py-2 text-gray-700 bg-gray-50 rounded-lg border border-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
              />
              <button
                onClick={handleSetBudget}
                className="w-full py-2 font-medium text-white bg-green-600 rounded-lg hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2 transition-all"
              >
                Set Budget
              </button>
            </div>
            <p className="text-xs text-gray-500 mt-2">⚠️ Budget can only be set once</p>
          </div>
        )}

        {/* Add expense button */}
        {currentUserData.budgetSet && (
          <div className="mb-4">
            <button
              onClick={() => {
                setEditingExpense(null);
                setExpenseAmount('');
                setExpenseDescription('');
                setExpenseCategory('');
                setShowExpenseDialog(true);
              }}
              className="flex items-center justify-center space-x-2 w-full py-2.5 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-all shadow"
            >
              <Plus size={18} />
              <span>Add New Expense</span>
            </button>
          </div>
        )}

        {/* All users overview */}
        {showAllUsers && (
          <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-200 mb-4">
            <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
              <Users className="mr-2 w-5 h-5 text-blue-600" />
              All Users
            </h2>
            <div className="grid grid-cols-1 gap-3">
              {allUsersStats.map((user) => (
                <div
                  key={user.email}
                  className={`p-3 rounded-lg border transition-all ${user.email === currentUser.email
                      ? 'border-blue-200 bg-blue-50'
                      : 'border-gray-200 bg-white hover:border-gray-300'
                    }`}
                >
                  <div className="flex items-center justify-between mb-2">
                    <div className="truncate flex-1">
                      <p className="text-sm font-medium text-gray-900 truncate">{user.email.split('@')[0]}</p>
                      <span className={`inline-block text-xs px-1.5 py-0.5 rounded-full mt-1 ${user.role === 'Admin'
                          ? 'bg-purple-100 text-purple-800'
                          : 'bg-green-100 text-green-800'
                        }`}>
                        {user.role}
                      </span>
                    </div>
                  </div>
                  <div className="space-y-1.5">
                    <div className="flex justify-between text-xs">
                      <span className="text-gray-600">Budget:</span>
                      <span className="font-medium">${user.budget.toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between text-xs">
                      <span className="text-gray-600">Spent:</span>
                      <span className="font-medium text-red-600">${user.totalExpenses.toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between text-xs">
                      <span className="text-gray-600">Remaining:</span>
                      <span className={`font-medium ${user.remaining >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                        ${user.remaining.toFixed(2)}
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Expense lists */}
        <div className="space-y-4">
          {/* User's expenses */}
          <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-200">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Your Expenses</h2>
            {currentUserData.expenses.length > 0 ? (
              <div className="space-y-2">
                {currentUserData.expenses
                  .sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp))
                  .map(expense => (
                    <div key={expense.id} className="p-3 bg-gray-50 rounded-lg border border-gray-200 hover:border-gray-300 transition-all">
                      <div className="flex justify-between items-start">
                        <div className="flex-1">
                          <div className="flex items-center space-x-1.5 mb-1.5">
                            <span
                              className="text-sm font-medium text-gray-900 cursor-pointer hover:underline"
                              onClick={() => {
                                setFullDescription(expense.description);
                                setShowDescriptionDialog(true);
                              }}
                            >
                              {truncateDescription(expense.description)}
                            </span>
                            <span className="px-1.5 py-0.5 text-xs bg-blue-100 text-blue-800 rounded-full">
                              {expense.category}
                            </span>
                          </div>
                          <div className="text-xs text-gray-500">
                            {formatDate(expense.timestamp)}
                            {expense.edited && (
                              <span className="ml-2 text-gray-400 italic">
                                (edited {formatDate(expense.editedAt)})
                              </span>
                            )}
                          </div>
                        </div>
                        <div className="flex items-center space-x-2 ml-3">
                          <span className="text-sm font-semibold text-red-600">${expense.amount.toFixed(2)}</span>
                          <button
                            onClick={() => handleEditExpense(expense)}
                            className="text-blue-500 hover:text-blue-700 text-xs px-2 py-0.5 rounded-md hover:bg-blue-50 transition-all"
                          >
                            <Edit size={14} />
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
              </div>
            ) : (
              <div className="text-center py-8">
                <div className="text-gray-400 mb-3">
                  <Tag size={40} className="mx-auto" />
                </div>
                <p className="text-gray-500 text-sm">No expenses yet</p>
                <p className="text-gray-400 text-xs">Start tracking your spending!</p>
              </div>
            )}
          </div>

          {/* All users' recent expenses */}
          {showAllUsers && (
            <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-200">
              <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                <Users className="mr-2 w-5 h-5 text-purple-600" />
                Recent Activity
              </h2>
              {allExpensesWithUsers.length > 0 ? (
                <div className="space-y-2">
                  {allExpensesWithUsers.slice(0, 5).map((expense, index) => (
                    <div key={`${expense.id}-${index}`} className="p-3 bg-gray-50 rounded-lg border border-gray-200">
                      <div className="flex justify-between items-start">
                        <div className="flex-1">
                          <div className="flex flex-wrap items-center gap-1.5 mb-1.5">
                            <span
                              className="text-sm font-medium text-gray-900 cursor-pointer hover:underline"
                              onClick={() => {
                                setFullDescription(expense.description);
                                setShowDescriptionDialog(true);
                              }}
                            >
                              {truncateDescription(expense.description)}
                            </span>
                            <span className="px-1.5 py-0.5 text-xs bg-blue-100 text-blue-800 rounded-full">
                              {expense.category}
                            </span>
                            <span className={`text-xs px-1.5 py-0.5 rounded-full ${expense.userRole === 'Admin' ? 'bg-purple-100 text-purple-800' :
                                'bg-green-100 text-green-800'
                              }`}>
                              {expense.userEmail === currentUser.email ? 'You' : expense.userRole}
                            </span>
                          </div>
                          <div className="text-xs text-gray-500">
                            {formatDate(expense.timestamp)}
                            {expense.edited && (
                              <span className="ml-2 text-gray-400 italic">
                                (edited {formatDate(expense.editedAt)})
                              </span>
                            )}
                          </div>
                        </div>
                        <span className="text-sm font-semibold text-red-600 ml-3">${expense.amount.toFixed(2)}</span>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8">
                  <div className="text-gray-400 mb-3">
                    <Users size={40} className="mx-auto" />
                  </div>
                  <p className="text-gray-500 text-sm">No recent activity</p>
                </div>
              )}
            </div>
          )}
        </div>
      </main>

      {/* Expense Dialog */}
      {showExpenseDialog && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-sm mx-4 max-h-[90vh] overflow-y-auto">
            <div className="p-5">
              <div className="flex items-center justify-between mb-5">
                <h2 className="text-xl font-bold text-gray-900">
                  {editingExpense ? 'Edit Expense' : 'Add Expense'}
                </h2>
                <button
                  onClick={() => {
                    setShowExpenseDialog(false);
                    setEditingExpense(null);
                  }}
                  className="p-1 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-md transition-all"
                >
                  <X size={20} />
                </button>
              </div>

              <div className="space-y-3">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Description
                  </label>
                  <input
                    type="text"
                    value={expenseDescription}
                    onChange={(e) => {
                      if (e.target.value.length <= 80) {
                        setExpenseDescription(e.target.value);
                      }
                    }}
                    placeholder="Enter expense description"
                    className="w-full px-3 py-2 text-gray-700 bg-gray-50 rounded-lg border border-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                    maxLength={80}
                  />
                  <div className="text-right text-xs text-gray-500 mt-1">
                    {expenseDescription.length}/80 characters
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Category
                  </label>
                  <select
                    value={expenseCategory}
                    onChange={(e) => setExpenseCategory(e.target.value)}
                    className="w-full px-3 py-2 text-gray-700 bg-gray-50 rounded-lg border border-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                  >
                    <option value="">Select a category</option>
                    {categories.map(cat => (
                      <option key={cat} value={cat}>{cat}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Amount
                  </label>
                  <input
                    type="number"
                    value={expenseAmount}
                    onChange={(e) => setExpenseAmount(e.target.value)}
                    placeholder="Enter amount"
                    step="0.01"
                    min="0"
                    className="w-full px-3 py-2 text-gray-700 bg-gray-50 rounded-lg border border-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                  />
                  <div className="text-xs text-gray-500 mt-1">
                    Remaining budget: ${remainingBudget.toFixed(2)}
                  </div>
                </div>
              </div>

              <div className="flex space-x-2 mt-6">
                <button
                  onClick={() => {
                    setShowExpenseDialog(false);
                    setEditingExpense(null);
                  }}
                  className="flex-1 px-3 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 focus:outline-none focus:ring-2 focus:ring-gray-300 transition-all font-medium text-sm"
                >
                  Cancel
                </button>
                <button
                  onClick={editingExpense ? handleUpdateExpense : handleAddExpense}
                  className="flex-1 px-3 py-2 font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-all text-sm"
                >
                  {editingExpense ? 'Update Expense' : 'Add Expense'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Description Dialog */}
      {showDescriptionDialog && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-sm mx-4 max-h-[90vh] overflow-y-auto">
            <div className="p-5">
              <div className="flex items-center justify-between mb-5">
                <h2 className="text-xl font-bold text-gray-900">Expense Description</h2>
                <button
                  onClick={() => setShowDescriptionDialog(false)}
                  className="p-1 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-md transition-all"
                >
                  <X size={20} />
                </button>
              </div>

              <div className="bg-gray-50 p-4 rounded-lg">
                <p className="text-gray-800 whitespace-pre-wrap break-words">{fullDescription}</p>
              </div>

              <div className="mt-4">
                <button
                  onClick={() => setShowDescriptionDialog(false)}
                  className="w-full px-3 py-2 font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-all text-sm"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}