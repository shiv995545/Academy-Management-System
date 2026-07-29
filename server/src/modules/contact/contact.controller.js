const contactService = require('./contact.service')
const { success } = require('../../shared/response/apiResponse')

async function createMessage(req, res, next) {
  try {
    const message = await contactService.createMessage(req.body)
    return success(res, { message }, 201)
  } catch (err) {
    return next(err)
  }
}

module.exports = {
  createMessage
}
