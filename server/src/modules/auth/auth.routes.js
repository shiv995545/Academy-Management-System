const express = require('express')
const rateLimit = require('express-rate-limit')
const authController = require('./auth.controller')
const authValidation = require('./auth.validation')
const authenticate = require('../../middleware/auth.middleware')
const authorize = require('../../middleware/role.middleware')
const validate = require('../../middleware/validation.middleware')
const { ROLES } = require('./auth.constants')

const router = express.Router()
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: 30,
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    success: false,
    message: 'Too many auth requests. Please try again later.'
  }
})

router.use(authLimiter)

router.post('/login', validate(authValidation.login), authController.loginAny)
router.post('/admin/login', validate(authValidation.login), authController.loginAdmin)
router.post('/teacher/login', validate(authValidation.login), authController.loginTeacher)
router.post('/student/login', validate(authValidation.login), authController.loginStudent)
router.post('/register', validate(authValidation.register), authController.register)
router.post('/logout', validate(authValidation.logout), authController.logout)
router.post('/refresh-token', validate(authValidation.refreshToken), authController.refreshToken)
router.post('/forgot-password', validate(authValidation.forgotPassword), authController.forgotPassword)
router.post('/reset-password', validate(authValidation.resetPassword), authController.resetPassword)
router.get('/me', authenticate, authController.getMe)
router.get('/audit-logs', authenticate, authorize(ROLES.ADMIN), authController.listAuditLogs)

module.exports = router
