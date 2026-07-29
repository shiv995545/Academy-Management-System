const contactRepository = require('./contact.repository')

module.exports = {
  createMessage: contactRepository.create
}
