import { useState, useEffect } from 'react';
import { Dialog } from '../common/Dialog';
import { Button } from '../common/Button';
import { X, Save, Filter } from 'lucide-react';
import {
  saveCustomFilter,
  getUserCustomFilters,
  deleteCustomFilter,
} from '../../utils/database';

export const CustomFiltersDialog = ({ 
  isOpen, 
  onClose, 
  groupId, 
  userId,
  categories,
  members,
  onApplyFilter
}) => {
  const [savedFilters, setSavedFilters] = useState([]);
  const [filterName, setFilterName] = useState('');
  const [selectedCategories, setSelectedCategories] = useState([]);
  const [selectedUsers, setSelectedUsers] = useState([]);
  const [dateRange, setDateRange] = useState({ start: '', end: '' });
  const [amountRange, setAmountRange] = useState({ min: '', max: '' });
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (isOpen) {
      fetchSavedFilters();
    }
  }, [isOpen, groupId]);

  const fetchSavedFilters = async () => {
    setLoading(true);
    try {
      const { data, error } = await getUserCustomFilters(userId);
      if (error) throw error;

      // Filter to only show filters for this group
      const groupFilters = (data || []).filter(f => f.group_id === groupId);
      setSavedFilters(groupFilters);
    } catch (error) {
      console.error('Error fetching filters:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSaveFilter = async () => {
    if (!filterName.trim()) {
      alert('Please enter a name for this filter');
      return;
    }

    const filterConfig = {
      categories: selectedCategories,
      users: selectedUsers,
      dateRange,
      amountRange
    };

    setSaving(true);
    try {
      const { error } = await saveCustomFilter(userId, {
        group_id: groupId,
        filter_name: filterName.trim(),
        filter_config: filterConfig,
      });

      if (error) throw error;
      
      alert('Filter saved successfully!');
      resetForm();
      fetchSavedFilters();
    } catch (error) {
      console.error('Error saving filter:', error);
      alert('Failed to save filter');
    } finally {
      setSaving(false);
    }
  };

  const handleLoadFilter = (filter) => {
    const config = filter.filter_config;
    setFilterName(filter.filter_name);
    setSelectedCategories(config.categories || []);
    setSelectedUsers(config.users || []);
    setDateRange(config.dateRange || { start: '', end: '' });
    setAmountRange(config.amountRange || { min: '', max: '' });
  };

  const handleApplyFilter = () => {
    onApplyFilter({
      categories: selectedCategories,
      users: selectedUsers,
      dateRange,
      amountRange
    });
    onClose();
  };

  const handleDeleteFilter = async (filterId) => {
    if (!confirm('Are you sure you want to delete this filter?')) {
      return;
    }

    try {
      const { error } = await deleteCustomFilter(filterId);
      if (error) throw error;
      fetchSavedFilters();
    } catch (error) {
      console.error('Error deleting filter:', error);
      alert('Failed to delete filter');
    }
  };

  const resetForm = () => {
    setFilterName('');
    setSelectedCategories([]);
    setSelectedUsers([]);
    setDateRange({ start: '', end: '' });
    setAmountRange({ min: '', max: '' });
  };

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

  return (
    <Dialog isOpen={isOpen} onClose={onClose} maxWidth="max-w-3xl">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-xl font-bold text-gray-900 flex items-center">
          <Filter className="mr-2 w-6 h-6 text-blue-600" />
          Custom Filters
        </h2>
        <button onClick={onClose} className="text-gray-400 hover:text-gray-500">
          <X size={20} />
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Saved Filters */}
        <div className="space-y-3">
          <h3 className="font-semibold text-gray-900 mb-3">Saved Filters</h3>
          {loading ? (
            <p className="text-sm text-gray-500">Loading filters...</p>
          ) : savedFilters.length === 0 ? (
            <p className="text-sm text-gray-500 italic">No saved filters yet</p>
          ) : (
            <div className="space-y-2 max-h-64 overflow-y-auto">
              {savedFilters.map(filter => (
                <div
                  key={filter.id}
                  className="flex items-center justify-between p-3 bg-gray-50 rounded-lg border border-gray-200 hover:border-blue-300 transition-colors"
                >
                  <button
                    onClick={() => handleLoadFilter(filter)}
                    className="flex-1 text-left font-medium text-sm text-gray-900 hover:text-blue-600"
                  >
                    {filter.filter_name}
                  </button>
                  <button
                    onClick={() => handleDeleteFilter(filter.id)}
                    className="ml-2 text-red-500 hover:text-red-700 text-xs"
                  >
                    Delete
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Filter Builder */}
        <div className="space-y-4">
          <h3 className="font-semibold text-gray-900 mb-3">Build Filter</h3>
          
          {/* Filter Name */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Filter Name
            </label>
            <input
              type="text"
              value={filterName}
              onChange={(e) => setFilterName(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="My Custom Filter"
            />
          </div>

          {/* Categories */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Categories
            </label>
            <div className="flex flex-wrap gap-2">
              {categories.map(category => (
                <button
                  key={category}
                  onClick={() => toggleCategory(category)}
                  className={`px-3 py-1 text-xs rounded-full transition-colors ${
                    selectedCategories.includes(category)
                      ? 'bg-blue-600 text-white'
                      : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                  }`}
                >
                  {category}
                </button>
              ))}
            </div>
          </div>

          {/* Users */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Members
            </label>
            <div className="space-y-1 max-h-32 overflow-y-auto">
              {members.map(member => (
                <label
                  key={member.user_id}
                  className="flex items-center p-2 hover:bg-gray-50 rounded cursor-pointer"
                >
                  <input
                    type="checkbox"
                    checked={selectedUsers.includes(member.user_id)}
                    onChange={() => toggleUser(member.user_id)}
                    className="mr-2"
                  />
                  <span className="text-sm text-gray-700">
                    {member.user_profiles.full_name || member.user_profiles.email}
                  </span>
                </label>
              ))}
            </div>
          </div>

          {/* Date Range */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Date Range
            </label>
            <div className="grid grid-cols-2 gap-2">
              <input
                type="date"
                value={dateRange.start}
                onChange={(e) => setDateRange({ ...dateRange, start: e.target.value })}
                className="px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                placeholder="Start"
              />
              <input
                type="date"
                value={dateRange.end}
                onChange={(e) => setDateRange({ ...dateRange, end: e.target.value })}
                className="px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                placeholder="End"
              />
            </div>
          </div>

          {/* Amount Range */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Amount Range
            </label>
            <div className="grid grid-cols-2 gap-2">
              <input
                type="number"
                value={amountRange.min}
                onChange={(e) => setAmountRange({ ...amountRange, min: e.target.value })}
                className="px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                placeholder="Min $"
                step="0.01"
              />
              <input
                type="number"
                value={amountRange.max}
                onChange={(e) => setAmountRange({ ...amountRange, max: e.target.value })}
                className="px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                placeholder="Max $"
                step="0.01"
              />
            </div>
          </div>
        </div>
      </div>

      {/* Actions */}
      <div className="flex justify-between items-center mt-6 pt-4 border-t border-gray-200">
        <Button onClick={resetForm} variant="secondary" className="text-sm">
          <span className="inline-flex items-center justify-center w-full gap-1 sm:gap-2">
            <span>Clear All</span>
          </span>
        </Button>
        <div className="flex space-x-2">
          <Button
            onClick={handleSaveFilter}
            disabled={saving}
            variant="secondary"
            className="text-sm"
          >
            <span className="inline-flex items-center justify-center w-full gap-1 sm:gap-2">
              <Save className="w-3 h-3 sm:w-4 sm:h-4" />
              <span>{saving ? 'Saving...' : 'Save Filter'}</span>
            </span>
          </Button>
          <Button onClick={handleApplyFilter} className="text-sm">
            <span className="inline-flex items-center justify-center w-full gap-1 sm:gap-2">
              <Filter className="w-3 h-3 sm:w-4 sm:h-4" />
              <span>Apply Filter</span>
            </span>
          </Button>
        </div>
      </div>
    </Dialog>
  );
};
