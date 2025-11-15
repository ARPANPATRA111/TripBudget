import { Plus, Users } from 'lucide-react';
import { GroupCard } from '../groups/GroupCard.jsx';
import { Button } from '../common/Button';

export const UserDashboard = ({ 
  groups, 
  currentUserId,
  onCreateGroup, 
  onJoinGroup, 
  onDeleteGroup,
  onGenerateReport,
  onViewDetails,
  onViewGroup,
  loading
}) => {
  const adminGroups = groups.filter(g => g.created_by === currentUserId);
  const memberGroups = groups.filter(g => g.created_by !== currentUserId);

  return (
    <div className="space-y-4 sm:space-y-6">
      {/* Quick Actions */}
      <div className="bg-gradient-to-r from-blue-500 to-indigo-600 rounded-xl shadow-lg p-4 sm:p-6 text-white">
        <h2 className="text-xl sm:text-2xl font-bold mb-2 sm:mb-4">Your Trip Groups</h2>
        <p className="text-blue-100 mb-3 sm:mb-4 text-sm sm:text-base">
          Create a new trip group or join an existing one with a group code
        </p>
        <div className="flex flex-col sm:flex-row gap-2 sm:gap-3">
          <Button
            onClick={onCreateGroup}
            className="bg-white/10 text-blue-600 hover:bg-white/20 w-full sm:w-auto"
          >
            <span className="inline-flex items-center justify-center w-full gap-1 sm:gap-2">
              <Plus className="w-4 h-4 sm:w-5 sm:h-5" />
              <span>Create Group</span>
            </span>
          </Button>
          <Button
            onClick={onJoinGroup}
            className="bg-white/10 backdrop-blur-sm hover:bg-white/20 text-white border-white/30 w-full sm:w-auto"
          >
            <span className="inline-flex items-center justify-center w-full gap-1 sm:gap-2">
              <Users className="w-4 h-4 sm:w-5 sm:h-5" />
              <span>Join Group</span>
            </span>
          </Button>
        </div>
      </div>

      {loading ? (
        <div className="text-center py-12">
          <div className="inline-block w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
          <p className="mt-3 text-gray-600">Loading your groups...</p>
        </div>
      ) : groups.length === 0 ? (
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-12 text-center">
          <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <Users className="w-10 h-10 text-gray-400" />
          </div>
          <h3 className="text-xl font-semibold text-gray-900 mb-2">No Groups Yet</h3>
          <p className="text-gray-600 mb-6 max-w-md mx-auto">
            Get started by creating your first trip group or join an existing one with a group code
          </p>
          <div className="flex flex-col sm:flex-row justify-center gap-3">
            <Button onClick={onCreateGroup} className="w-full sm:w-auto">
              <span className="inline-flex items-center justify-center w-full gap-2">
                <Plus className="w-5 h-5" />
                <span>Create Your First Group</span>
              </span>
            </Button>
            <Button onClick={onJoinGroup} variant="secondary" className="w-full sm:w-auto">
              <span className="inline-flex items-center justify-center w-full gap-2">
                <Users className="w-5 h-5" />
                <span>Join a Group</span>
              </span>
            </Button>
          </div>
        </div>
      ) : (
        <>
          {/* Admin Groups */}
          {adminGroups.length > 0 && (
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                <span className="w-2 h-2 bg-blue-600 rounded-full mr-2"></span>
                Groups You Manage ({adminGroups.length})
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4">
                {adminGroups.map(group => (
                  <GroupCard
                    key={group.id}
                    group={group}
                    isAdmin={true}
                    onDelete={onDeleteGroup}
                    onGenerateReport={onGenerateReport}
                    onViewDetails={onViewGroup}
                  />
                ))}
              </div>
            </div>
          )}

          {/* Member Groups */}
          {memberGroups.length > 0 && (
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                <span className="w-2 h-2 bg-green-600 rounded-full mr-2"></span>
                Groups You've Joined ({memberGroups.length})
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4">
                {memberGroups.map(group => (
                  <GroupCard
                    key={group.id}
                    group={group}
                    isAdmin={false}
                    onDelete={onDeleteGroup}
                    onGenerateReport={onGenerateReport}
                    onViewDetails={onViewGroup}
                  />
                ))}
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
};
