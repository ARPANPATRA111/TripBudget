import { Search, X, Tag, Download } from 'lucide-react';
import { Button } from '../common/Button';
import { useState } from 'react';
import { exportExpensesToCSV } from '../../utils/tripLog';

export const FiltersSection = ({
  searchTerm,
  setSearchTerm,
  selectedCategories,
  setSelectedCategories,
  selectedUsers,
  setSelectedUsers,
  dateRange,
  setDateRange,
  amountRange,
  setAmountRange,
  categories,
  members,
  filteredExpenses,
  allExpenses,
  groupId,
  userId
}) => {
  const [showFilters, setShowFilters] = useState(false);
  const [exporting, setExporting] = useState(false);

  const toggleCategory = (category) => {
    setSelectedCategories(prev =>
      prev.includes(category)
        ? prev.filter(c => c !== category)
        : [...prev, category]
    );
  };

  const toggleUser = (userId) => {
    setSelectedUsers(prev =>
      prev.includes(userId)
        ? prev.filter(u => u !== userId)
        : [...prev, userId]
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

  const handleExport = async () => {
    setExporting(true);
    try {
      await exportExpensesToCSV(groupId);
    } catch (error) {
      console.error('Export error:', error);
      alert('Failed to export expenses');
    } finally {
      setExporting(false);
    }
  };

  const handleApplyCustomFilter = (filterConfig) => {
    setSelectedCategories(filterConfig.categories || []);
    setSelectedUsers(filterConfig.users || []);
    setDateRange(filterConfig.dateRange || { start: '', end: '' });
    setAmountRange(filterConfig.amountRange || { min: '', max: '' });
  };

  return (
    <>
      <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-200">
        {/* Search bar */}
        <div className="flex items-center gap-2 mb-3">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-2.5 w-5 h-5 text-gray-400" />
            <input
              type="text"
              placeholder="Search expenses..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-3 py-2 text-sm text-gray-700 bg-gray-50 rounded-lg border border-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
            />
          </div>
          <button
            onClick={() => setShowFilters(!showFilters)}
            className={`p-2 rounded-lg transition-colors relative ${
              showFilters ? 'bg-blue-100 text-blue-600' : 'text-gray-500 hover:text-gray-700 hover:bg-gray-100'
            }`}
            title="Toggle filters"
          >
            <Tag size={20} />
            {getActiveFilterCount() > 0 && (
              <span className="absolute -top-1 -right-1 bg-red-500 text-white text-[10px] rounded-full h-5 w-5 flex items-center justify-center">
                {getActiveFilterCount()}
              </span>
            )}
          </button>
          <button
            onClick={handleExport}
            disabled={exporting}
            className="p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-lg transition-colors disabled:opacity-50"
            title="Export to CSV"
          >
            {exporting ? (
              <div className="animate-spin h-5 w-5 border-b-2 border-gray-500 rounded-full"></div>
            ) : (
              <Download size={20} />
            )}
          </button>
        </div>

        {/* Results info */}
        <div className="flex items-center justify-between text-sm text-gray-600">
          <span>
            Showing <strong>{filteredExpenses.length}</strong> of <strong>{allExpenses.length}</strong> expenses
          </span>
          {getActiveFilterCount() > 0 && (
            <button
              onClick={clearAllFilters}
              className="text-blue-600 hover:text-blue-700 font-medium flex items-center"
            >
              <X size={14} className="mr-1" />
              Clear all filters
            </button>
          )}
        </div>

        {/* Filter section */}
        {showFilters && (
          <div className="border-t mt-4 pt-4 space-y-4">
            {/* Category filters */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Categories</label>
              <div className="flex flex-wrap gap-2">
                {categories.map(category => (
                  <button
                    key={category}
                    onClick={() => toggleCategory(category)}
                    className={`px-3 py-1.5 rounded-full text-sm font-medium transition-colors ${
                      selectedCategories.includes(category)
                        ? 'bg-blue-600 text-white'
                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                    }`}
                  >
                    {category}
                  </button>
                ))}
              </div>
            </div>

            {/* User filters */}
            {members && members.length > 0 && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Members</label>
                <div className="flex flex-wrap gap-2">
                  {members.map(member => (
                    <button
                      key={member.user_id}
                      onClick={() => toggleUser(member.user_id)}
                      className={`px-3 py-1.5 rounded-full text-sm font-medium transition-colors ${
                        selectedUsers.includes(member.user_id)
                          ? 'bg-purple-600 text-white'
                          : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                      }`}
                    >
                      {member.user_profiles?.full_name || member.user_profiles?.email?.split('@')[0] || 'Unknown'}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Date range */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Date Range</label>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <input
                    type="date"
                    value={dateRange.start}
                    onChange={(e) => setDateRange({ ...dateRange, start: e.target.value })}
                    className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="Start date"
                  />
                </div>
                <div>
                  <input
                    type="date"
                    value={dateRange.end}
                    onChange={(e) => setDateRange({ ...dateRange, end: e.target.value })}
                    className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="End date"
                  />
                </div>
              </div>
            </div>

            {/* Amount range */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Amount Range</label>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <input
                    type="number"
                    value={amountRange.min}
                    onChange={(e) => setAmountRange({ ...amountRange, min: e.target.value })}
                    className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="Min $"
                    step="0.01"
                  />
                </div>
                <div>
                  <input
                    type="number"
                    value={amountRange.max}
                    onChange={(e) => setAmountRange({ ...amountRange, max: e.target.value })}
                    className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="Max $"
                    step="0.01"
                  />
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

    </>
  );
};
