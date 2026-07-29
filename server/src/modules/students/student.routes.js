const express = require('express')
const studentController = require('./student.controller')
const studentValidation = require('./student.validation')
const authenticate = require('../../middleware/auth.middleware')
const authorize = require('../../middleware/role.middleware')
const validate = require('../../middleware/validation.middleware')
const { ROLES } = require('../auth/auth.constants')

const router = express.Router()

router.use(authenticate)

router.post('/', authorize(ROLES.ADMIN, ROLES.TEACHER), validate(studentValidation.create), studentController.createStudent)
router.get('/', authorize(ROLES.ADMIN, ROLES.TEACHER), studentController.listStudents)
router.get('/:id', authorize(ROLES.ADMIN, ROLES.TEACHER), studentController.getStudent)
router.put('/:id', authorize(ROLES.ADMIN, ROLES.TEACHER), studentController.updateStudent)
router.delete('/:id', authorize(ROLES.ADMIN), studentController.deleteStudent)

module.exports = router
