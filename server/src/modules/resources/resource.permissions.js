const { ROLES } = require('../auth/auth.constants')

function canManageAnyResource(user) {
  return user?.role === ROLES.ADMIN
}

function canCreateResource(user) {
  return [ROLES.ADMIN, ROLES.TEACHER].includes(user?.role)
}

function canManageResource(user, resource) {
  if (!user || !resource) return false
  if (canManageAnyResource(user)) return true
  return user.role === ROLES.TEACHER && Number(resource.uploaded_by) === Number(user.id)
}

function canReadManagementView(user) {
  return [ROLES.ADMIN, ROLES.TEACHER].includes(user?.role)
}

module.exports = {
  canCreateResource,
  canManageAnyResource,
  canManageResource,
  canReadManagementView
}
