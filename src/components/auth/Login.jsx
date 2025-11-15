import { Button } from '../common/Button';
import { DollarSign } from 'lucide-react';

export const Login = ({ error, handleGoogleSignIn, loading }) => (
  <div className="bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 min-h-screen flex items-center justify-center p-4 sm:p-6">
    <div className="w-full max-w-md">
      <div className="bg-white p-8 sm:p-10 rounded-3xl shadow-2xl border border-gray-100">
        <div className="text-center mb-8 sm:mb-10">
          <div className="mx-auto w-20 h-20 sm:w-24 sm:h-24 bg-gradient-to-br from-blue-600 via-indigo-600 to-purple-600 rounded-3xl flex items-center justify-center mb-5 sm:mb-6 shadow-xl transform hover:scale-105 transition-transform">
            <DollarSign className="w-10 h-10 sm:w-12 sm:h-12 text-white" strokeWidth={2.5} />
          </div>
          <h1 className="text-3xl sm:text-4xl font-bold mb-3">
            Trip Budget Tracker
          </h1>
          <p className="text-base sm:text-lg text-gray-600 font-medium">Collaborative expense tracking for group trips</p>
        </div>

        <div className="space-y-5">
          {error && (
            <div className="bg-red-50 border-l-4 border-red-500 rounded-lg p-4 shadow-sm">
              <p className="text-red-700 text-sm text-center font-medium">{error}</p>
            </div>
          )}

          {loading && (
            <div className="bg-blue-50 border-l-4 border-blue-500 rounded-lg p-4 shadow-sm">
              <p className="text-blue-800 text-sm text-center font-medium">🔐 Please check for a popup window to complete sign-in</p>
            </div>
          )}

<Button
  onClick={handleGoogleSignIn}
  disabled={loading}
  className="
    relative inline-flex w-full items-center justify-center
    rounded-full border border-gray-300
    bg-blue-500 text-sm sm:text-base font-medium text-white
    py-3 pl-12 pr-6
    shadow-sm hover:shadow-md
    hover:bg-blue-600
    focus:outline-none focus:ring-2 focus:ring-blue-500/70 focus:ring-offset-2
    disabled:bg-gray-50 disabled:border-gray-200
    disabled:text-gray-400 disabled:shadow-none
    disabled:hover:bg-gray-50 disabled:hover:shadow-none
    transition-all duration-150
  "
>
  {/* Google icon on the left */}
  <span className="absolute left-4 sm:left-5 flex items-center justify-center">
    <svg className="w-5 h-5 sm:w-6 sm:h-6" viewBox="0 0 24 24">
      <path
        fill="#4285F4"
        d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
      />
      <path
        fill="#34A853"
        d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
      />
      <path
        fill="#FBBC05"
        d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
      />
      <path
        fill="#EA4335"
        d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
      />
    </svg>
  </span>

  <span>
    {loading ? 'Signing in…' : 'Sign in with Google'}
  </span>
</Button>

          <p className="text-xs sm:text-sm text-gray-500 text-center mt-6 px-2">
            By signing in, you agree to our <span className="text-gray-700 font-medium">Terms of Service</span> and <span className="text-gray-700 font-medium">Privacy Policy</span>
          </p>
        </div>
      </div>
      
      {/* Optional: Add a subtle footer */}
      <div className="text-center mt-6">
        <p className="text-sm text-gray-500">
          Secure authentication powered by Google
        </p>
      </div>
    </div>
  </div>
);