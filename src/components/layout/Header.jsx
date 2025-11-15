import { getInitials, getColorFromEmail } from '../../utils/helpers';
import { Button } from '../common/Button';
import { Eye, EyeOff, PieChart, Download } from 'lucide-react';

export const Header = ({ 
  currentUser, 
  showStats, 
  setShowStats, 
  showTotalBudget, 
  setShowTotalBudget, 
  showAllUsers, 
  setShowAllUsers, 
  totalBudget, 
  handleLogout 
}) => (
  <header className="bg-white shadow-sm sticky top-0 z-50 border-b border-gray-200">
    <div className="px-4 sm:px-6 lg:px-8">
      <div className="flex justify-between items-center h-14 sm:h-16">
        <div className="flex items-center space-x-2">
          <div
            className="w-7 h-7 sm:w-8 sm:h-8 rounded-md flex items-center justify-center text-white"
            style={{ backgroundColor: getColorFromEmail(currentUser.email) }}
          >
            {getInitials(currentUser.email)}
          </div>
          <div>
            <h1 className="text-sm sm:text-base text-gray-900 truncate max-w-[120px] sm:max-w-[180px] uppercase font-bold">
              {currentUser.email.split('@')[0]}
            </h1>
            <span className={`text-xs ${currentUser.role === 'Admin' ? 'text-blue-400' : currentUser.role === 'Viewer' ? 'text-gray-500' : 'text-green-600'}`}>
              {currentUser.role}
            </span>
          </div>
        </div>

        <div className="flex items-center space-x-2 sm:space-x-4">
          <button
            onClick={() => setShowStats(!showStats)}
            className={`p-1.5 rounded-md transition-colors ${showStats
              ? 'bg-blue-100 text-blue-600'
              : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            title="View spending stats"
          >
            <PieChart size={16} />
          </button>
          <button
            onClick={() => setShowTotalBudget(!showTotalBudget)}
            title="Overall Trip Budget"
            className="px-2 py-1 text-xs sm:text-sm font-medium bg-indigo-100 text-indigo-700 rounded-md hover:bg-indigo-200"
          >
            ${totalBudget.toFixed(2)}
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
          <Button onClick={handleLogout} variant="danger">
            <span className="inline-flex items-center justify-center w-full gap-1 sm:gap-2">
              <span>Logout</span>
            </span>
          </Button>
        </div>
      </div>
    </div>
  </header>
);