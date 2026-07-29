const express = require('express')
const controller = require('./classLevel.controller')
const validation = require('./classLevel.validation')
const authenticate = require('../../middleware/auth.middleware')
const authorize = require('../../middleware/role.middleware')
const validate = require('../../middleware/validation.middleware')
const { ROLES } = require('../auth/auth.constants')

const router = express.Router()

router.get('/public', controller.listPublicClassLevels)

router.use(authenticate)

router.get('/', authorize(ROLES.ADMIN, ROLES.TEACHER), controller.listClassLevels)
router.post('/', authorize(ROLES.ADMIN), validate(validation.create), controller.createClassLevel)
router.put('/:id', authorize(ROLES.ADMIN), validate(validation.update), controller.updateClassLevel)
router.delete('/:id', authorize(ROLES.ADMIN), controller.deleteClassLevel)

module.exports = router
