const repository = require('./courseApplication.repository')

module.exports = {
  createApplication: repository.create,
  deleteApplication: repository.remove,
  listApplications: repository.findAll,
  updateApplicationStatus: repository.updateStatus
}
