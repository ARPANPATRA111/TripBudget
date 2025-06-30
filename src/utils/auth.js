export const USER_CREDENTIALS = {
  [import.meta.env.VITE_ADMIN_USER]: { password: import.meta.env.VITE_ADMIN_PASS, role: 'Admin' },
  [import.meta.env.VITE_USER1]: { password: import.meta.env.VITE_USER1_PASS, role: 'User' },
  [import.meta.env.VITE_USER2]: { password: import.meta.env.VITE_USER2_PASS, role: 'User' },
  [import.meta.env.VITE_USER3]: { password: import.meta.env.VITE_USER3_PASS, role: 'User' },
  [import.meta.env.VITE_USER4]: { password: import.meta.env.VITE_USER4_PASS, role: 'User' },
  [import.meta.env.VITE_VIEWER_USER]: { password: import.meta.env.VITE_VIEWER_PASS, role: 'Viewer' },
};