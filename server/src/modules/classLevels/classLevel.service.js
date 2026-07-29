const repository = require('./classLevel.repository')

module.exports = {
  createClassLevel: repository.create,
  deleteClassLevel: repository.remove,
  listClassLevels: repository.findAll,
  updateClassLevel: repository.update
}
