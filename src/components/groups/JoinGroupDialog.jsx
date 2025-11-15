import { useState } from 'react';
import { Dialog } from '../common/Dialog';
import { Button } from '../common/Button';
import { X, UserPlus, Key } from 'lucide-react';

export const JoinGroupDialog = ({ isOpen, onClose, onJoin }) => {
  const [groupCode, setGroupCode] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    const code = groupCode.trim().toUpperCase();
    if (!code || code.length !== 8) {
      setError('Please enter a valid 8-character group code');
      return;
    }

    setLoading(true);
    try {
      await onJoin(code);
      setGroupCode('');
      onClose();
    } catch (err) {
      setError(err.message || 'Failed to join group');
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    setGroupCode('');
    setError('');
    onClose();
  };

  const handleInputChange = (e) => {
    const value = e.target.value.toUpperCase().replace(/[^A-Z0-9]/g, '');
    setGroupCode(value.substring(0, 8));
  };

  return (
    <Dialog isOpen={isOpen} onClose={handleClose}>
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-xl font-bold text-gray-900 flex items-center">
          <UserPlus className="mr-2 w-6 h-6 text-green-600" />
          Join Trip Group
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
            Group Code *
          </label>
          <div className="relative">
            <Key className="absolute left-3 top-3 w-5 h-5 text-gray-400" />
            <input
              type="text"
              value={groupCode}
              onChange={handleInputChange}
              className="w-full pl-10 pr-4 py-2.5 text-gray-700 bg-gray-50 rounded-lg border border-gray-200 focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all uppercase font-mono text-lg tracking-wider text-center"
              placeholder="ABC12345"
              disabled={loading}
              maxLength={8}
            />
          </div>
          <p className="mt-1.5 text-xs text-gray-500">
            Enter the 8-character code provided by the group admin
          </p>
        </div>

        {error && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-3">
            <p className="text-red-600 text-sm">{error}</p>
          </div>
        )}

        <div className="bg-green-50 border border-green-200 rounded-lg p-3">
          <p className="text-sm text-green-800">
            ℹ️ Once you join, you'll be able to add, edit, and delete your own expenses in the group.
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
            className="flex-1 bg-green-600 hover:bg-green-700"
            disabled={loading || groupCode.length !== 8}
          >
            <span className="inline-flex items-center justify-center w-full gap-1 sm:gap-2">
              <span>{loading ? 'Joining...' : 'Join Group'}</span>
            </span>
          </Button>
        </div>
      </form>
    </Dialog>
  );
};
