const batchRepository = require('./batch.repository')

module.exports = {
  createBatch: batchRepository.create,
  deleteBatch: batchRepository.remove,
  listBatches: batchRepository.findAllForUser,
  listPublicBatches: batchRepository.findPublic,
  teacherOwnsBatch: batchRepository.isOwnedByTeacher,
  updateBatch: batchRepository.update
}
