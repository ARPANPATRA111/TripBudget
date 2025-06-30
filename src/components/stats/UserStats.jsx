import { Users } from 'lucide-react';
import { getInitials, getColorFromEmail } from '../../utils/helpers';

export const UserStats = ({ 
  showAllUsers, 
  setShowAllUsers, 
  allUsersStats, 
  currentUser 
}) => (
  <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-200 mb-4">
    <h2 className="text-lg sm:text-xl font-semibold text-gray-900 mb-4 flex items-center">
      <Users className="mr-2 w-5 h-5 text-blue-600" />
      All Users
    </h2>
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
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
                <p className="text-sm sm:text-base font-medium text-gray-900 truncate">
                  {user.email.split('@')[0]}
                </p>
                <span className={`text-xs ${user.role === 'Admin' ? 'text-purple-600' : user.role === 'Viewer' ? 'text-gray-500' : 'text-green-600'
                  }`}>
                  {user.role}
                </span>
              </div>
            </div>
          </div>
          <div className="space-y-1.5">
            <div className="flex justify-between text-xs sm:text-sm">
              <span className="text-gray-600">Budget:</span>
              <span className="font-medium">${user.budget.toFixed(2)}</span>
            </div>
            <div className="flex justify-between text-xs sm:text-sm">
              <span className="text-gray-600">Spent:</span>
              <span className="font-medium text-red-600">${user.totalExpenses.toFixed(2)}</span>
            </div>
            <div className="flex justify-between text-xs sm:text-sm">
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
);