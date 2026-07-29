const batchService = require('../batches/batch.service')
const enrollmentRepository = require('./enrollment.repository')

async function createEnrollment(user, data) {
  if (user.role === 'teacher') {
    const ownsBatch = await batchService.teacherOwnsBatch(data.batchId, user.id)

    if (!ownsBatch) {
      const err = new Error('Teachers can enroll students only in their own batches')
      err.statusCode = 403
      throw err
    }
  }

  return enrollmentRepository.create(data)
}

module.exports = {
  createEnrollment,
  deleteEnrollment: enrollmentRepository.remove,
  listEnrollments: enrollmentRepository.findAllForUser
}
