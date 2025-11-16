import { Copy, Check, Users, IndianRupee, Calendar, Trash2, Mail, Settings } from 'lucide-react';
import { useState } from 'react';
import { Button } from '../common/Button';

export const GroupCard = ({ group, isAdmin, onDelete, onGenerateReport, onViewDetails }) => {
  const [copied, setCopied] = useState(false);

  const copyGroupCode = () => {
    navigator.clipboard.writeText(group.invite_code || group.group_code);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  // Calculate derived values with safe defaults
  const totalExpenses = group.total_expenses || 0;
  const totalBudget = group.total_budget || 0;
  const remainingBudget = totalBudget - totalExpenses;
  const memberCount = group.members?.length || group.member_count || 0;

  const percentageUsed = totalBudget > 0
    ? (totalExpenses / totalBudget) * 100
    : 0;

  const getBudgetColor = () => {
    if (percentageUsed >= 90) return 'text-red-600 bg-red-50';
    if (percentageUsed >= 75) return 'text-orange-600 bg-orange-50';
    return 'text-green-600 bg-green-50';
  };

  const getProgressColor = () => {
    if (percentageUsed >= 90) return 'bg-red-500';
    if (percentageUsed >= 75) return 'bg-orange-500';
    return 'bg-green-500';
  };

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden hover:shadow-md transition-shadow">
      {/* Header */}
      <div className="bg-gradient-to-r from-blue-500 to-indigo-600 p-3 sm:p-4 text-white">
        <div className="flex justify-between items-start mb-2">
          <h3 className="font-bold text-base sm:text-lg flex-1 pr-2">{group.trip_name}</h3>
          {isAdmin && (
            <span className="bg-white/20 backdrop-blur-sm px-2 py-0.5 sm:px-2.5 sm:py-1 rounded-full text-xs font-medium flex-shrink-0">
              Admin
            </span>
          )}
        </div>
        <div className="flex items-center text-xs sm:text-sm text-blue-100">
          <Calendar className="w-3 h-3 sm:w-4 sm:h-4 mr-1" />
          <span>
            {group.created_at
              ? (group.created_at.toDate ? group.created_at.toDate() : new Date(group.created_at)).toLocaleDateString()
              : 'N/A'
            }
          </span>
        </div>
      </div>

      {/* Content */}
      <div className="p-3 sm:p-4">
        {/* Group Code - Only show to admin */}
        {isAdmin && (
          <div className="mb-4 bg-gray-50 rounded-lg p-3 border border-gray-200">
            <div className="flex items-center justify-between">
              <div className="flex-1">
                <p className="text-xs font-medium text-gray-500 mb-1">Group Code</p>
                <p className="font-mono text-lg font-bold text-gray-900">{group.invite_code || group.group_code}</p>
              </div>
              <button
                onClick={copyGroupCode}
                className="ml-3 p-2 bg-white rounded-lg border border-gray-200 hover:bg-gray-50 transition-colors"
                title="Copy code"
              >
                {copied ? (
                  <Check className="w-4 h-4 text-green-600" />
                ) : (
                  <Copy className="w-4 h-4 text-gray-600" />
                )}
              </button>
            </div>
          </div>
        )}

        {/* Stats Grid */}
        <div className="grid grid-cols-2 gap-3 mb-4">
          <div className="bg-gray-50 rounded-lg p-3">
            <div className="flex items-center text-gray-500 text-xs mb-1">
              <IndianRupee className="w-3.5 h-3.5 mr-1" />
              <span>Budget</span>
            </div>
            <p className="font-bold text-gray-900">₹{totalBudget.toFixed(2)}</p>
          </div>
          <div className="bg-gray-50 rounded-lg p-3">
            <div className="flex items-center text-gray-500 text-xs mb-1">
              <Users className="w-3.5 h-3.5 mr-1" />
              <span>Members</span>
            </div>
            <p className="font-bold text-gray-900">{memberCount}</p>
          </div>
        </div>

        {/* Budget Progress */}
        <div className="mb-4">
          <div className="flex justify-between items-center mb-2">
            <span className="text-xs font-medium text-gray-600">Budget Used</span>
            <span className={`text-xs font-bold px-2 py-0.5 rounded ${getBudgetColor()}`}>
              {percentageUsed.toFixed(1)}%
            </span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2.5 overflow-hidden">
            <div
              className={`h-full transition-all duration-500 ${getProgressColor()}`}
              style={{ width: `${Math.min(percentageUsed, 100)}%` }}
            />
          </div>
          <div className="flex justify-between items-center mt-2 text-xs">
            <span className="text-gray-600">
              Spent: <span className="font-semibold text-gray-900">₹{totalExpenses.toFixed(2)}</span>
            </span>
            <span className="text-gray-600">
              Left: <span className="font-semibold text-gray-900">₹{remainingBudget.toFixed(2)}</span>
            </span>
          </div>
        </div>

        {/* Actions */}
        <div className="space-y-2">
          <Button
            onClick={() => onViewDetails(group)}
            className="w-full text-xs sm:text-sm py-2"
          >
            <span className="inline-flex items-center justify-center w-full gap-1 sm:gap-2">
              <Settings className="w-3 h-3 sm:w-4 sm:h-4" />
              <span>View Details</span>
            </span>
          </Button>

          <div className="flex flex-col sm:flex-row gap-2 sm:space-x-2">
            <Button
              onClick={() => onGenerateReport(group)}
              variant="secondary"
              className="flex-1 text-xs sm:text-sm py-2"
            >
              <span className="inline-flex items-center justify-center w-full gap-1 sm:gap-2">
                <Mail className="w-3 h-3 sm:w-4 sm:h-4" />
                <span className="hidden sm:inline">Trip Log</span>
                <span className="sm:hidden">Log</span>
              </span>
            </Button>

            {isAdmin && (
              <Button
                onClick={() => onDelete(group)}
                variant="danger"
                className="flex-1 text-xs sm:text-sm py-2 bg-red-50 text-red-600 hover:bg-red-100 border-red-200"
              >
                <span className="inline-flex items-center justify-center w-full gap-1 sm:gap-2">
                  <Trash2 className="w-3 h-3 sm:w-4 sm:h-4" />
                  <span>Delete</span>
                </span>
              </Button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
