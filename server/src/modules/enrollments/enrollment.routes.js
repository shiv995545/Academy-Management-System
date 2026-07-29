const express = require('express')
const enrollmentController = require('./enrollment.controller')
const enrollmentValidation = require('./enrollment.validation')
const authenticate = require('../../middleware/auth.middleware')
const authorize = require('../../middleware/role.middleware')
const validate = require('../../middleware/validation.middleware')
const { ROLES } = require('../auth/auth.constants')

const router = express.Router()

router.use(authenticate)

router.post(
  '/',
  authorize(ROLES.ADMIN, ROLES.TEACHER),
  validate(enrollmentValidation.create),
  enrollmentController.createEnrollment
)
router.get('/', authorize(ROLES.ADMIN, ROLES.TEACHER), enrollmentController.listEnrollments)
router.delete('/:id', authorize(ROLES.ADMIN), enrollmentController.deleteEnrollment)

module.exports = router
