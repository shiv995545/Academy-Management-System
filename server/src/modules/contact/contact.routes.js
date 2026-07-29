const express = require('express')
const contactController = require('./contact.controller')
const contactValidation = require('./contact.validation')
const validate = require('../../middleware/validation.middleware')

const router = express.Router()

router.post('/messages', validate(contactValidation.createMessage), contactController.createMessage)

module.exports = router
