import {
  collection,
  doc,
  getDoc,
  getDocs,
  addDoc,
  updateDoc,
  deleteDoc,
  query,
  where,
  orderBy,
  arrayUnion,
  arrayRemove,
  writeBatch,
} from 'firebase/firestore';
import { db } from './firebase';

// ==================== GROUPS ====================

/**
 * Create a new group
 */
export const createGroup = async (groupData, userId) => {
  try {
    const now = new Date();
    const groupWithTimestamps = {
      ...groupData,
      created_by: userId,
      members: [userId],
      created_at: now,
      updated_at: now,
    };

    const groupRef = await addDoc(collection(db, 'groups'), groupWithTimestamps);

    // Add user as admin in group_members subcollection
    await addDoc(collection(db, 'groups', groupRef.id, 'members'), {
      user_id: userId,
      role: 'admin',
      joined_at: now,
    });

    return { data: { id: groupRef.id, ...groupWithTimestamps }, error: null };
  } catch (error) {
    console.error('Error creating group:', error);
    return { data: null, error };
  }
};

/**
 * Get a group by invite code
 */
export const getGroupByInviteCode = async (inviteCode) => {
  try {
    const q = query(
      collection(db, 'groups'),
      where('invite_code', '==', inviteCode)
    );
    const querySnapshot = await getDocs(q);

    if (querySnapshot.empty) {
      return { data: null, error: new Error('Group not found') };
    }

    const doc = querySnapshot.docs[0];
    return { data: { id: doc.id, ...doc.data() }, error: null };
  } catch (error) {
    console.error('Error getting group by invite code:', error);
    return { data: null, error };
  }
};

/**
 * Join a group
 */
export const joinGroup = async (groupId, userId) => {
  try {
    const now = new Date();
    const groupRef = doc(db, 'groups', groupId);

    // Add user to members array
    await updateDoc(groupRef, {
      members: arrayUnion(userId),
      updated_at: now,
    });

    // Add member record
    await addDoc(collection(db, 'groups', groupId, 'members'), {
      user_id: userId,
      role: 'member',
      joined_at: now,
    });

    return { error: null };
  } catch (error) {
    console.error('Error joining group:', error);
    return { error };
  }
};

/**
 * Get user's groups
 */
export const getUserGroups = async (userId) => {
  try {
    const q = query(
      collection(db, 'groups'),
      where('members', 'array-contains', userId),
      orderBy('created_at', 'desc')
    );
    const querySnapshot = await getDocs(q);

    const groups = querySnapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    }));

    return { data: groups, error: null };
  } catch (error) {
    console.error('Error getting user groups:', error);
    return { data: [], error };
  }
};

/**
 * Delete a group
 */
export const deleteGroup = async (groupId) => {
  try {
    const batch = writeBatch(db);

    // Delete all expenses in the group
    const expensesQuery = query(
      collection(db, 'expenses'),
      where('group_id', '==', groupId)
    );
    const expensesSnapshot = await getDocs(expensesQuery);
    expensesSnapshot.docs.forEach((doc) => {
      batch.delete(doc.ref);
    });

    // Delete all members
    const membersSnapshot = await getDocs(
      collection(db, 'groups', groupId, 'members')
    );
    membersSnapshot.docs.forEach((doc) => {
      batch.delete(doc.ref);
    });

    // Delete the group
    batch.delete(doc(db, 'groups', groupId));

    await batch.commit();
    return { error: null };
  } catch (error) {
    console.error('Error deleting group:', error);
    return { error };
  }
};

/**
 * Get group details with member info
 */
export const getGroupDetails = async (groupId) => {
  try {
    const groupRef = doc(db, 'groups', groupId);
    const groupSnap = await getDoc(groupRef);

    if (!groupSnap.exists()) {
      return { data: null, error: new Error('Group not found') };
    }

    const groupData = { id: groupSnap.id, ...groupSnap.data() };

    // Get members
    const membersSnapshot = await getDocs(
      collection(db, 'groups', groupId, 'members')
    );
    const memberIds = membersSnapshot.docs.map((doc) => doc.data().user_id);

    // Get user profiles for members
    const memberProfiles = await Promise.all(
      memberIds.map(async (userId) => {
        const userRef = doc(db, 'users', userId);
        const userSnap = await getDoc(userRef);
        return userSnap.exists() ? { id: userId, ...userSnap.data() } : null;
      })
    );

    groupData.member_profiles = memberProfiles.filter(Boolean);
    return { data: groupData, error: null };
  } catch (error) {
    console.error('Error getting group details:', error);
    return { data: null, error };
  }
};

