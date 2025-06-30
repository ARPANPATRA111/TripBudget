import { Button } from '../common/Button';
import { DollarSign } from 'lucide-react';

export const Login = ({ name, setName, password, setPassword, error, handleLogin }) => (
  <div className="bg-gradient-to-br from-blue-50 to-indigo-100 min-h-screen flex items-center justify-center p-4">
    <div className="w-full max-w-md">
      <div className="bg-white p-6 rounded-2xl shadow-xl">
        <div className="text-center mb-6">
          <div className="mx-auto w-16 h-16 bg-blue-600 rounded-full flex items-center justify-center mb-4">
            <DollarSign className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-2xl font-bold text-gray-900 mb-1">Trip Budget Tracker</h1>
          <p className="text-gray-600 text-sm">Manage your group finances efficiently</p>
        </div>

        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Your Name</label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full px-4 py-2 text-gray-700 bg-gray-50 rounded-lg border border-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
              placeholder="Enter your name"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Password</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full px-4 py-2 text-gray-700 bg-gray-50 rounded-lg border border-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
              placeholder="Enter your password"
            />
          </div>

          {error && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-3">
              <p className="text-red-600 text-sm text-center">{error}</p>
            </div>
          )}

          <Button onClick={handleLogin} className="w-full">
            Sign In
          </Button>

          <div className="bg-gray-50 rounded-lg p-3 text-center">
            <p className="text-xs text-gray-600 mb-1">Contact admin for access</p>
            <p className="text-xs text-gray-600 mb-1">Name:- demo</p>
            <p className="text-xs text-gray-600 mb-1">Password:- 159</p>
          </div>
        </div>
      </div>
    </div>
  </div>
);