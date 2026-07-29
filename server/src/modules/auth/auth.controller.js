const authService = require('./auth.service')
const { AUTH_MESSAGES, ROLES } = require('./auth.constants')
const { success } = require('../../shared/response/apiResponse')

function requestMeta(req) {
  return {
    ipAddress: req.ip,
    userAgent: req.headers['user-agent']
  }
}

function getApiInfo(req, res) {
  return success(res, {
    message: 'Coaching Management System API',
    version: 'v1',
    basePath: '/api/v1',
    auth: {
      login: 'POST /api/v1/auth/login',
      adminLogin: 'POST /api/v1/auth/admin/login',
      teacherLogin: 'POST /api/v1/auth/teacher/login',
      studentLogin: 'POST /api/v1/auth/student/login',
      register: 'POST /api/v1/auth/register',
      logout: 'POST /api/v1/auth/logout',
      refreshToken: 'POST /api/v1/auth/refresh-token',
      forgotPassword: 'POST /api/v1/auth/forgot-password',
      resetPassword: 'POST /api/v1/auth/reset-password',
      me: 'GET /api/v1/auth/me'
    },
    admin: ['/api/v1/admin/teachers', '/api/v1/courses', '/api/v1/batches'],
    shared: ['/api/v1/students', '/api/v1/enrollments']
  })
}

async function handleLogin(req, res, next, expectedRole = null) {
  try {
    const result = await authService.login({
      ...req.body,
      role: expectedRole || req.body.role,
      meta: requestMeta(req)
    })
    return success(res, result)
  } catch (err) {
    return next(err)
  }
}

function loginAny(req, res, next) {
  return handleLogin(req, res, next)
}

function loginAdmin(req, res, next) {
  return handleLogin(req, res, next, ROLES.ADMIN)
}

function loginTeacher(req, res, next) {
  return handleLogin(req, res, next, ROLES.TEACHER)
}

function loginStudent(req, res, next) {
  return handleLogin(req, res, next, ROLES.STUDENT)
}

async function register(req, res, next) {
  try {
    const result = await authService.register(req.body, requestMeta(req))
    return success(res, result, 201)
  } catch (err) {
    return next(err)
  }
}

async function logout(req, res, next) {
  try {
    await authService.logout(req.body.refreshToken, req.user, requestMeta(req))
    return success(res, { message: 'Logged out successfully' })
  } catch (err) {
    return next(err)
  }
}

async function refreshToken(req, res, next) {
  try {
    const result = await authService.refreshToken(req.body.refreshToken, requestMeta(req))
    return success(res, result)
  } catch (err) {
    return next(err)
  }
}

async function forgotPassword(req, res, next) {
  try {
    const result = await authService.forgotPassword(req.body.email, requestMeta(req))
    return success(res, {
      message: AUTH_MESSAGES.PASSWORD_RESET_ACCEPTED,
      ...(result.resetToken ? { resetToken: result.resetToken } : {})
    })
  } catch (err) {
    return next(err)
  }
}

async function resetPassword(req, res, next) {
  try {
    const user = await authService.resetPassword(req.body, requestMeta(req))
    return success(res, { message: 'Password reset successfully', user })
  } catch (err) {
    return next(err)
  }
}

function getMe(req, res) {
  return success(res, { user: req.user })
}

async function listAuditLogs(req, res, next) {
  try {
    const auditLogs = await authService.listAuditLogs()
    return success(res, { auditLogs })
  } catch (err) {
    return next(err)
  }
}

module.exports = {
  forgotPassword,
  getApiInfo,
  getMe,
  listAuditLogs,
  loginAdmin,
  loginAny,
  loginStudent,
  loginTeacher,
  logout,
  refreshToken,
  register,
  resetPassword
}
