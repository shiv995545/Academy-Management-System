const express = require('express')
const teacherController = require('./teacher.controller')
const teacherValidation = require('./teacher.validation')
const authenticate = require('../../middleware/auth.middleware')
const authorize = require('../../middleware/role.middleware')
const validate = require('../../middleware/validation.middleware')
const { ROLES } = require('../auth/auth.constants')

const router = express.Router()

router.use(authenticate, authorize(ROLES.ADMIN))

router.post('/', validate(teacherValidation.create), teacherController.createTeacher)
router.get('/', teacherController.listTeachers)
router.put('/:id', teacherController.updateTeacher)
router.delete('/:id', teacherController.deleteTeacher)

module.exports = router
