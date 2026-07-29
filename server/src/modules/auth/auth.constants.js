const ROLES = require('../../shared/constants/roles')

module.exports = {
  AUTH_MESSAGES: {
    INVALID_CREDENTIALS: 'Invalid email or password',
    ACCOUNT_DISABLED: 'This account is disabled',
    PASSWORD_RESET_ACCEPTED: 'If the email exists, a password reset token has been generated',
    PASSWORD_RESET_INVALID: 'Invalid or expired reset token',
    REFRESH_TOKEN_INVALID: 'Invalid or expired refresh token',
    WRONG_LOGIN_PORTAL: (role) => `This login is not for ${role}`,
    TOKEN_REQUIRED: 'Authorization token is required',
    TOKEN_INVALID: 'Invalid or expired token',
    USER_NOT_FOUND: 'User no longer exists'
  },
  ROLES
}
