import React, { useState, useMemo, useEffect, useCallback } from 'react';
import { supabase } from './utils/supabase';
import { USER_CREDENTIALS } from './utils/auth';
import { getInitials, getColorFromEmail, formatDate, truncateDescription } from './utils/helpers';
import { Loading } from './components/common/Loading';
import { Login } from './components/auth/Login';
import { Header } from './components/layout/Header';
import { BudgetCards } from './components/budget/BudgetCards';
import { BudgetProgress } from './components/budget/BudgetProgress';
import { SetBudgetForm } from './components/budget/SetBudgetForm';
import { ExpenseDialog } from './components/expenses/ExpenseDialog';
import { ExpenseList } from './components/expenses/ExpenseList';
import { FiltersSection } from './components/expenses/FiltersSection';
import { CategoryStats } from './components/stats/CategoryStats';
import { UserStats } from './components/stats/UserStats';
import { Dialog } from './components/common/Dialog';
import { 
  Users, Eye, EyeOff, Plus, X, DollarSign, Calendar, Tag, Edit, 
  Search, PieChart, Download, ArrowUp, ArrowDown 
} from 'lucide-react';

export default function App() {
  // State variables
  const [showFilters, setShowFilters] = useState(false);
  const [dateRange, setDateRange] = useState({ start: '', end: '' });
  const [amountRange, setAmountRange] = useState({ min: '', max: '' });
  const [selectedUsers, setSelectedUsers] = useState([]);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [showStats, setShowStats] = useState(false);
  const [currentUser, setCurrentUser] = useState(null);
  const [usersData, setUsersData] = useState({});
  const [loading, setLoading] = useState(true);
  const [showAllUsers, setShowAllUsers] = useState(false);
  const [name, setName] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [budgetInput, setBudgetInput] = useState('');
  const [showTotalBudget, setShowTotalBudget] = useState(false);
  const [visibleExpenseCount, setVisibleExpenseCount] = useState(10);
  
  // Dialog state
  const [showExpenseDialog, setShowExpenseDialog] = useState(false);
  const [expenseAmount, setExpenseAmount] = useState('');
  const [expenseDescription, setExpenseDescription] = useState('');
  const [expenseCategory, setExpenseCategory] = useState('');
  const [editingExpense, setEditingExpense] = useState(null);

  // Description dialog state
  const [showDescriptionDialog, setShowDescriptionDialog] = useState(false);
  const [fullDescription, setFullDescription] = useState('');

  // Search and filters state
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategories, setSelectedCategories] = useState([]);
  const [sortConfig, setSortConfig] = useState({ key: 'timestamp', direction: 'desc' });
  const [exporting, setExporting] = useState(false);

  const categories = ['Food', 'Water', 'Taxi', 'Utilities', 'Rooms', 'Rafting', 'Other'];

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

  const filteredExpenses = useMemo(() => {
    let filtered = [...allExpensesWithUsers];

    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      filtered = filtered.filter(expense =>
        expense.description.toLowerCase().includes(term) ||
        expense.category.toLowerCase().includes(term) ||
        expense.userName.toLowerCase().includes(term)
      );
    }

    if (selectedCategories.length > 0) {
      filtered = filtered.filter(expense =>
        selectedCategories.includes(expense.category)
      );
    }

    if (selectedUsers.length > 0) {
      filtered = filtered.filter(expense =>
        selectedUsers.includes(expense.userEmail)
      );
    }

    if (dateRange.start || dateRange.end) {
      filtered = filtered.filter(expense => {
        const expenseDate = new Date(expense.timestamp).toISOString().split('T')[0];
        const startMatch = !dateRange.start || expenseDate >= dateRange.start;
        const endMatch = !dateRange.end || expenseDate <= dateRange.end;
        return startMatch && endMatch;
      });
    }

    if (amountRange.min || amountRange.max) {
      filtered = filtered.filter(expense => {
        const minMatch = !amountRange.min || expense.amount >= parseFloat(amountRange.min);
        const maxMatch = !amountRange.max || expense.amount <= parseFloat(amountRange.max);
        return minMatch && maxMatch;
      });
    }

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
  }, [allExpensesWithUsers, searchTerm, selectedCategories, selectedUsers, dateRange, amountRange, sortConfig]);

  const totalBudget = useMemo(() => {
    return allUsersStats.reduce((sum, user) => sum + user.remaining, 0);
  }, [allUsersStats]);

  const categorySpending = useMemo(() => {
    const spending = {};
    const totalBudgetSum = allUsersStats.reduce((sum, user) => sum + user.budget, 0);

    allExpensesWithUsers.forEach(expense => {
      if (!spending[expense.category]) {
        spending[expense.category] = 0;
      }
      spending[expense.category] += expense.amount;
    });

    return Object.entries(spending).map(([category, amount]) => ({
      category,
      amount,
      percentage: totalBudgetSum > 0 ? (amount / totalBudgetSum) * 100 : 0
    }));
  }, [allExpensesWithUsers, allUsersStats]);

  const budgetProgress = useMemo(() => {
    if (!currentUserData.budget || currentUserData.budget <= 0) return 0;
    return Math.min(100, (totalExpenses / currentUserData.budget) * 100);
  }, [currentUserData, totalExpenses]);

  // Helper functions
  const toggleUserFilter = (userEmail) => {
    setSelectedUsers(prev =>
      prev.includes(userEmail)
        ? prev.filter(u => u !== userEmail)
        : [...prev, userEmail]
    );
  };

  const clearAllFilters = () => {
    setSelectedCategories([]);
    setSelectedUsers([]);
    setDateRange({ start: '', end: '' });
    setAmountRange({ min: '', max: '' });
    setSearchTerm('');
  };

  const getActiveFilterCount = () => {
    let count = 0;
    if (selectedCategories.length > 0) count++;
    if (selectedUsers.length > 0) count++;
    if (dateRange.start || dateRange.end) count++;
    if (amountRange.min || amountRange.max) count++;
    if (searchTerm) count++;
    return count;
  };

  const requestSort = (key) => {
    let direction = 'desc';
    if (sortConfig.key === key && sortConfig.direction === 'desc') {
      direction = 'asc';
    }
    setSortConfig({ key, direction });
  };

  const toggleCategory = (category) => {
    setSelectedCategories(prev =>
      prev.includes(category)
        ? prev.filter(c => c !== category)
        : [...prev, category]
    );
  };

  // Authentication handlers
  const handleLogin = () => {
    const email = `${name.toLowerCase()}`;
    const user = USER_CREDENTIALS[email];
    if (user && user.password === password) {
      setIsLoggedIn(true);
      setCurrentUser({ email, role: user.role });
      setError('');
      setPassword('');
    } else {
      setError('Invalid name or password. Please try again.');
    }
  };

  const handleLogout = () => {
    setIsLoggedIn(false);
    setCurrentUser(null);
    setName('');
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

  // Check if user is Viewer (read-only)
  const isViewer = currentUser?.role === 'Viewer';
  const canEdit = !isViewer && currentUserData.budgetSet;

  // Loading state
  if (loading) {
    return <Loading />;
  }

  // Login screen
  if (!isLoggedIn) {
    return <Login 
      name={name} 
      setName={setName} 
      password={password} 
      setPassword={setPassword} 
      error={error} 
      handleLogin={handleLogin} 
    />;
  }

  return (
    <div className="bg-gray-50 min-h-screen">
      <Header 
        currentUser={currentUser}
        showStats={showStats}
        setShowStats={setShowStats}
        showTotalBudget={showTotalBudget}
        setShowTotalBudget={setShowTotalBudget}
        showAllUsers={showAllUsers}
        setShowAllUsers={setShowAllUsers}
        totalBudget={totalBudget}
        handleLogout={handleLogout}
      />

      <main className="px-4 py-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
        <BudgetCards 
          budget={currentUserData.budget} 
          totalExpenses={totalExpenses} 
          remainingBudget={remainingBudget} 
        />

        {currentUserData.budgetSet && (
          <BudgetProgress 
            totalExpenses={totalExpenses} 
            remainingBudget={remainingBudget} 
            budgetProgress={budgetProgress} 
          />
        )}

        {!currentUserData.budgetSet && !isViewer && (
          <SetBudgetForm 
            budgetInput={budgetInput} 
            setBudgetInput={setBudgetInput} 
            handleSetBudget={handleSetBudget} 
          />
        )}

        {canEdit && (
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

        {showStats && (
          <CategoryStats 
            showStats={showStats}
            setShowStats={setShowStats}
            categorySpending={categorySpending}
          />
        )}

        {showAllUsers && (
          <UserStats 
            allUsersStats={allUsersStats}
            currentUser={currentUser}
          />
        )}

        <div className="space-y-4">
          {!isViewer && (
            <ExpenseList
              title="Your Expenses"
              expenses={currentUserData.expenses}
              sortConfig={sortConfig}
              requestSort={requestSort}
              canEdit={canEdit}
              onViewDescription={(desc) => {
                setFullDescription(desc);
                setShowDescriptionDialog(true);
              }}
              onEdit={handleEditExpense}
            />
          )}

          <FiltersSection
            searchTerm={searchTerm}
            setSearchTerm={setSearchTerm}
            showFilters={showFilters}
            setShowFilters={setShowFilters}
            selectedCategories={selectedCategories}
            toggleCategory={toggleCategory}
            selectedUsers={selectedUsers}
            toggleUserFilter={toggleUserFilter}
            usersData={usersData}
            dateRange={dateRange}
            setDateRange={setDateRange}
            amountRange={amountRange}
            setAmountRange={setAmountRange}
            categories={categories}
            clearAllFilters={clearAllFilters}
            filteredExpenses={filteredExpenses}
            allExpensesWithUsers={allExpensesWithUsers}
            exporting={exporting}
            exportToCSV={exportToCSV}
            isViewer={isViewer}
            getActiveFilterCount={getActiveFilterCount}
            getColorFromEmail={getColorFromEmail}
          />

          <ExpenseList
            title="Recent Activity"
            expenses={filteredExpenses.slice(0, visibleExpenseCount)}
            sortConfig={sortConfig}
            requestSort={requestSort}
            canEdit={false}
            onViewDescription={(desc) => {
              if (!isViewer) {
                setFullDescription(desc);
                setShowDescriptionDialog(true);
              }
            }}
            visibleExpenseCount={visibleExpenseCount}
            setVisibleExpenseCount={setVisibleExpenseCount}
            icon={Users}
          />
        </div>
      </main>

      <ExpenseDialog 
        showExpenseDialog={showExpenseDialog}
        setShowExpenseDialog={setShowExpenseDialog}
        editingExpense={editingExpense}
        expenseAmount={expenseAmount}
        setExpenseAmount={setExpenseAmount}
        expenseDescription={expenseDescription}
        setExpenseDescription={setExpenseDescription}
        expenseCategory={expenseCategory}
        setExpenseCategory={setExpenseCategory}
        categories={categories}
        handleAddExpense={handleAddExpense}
        handleUpdateExpense={handleUpdateExpense}
      />

      <Dialog isOpen={showDescriptionDialog} onClose={() => setShowDescriptionDialog(false)}>
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-lg sm:text-xl font-semibold text-gray-900">Expense Description</h2>
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
      </Dialog>
    </div>
  );
}