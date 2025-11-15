import { X, Users, DollarSign, Calendar, Mail, Crown } from 'lucide-react';
import { Dialog } from '../common/Dialog';
import { useState, useEffect } from 'react';
import { Button } from '../common/Button';
import { db } from '../../utils/firebase';
import { doc, getDoc, updateDoc, collection, query, getDocs, deleteDoc } from 'firebase/firestore';

export const GroupDetailsDialog = ({ isOpen, onClose, group, currentUserId, onUpdate }) => {
  const [members, setMembers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [updating, setUpdating] = useState(false);
  const [editMode, setEditMode] = useState(false);
  const [newBudget, setNewBudget] = useState('');

  const isAdmin = group?.created_by === currentUserId;

  useEffect(() => {
    if (isOpen && group) {
      fetchMembers();
      setNewBudget(group.total_budget.toString());
    }
  }, [isOpen, group]);

  const fetchMembers = async () => {
    setLoading(true);
    try {
      const membersRef = collection(db, 'groups', group.id, 'members');
      const membersSnapshot = await getDocs(membersRef);
      
      const membersData = await Promise.all(
        membersSnapshot.docs.map(async (memberDoc) => {
          const memberData = memberDoc.data();
          const userDoc = await getDoc(doc(db, 'users', memberData.user_id));
          const userData = userDoc.data();
          
          return {
            id: memberDoc.id,
            ...memberData,
            user_profiles: userData || {}
          };
        })
      );
      
      setMembers(membersData.sort((a, b) => a.joined_at - b.joined_at));
    } catch (error) {
      console.error('Error fetching members:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateBudget = async () => {
    const budget = parseFloat(newBudget);
    if (isNaN(budget) || budget <= 0) {
      alert('Please enter a valid budget amount');
      return;
    }

    setUpdating(true);
    try {
      const groupRef = doc(db, 'groups', group.id);
      await updateDoc(groupRef, { 
        total_budget: budget,
        updated_at: new Date()
      });
      
      setEditMode(false);
      onUpdate();
    } catch (error) {
      console.error('Error updating budget:', error);
      alert('Failed to update budget');
    } finally {
      setUpdating(false);
    }
  };

  const handleRemoveMember = async (memberId, memberUserId) => {
    if (memberUserId === group.created_by) {
      alert('Cannot remove the group admin');
      return;
    }

    if (!confirm('Are you sure you want to remove this member?')) {
      return;
    }

    try {
      const memberRef = doc(db, 'groups', group.id, 'members', memberId);
      await deleteDoc(memberRef);
      
      // Also remove from members array in group doc
      const groupRef = doc(db, 'groups', group.id);
      const groupDoc = await getDoc(groupRef);
      if (groupDoc.exists()) {
        const currentMembers = groupDoc.data().members || [];
        await updateDoc(groupRef, {
          members: currentMembers.filter(id => id !== memberUserId),
          updated_at: new Date()
        });
      }
      
      fetchMembers();
      onUpdate();
    } catch (error) {
      console.error('Error removing member:', error);
      alert('Failed to remove member');
    }
  };

  if (!group) return null;

  // Calculate derived values with safe defaults
  const totalExpenses = group.total_expenses || 0;
  const totalBudget = group.total_budget || 0;
  const remainingBudget = totalBudget - totalExpenses;

  const percentageUsed = totalBudget > 0 
    ? (totalExpenses / totalBudget) * 100 
    : 0;

  return (
    <Dialog isOpen={isOpen} onClose={onClose} maxWidth="max-w-2xl">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-xl font-bold text-gray-900 flex items-center">
          <Users className="mr-2 w-6 h-6 text-blue-600" />
          Group Details
        </h2>
        <button
          onClick={onClose}
          className="text-gray-400 hover:text-gray-500"
        >
          <X size={20} />
        </button>
      </div>

      <div className="space-y-6">
        {/* Group Info */}
        <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-lg p-4 border border-blue-200">
          <h3 className="font-bold text-lg text-gray-900 mb-3">{group.trip_name}</h3>
          <div className="grid grid-cols-2 gap-3 text-sm">
            <div className="flex items-center text-gray-600">
              <Calendar className="w-4 h-4 mr-2" />
              Created: {group.created_at 
                ? (group.created_at.toDate ? group.created_at.toDate() : new Date(group.created_at)).toLocaleDateString()
                : 'N/A'
              }
            </div>
            <div className="flex items-center text-gray-600">
              <Users className="w-4 h-4 mr-2" />
              {members.length} member{members.length !== 1 ? 's' : ''}
            </div>
          </div>
        </div>

        {/* Budget Section */}
        <div className="bg-white rounded-lg border border-gray-200 p-4">
          <div className="flex justify-between items-center mb-3">
            <h4 className="font-semibold text-gray-900">Budget Overview</h4>
            {isAdmin && !editMode && (
              <button
                onClick={() => setEditMode(true)}
                className="text-xs text-blue-600 hover:text-blue-700 font-medium"
              >
                Edit Budget
              </button>
            )}
          </div>

          {editMode && isAdmin ? (
            <div className="space-y-3">
              <div className="flex items-center space-x-2">
                <DollarSign className="w-5 h-5 text-gray-400" />
                <input
                  type="number"
                  value={newBudget}
                  onChange={(e) => setNewBudget(e.target.value)}
                  className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  step="0.01"
                  min="0.01"
                />
              </div>
              <div className="flex space-x-2">
                <Button
                  onClick={handleUpdateBudget}
                  disabled={updating}
                  className="flex-1 text-sm"
                >
                  <span className="inline-flex items-center justify-center w-full gap-1 sm:gap-2">
                    <span>{updating ? 'Updating...' : 'Update'}</span>
                  </span>
                </Button>
                <Button
                  onClick={() => {
                    setEditMode(false);
                    setNewBudget(group.total_budget.toString());
                  }}
                  variant="secondary"
                  className="flex-1 text-sm"
                >
                  <span className="inline-flex items-center justify-center w-full gap-1 sm:gap-2">
                    <span>Cancel</span>
                  </span>
                </Button>
              </div>
            </div>
          ) : (
            <div className="space-y-3">
              <div className="grid grid-cols-3 gap-3 text-center">
                <div>
                  <p className="text-xs text-gray-500 mb-1">Budget</p>
                  <p className="font-bold text-gray-900">${totalBudget.toFixed(2)}</p>
                </div>
                <div>
                  <p className="text-xs text-gray-500 mb-1">Spent</p>
                  <p className="font-bold text-red-600">${totalExpenses.toFixed(2)}</p>
                </div>
                <div>
                  <p className="text-xs text-gray-500 mb-1">Remaining</p>
                  <p className="font-bold text-green-600">${remainingBudget.toFixed(2)}</p>
                </div>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2.5">
                <div
                  className={`h-full transition-all rounded-full ${
                    percentageUsed >= 90 ? 'bg-red-500' :
                    percentageUsed >= 75 ? 'bg-orange-500' : 'bg-green-500'
                  }`}
                  style={{ width: `${Math.min(percentageUsed, 100)}%` }}
                />
              </div>
              <p className="text-xs text-center text-gray-600">
                {percentageUsed.toFixed(1)}% of budget used
              </p>
            </div>
          )}
        </div>

        {/* Members List */}
        <div className="bg-white rounded-lg border border-gray-200 p-4">
          <h4 className="font-semibold text-gray-900 mb-3">Members</h4>
          {loading ? (
            <p className="text-sm text-gray-500 text-center py-4">Loading members...</p>
          ) : (
            <div className="space-y-2 max-h-64 overflow-y-auto">
              {members.map((member) => (
                <div
                  key={member.id}
                  className="flex items-center justify-between p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
                >
                  <div className="flex items-center flex-1">
                    <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-full flex items-center justify-center text-white font-bold mr-3">
                      {member.user_profiles.full_name?.[0]?.toUpperCase() || 'U'}
                    </div>
                    <div>
                      <p className="font-medium text-gray-900 text-sm">
                        {member.user_profiles.full_name || member.user_profiles.email}
                        {member.user_id === group.created_by && (
                          <Crown className="inline w-4 h-4 ml-1 text-yellow-500" />
                        )}
                      </p>
                      <p className="text-xs text-gray-500">{member.user_profiles.email}</p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    <span className={`text-xs px-2 py-1 rounded-full ${
                      member.role === 'admin' 
                        ? 'bg-blue-100 text-blue-700' 
                        : 'bg-gray-100 text-gray-700'
                    }`}>
                      {member.role}
                    </span>
                    {isAdmin && member.user_id !== group.created_by && (
                      <button
                        onClick={() => handleRemoveMember(member.id, member.user_id)}
                        className="text-xs text-red-600 hover:text-red-700 font-medium"
                      >
                        Remove
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </Dialog>
  );
};
