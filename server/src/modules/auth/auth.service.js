const authRepository = require('./auth.repository')
const AppError = require('../../shared/errors/AppError')
const { hashPassword, verifyPassword } = require('../../utils/password')
const { AUTH_MESSAGES, ROLES } = require('./auth.constants')
const {
  createAccessToken,
  createPasswordResetToken,
  createRefreshToken,
  getPasswordResetExpiry,
  getRefreshTokenExpiry,
  hashOpaqueToken
} = require('./auth.tokens')

function toPublicUser(user) {
  return {
    id: user.id,
    name: user.name,
    email: user.email,
    role: user.role,
    is_active: user.is_active,
    created_at: user.created_at
  }
}

function normalizeTokenUser(row) {
  return {
    id: row.user_id,
    name: row.name,
    email: row.email,
    role: row.role,
    is_active: row.is_active,
    created_at: row.user_created_at
  }
}

async function issueTokenPair(user) {
  const refreshToken = createRefreshToken()
  await authRepository.createRefreshToken({
    userId: user.id,
    tokenHash: hashOpaqueToken(refreshToken),
    expiresAt: getRefreshTokenExpiry()
  })

  return {
    token: createAccessToken(user),
    refreshToken
  }
}

async function audit({ userId, email, action, success, meta }) {
  await authRepository.createAuditLog({
    userId,
    email,
    action,
    success,
    ipAddress: meta?.ipAddress,
    userAgent: meta?.userAgent
  })
}

async function login({ email, password, role, meta }) {
  const user = await authRepository.findByEmail(email)
  const isValidPassword = user ? await verifyPassword(password, user.password_hash) : false

  if (!user || !isValidPassword) {
    await audit({ email, action: 'login_failed', success: false, meta })
    throw new AppError(AUTH_MESSAGES.INVALID_CREDENTIALS, 401)
  }

  if (!user.is_active) {
    await audit({ userId: user.id, email, action: 'login_disabled', success: false, meta })
    throw new AppError(AUTH_MESSAGES.ACCOUNT_DISABLED, 403)
  }

  if (role && user.role !== role) {
    await audit({ userId: user.id, email, action: 'login_wrong_portal', success: false, meta })
    throw new AppError(AUTH_MESSAGES.WRONG_LOGIN_PORTAL(role), 403)
  }

  const tokens = await issueTokenPair(user)
  await audit({ userId: user.id, email, action: 'login_success', success: true, meta })

  return {
    ...tokens,
    user: toPublicUser(user)
  }
}

async function register(data, meta) {
  const role = data.role || ROLES.STUDENT

  if (role !== ROLES.STUDENT) {
    throw new AppError('Public registration is only available for students', 403)
  }

  const user = await authRepository.createUser({
    name: data.name,
    email: data.email,
    passwordHash: hashPassword(data.password),
    role
  })

  const tokens = await issueTokenPair(user)
  await audit({
    userId: user.id,
    email: user.email,
    action: 'register_success',
    success: true,
    meta
  })

  return {
    ...tokens,
    user: toPublicUser(user)
  }
}

async function refreshToken(refreshToken, meta) {
  const tokenHash = hashOpaqueToken(refreshToken)
  const row = await authRepository.findRefreshToken(tokenHash)

  if (!row) {
    await audit({ action: 'refresh_failed', success: false, meta })
    throw new AppError(AUTH_MESSAGES.REFRESH_TOKEN_INVALID, 401)
  }

  const user = normalizeTokenUser(row)
  if (!user.is_active) {
    await audit({ userId: user.id, email: user.email, action: 'refresh_disabled', success: false, meta })
    throw new AppError(AUTH_MESSAGES.ACCOUNT_DISABLED, 403)
  }

  await authRepository.revokeRefreshToken(tokenHash)
  const tokens = await issueTokenPair(user)
  await audit({ userId: user.id, email: user.email, action: 'refresh_success', success: true, meta })

  return {
    ...tokens,
    user: toPublicUser(user)
  }
}

async function logout(refreshToken, user, meta) {
  if (refreshToken) {
    await authRepository.revokeRefreshToken(hashOpaqueToken(refreshToken))
  }

  await audit({
    userId: user?.id,
    email: user?.email,
    action: 'logout',
    success: true,
    meta
  })
}

async function forgotPassword(email, meta) {
  const user = await authRepository.findByEmail(email)

  if (!user || !user.is_active) {
    await audit({ email, action: 'forgot_password_requested', success: false, meta })
    return { resetToken: null }
  }

  const resetToken = createPasswordResetToken()
  await authRepository.createPasswordResetToken({
    userId: user.id,
    tokenHash: hashOpaqueToken(resetToken),
    expiresAt: getPasswordResetExpiry()
  })
  await audit({
    userId: user.id,
    email,
    action: 'forgot_password_requested',
    success: true,
    meta
  })

  return { resetToken }
}

async function resetPassword({ token, password }, meta) {
  const resetToken = await authRepository.findPasswordResetToken(hashOpaqueToken(token))

  if (!resetToken) {
    await audit({ action: 'reset_password_failed', success: false, meta })
    throw new AppError(AUTH_MESSAGES.PASSWORD_RESET_INVALID, 400)
  }

  const user = await authRepository.updatePassword(resetToken.user_id, hashPassword(password))
  await authRepository.markPasswordResetTokenUsed(resetToken.id)
  await authRepository.revokeAllRefreshTokensForUser(resetToken.user_id)
  await audit({
    userId: user.id,
    email: user.email,
    action: 'reset_password_success',
    success: true,
    meta
  })

  return toPublicUser(user)
}

async function listAuditLogs() {
  return authRepository.listAuditLogs()
}

async function createTeacher(data) {
  return authRepository.createUser({
    name: data.name,
    email: data.email,
    passwordHash: hashPassword(data.password),
    role: ROLES.TEACHER
  })
}

module.exports = {
  createTeacher,
  forgotPassword,
  listAuditLogs,
  login,
  logout,
  refreshToken,
  register,
  resetPassword
}
