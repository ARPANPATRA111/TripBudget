import { Search, X, Tag, Download } from 'lucide-react';
import { Button } from '../common/Button';

export const FiltersSection = ({
  searchTerm,
  setSearchTerm,
  showFilters,
  setShowFilters,
  selectedCategories,
  toggleCategory,
  selectedUsers,
  toggleUserFilter,
  usersData,
  dateRange,
  setDateRange,
  amountRange,
  setAmountRange,
  categories,
  clearAllFilters,
  filteredExpenses,
  allExpensesWithUsers,
  exporting,
  exportToCSV,
  isViewer,
  getActiveFilterCount,
  getColorFromEmail
}) => (
  <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-200 mb-4">
    {/* Search bar */}
    <div className="flex items-center mb-3">
      <Search className="w-5 h-5 text-gray-400 mr-2" />
      <input
        type="text"
        placeholder="Search expenses..."
        value={searchTerm}
        onChange={(e) => setSearchTerm(e.target.value)}
        className="flex-1 px-3 py-2 text-sm text-gray-700 bg-gray-50 rounded-lg border border-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
      />
      <button
        onClick={() => setShowFilters(!showFilters)}
        className={`ml-2 p-2 rounded-lg transition-colors relative ${showFilters ? 'bg-blue-100 text-blue-600' : 'text-gray-500 hover:text-gray-700 hover:bg-gray-100'
          }`}
        title="Toggle filters"
      >
        <Tag size={16} />
        {getActiveFilterCount() > 0 && (
          <span className="absolute -top-1 -right-1 bg-red-500 text-white text-[10px] rounded-full h-5 w-5 flex items-center justify-center">
            {getActiveFilterCount()}
          </span>
        )}
      </button>
      <button
        onClick={exportToCSV}
        disabled={exporting || isViewer}
        className={`ml-1 p-1.5 rounded-lg transition-colors ${isViewer ? 'text-gray-300 cursor-not-allowed' : 'text-gray-500 hover:text-gray-700 hover:bg-gray-100'}`}
        title={isViewer ? "Viewers cannot export data" : "Export to CSV"}
      >
        {exporting ? (
          <div className="animate-spin h-3 w-3 border-b-2 border-gray-500 rounded-full"></div>
        ) : (
          <Download size={16} />
        )}
      </button>
    </div>

    {/* Filter section */}
    {showFilters && (
      <div className="border-t pt-4 space-y-4">
        {/* Category filters */}
        <div>
          <label className="block text-sm sm:text-base font-medium text-gray-700 mb-2">Categories</label>
          <div className="flex flex-wrap gap-2">
            {categories.map(category => (
              <button
                key={category}
                onClick={() => toggleCategory(category)}
                className={`px-3 py-1 rounded-full text-xs sm:text-sm font-medium transition-colors ${selectedCategories.includes(category)
                  ? 'bg-blue-100 text-blue-800 border border-blue-200'
                  : 'bg-gray-100 text-gray-700 border border-gray-200 hover:bg-gray-200'
                  }`}
              >
                {category}
              </button>
            ))}
          </div>
        </div>

        {/* User filters */}
        <div>
          <label className="block text-sm sm:text-base font-medium text-gray-700 mb-2">Users</label>
          <div className="flex flex-wrap gap-2">
            {Object.keys(usersData).map(userEmail => (
              <button
                key={userEmail}
                onClick={() => toggleUserFilter(userEmail)}
                className={`flex items-center px-3 py-1 rounded-full text-xs sm:text-sm font-medium transition-colors ${selectedUsers.includes(userEmail)
                  ? 'bg-purple-100 text-purple-800 border border-purple-200'
                  : 'bg-gray-100 text-gray-700 border border-gray-200 hover:bg-gray-200'
                  }`}
              >
                <div
                  className="w-4 h-4 rounded-full mr-1.5"
                  style={{ backgroundColor: getColorFromEmail(userEmail) }}
                ></div>
                {userEmail.split('@')[0]}
              </button>
            ))}
          </div>
        </div>

        {/* Date range filter */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div>
            <label className="block text-sm sm:text-base font-medium text-gray-700 mb-1">From Date</label>
            <input
              type="date"
              value={dateRange.start}
              onChange={(e) => setDateRange(prev => ({ ...prev, start: e.target.value }))}
              className="w-full px-3 py-2 text-gray-700 bg-gray-50 rounded-lg border border-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
            />
          </div>
          <div>
            <label className="block text-sm sm:text-base font-medium text-gray-700 mb-1">To Date</label>
            <input
              type="date"
              value={dateRange.end}
              onChange={(e) => setDateRange(prev => ({ ...prev, end: e.target.value }))}
              className="w-full px-3 py-2 text-gray-700 bg-gray-50 rounded-lg border border-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
            />
          </div>
        </div>

        {/* Amount range filter */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div>
            <label className="block text-sm sm:text-base font-medium text-gray-700 mb-1">Min Amount ($)</label>
            <input
              type="number"
              placeholder="0.00"
              step="0.01"
              min="0"
              value={amountRange.min}
              onChange={(e) => setAmountRange(prev => ({ ...prev, min: e.target.value }))}
              className="w-full px-3 py-2 text-gray-700 bg-gray-50 rounded-lg border border-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
            />
          </div>
          <div>
            <label className="block text-sm sm:text-base font-medium text-gray-700 mb-1">Max Amount ($)</label>
            <input
              type="number"
              placeholder="1000.00"
              step="0.01"
              min="0"
              value={amountRange.max}
              onChange={(e) => setAmountRange(prev => ({ ...prev, max: e.target.value }))}
              className="w-full px-3 py-2 text-gray-700 bg-gray-50 rounded-lg border border-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
            />
          </div>
        </div>

        {/* Filter actions */}
        <div className="flex justify-between items-center pt-2 border-t">
          <div className="text-xs sm:text-sm text-gray-600">
            Showing {filteredExpenses.length} of {allExpensesWithUsers.length} expenses
          </div>
          <div className="flex space-x-2">
            <button
              onClick={clearAllFilters}
              className="px-3 py-1.5 text-xs sm:text-sm text-gray-600 hover:text-gray-800 hover:bg-gray-100 rounded-lg transition-colors"
            >
              Clear All
            </button>
            <Button
              onClick={() => setShowFilters(false)}
              className="px-3 py-1.5 text-xs sm:text-sm"
            >
              Apply Filters
            </Button>
          </div>
        </div>
      </div>
    )}

    {/* Active filter chips */}
    {(selectedCategories.length > 0 || selectedUsers.length > 0 || dateRange.start || dateRange.end || amountRange.min || amountRange.max) && (
      <div className="mt-3 flex flex-wrap gap-2">
        {selectedCategories.map(category => (
          <span
            key={`cat-${category}`}
            className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800"
          >
            Category: {category}
            <button
              onClick={() => toggleCategory(category)}
              className="ml-1 text-blue-500 hover:text-blue-700"
            >
              <X size={12} />
            </button>
          </span>
        ))}
        {selectedUsers.map(userEmail => (
          <span
            key={`user-${userEmail}`}
            className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-purple-100 text-purple-800"
          >
            User: {userEmail.split('@')[0]}
            <button
              onClick={() => toggleUserFilter(userEmail)}
              className="ml-1 text-purple-500 hover:text-purple-700"
            >
              <X size={12} />
            </button>
          </span>
        ))}
        {(dateRange.start || dateRange.end) && (
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
            Date: {dateRange.start || 'Any'} - {dateRange.end || 'Any'}
            <button
              onClick={() => setDateRange({ start: '', end: '' })}
              className="ml-1 text-green-500 hover:text-green-700"
            >
              <X size={12} />
            </button>
          </span>
        )}
        {(amountRange.min || amountRange.max) && (
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-orange-100 text-orange-800">
            Amount: ${amountRange.min || '0'} - ${amountRange.max || '∞'}
            <button
              onClick={() => setAmountRange({ min: '', max: '' })}
              className="ml-1 text-orange-500 hover:text-orange-700"
            >
              <X size={12} />
            </button>
          </span>
        )}
      </div>
    )}
  </div>
);