// ==================== EXPENSES ====================

/**
 * Create a new expense
 */
export const createExpense = async (expenseData) => {
  try {
    const now = new Date();
    const expenseWithTimestamps = {
      ...expenseData,
      created_at: now,
      updated_at: now,
    };
    
    const expenseRef = await addDoc(collection(db, 'expenses'), expenseWithTimestamps);

    return { data: { id: expenseRef.id, ...expenseWithTimestamps }, error: null };
  } catch (error) {
    console.error('Error creating expense:', error);
    return { data: null, error };
  }
};

/**
 * Get expenses for a group
 */
export const getGroupExpenses = async (groupId) => {
  try {
    const q = query(
      collection(db, 'expenses'),
      where('group_id', '==', groupId),
      orderBy('expense_date', 'desc')
    );
    const querySnapshot = await getDocs(q);

    const expenses = querySnapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    }));

    return { data: expenses, error: null };
  } catch (error) {
    console.error('Error getting group expenses:', error);
    return { data: [], error };
  }
};

/**
 * Update an expense
 */
export const updateExpense = async (expenseId, updates) => {
  try {
    const expenseRef = doc(db, 'expenses', expenseId);
    await updateDoc(expenseRef, {
      ...updates,
      updated_at: new Date(),
    });

    return { error: null };
  } catch (error) {
    console.error('Error updating expense:', error);
    return { error };
  }
};

/**
 * Delete an expense
 */
export const deleteExpense = async (expenseId) => {
  try {
    await deleteDoc(doc(db, 'expenses', expenseId));
    return { error: null };
  } catch (error) {
    console.error('Error deleting expense:', error);
    return { error };
  }
};

// ==================== CUSTOM FILTERS ====================

/**
 * Save a custom filter
 */
export const saveCustomFilter = async (userId, filterData) => {
  try {
    const now = new Date();
    const filterWithTimestamp = {
      user_id: userId,
      ...filterData,
      created_at: now,
    };
    
    const filterRef = await addDoc(collection(db, 'custom_filters'), filterWithTimestamp);

    return { data: { id: filterRef.id, ...filterWithTimestamp }, error: null };
  } catch (error) {
    console.error('Error saving custom filter:', error);
    return { data: null, error };
  }
};

/**
 * Get user's custom filters
 */
export const getUserCustomFilters = async (userId) => {
  try {
    const q = query(
      collection(db, 'custom_filters'),
      where('user_id', '==', userId),
      orderBy('created_at', 'desc')
    );
    const querySnapshot = await getDocs(q);

    const filters = querySnapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    }));

    return { data: filters, error: null };
  } catch (error) {
    console.error('Error getting custom filters:', error);
    return { data: [], error };
  }
};

/**
 * Delete a custom filter
 */
export const deleteCustomFilter = async (filterId) => {
  try {
    await deleteDoc(doc(db, 'custom_filters', filterId));
    return { error: null };
  } catch (error) {
    console.error('Error deleting custom filter:', error);
    return { error };
  }
};

// ==================== STATISTICS ====================

/**
 * Get group statistics
 */
export const getGroupStats = async (groupId) => {
  try {
    const expensesResult = await getGroupExpenses(groupId);
    if (expensesResult.error) throw expensesResult.error;

    const expenses = expensesResult.data;

    // Calculate stats
    const totalSpent = expenses.reduce((sum, exp) => sum + exp.amount, 0);
    const categoryTotals = expenses.reduce((acc, exp) => {
      acc[exp.category] = (acc[exp.category] || 0) + exp.amount;
      return acc;
    }, {});

    const userTotals = expenses.reduce((acc, exp) => {
      acc[exp.paid_by] = (acc[exp.paid_by] || 0) + exp.amount;
      return acc;
    }, {});

    return {
      data: {
        total_spent: totalSpent,
        expense_count: expenses.length,
        category_totals: categoryTotals,
        user_totals: userTotals,
      },
      error: null,
    };
  } catch (error) {
    console.error('Error getting group stats:', error);
    return { data: null, error };
  }
};
