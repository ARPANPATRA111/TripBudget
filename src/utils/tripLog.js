import { doc, getDoc, collection, query, where, orderBy, getDocs } from 'firebase/firestore';
import { db } from './firebase';

/**
 * Generates a comprehensive trip log report for a group
 * @param {string} groupId - The group ID
 * @returns {Object} - Trip log data
 */
export const generateTripLog = async (groupId) => {
  try {
    // Fetch group details
    const groupRef = doc(db, 'groups', groupId);
    const groupSnap = await getDoc(groupRef);

    if (!groupSnap.exists()) {
      throw new Error('Group not found');
    }

    const group = { id: groupSnap.id, ...groupSnap.data() };

    // Fetch all expenses
    const expensesQuery = query(
      collection(db, 'expenses'),
      where('group_id', '==', groupId),
      orderBy('expense_date', 'asc')
    );
    const expensesSnap = await getDocs(expensesQuery);
    
    // Fetch user profiles for expenses
    const expenses = await Promise.all(
      expensesSnap.docs.map(async (expDoc) => {
        const expense = { id: expDoc.id, ...expDoc.data() };
        const userRef = doc(db, 'users', expense.paid_by);
        const userSnap = await getDoc(userRef);
        expense.user_profiles = userSnap.exists() 
          ? { id: userSnap.id, ...userSnap.data() }
          : { id: expense.paid_by, email: 'Unknown', full_name: 'Unknown' };
        return expense;
      })
    );

    // Fetch all members
    const membersSnap = await getDocs(
      collection(db, 'groups', groupId, 'members')
    );
    
    const members = await Promise.all(
      membersSnap.docs.map(async (memberDoc) => {
        const memberData = memberDoc.data();
        const userRef = doc(db, 'users', memberData.user_id);
        const userSnap = await getDoc(userRef);
        return {
          id: memberDoc.id,
          ...memberData,
          user_profiles: userSnap.exists() ? { id: userSnap.id, ...userSnap.data() } : null,
        };
      })
    );

    // Calculate statistics
    const totalExpenses = expenses.reduce((sum, exp) => sum + parseFloat(exp.amount), 0);
    const remainingBudget = group.total_budget - totalExpenses;

    // Group expenses by category
    const categoryBreakdown = {};
    expenses.forEach(exp => {
      if (!categoryBreakdown[exp.category]) {
        categoryBreakdown[exp.category] = 0;
      }
      categoryBreakdown[exp.category] += parseFloat(exp.amount);
    });

    // Calculate per-user spending
    const userSpending = {};
    expenses.forEach(exp => {
      const userId = exp.paid_by;
      if (!userSpending[userId]) {
        userSpending[userId] = {
          name: exp.user_profiles.full_name || exp.user_profiles.email,
          email: exp.user_profiles.email,
          total: 0,
          count: 0
        };
      }
      userSpending[userId].total += parseFloat(exp.amount);
      userSpending[userId].count += 1;
    });

    return {
      group,
      expenses,
      members,
      stats: {
        totalBudget: group.total_budget,
        totalExpenses,
        remainingBudget,
        memberCount: members.length,
        expenseCount: expenses.length,
        categoryBreakdown,
        userSpending
      }
    };
  } catch (error) {
    console.error('Error generating trip log:', error);
    throw error;
  }
};

/**
 * Generates HTML content for the trip log email
 * @param {Object} tripLogData - Data from generateTripLog
 * @returns {string} - HTML content
 */
