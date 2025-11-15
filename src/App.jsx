import React, { useState, useEffect } from 'react';
import { Toaster, toast } from 'react-hot-toast';
import { signInWithGoogle, signOut, getCurrentUser, getOrCreateUserProfile, onAuthStateChange } from './utils/auth';
import {
  createGroup,
  getUserGroups,
  getGroupByInviteCode,
  joinGroup,
  deleteGroup,
  getGroupStats
} from './utils/database';
import { downloadTripLog } from './utils/tripLog';
import { Loading } from './components/common/Loading';
import { Login } from './components/auth/Login';
import { UserDashboard } from './components/dashboard/UserDashboard';
import { GroupExpensesView } from './components/expenses/GroupExpensesView';
import { CreateGroupDialog } from './components/groups/CreateGroupDialog';
import { JoinGroupDialog } from './components/groups/JoinGroupDialog';
import { GroupDetailsDialog } from './components/groups/GroupDetailsDialog';
import { LogOut, User } from 'lucide-react';

export default function App() {
  // Auth state
  const [user, setUser] = useState(null);
  const [userProfile, setUserProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [authError, setAuthError] = useState('');

  // App state
  const [groups, setGroups] = useState([]);
  const [selectedGroup, setSelectedGroup] = useState(null);
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [showJoinDialog, setShowJoinDialog] = useState(false);
  const [showGroupDetails, setShowGroupDetails] = useState(false);
  const [selectedGroupForDetails, setSelectedGroupForDetails] = useState(null);

  // Initialize auth
  useEffect(() => {
    initializeAuth();

    const unsubscribe = onAuthStateChange(async (authUser) => {
      if (authUser) {
        await handleUserSignIn(authUser);
      } else {
        setUser(null);
        setUserProfile(null);
        setGroups([]);
        setSelectedGroup(null);
      }
    });

    return () => {
      unsubscribe();
    };
  }, []);

  // Fetch groups when user profile is set
  useEffect(() => {
    if (userProfile) {
      fetchUserGroups();
    }
  }, [userProfile]);

  const initializeAuth = async () => {
    try {
      const { user: currentUser } = await getCurrentUser();
      if (currentUser) {
        await handleUserSignIn(currentUser);
      }
    } catch (error) {
      console.error('Error initializing auth:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleUserSignIn = async (authUser) => {
    try {
      const { profile } = await getOrCreateUserProfile(authUser);
      setUser(authUser);
      setUserProfile(profile);
      setAuthError('');
    } catch (error) {
      console.error('Error handling user sign in:', error);
      setAuthError('Failed to load user profile');
    }
  };

  const handleGoogleSignIn = async () => {
    setLoading(true);
    setAuthError('');
    try {
      const { user: authUser, error } = await signInWithGoogle();
      if (error) {
        setAuthError(error.message || 'Failed to sign in with Google');
      }
      // User will be handled by onAuthStateChange
    } catch (error) {
      setAuthError('An unexpected error occurred');
      console.error('Sign in error:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSignOut = async () => {
    try {
      await signOut();
      setUser(null);
      setUserProfile(null);
      setGroups([]);
      setSelectedGroup(null);
    } catch (error) {
      console.error('Error signing out:', error);
    }
  };

  const fetchUserGroups = async () => {
    try {
      const { data: groupsData, error } = await getUserGroups(userProfile.id);
      if (error) throw error;

      // Enrich groups with stats
      const groupsWithStats = await Promise.all(
        groupsData.map(async (group) => {
          const { data: stats } = await getGroupStats(group.id);
          return {
            ...group,
            total_expenses: stats?.total_spent || 0,
            expense_count: stats?.expense_count || 0,
          };
        })
      );

      setGroups(groupsWithStats);
    } catch (error) {
      console.error('Error fetching groups:', error);
    }
  };

  const handleCreateGroup = async ({ tripName, totalBudget }) => {
    try {
      // Generate 8-character invite code
      const inviteCode = Math.random().toString(36).substring(2, 10).toUpperCase();

      const { data: newGroup, error } = await createGroup(
        {
          trip_name: tripName,
          total_budget: totalBudget,
          invite_code: inviteCode,
          is_active: true,
        },
        userProfile.id
      );

      if (error) throw error;

      setShowCreateDialog(false);
      await fetchUserGroups();
      
      // Show success message with invite code
      toast.success(
        `Group created! Invite Code: ${inviteCode}`,
        {
          duration: 6000,
          icon: '🎉',
        }
      );
    } catch (error) {
      console.error('Error creating group:', error);
      throw new Error('Failed to create group. Please try again.');
    }
  };

  const handleJoinGroup = async (inviteCode) => {
    try {
      // Check if group exists
      const { data: group, error: groupError } = await getGroupByInviteCode(inviteCode);

      if (groupError || !group) {
        throw new Error('Invalid invite code or group not found');
      }

      // Check if group is active
      if (!group.is_active) {
        throw new Error('This group is no longer active');
      }

      // Check if already a member
      if (group.members && group.members.includes(userProfile.id)) {
        throw new Error('You are already a member of this group');
      }

      // Add user as member
      const { error: joinError } = await joinGroup(group.id, userProfile.id);

      if (joinError) throw joinError;

      toast.success('Successfully joined the group!', { icon: '✅' });
      await fetchUserGroups();
      setShowJoinDialog(false);
    } catch (error) {
      console.error('Error joining group:', error);
      throw new Error(error.message || 'Failed to join group. Please try again.');
    }
  };

  const handleDeleteGroup = async (group) => {
    const confirmed = window.confirm(`Are you sure you want to delete "${group.trip_name}"? This action cannot be undone.`);
    if (!confirmed) return;

    if (group.created_by !== userProfile.id) {
      toast.error('Only the group admin can delete this group');
      return;
    }

    try {
      // First, generate and download trip log for all members
      await handleGenerateReport(group);

      // Delete the group (will cascade delete members and expenses)
      const { error } = await deleteGroup(group.id);

      if (error) throw error;

      toast.success('Group deleted. Trip log downloaded for your records.');
      await fetchUserGroups();
    } catch (error) {
      console.error('Error deleting group:', error);
      toast.error('Failed to delete group. Please try again.');
    }
  };

  const handleGenerateReport = async (group) => {
    try {
      const result = await downloadTripLog(group.id);
      if (result.success) {
        toast.success('Trip log downloaded successfully!', { icon: '📄' });
      } else {
        throw result.error;
      }
    } catch (error) {
      console.error('Error generating report:', error);
      toast.error('Failed to generate trip log. Please try again.');
    }
  };

  const handleViewDetails = (group) => {
    setSelectedGroupForDetails(group);
    setShowGroupDetails(true);
  };

  const handleViewGroup = (group) => {
    setSelectedGroup(group);
  };

  if (loading) {
    return <Loading />;
  }

  if (!user || !userProfile) {
    return (
      <Login
        error={authError}
        handleGoogleSignIn={handleGoogleSignIn}
        loading={loading}
      />
    );
  }

  return (
    <>
      <Toaster 
        position="top-center"
        toastOptions={{
          duration: 4000,
          style: {
            background: '#fff',
            color: '#363636',
            padding: '16px',
            borderRadius: '8px',
            boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
            maxWidth: '500px',
          },
          success: {
            iconTheme: {
              primary: '#10b981',
              secondary: '#fff',
            },
          },
          error: {
            iconTheme: {
              primary: '#ef4444',
              secondary: '#fff',
            },
          },
        }}
      />
      <div className="min-h-screen bg-gray-50">
        {/* Header */}
        <header className="bg-white shadow-sm border-b border-gray-200 sticky top-0 z-40">
          <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8 py-3 sm:py-4">
            <div className="flex justify-between items-center">
              <div className="flex items-center space-x-2 sm:space-x-3 min-w-0 flex-1">
                <div className="w-9 h-9 sm:w-10 sm:h-10 bg-gradient-to-br from-blue-600 to-indigo-600 rounded-full flex items-center justify-center flex-shrink-0">
                  <span className="text-white font-bold text-base sm:text-lg">
                    {userProfile.full_name?.[0]?.toUpperCase() || userProfile.email?.[0]?.toUpperCase()}
                  </span>
                </div>
                <div className="min-w-0 flex-1">
                  <h1 className="text-base sm:text-xl font-bold text-gray-900 truncate">
                    {selectedGroup ? selectedGroup.trip_name : 'Trip Budget Tracker'}
                  </h1>
                  <p className="text-xs sm:text-sm text-gray-600 truncate">
                    {userProfile.full_name || userProfile.email}
                  </p>
                </div>
              </div>
              <button
                onClick={handleSignOut}
                className="flex items-center space-x-1 sm:space-x-2 px-2 sm:px-4 py-2 text-gray-700 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors flex-shrink-0"
              >
                <LogOut className="w-4 h-4 sm:w-5 sm:h-5" />
                <span className="hidden sm:inline text-sm">Sign Out</span>
              </button>
            </div>
          </div>
        </header>

        {/* Main Content */}
        <main className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8 py-4 sm:py-8">
          {selectedGroup ? (
            <GroupExpensesView
              group={selectedGroup}
              currentUserId={userProfile.id}
              onBack={() => setSelectedGroup(null)}
            />
          ) : (
            <UserDashboard
              groups={groups}
              currentUserId={userProfile.id}
              onCreateGroup={() => setShowCreateDialog(true)}
              onJoinGroup={() => setShowJoinDialog(true)}
              onDeleteGroup={handleDeleteGroup}
              onGenerateReport={handleGenerateReport}
              onViewDetails={handleViewDetails}
              onViewGroup={handleViewGroup}
              loading={loading}
            />
          )}
        </main>

        {/* Dialogs */}
        <CreateGroupDialog
          isOpen={showCreateDialog}
          onClose={() => setShowCreateDialog(false)}
          onCreate={handleCreateGroup}
        />

        <JoinGroupDialog
          isOpen={showJoinDialog}
          onClose={() => setShowJoinDialog(false)}
          onJoin={handleJoinGroup}
        />

        {selectedGroupForDetails && (
          <GroupDetailsDialog
            isOpen={showGroupDetails}
            onClose={() => {
              setShowGroupDetails(false);
              setSelectedGroupForDetails(null);
            }}
            group={selectedGroupForDetails}
            currentUserId={userProfile.id}
            onUpdate={fetchUserGroups}
          />
        )}
      </div>
    </>
  );
}
