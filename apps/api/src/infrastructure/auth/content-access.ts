export function canManageContent(user: { roles?: string[]; permissions?: string[] } | null | undefined, resource: 'lessons' | 'exams' | 'questions') {
  if (user?.roles?.includes('admin')) return true
  const actions = resource === 'exams' ? ['create', 'publish', 'grade', 'delete'] : resource === 'questions' ? ['manage'] : ['create', 'update', 'delete', 'manage']
  return actions.some(action => user?.permissions?.includes(`${resource}:${action}`))
}
