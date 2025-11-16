import { useState, useEffect, useMemo } from 'react';
import {
  getGroupExpenses,
  createExpense,
  updateExpense,
  deleteExpense,
} from '../../utils/database';
import { doc, getDoc, collection, getDocs, onSnapshot, query, where, orderBy, updateDoc } from 'firebase/firestore';
import { db } from '../../utils/firebase';
import { ExpenseDialog } from './ExpenseDialog';
import { ExpenseList } from './ExpenseList';
import { FiltersSection } from './FiltersSection';
import { ExpenseDetailDialog } from './ExpenseDetailDialog';
import { Plus, ArrowLeft, TrendingUp, Users as UsersIcon } from 'lucide-react';
import { Button } from '../common/Button';
import { CategoryStats } from '../stats/CategoryStats';
import { formatDate } from '../../utils/helpers';

export const GroupExpensesView = ({ group, currentUserId, onBack }) => {
  const [expenses, setExpenses] = useState([]);
  const [members, setMembers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showExpenseDialog, setShowExpenseDialog] = useState(false);
  const [editingExpense, setEditingExpense] = useState(null);
  const [showStats, setShowStats] = useState(false);
  const [selectedExpense, setSelectedExpense] = useState(null);
  const [showExpenseDetail, setShowExpenseDetail] = useState(false);

  // Expense form state
  const [expenseAmount, setExpenseAmount] = useState('');
  const [expenseDescription, setExpenseDescription] = useState('');
  const [expenseCategory, setExpenseCategory] = useState('');
  const [expenseDate, setExpenseDate] = useState(new Date().toISOString().split('T')[0]);

  // Filter state
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategories, setSelectedCategories] = useState([]);
  const [selectedUsers, setSelectedUsers] = useState([]);
  const [dateRange, setDateRange] = useState({ start: '', end: '' });
  const [amountRange, setAmountRange] = useState({ min: '', max: '' });
  const [sortConfig, setSortConfig] = useState({ key: 'created_at', direction: 'desc' });
  const [visibleExpenseCount, setVisibleExpenseCount] = useState(10);

  const [categories, setCategories] = useState(['Food', 'Transport', 'Accommodation', 'Activities', 'Shopping', 'Utilities', 'Entertainment', 'Other']);

  useEffect(() => {
    if (!group) return;

    // Set up real-time listener for expenses
    const expensesQuery = query(
      collection(db, 'expenses'),
      where('group_id', '==', group.id),
      orderBy('expense_date', 'desc')
    );

    const unsubscribe = onSnapshot(expensesQuery, async (snapshot) => {
      try {
        const expensesData = snapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        }));

        // Enrich expenses with user profiles
        const enrichedExpenses = await Promise.all(
          expensesData.map(async (expense) => {
            const userRef = doc(db, 'users', expense.paid_by);
            const userSnap = await getDoc(userRef);
            return {
              ...expense,
              user_id: expense.paid_by,
              user_profiles: userSnap.exists()
                ? { id: userSnap.id, ...userSnap.data() }
                : { id: expense.paid_by, email: 'Unknown', full_name: 'Unknown' },
            };
          })
        );

        setExpenses(enrichedExpenses);
        setLoading(false);
      } catch (error) {
        console.error('Error fetching expenses:', error);
        setLoading(false);
      }
    });

    fetchMembers();
    fetchGroupCategories();

    // Cleanup listener on unmount
    return () => unsubscribe();
  }, [group]);

  const fetchGroupCategories = async () => {
    try {
      const groupRef = doc(db, 'groups', group.id);
      const groupSnap = await getDoc(groupRef);
      
      if (groupSnap.exists() && groupSnap.data().custom_categories) {
        const customCategories = groupSnap.data().custom_categories || [];
        const defaultCategories = ['Food', 'Transport', 'Accommodation', 'Activities', 'Shopping', 'Utilities', 'Entertainment', 'Other'];
        const allCategories = [...new Set([...defaultCategories, ...customCategories])];
        setCategories(allCategories);
      }
    } catch (error) {
      console.error('Error fetching group categories:', error);
    }
  };

  const fetchExpenses = async () => {
    // Kept for manual refresh if needed
    try {
      const { data, error } = await getGroupExpenses(group.id);
      if (error) throw error;

      const enrichedExpenses = await Promise.all(
        (data || []).map(async (expense) => {
          const userRef = doc(db, 'users', expense.paid_by);
          const userSnap = await getDoc(userRef);
          return {
            ...expense,
            user_id: expense.paid_by,
            user_profiles: userSnap.exists()
              ? { id: userSnap.id, ...userSnap.data() }
              : { id: expense.paid_by, email: 'Unknown', full_name: 'Unknown' },
          };
        })
      );

      setExpenses(enrichedExpenses);
    } catch (error) {
      console.error('Error fetching expenses:', error);
    }
  };

  const fetchMembers = async () => {
    try {
      const membersSnap = await getDocs(
        collection(db, 'groups', group.id, 'members')
      );

      const membersWithProfiles = await Promise.all(
        membersSnap.docs.map(async (memberDoc) => {
          const memberData = memberDoc.data();
          const userRef = doc(db, 'users', memberData.user_id);
          const userSnap = await getDoc(userRef);
          return {
            user_id: memberData.user_id,
            role: memberData.role,
            user_profiles: userSnap.exists()
              ? { id: userSnap.id, ...userSnap.data() }
              : null,
          };
        })
      );

      setMembers(membersWithProfiles);
    } catch (error) {
      console.error('Error fetching members:', error);
    }
  };

  const handleAddExpense = async () => {
    const amount = parseFloat(expenseAmount);
    const trimmedCategory = expenseCategory?.trim();
    
    if (isNaN(amount) || amount <= 0) {
      alert('Please enter a valid amount');
      return;
    }
    
    if (!expenseDescription.trim()) {
      alert('Please enter a description');
      return;
    }
    
    if (!trimmedCategory) {
      alert('Please select or enter a category');
      return;
    }

    try {
      // Add custom category to group if it's new
      const defaultCategories = ['Food', 'Transport', 'Accommodation', 'Activities', 'Shopping', 'Utilities', 'Entertainment', 'Other'];
      if (!defaultCategories.includes(trimmedCategory) && !categories.includes(trimmedCategory)) {
        const groupRef = doc(db, 'groups', group.id);
        const groupSnap = await getDoc(groupRef);
        const currentCustomCategories = groupSnap.data()?.custom_categories || [];
        
        if (!currentCustomCategories.includes(trimmedCategory)) {
          await updateDoc(groupRef, {
            custom_categories: [...currentCustomCategories, trimmedCategory]
          });
          setCategories([...categories, trimmedCategory]);
        }
      }

      const { error } = await createExpense({
        group_id: group.id,
        paid_by: currentUserId,
        amount: amount,
        description: expenseDescription.trim(),
        category: trimmedCategory,
        expense_date: expenseDate,
      });

      if (error) throw error;

      resetExpenseForm();
      setShowExpenseDialog(false);
      await fetchExpenses();
    } catch (error) {
      console.error('Error adding expense:', error);
      alert('Failed to add expense. Please try again.');
    }
  };

  const handleUpdateExpense = async () => {
    const amount = parseFloat(expenseAmount);
    if (isNaN(amount) || amount <= 0 || !expenseDescription.trim() || !expenseCategory) {
      alert('Please fill in all expense details correctly');
      return;
    }

    try {
      const { error } = await updateExpense(editingExpense.id, {
        amount: amount,
        description: expenseDescription.trim(),
        category: expenseCategory,
        expense_date: expenseDate,
        is_edited: true,
      });

      if (error) throw error;

      resetExpenseForm();
      setShowExpenseDialog(false);
      setEditingExpense(null);
      await fetchExpenses();
    } catch (error) {
      console.error('Error updating expense:', error);
      alert('Failed to update expense. Please try again.');
    }
  };

  const handleDeleteExpense = async (expenseId) => {
    if (!confirm('Are you sure you want to delete this expense?')) {
      return;
    }

    try {
      const { error } = await deleteExpense(expenseId);
      if (error) throw error;
      await fetchExpenses();
    } catch (error) {
      console.error('Error deleting expense:', error);
      alert('Failed to delete expense. Please try again.');
    }
  };

  const handleEditExpense = (expense) => {
    if (expense.user_id !== currentUserId) {
      alert('You can only edit your own expenses');
      return;
    }

    setEditingExpense(expense);
    setExpenseAmount(expense.amount.toString());
    setExpenseDescription(expense.description);
    setExpenseCategory(expense.category);
    setExpenseDate(expense.expense_date);
    setShowExpenseDialog(true);
  };

  const resetExpenseForm = () => {
    setExpenseAmount('');
    setExpenseDescription('');
    setExpenseCategory('');
    setExpenseDate(new Date().toISOString().split('T')[0]);
  };

  const handleViewExpenseDetail = (expense) => {
    setSelectedExpense(expense);
    setShowExpenseDetail(true);
  };

  // Computed values
  const totalExpenses = useMemo(() => {
    return expenses.reduce((sum, exp) => sum + parseFloat(exp.amount), 0);
  }, [expenses]);

  const remainingBudget = useMemo(() => {
    return group.total_budget - totalExpenses;
  }, [group.total_budget, totalExpenses]);

  const myExpenses = useMemo(() => {
    return expenses.filter(exp => exp.user_id === currentUserId);
  }, [expenses, currentUserId]);

  const myTotalExpenses = useMemo(() => {
    return myExpenses.reduce((sum, exp) => sum + parseFloat(exp.amount), 0);
  }, [myExpenses]);

  const filteredExpenses = useMemo(() => {
    let filtered = [...expenses];

    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      filtered = filtered.filter(expense =>
        expense.description.toLowerCase().includes(term) ||
        expense.category.toLowerCase().includes(term) ||
        expense.user_profiles.full_name?.toLowerCase().includes(term) ||
        expense.user_profiles.email?.toLowerCase().includes(term)
      );
    }

    if (selectedCategories.length > 0) {
      filtered = filtered.filter(expense => selectedCategories.includes(expense.category));
    }

    if (selectedUsers.length > 0) {
      filtered = filtered.filter(expense => selectedUsers.includes(expense.user_id));
    }

    if (dateRange.start || dateRange.end) {
      filtered = filtered.filter(expense => {
        const expenseDate = expense.expense_date;
        const startMatch = !dateRange.start || expenseDate >= dateRange.start;
        const endMatch = !dateRange.end || expenseDate <= dateRange.end;
        return startMatch && endMatch;
      });
    }

    if (amountRange.min || amountRange.max) {
      filtered = filtered.filter(expense => {
        const amount = parseFloat(expense.amount);
        const minMatch = !amountRange.min || amount >= parseFloat(amountRange.min);
        const maxMatch = !amountRange.max || amount <= parseFloat(amountRange.max);
        return minMatch && maxMatch;
      });
    }

    if (sortConfig.key) {
      filtered.sort((a, b) => {
        let aVal = a[sortConfig.key];
        let bVal = b[sortConfig.key];

        if (sortConfig.key === 'amount') {
          aVal = parseFloat(aVal);
          bVal = parseFloat(bVal);
        }

        if (aVal < bVal) return sortConfig.direction === 'asc' ? -1 : 1;
        if (aVal > bVal) return sortConfig.direction === 'asc' ? 1 : -1;
        return 0;
      });
    }

    return filtered;
  }, [expenses, searchTerm, selectedCategories, selectedUsers, dateRange, amountRange, sortConfig]);

  const categorySpending = useMemo(() => {
    const spending = {};
    expenses.forEach(expense => {
      const category = expense.category;
      if (!spending[category]) {
        spending[category] = 0;
      }
      spending[category] += parseFloat(expense.amount);
    });

    return Object.entries(spending).map(([category, amount]) => ({
      category,
      amount,
      percentage: group.total_budget > 0 ? (amount / group.total_budget) * 100 : 0
    }));
  }, [expenses, group.total_budget]);

  const requestSort = (key) => {
    let direction = 'desc';
    if (sortConfig.key === key && sortConfig.direction === 'desc') {
      direction = 'asc';
    }
    setSortConfig({ key, direction });
  };

  const budgetProgress = group.total_budget > 0 ? (totalExpenses / group.total_budget) * 100 : 0;

  if (loading) {
    return (
      <div className="text-center py-12">
        <div className="inline-block w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
        <p className="mt-3 text-gray-600">Loading expenses...</p>
      </div>
    );
  }

  return (
    <div className="space-y-4 sm:space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 sm:gap-0">
        <Button onClick={onBack} variant="secondary" className="w-full sm:w-auto">
          <span className="inline-flex items-center justify-center w-full gap-1 sm:gap-2">
            <ArrowLeft className="w-4 h-4 sm:w-5 sm:h-5" />
            <span>Back to Dashboard</span>
          </span>
        </Button>
        <h2 className="text-xl sm:text-2xl font-bold text-gray-900 truncate">{group.trip_name}</h2>
      </div>

      {/* Budget Overview Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-2 sm:gap-4">
        <div className="bg-gradient-to-br from-blue-400 to-blue-600 p-3 sm:p-4 rounded-lg shadow text-white">
          <p className="text-blue-100 text-xs sm:text-sm font-medium mb-1">Total Budget</p>
          <p className="text-lg sm:text-2xl font-bold">₹{group.total_budget.toFixed(2)}</p>
        </div>
        <div className="bg-gradient-to-br from-red-400 to-red-600 p-3 sm:p-4 rounded-lg shadow text-white">
          <p className="text-red-100 text-xs sm:text-sm font-medium mb-1">Total Spent</p>
          <p className="text-lg sm:text-2xl font-bold">₹{totalExpenses.toFixed(2)}</p>
        </div>
        <div className="bg-gradient-to-br from-green-400 to-green-600 p-3 sm:p-4 rounded-lg shadow text-white">
          <p className="text-green-100 text-xs sm:text-sm font-medium mb-1">Remaining</p>
          <p className="text-lg sm:text-2xl font-bold">₹{remainingBudget.toFixed(2)}</p>
        </div>
        <div className="bg-gradient-to-br from-purple-400 to-purple-600 p-3 sm:p-4 rounded-lg shadow text-white">
          <p className="text-purple-100 text-xs sm:text-sm font-medium mb-1">Your Spending</p>
          <p className="text-lg sm:text-2xl font-bold">₹{myTotalExpenses.toFixed(2)}</p>
        </div>
      </div>

      {/* Progress Bar */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
        <div className="flex justify-between items-center mb-2">
          <span className="text-sm font-medium text-gray-700">Budget Usage</span>
          <span className={`text-sm font-bold ${
            budgetProgress >= 90 ? 'text-red-600' :
            budgetProgress >= 75 ? 'text-orange-600' : 'text-green-600'
          }`}>
            {budgetProgress.toFixed(1)}%
          </span>
        </div>
        <div className="w-full bg-gray-200 rounded-full h-3 overflow-hidden">
          <div
            className={`h-full transition-all duration-500 ${
              budgetProgress >= 90 ? 'bg-red-500' :
              budgetProgress >= 75 ? 'bg-orange-500' : 'bg-green-500'
            }`}
            style={{ width: `${Math.min(budgetProgress, 100)}%` }}
          />
        </div>
      </div>

      {/* Add Expense Button */}
      <Button
        onClick={() => {
          resetExpenseForm();
          setEditingExpense(null);
          setShowExpenseDialog(true);
        }}
        className="w-full text-sm sm:text-base"
      >
        <span className="inline-flex items-center justify-center w-full gap-1 sm:gap-2">
          <Plus className="w-4 h-4 sm:w-5 sm:h-5" />
          <span>Add New Expense</span>
        </span>
      </Button>

      {/* Stats Toggle */}
      <Button
        onClick={() => setShowStats(!showStats)}
        variant="secondary"
        className="w-full text-sm sm:text-base"
      >
        <span className="inline-flex items-center justify-center w-full gap-1 sm:gap-2">
          <TrendingUp className="w-4 h-4 sm:w-5 sm:h-5" />
          <span>{showStats ? 'Hide' : 'Show'} Category Statistics</span>
        </span>
      </Button>

      {/* Category Stats */}
      {showStats && (
        <CategoryStats
          showStats={showStats}
          setShowStats={setShowStats}
          categorySpending={categorySpending}
        />
      )}

      {/* My Expenses */}
      <ExpenseList
        title="My Expenses"
        expenses={myExpenses}
        sortConfig={sortConfig}
        requestSort={requestSort}
        canEdit={true}
        onEdit={handleEditExpense}
        onDelete={handleDeleteExpense}
        onViewDetail={handleViewExpenseDetail}
        currentUserId={currentUserId}
      />

      {/* Filters */}
      <FiltersSection
        searchTerm={searchTerm}
        setSearchTerm={setSearchTerm}
        selectedCategories={selectedCategories}
        setSelectedCategories={setSelectedCategories}
        selectedUsers={selectedUsers}
        setSelectedUsers={setSelectedUsers}
        dateRange={dateRange}
        setDateRange={setDateRange}
        amountRange={amountRange}
        setAmountRange={setAmountRange}
        categories={categories}
        members={members}
        filteredExpenses={filteredExpenses}
        allExpenses={expenses}
        groupId={group.id}
        userId={currentUserId}
      />

      {/* All Group Expenses */}
      <ExpenseList
        title="All Group Expenses"
        expenses={filteredExpenses.slice(0, visibleExpenseCount)}
        sortConfig={sortConfig}
        requestSort={requestSort}
        canEdit={false}
        onViewDetail={handleViewExpenseDetail}
        currentUserId={currentUserId}
        icon={UsersIcon}
        visibleExpenseCount={visibleExpenseCount}
        setVisibleExpenseCount={setVisibleExpenseCount}
      />

      {/* Expense Dialog */}
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
        expenseDate={expenseDate}
        setExpenseDate={setExpenseDate}
        categories={categories}
        handleAddExpense={handleAddExpense}
        handleUpdateExpense={handleUpdateExpense}
      />

      {/* Expense Detail Dialog */}
      <ExpenseDetailDialog
        isOpen={showExpenseDetail}
        onClose={() => setShowExpenseDetail(false)}
        expense={selectedExpense}
      />
    </div>
  );
};
