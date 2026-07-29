const express = require('express')
const batchController = require('./batch.controller')
const batchValidation = require('./batch.validation')
const authenticate = require('../../middleware/auth.middleware')
const authorize = require('../../middleware/role.middleware')
const validate = require('../../middleware/validation.middleware')
const { ROLES } = require('../auth/auth.constants')

const router = express.Router()

router.get('/public', batchController.listPublicBatches)

router.use(authenticate)

router.post('/', authorize(ROLES.ADMIN), validate(batchValidation.create), batchController.createBatch)
router.get('/', authorize(ROLES.ADMIN, ROLES.TEACHER), batchController.listBatches)
router.put('/:id', authorize(ROLES.ADMIN), batchController.updateBatch)
router.delete('/:id', authorize(ROLES.ADMIN), batchController.deleteBatch)

module.exports = router
