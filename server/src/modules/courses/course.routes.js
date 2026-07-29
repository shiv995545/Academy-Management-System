const express = require('express')
const courseController = require('./course.controller')
const courseValidation = require('./course.validation')
const authenticate = require('../../middleware/auth.middleware')
const authorize = require('../../middleware/role.middleware')
const validate = require('../../middleware/validation.middleware')
const { ROLES } = require('../auth/auth.constants')

const router = express.Router()

router.get('/public', courseController.listPublicCourses)

router.use(authenticate)

router.post('/', authorize(ROLES.ADMIN), validate(courseValidation.create), courseController.createCourse)
router.get('/', authorize(ROLES.ADMIN, ROLES.TEACHER), courseController.listCourses)
router.put('/:id', authorize(ROLES.ADMIN), validate(courseValidation.update), courseController.updateCourse)
router.delete('/:id', authorize(ROLES.ADMIN), courseController.deleteCourse)

module.exports = router
