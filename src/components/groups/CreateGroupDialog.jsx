import { useState } from 'react';
import { Dialog } from '../common/Dialog';
import { Button } from '../common/Button';
import { X, Users, IndianRupee } from 'lucide-react';

export const CreateGroupDialog = ({ isOpen, onClose, onCreate }) => {
  const [tripName, setTripName] = useState('');
  const [totalBudget, setTotalBudget] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!tripName.trim()) {
      setError('Please enter a trip name');
      return;
    }

    const budget = parseFloat(totalBudget);
    if (isNaN(budget) || budget <= 0) {
      setError('Please enter a valid budget amount');
      return;
    }

    setLoading(true);
    try {
      await onCreate({ tripName: tripName.trim(), totalBudget: budget });
      setTripName('');
      setTotalBudget('');
      onClose();
    } catch (err) {
      setError(err.message || 'Failed to create group');
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    setTripName('');
    setTotalBudget('');
    setError('');
    onClose();
  };

  return (
    <Dialog isOpen={isOpen} onClose={handleClose}>
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-xl font-bold text-gray-900 flex items-center">
          <Users className="mr-2 w-6 h-6 text-blue-600" />
          Create Trip Group
        </h2>
        <button
          onClick={handleClose}
          className="text-gray-400 hover:text-gray-500"
          disabled={loading}
        >
          <X size={20} />
        </button>
      </div>

      <form onSubmit={handleSubmit} className="space-y-5">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Trip Name *
          </label>
          <input
            type="text"
            value={tripName}
            onChange={(e) => setTripName(e.target.value)}
            className="w-full px-4 py-2.5 text-gray-700 bg-gray-50 rounded-lg border border-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
            placeholder="e.g., Summer Vacation 2024"
            disabled={loading}
            maxLength={100}
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Total Budget ($) *
          </label>
          <div className="relative">
            <IndianRupee className="absolute left-3 top-3 w-5 h-5 text-gray-400" />
            <input
              type="number"
              value={totalBudget}
              onChange={(e) => setTotalBudget(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 text-gray-700 bg-gray-50 rounded-lg border border-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
              placeholder="0.00"
              step="0.01"
              min="0.01"
              disabled={loading}
            />
          </div>
        </div>

        {error && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-3">
            <p className="text-red-600 text-sm">{error}</p>
          </div>
        )}

        <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
          <p className="text-sm text-blue-800">
            ℹ️ You will be the admin of this group and receive a unique group code to share with members.
          </p>
        </div>

        <div className="flex space-x-3 pt-2">
          <Button
            type="button"
            onClick={handleClose}
            variant="secondary"
            className="flex-1"
            disabled={loading}
          >
            <span className="inline-flex items-center justify-center w-full gap-1 sm:gap-2">
              <span>Cancel</span>
            </span>
          </Button>
          <Button
            type="submit"
            className="flex-1"
            disabled={loading}
          >
            <span className="inline-flex items-center justify-center w-full gap-1 sm:gap-2">
              <span>{loading ? 'Creating...' : 'Create Group'}</span>
            </span>
          </Button>
        </div>
      </form>
    </Dialog>
  );
};
