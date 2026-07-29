const express = require('express')
const controller = require('./courseApplication.controller')
const validation = require('./courseApplication.validation')
const authenticate = require('../../middleware/auth.middleware')
const authorize = require('../../middleware/role.middleware')
const validate = require('../../middleware/validation.middleware')
const { ROLES } = require('../auth/auth.constants')

const router = express.Router()

router.post('/', validate(validation.create), controller.createApplication)

router.use(authenticate)

router.get('/', authorize(ROLES.ADMIN), controller.listApplications)
router.patch('/:id/status', authorize(ROLES.ADMIN), validate(validation.updateStatus), controller.updateApplicationStatus)
router.delete('/:id', authorize(ROLES.ADMIN), controller.deleteApplication)

module.exports = router
