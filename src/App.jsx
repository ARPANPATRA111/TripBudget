import React, { useState, useMemo, useEffect, useCallback } from 'react';
import { Users, Eye, EyeOff, Plus, X, DollarSign, Calendar, Tag, Edit, Search, Filter, Download, ArrowUp, ArrowDown } from 'lucide-react';
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

// Helper function to get user initials
const getInitials = (email) => {
  if (!email) return '?';
  const namePart = email.split('@')[0];
  const parts = namePart.split(/[._-]/);
  return parts.map(part => part.charAt(0).toUpperCase()).join('').substring(0, 2);
};

// Helper function to generate random color based on email
const getColorFromEmail = (email) => {
  if (!email) return '#6b7280';
  const colors = [
    '#3b82f6', '#6366f1', '#8b5cf6', '#a855f7', '#d946ef', '#ec4899',
    '#f43f5e', '#ef4444', '#f97316', '#f59e0b', '#10b981', '#14b8a6'
  ];
  const hash = email.split('').reduce((acc, char) => char.charCodeAt(0) + acc, 0);
  return colors[hash % colors.length];
};

export default function App() {
  // State variables
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [showFilters, setShowFilters] = useState(false);
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

  // New state for search and filters
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategories, setSelectedCategories] = useState([]);
  const [sortConfig, setSortConfig] = useState({ key: 'timestamp', direction: 'desc' });
  const [exporting, setExporting] = useState(false);

  const categories = ['Food', 'Water', 'Taxi', 'Utilities', 'Rooms', 'Rafting', 'Renting', 'Other'];

  // Fetch data from Supabase
  const fetchBudgetData = useCallback(async () => {
    setLoading(true);
    try {
      const { data: budgetData, error: fetchError } = await supabase
        .from('user_budgets')
        .select('*');

      if (fetchError) {
        console.error("Error fetching data:", fetchError);
        throw new Error('Failed to fetch budget data');
      }

      const formattedData = budgetData.reduce((acc, user) => {
        acc[user.user_email] = user.data;
        return acc;
      }, {});
      setUsersData(formattedData);
    } catch (error) {
      console.error("Error in fetchBudgetData:", error);
      alert('Database error occurred. Please try again later.');
    } finally {
      setLoading(false);
    }
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

  // Combined expenses from all users with user info
  const allExpensesWithUsers = useMemo(() => {
    return Object.entries(usersData)
      .flatMap(([email, data]) =>
        data.expenses.map(expense => ({
          ...expense,
          userEmail: email,
          userName: email.split('@')[0],
          userRole: USER_CREDENTIALS[email]?.role || 'Unknown',
          timestamp: expense.timestamp || expense.date,
          userInitials: getInitials(email),
          userColor: getColorFromEmail(email)
        }))
      );
  }, [usersData]);

  // Filtered and sorted expenses
  const filteredExpenses = useMemo(() => {
    let filtered = [...allExpensesWithUsers];

    // Apply search filter
    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      filtered = filtered.filter(expense =>
        expense.description.toLowerCase().includes(term) ||
        expense.category.toLowerCase().includes(term) ||
        expense.userName.toLowerCase().includes(term)
      );
    }

    // Apply category filter
    if (selectedCategories.length > 0) {
      filtered = filtered.filter(expense =>
        selectedCategories.includes(expense.category)
      );
    }

    // Apply sorting
    if (sortConfig.key) {
      filtered.sort((a, b) => {
        if (a[sortConfig.key] < b[sortConfig.key]) {
          return sortConfig.direction === 'asc' ? -1 : 1;
        }
        if (a[sortConfig.key] > b[sortConfig.key]) {
          return sortConfig.direction === 'asc' ? 1 : -1;
        }
        return 0;
      });
    }

    return filtered;
  }, [allExpensesWithUsers, searchTerm, selectedCategories, sortConfig]);

  // Calculate total budget across all users
  const totalBudget = useMemo(() => {
    return allUsersStats.reduce((sum, user) => sum + user.remaining, 0);
  }, [allUsersStats]);

  // Request sort
  const requestSort = (key) => {
    let direction = 'desc';
    if (sortConfig.key === key && sortConfig.direction === 'desc') {
      direction = 'asc';
    }
    setSortConfig({ key, direction });
  };

  // Toggle category selection
  const toggleCategory = (category) => {
    setSelectedCategories(prev =>
      prev.includes(category)
        ? prev.filter(c => c !== category)
        : [...prev, category]
    );
  };

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

    try {
      const updatedUserData = {
        ...currentUserData,
        budget: newBudget,
        budgetSet: true
      };

      const { error: upsertError } = await supabase
        .from('user_budgets')
        .upsert({ user_email: currentUser.email, data: updatedUserData });

      if (upsertError) {
        throw new Error(upsertError.message);
      }

      setBudgetInput('');
      await fetchBudgetData();
    } catch (error) {
      console.error('Error setting budget:', error);
      alert('Failed to update budget. Please try again.');
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

    try {
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
        throw new Error(upsertError.message);
      }

      setExpenseAmount('');
      setExpenseDescription('');
      setExpenseCategory('');
      setShowExpenseDialog(false);
      setEditingExpense(null);
      await fetchBudgetData();
    } catch (error) {
      console.error('Error adding expense:', error);
      alert('Failed to add expense. Please try again.');
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

    try {
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
        throw new Error(upsertError.message);
      }

      setExpenseAmount('');
      setExpenseDescription('');
      setExpenseCategory('');
      setShowExpenseDialog(false);
      setEditingExpense(null);
      await fetchBudgetData();
    } catch (error) {
      console.error('Error updating expense:', error);
      alert('Failed to update expense. Please try again.');
    }
  };

  // Export expenses to CSV
  const exportToCSV = async () => {
    setExporting(true);
    try {
      const csvContent = [
        ['Date', 'User', 'Role', 'Category', 'Description', 'Amount'],
        ...filteredExpenses.map(expense => [
          formatDate(expense.timestamp),
          expense.userName,
          expense.userRole,
          expense.category,
          expense.description,
          expense.amount.toFixed(2)
        ])
      ].map(e => e.join(',')).join('\n');

      const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.setAttribute('href', url);
      link.setAttribute('download', `expenses_${new Date().toISOString().split('T')[0]}.csv`);
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } catch (error) {
      console.error('Error exporting to CSV:', error);
      alert('Failed to export expenses. Please try again.');
    } finally {
      setExporting(false);
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

  // Budget progress percentage
  const budgetProgress = useMemo(() => {
    if (!currentUserData.budget || currentUserData.budget <= 0) return 0;
    return Math.min(100, (totalExpenses / currentUserData.budget) * 100);
  }, [currentUserData, totalExpenses]);

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
              <div
                className="w-7 h-7 rounded-md flex items-center justify-center text-white"
                style={{ backgroundColor: getColorFromEmail(currentUser.email) }}
              >
                {getInitials(currentUser.email)}
              </div>
              <div>
                <h1 className="text-sm text-gray-900 truncate max-w-[120px] uppercase font-bold">
                  {currentUser.email.split('@')[0]}
                </h1>
                <span className={`text-xs ${currentUser.role === 'Admin' ? 'text-blue-400' : 'text-green-600'}`}>
                  {currentUser.role}
                </span>
              </div>
            </div>

            <div className="flex items-center space-x-4">
              <button
                onClick={() => setShowFilters(!showFilters)}
                className={`p-1.5 rounded-md transition-colors ${showFilters
                    ? 'bg-blue-100 text-blue-600'
                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                  }`}
                title="Toggle filters"
              >
                <Filter size={16} />
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

        {/* Budget progress bar */}
        {currentUserData.budgetSet && (
          <div className="mb-4">
            <div className="flex justify-between text-xs text-gray-600 mb-1">
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
        )}

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

        {/* Search and filter controls */}
        {/* {currentUserData.budgetSet && (
          <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-200 mb-4">
            <div className="flex items-center mb-3">
              <Search className="w-5 h-5 text-gray-400 mr-2" />
              <input
                type="text"
                placeholder="Search expenses..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="flex-1 px-3 py-2 text-gray-700 bg-gray-50 rounded-lg border border-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
              />
            </div>
            
            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <Filter className="w-5 h-5 text-gray-400 mr-2" />
                <div className="flex flex-wrap gap-2">
                  {categories.map(category => (
                    <button
                      key={category}
                      onClick={() => toggleCategory(category)}
                      className={`text-xs px-2 py-1 rounded-full ${
                        selectedCategories.includes(category)
                          ? 'bg-blue-100 text-blue-800 border border-blue-200'
                          : 'bg-gray-100 text-gray-800 border border-gray-200 hover:bg-gray-200'
                      }`}
                    >
                      {category}
                    </button>
                  ))}
                </div>
              </div>
              
              <button
                onClick={exportToCSV}
                disabled={exporting}
                className="flex items-center text-xs px-3 py-1.5 bg-green-100 text-green-800 rounded-lg hover:bg-green-200 disabled:opacity-50"
              >
                {exporting ? 'Exporting...' : (
                  <>
                    <Download size={14} className="mr-1" />
                    Export
                  </>
                )}
              </button>
            </div>
          </div>
        )} */}

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
                    <div className="flex items-center">
                      <div
                        className="w-8 h-8 rounded-full flex items-center justify-center text-white mr-2"
                        style={{ backgroundColor: getColorFromEmail(user.email) }}
                      >
                        {getInitials(user.email)}
                      </div>
                      <div className="truncate">
                        <p className="text-sm font-medium text-gray-900 truncate">
                          {user.email.split('@')[0]}
                        </p>
                        <span className={`text-xs ${user.role === 'Admin' ? 'text-purple-600' : 'text-green-600'
                          }`}>
                          {user.role}
                        </span>
                      </div>
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
                      <span className={`font-medium ${user.remaining >= 0 ? 'text-green-600' : 'text-red-600'
                        }`}>
                        ${user.remaining.toFixed(2)}
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Filter section - shown when showFilters is true */}
        {showFilters && (
          <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-200 mb-4">
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-sm font-medium text-gray-900">Filters</h3>
              <button
                onClick={() => setShowFilters(false)}
                className="text-gray-400 hover:text-gray-500"
              >
                <X size={16} />
              </button>
            </div>

            <div className="flex items-center mb-3">
              <Search className="w-5 h-5 text-gray-400 mr-2" />
              <input
                type="text"
                placeholder="Search expenses..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="flex-1 px-3 py-2 text-gray-700 bg-gray-50 rounded-lg border border-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
              />
            </div>

            <div className="mb-2">
              <div className="flex items-center text-sm text-gray-600 mb-2">
                <Filter className="w-4 h-4 text-gray-400 mr-1" />
                <span>Categories</span>
              </div>
              <div className="flex flex-wrap gap-2">
                {categories.map(category => (
                  <button
                    key={category}
                    onClick={() => toggleCategory(category)}
                    className={`text-xs px-2 py-1 rounded-full ${selectedCategories.includes(category)
                        ? 'bg-blue-100 text-blue-800 border border-blue-200'
                        : 'bg-gray-100 text-gray-800 border border-gray-200 hover:bg-gray-200'
                      }`}
                  >
                    {category}
                  </button>
                ))}
              </div>
            </div>

            <button
              onClick={exportToCSV}
              disabled={exporting}
              className="w-full flex items-center justify-center text-xs px-3 py-1.5 bg-green-100 text-green-800 rounded-lg hover:bg-green-200 disabled:opacity-50 mt-2"
            >
              {exporting ? 'Exporting...' : (
                <>
                  <Download size={14} className="mr-1" />
                  Export to CSV
                </>
              )}
            </button>
          </div>
        )}

        {/* Expense lists */}
        <div className="space-y-4">
          {/* User's expenses */}
          <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-200">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-lg font-semibold text-gray-900">Your Expenses</h2>
              <div className="flex space-x-2">
                <button
                  onClick={() => requestSort('amount')}
                  className="flex items-center text-xs px-2 py-1 bg-gray-100 rounded-lg"
                >
                  Amount {sortConfig.key === 'amount' && (
                    sortConfig.direction === 'asc' ? <ArrowUp size={12} className="ml-1" /> : <ArrowDown size={12} className="ml-1" />
                  )}
                </button>
                <button
                  onClick={() => requestSort('timestamp')}
                  className="flex items-center text-xs px-2 py-1 bg-gray-100 rounded-lg"
                >
                  Date {sortConfig.key === 'timestamp' && (
                    sortConfig.direction === 'asc' ? <ArrowUp size={12} className="ml-1" /> : <ArrowDown size={12} className="ml-1" />
                  )}
                </button>
              </div>
            </div>
            {currentUserData.expenses.length > 0 ? (
              <div className="space-y-2">
                {currentUserData.expenses
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
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-lg font-semibold text-gray-900 flex items-center">
                  <Users className="mr-2 w-5 h-5 text-purple-600" />
                  Recent Activity
                </h2>
                <div className="flex space-x-2">
                  <button
                    onClick={() => requestSort('amount')}
                    className="flex items-center text-xs px-2 py-1 bg-gray-100 rounded-lg"
                  >
                    Amount {sortConfig.key === 'amount' && (
                      sortConfig.direction === 'asc' ? <ArrowUp size={12} className="ml-1" /> : <ArrowDown size={12} className="ml-1" />
                    )}
                  </button>
                  <button
                    onClick={() => requestSort('timestamp')}
                    className="flex items-center text-xs px-2 py-1 bg-gray-100 rounded-lg"
                  >
                    Date {sortConfig.key === 'timestamp' && (
                      sortConfig.direction === 'asc' ? <ArrowUp size={12} className="ml-1" /> : <ArrowDown size={12} className="ml-1" />
                    )}
                  </button>
                </div>
              </div>
              {filteredExpenses.length > 0 ? (
                <div className="space-y-2">
                  {filteredExpenses.slice(0, 10).map((expense, index) => (
                    <div key={`${expense.id}-${index}`} className="p-3 bg-gray-50 rounded-lg border border-gray-200">
                      <div className="flex justify-between items-start">
                        <div className="flex-1">
                          <div className="flex flex-wrap items-center gap-1.5 mb-1.5">
                            <div
                              className="w-6 h-6 rounded-full flex items-center justify-center text-white text-xs mr-1"
                              style={{ backgroundColor: expense.userColor }}
                            >
                              {expense.userInitials}
                            </div>
                            <span className="text-sm font-medium text-gray-900">
                              {expense.userName}
                            </span>
                            <span className="text-xs text-gray-500">
                              {expense.userRole}
                            </span>
                          </div>
                          <div className="flex items-center space-x-1.5 mb-1">
                            <span
                              className="text-sm text-gray-700 cursor-pointer hover:underline"
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
                        <div className="ml-3">
                          <span className="text-sm font-semibold text-red-600">
                            ${expense.amount.toFixed(2)}
                          </span>
                        </div>
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
                  <p className="text-gray-400 text-xs">Expenses will appear here</p>
                </div>
              )}
            </div>
          )}
        </div>
      </main>

      {/* Expense Dialog */}
      {showExpenseDialog && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg shadow-xl w-full max-w-md">
            <div className="p-5">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-lg font-semibold text-gray-900">
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
                  <label className="block text-sm font-medium text-gray-700 mb-1">Amount ($)</label>
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
                  <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                  <input
                    type="text"
                    value={expenseDescription}
                    onChange={(e) => setExpenseDescription(e.target.value)}
                    className="w-full px-3 py-2 text-gray-700 bg-gray-50 rounded-lg border border-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                    placeholder="What was this expense for?"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Category</label>
                  <select
                    value={expenseCategory}
                    onChange={(e) => setExpenseCategory(e.target.value)}
                    className="w-full px-3 py-2 text-gray-700 bg-gray-50 rounded-lg border border-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                  >
                    <option value="">Select a category</option>
                    {categories.map(category => (
                      <option key={category} value={category}>{category}</option>
                    ))}
                  </select>
                </div>
                <div className="pt-2">
                  <button
                    onClick={editingExpense ? handleUpdateExpense : handleAddExpense}
                    className="w-full py-2.5 font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-all"
                  >
                    {editingExpense ? 'Update Expense' : 'Add Expense'}
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Description Dialog */}
      {showDescriptionDialog && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg shadow-xl w-full max-w-md">
            <div className="p-5">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-lg font-semibold text-gray-900">Expense Description</h2>
                <button
                  onClick={() => setShowDescriptionDialog(false)}
                  className="text-gray-400 hover:text-gray-500"
                >
                  <X size={20} />
                </button>
              </div>
              <div className="bg-gray-50 p-4 rounded-lg">
                <p className="text-gray-700 whitespace-pre-wrap">{fullDescription}</p>
              </div>
              <div className="mt-4">
                <button
                  onClick={() => setShowDescriptionDialog(false)}
                  className="w-full py-2 font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-all"
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