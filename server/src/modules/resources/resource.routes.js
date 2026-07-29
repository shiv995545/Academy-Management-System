const express = require('express')
const controller = require('./resource.controller')
const validation = require('./resource.validation')
const authenticate = require('../../middleware/auth.middleware')
const validate = require('../../middleware/validation.middleware')

const router = express.Router()

router.get('/', controller.listPublic)
router.get('/categories', controller.listCategories)
router.get('/tags', controller.listTags)
router.post('/:id/download', controller.countDownload)

router.get('/manage/all', authenticate, controller.listManaged)
router.get('/manage/activity', authenticate, controller.listActivity)
router.get('/manage/stats', authenticate, controller.stats)
router.post('/upload', authenticate, validate(validation.upload), controller.upload)
router.post('/', authenticate, validate(validation.create), controller.create)
router.post('/categories', authenticate, validate(validation.createCategory), controller.createCategory)
router.put('/categories/:id', authenticate, validate(validation.updateCategory), controller.updateCategory)
router.delete('/categories/:id', authenticate, controller.deleteCategory)
router.patch('/:id/status', authenticate, validate(validation.updateStatus), controller.updateStatus)
router.put('/:id', authenticate, validate(validation.update), controller.update)
router.delete('/:id', authenticate, controller.remove)
router.get('/:id', controller.getPublic)

module.exports = router
