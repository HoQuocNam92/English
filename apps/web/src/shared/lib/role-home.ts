/** Send each signed-in user to a dashboard their role can access. */
export function roleHome(roles: readonly string[]): '/admin/dashboard' | '/learn' {
  return roles.some(role => role === 'admin' || role === 'teacher')
    ? '/admin/dashboard'
    : '/learn';
}