export const generateTripLogHTML = (tripLogData) => {
  const { group, expenses, stats } = tripLogData;
  
  const categoryRows = Object.entries(stats.categoryBreakdown)
    .sort((a, b) => b[1] - a[1])
    .map(([category, amount]) => `
      <tr>
        <td style="padding: 8px; border-bottom: 1px solid #e5e7eb;">${category}</td>
        <td style="padding: 8px; border-bottom: 1px solid #e5e7eb; text-align: right;">$${amount.toFixed(2)}</td>
        <td style="padding: 8px; border-bottom: 1px solid #e5e7eb; text-align: right;">
          ${((amount / stats.totalBudget) * 100).toFixed(1)}%
        </td>
      </tr>
    `).join('');

  const userRows = Object.entries(stats.userSpending)
    .sort((a, b) => b[1].total - a[1].total)
    .map(([userId, data]) => `
      <tr>
        <td style="padding: 8px; border-bottom: 1px solid #e5e7eb;">${data.name}</td>
        <td style="padding: 8px; border-bottom: 1px solid #e5e7eb; text-align: right;">${data.count}</td>
        <td style="padding: 8px; border-bottom: 1px solid #e5e7eb; text-align: right;">$${data.total.toFixed(2)}</td>
      </tr>
    `).join('');

  const expenseRows = expenses
    .map(exp => `
      <tr>
        <td style="padding: 8px; border-bottom: 1px solid #e5e7eb;">${new Date(exp.expense_date).toLocaleDateString()}</td>
        <td style="padding: 8px; border-bottom: 1px solid #e5e7eb;">${exp.user_profiles.full_name || exp.user_profiles.email}</td>
        <td style="padding: 8px; border-bottom: 1px solid #e5e7eb;">${exp.category}</td>
        <td style="padding: 8px; border-bottom: 1px solid #e5e7eb;">${exp.description}</td>
        <td style="padding: 8px; border-bottom: 1px solid #e5e7eb; text-align: right;">$${parseFloat(exp.amount).toFixed(2)}</td>
      </tr>
    `).join('');

  return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Trip Log - ${group.trip_name}</title>
</head>
<body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 800px; margin: 0 auto; padding: 20px;">
  <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 30px; border-radius: 10px; margin-bottom: 30px;">
    <h1 style="margin: 0 0 10px 0;">${group.trip_name}</h1>
    <p style="margin: 0; opacity: 0.9;">Trip Log Report</p>
    <p style="margin: 5px 0 0 0; opacity: 0.9; font-size: 14px;">Generated on ${new Date().toLocaleDateString()}</p>
  </div>

  <div style="background: #f9fafb; border-radius: 10px; padding: 20px; margin-bottom: 30px;">
    <h2 style="color: #1f2937; margin-top: 0;">Budget Summary</h2>
    <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 15px;">
      <div style="background: white; padding: 15px; border-radius: 8px; border-left: 4px solid #10b981;">
        <p style="margin: 0; color: #6b7280; font-size: 14px;">Total Budget</p>
        <p style="margin: 5px 0 0 0; font-size: 24px; font-weight: bold; color: #10b981;">$${stats.totalBudget.toFixed(2)}</p>
      </div>
      <div style="background: white; padding: 15px; border-radius: 8px; border-left: 4px solid #ef4444;">
        <p style="margin: 0; color: #6b7280; font-size: 14px;">Total Spent</p>
        <p style="margin: 5px 0 0 0; font-size: 24px; font-weight: bold; color: #ef4444;">$${stats.totalExpenses.toFixed(2)}</p>
      </div>
      <div style="background: white; padding: 15px; border-radius: 8px; border-left: 4px solid #3b82f6;">
        <p style="margin: 0; color: #6b7280; font-size: 14px;">Remaining</p>
        <p style="margin: 5px 0 0 0; font-size: 24px; font-weight: bold; color: #3b82f6;">$${stats.remainingBudget.toFixed(2)}</p>
      </div>
    </div>
  </div>

  <div style="background: white; border-radius: 10px; padding: 20px; margin-bottom: 30px; box-shadow: 0 1px 3px rgba(0,0,0,0.1);">
    <h2 style="color: #1f2937; margin-top: 0;">Spending by Category</h2>
    <table style="width: 100%; border-collapse: collapse;">
      <thead>
        <tr style="background: #f3f4f6;">
          <th style="padding: 10px; text-align: left; border-bottom: 2px solid #e5e7eb;">Category</th>
          <th style="padding: 10px; text-align: right; border-bottom: 2px solid #e5e7eb;">Amount</th>
          <th style="padding: 10px; text-align: right; border-bottom: 2px solid #e5e7eb;">% of Budget</th>
        </tr>
      </thead>
      <tbody>
        ${categoryRows}
      </tbody>
    </table>
  </div>

  <div style="background: white; border-radius: 10px; padding: 20px; margin-bottom: 30px; box-shadow: 0 1px 3px rgba(0,0,0,0.1);">
    <h2 style="color: #1f2937; margin-top: 0;">Spending by Member</h2>
    <table style="width: 100%; border-collapse: collapse;">
      <thead>
        <tr style="background: #f3f4f6;">
          <th style="padding: 10px; text-align: left; border-bottom: 2px solid #e5e7eb;">Member</th>
          <th style="padding: 10px; text-align: right; border-bottom: 2px solid #e5e7eb;">Expenses</th>
          <th style="padding: 10px; text-align: right; border-bottom: 2px solid #e5e7eb;">Total</th>
        </tr>
      </thead>
      <tbody>
        ${userRows}
      </tbody>
    </table>
  </div>

  <div style="background: white; border-radius: 10px; padding: 20px; margin-bottom: 30px; box-shadow: 0 1px 3px rgba(0,0,0,0.1);">
    <h2 style="color: #1f2937; margin-top: 0;">Detailed Expense List</h2>
    <table style="width: 100%; border-collapse: collapse; font-size: 14px;">
      <thead>
        <tr style="background: #f3f4f6;">
          <th style="padding: 8px; text-align: left; border-bottom: 2px solid #e5e7eb;">Date</th>
          <th style="padding: 8px; text-align: left; border-bottom: 2px solid #e5e7eb;">Member</th>
          <th style="padding: 8px; text-align: left; border-bottom: 2px solid #e5e7eb;">Category</th>
          <th style="padding: 8px; text-align: left; border-bottom: 2px solid #e5e7eb;">Description</th>
          <th style="padding: 8px; text-align: right; border-bottom: 2px solid #e5e7eb;">Amount</th>
        </tr>
      </thead>
      <tbody>
        ${expenseRows}
      </tbody>
    </table>
  </div>

  <div style="text-align: center; color: #6b7280; font-size: 14px; padding: 20px;">
    <p>This report was generated by Trip Budget Tracker</p>
    <p style="margin: 5px 0;">Invite Code: <strong>${group.invite_code}</strong></p>
  </div>
</body>
</html>
  `;
};

/**
 * Downloads trip log as HTML file
 * @param {string} groupId - The group ID
 */
export const downloadTripLog = async (groupId) => {
  try {
    const tripLogData = await generateTripLog(groupId);
    const htmlContent = generateTripLogHTML(tripLogData);
    
    const blob = new Blob([htmlContent], { type: 'text/html' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `trip-log-${tripLogData.group.trip_name.replace(/\s+/g, '-')}-${new Date().toISOString().split('T')[0]}.html`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
    
    return { success: true };
  } catch (error) {
    console.error('Error downloading trip log:', error);
    return { success: false, error };
  }
};

/**
 * Generates a CSV export of expenses
 * @param {string} groupId - The group ID
 */
export const exportExpensesToCSV = async (groupId) => {
  try {
    const expensesQuery = query(
      collection(db, 'expenses'),
      where('group_id', '==', groupId),
      orderBy('expense_date', 'asc')
    );
    const expensesSnap = await getDocs(expensesQuery);
    
    const expenses = await Promise.all(
      expensesSnap.docs.map(async (expDoc) => {
        const expense = { id: expDoc.id, ...expDoc.data() };
        const userRef = doc(db, 'users', expense.paid_by);
        const userSnap = await getDoc(userRef);
        expense.user_profiles = userSnap.exists() 
          ? { id: userSnap.id, ...userSnap.data() }
          : { id: expense.paid_by, email: 'Unknown', full_name: 'Unknown' };
        return expense;
      })
    );

    const csvContent = [
      ['Date', 'Member', 'Email', 'Category', 'Description', 'Amount'],
      ...expenses.map(exp => [
        exp.expense_date,
        exp.user_profiles.full_name || exp.user_profiles.email,
        exp.user_profiles.email,
        exp.category,
        exp.description,
        exp.amount
      ])
    ].map(row => row.map(cell => `"${cell}"`).join(',')).join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `expenses-${new Date().toISOString().split('T')[0]}.csv`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);

    return { success: true };
  } catch (error) {
    console.error('Error exporting to CSV:', error);
    return { success: false, error };
  }
};
